import { z } from "zod";
import { createRouter, publicQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import { documents, receipts } from "../../db/schema.js";
import { eq, or } from "drizzle-orm";
import blockchain from "../services/blockchain.js";

export const verifyRouter = createRouter({
  byId: publicQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const prefix = input.id.split("-")[0];

      if (prefix === "RCP") {
        const r = await db
          .select()
          .from(receipts)
          .where(eq(receipts.receiptId, input.id))
          .limit(1);

        if (!r.length) {
          return { found: false, message: "Receipt not found" };
        }

        const chainData = await blockchain.verifyReceiptById(input.id);

        return {
          found: true,
          type: "receipt" as const,
          data: r[0],
          chain: chainData
            ? {
                exists: chainData.exists,
                isPaid: chainData.isPaid,
                timestamp: chainData.timestamp,
                amount: chainData.amountInCents / 100,
                currency: chainData.currency,
              }
            : null,
        };
      }

      const d = await db
        .select()
        .from(documents)
        .where(
          or(
            eq(documents.verificationId, input.id),
            eq(documents.blockchainHash, input.id)
          )
        )
        .limit(1);

      if (!d.length) {
        return { found: false, message: "Document not found" };
      }

      const chainData = await blockchain.verifyByVerificationId(input.id);

      return {
        found: true,
        type: "document" as const,
        data: d[0],
        chain: chainData
          ? {
              exists: chainData.exists,
              isActive: chainData.isActive,
              timestamp: chainData.timestamp,
              signerCount: chainData.signerCount,
              owner: chainData.owner,
            }
          : null,
      };
    }),

  byHash: publicQuery
    .input(z.object({ hash: z.string() }))
    .query(async ({ input }) => {
      const chainData = await blockchain.verifyDocument(input.hash);

      if (!chainData) {
        return { found: false, message: "Hash not found on blockchain" };
      }

      const db = getDb();
      const d = await db
        .select()
        .from(documents)
        .where(eq(documents.blockchainHash, input.hash))
        .limit(1);

      return {
        found: true,
        type: "document" as const,
        data: d[0] || null,
        chain: {
          exists: chainData.exists,
          isActive: chainData.isActive,
          timestamp: chainData.timestamp,
          signerCount: chainData.signerCount,
          owner: chainData.owner,
        },
      };
    }),
});
