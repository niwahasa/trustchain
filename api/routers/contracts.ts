import { z } from "zod";
import crypto from "node:crypto";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { contracts, contractParties, contractVersions, auditLogs } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { generateVerificationId, generateSecureToken } from "../services/crypto";
import blockchain from "../services/blockchain";
import emailService from "../services/email";

export const contractRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const list = await db
      .select()
      .from(contracts)
      .where(eq(contracts.ownerId, ctx.user!.id))
      .orderBy(desc(contracts.createdAt));
    return list;
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const c = await db
        .select()
        .from(contracts)
        .where(eq(contracts.id, input.id))
        .limit(1);
      if (!c.length) return null;
      const parties = await db
        .select()
        .from(contractParties)
        .where(eq(contractParties.contractId, input.id));
      const versions = await db
        .select()
        .from(contractVersions)
        .where(eq(contractVersions.contractId, input.id))
        .orderBy(desc(contractVersions.savedAt));
      return { ...c[0], parties, versions };
    }),

  create: authedQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const verificationId = generateVerificationId("CT");

      const result = await db.insert(contracts).values({
        title: input.title,
        content: input.content,
        verificationId,
        ownerId: ctx.user!.id,
      });

      const wordCount = input.content.split(/\s+/).length;
      await db.insert(contractVersions).values({
        contractId: result[0].insertId,
        content: input.content,
        wordCount,
      });

      await db.insert(auditLogs).values({
        event: "contract_created",
        entityType: "contract",
        entityId: String(result[0].insertId),
        userId: ctx.user!.id,
        metadata: JSON.stringify({ title: input.title }),
      });

      return { id: result[0].insertId, verificationId };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        content: z.string().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const updates: Record<string, unknown> = {};
      if (input.title) updates.title = input.title;
      if (input.content) updates.content = input.content;

      await db
        .update(contracts)
        .set(updates)
        .where(eq(contracts.id, input.id));

      if (input.content) {
        const wordCount = input.content.split(/\s+/).length;
        await db.insert(contractVersions).values({
          contractId: input.id,
          content: input.content,
          wordCount,
        });
      }

      await db.insert(auditLogs).values({
        event: "contract_updated",
        entityType: "contract",
        entityId: String(input.id),
        userId: ctx.user!.id,
      });

      return { success: true };
    }),

  addParty: authedQuery
    .input(
      z.object({
        contractId: z.number(),
        name: z.string().min(1),
        email: z.string().email(),
        role: z.string().default("Party"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const token = generateSecureToken();

      await db.insert(contractParties).values({
        contractId: input.contractId,
        name: input.name,
        email: input.email,
        role: input.role,
        token,
      });

      return { token };
    }),

  finalize: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const c = await db
        .select()
        .from(contracts)
        .where(eq(contracts.id, input.id))
        .limit(1);

      if (!c.length) throw new Error("Contract not found");

      const fileHash = crypto
        .createHash("sha256")
        .update(c[0].content)
        .digest("hex");

      const ipfsCid = `Qm${Array.from({ length: 44 }, () =>
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(
          Math.floor(Math.random() * 62)
        )
      ).join("")}`;

      const { txHash } = await blockchain.registerDocument(
        fileHash,
        c[0].verificationId,
        ipfsCid,
        1
      );

      await db
        .update(contracts)
        .set({
          status: "finalized",
          txHash,
          ipfsCid,
          fileHash,
          finalizedAt: new Date(),
        })
        .where(eq(contracts.id, input.id));

      const parties = await db
        .select()
        .from(contractParties)
        .where(eq(contractParties.contractId, input.id));

      for (const party of parties) {
        await emailService.sendContractInvitation(
          party.email,
          c[0].title,
          ctx.user!.name || "A user",
          `${process.env.FRONTEND_URL || "http://localhost:3000"}/contracts/${input.id}?token=${party.token}`
        );
      }

      await db.insert(auditLogs).values({
        event: "contract_finalized",
        entityType: "contract",
        entityId: String(input.id),
        userId: ctx.user!.id,
        metadata: JSON.stringify({ txHash }),
      });

      return { txHash, ipfsCid };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(contracts)
        .set({ status: "revoked" })
        .where(eq(contracts.id, input.id));

      await db.insert(auditLogs).values({
        event: "contract_revoked",
        entityType: "contract",
        entityId: String(input.id),
        userId: ctx.user!.id,
      });

      return { success: true };
    }),
});
