import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import { documents, signers, auditLogs } from "../../db/schema.js";
import { eq, and, desc } from "drizzle-orm";
import {
  sha256Hash,
  generateVerificationId,
  generateSecureToken,
} from "../services/crypto.js";
import blockchain from "../services/blockchain.js";
import emailService from "../services/email.js";

export const documentRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const docs = await db
      .select()
      .from(documents)
      .where(eq(documents.ownerId, ctx.user!.id))
      .orderBy(desc(documents.createdAt));
    return docs;
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const doc = await db
        .select()
        .from(documents)
        .where(eq(documents.id, input.id))
        .limit(1);
      if (!doc.length) return null;
      const docSigners = await db
        .select()
        .from(signers)
        .where(eq(signers.documentId, input.id));
      return { ...doc[0], signers: docSigners };
    }),

  create: authedQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        fileHash: z.string().min(1),
        fileSize: z.number().optional(),
        mimeType: z.string().optional(),
        docType: z
          .enum(["document", "contract", "receipt", "certificate"])
          .default("document"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const verificationId = generateVerificationId("TC");

      const result = await db.insert(documents).values({
        title: input.title,
        description: input.description,
        fileHash: input.fileHash,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        docType: input.docType,
        verificationId,
        ownerId: ctx.user!.id,
      });

      await db.insert(auditLogs).values({
        event: "document_created",
        entityType: "document",
        entityId: String(result[0].insertId),
        userId: ctx.user!.id,
        metadata: JSON.stringify({ title: input.title, docType: input.docType }),
      });

      return { id: result[0].insertId, verificationId };
    }),

  anchor: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const doc = await db
        .select()
        .from(documents)
        .where(eq(documents.id, input.id))
        .limit(1);

      if (!doc.length) throw new Error("Document not found");

      const docTypeMap: Record<string, number> = {
        document: 0,
        contract: 1,
        receipt: 2,
        certificate: 3,
      };

      const ipfsCid = `Qm${Array.from({ length: 44 }, () =>
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(
          Math.floor(Math.random() * 62)
        )
      ).join("")}`;

      const { txHash } = await blockchain.registerDocument(
        doc[0].fileHash,
        doc[0].verificationId,
        ipfsCid,
        docTypeMap[doc[0].docType] ?? 0
      );

      await db
        .update(documents)
        .set({
          txHash,
          ipfsCid,
          blockchainHash: sha256Hash(doc[0].fileHash),
          status: "verified",
          anchoredAt: new Date(),
        })
        .where(eq(documents.id, input.id));

      await db.insert(auditLogs).values({
        event: "document_anchored",
        entityType: "document",
        entityId: String(input.id),
        userId: ctx.user!.id,
        metadata: JSON.stringify({ txHash, ipfsCid }),
      });

      return { txHash, ipfsCid };
    }),

  addSigner: authedQuery
    .input(
      z.object({
        documentId: z.number(),
        name: z.string().min(1),
        email: z.string().email(),
        role: z.string().default("Signatory"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const token = generateSecureToken();

      await db.insert(signers).values({
        documentId: input.documentId,
        name: input.name,
        email: input.email,
        role: input.role,
        token,
      });

      const doc = await db
        .select()
        .from(documents)
        .where(eq(documents.id, input.documentId))
        .limit(1);

      if (doc.length) {
        await emailService.sendSignatureRequest(
          input.email,
          doc[0].title,
          ctx.user!.name || "A user",
          `${process.env.FRONTEND_URL || "http://localhost:3000"}/sign/${token}`
        );
      }

      await db.insert(auditLogs).values({
        event: "signer_invited",
        entityType: "document",
        entityId: String(input.documentId),
        userId: ctx.user!.id,
        metadata: JSON.stringify({ signerEmail: input.email }),
      });

      return { token };
    }),

  signByToken: publicQuery
    .input(
      z.object({
        token: z.string(),
        signature: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const signer = await db
        .select()
        .from(signers)
        .where(eq(signers.token, input.token))
        .limit(1);

      if (!signer.length) throw new Error("Invalid signing token");
      if (signer[0].signedAt) throw new Error("Already signed");

      const doc = await db
        .select()
        .from(documents)
        .where(eq(documents.id, signer[0].documentId))
        .limit(1);

      let txHash: string | null = null;
      if (doc.length) {
        const result = await blockchain.signDocument(
          doc[0].fileHash,
          signer[0].email
        );
        txHash = result.txHash;
      }

      await db
        .update(signers)
        .set({ signedAt: new Date(), txHash })
        .where(eq(signers.id, signer[0].id));

      await db.insert(auditLogs).values({
        event: "document_signed",
        entityType: "document",
        entityId: String(signer[0].documentId),
        metadata: JSON.stringify({ signerEmail: signer[0].email }),
      });

      return { success: true, txHash };
    }),

  getByToken: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const signer = await db
        .select()
        .from(signers)
        .where(eq(signers.token, input.token))
        .limit(1);

      if (!signer.length) return null;

      const doc = await db
        .select()
        .from(documents)
        .where(eq(documents.id, signer[0].documentId))
        .limit(1);

      return { signer: signer[0], document: doc[0] || null };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(documents)
        .set({ status: "revoked" })
        .where(
          and(
            eq(documents.id, input.id),
            eq(documents.ownerId, ctx.user!.id)
          )
        );

      await db.insert(auditLogs).values({
        event: "document_deleted",
        entityType: "document",
        entityId: String(input.id),
        userId: ctx.user!.id,
      });

      return { success: true };
    }),
});
