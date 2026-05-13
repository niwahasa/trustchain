import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { receipts, auditLogs } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { sha256Hash, generateReceiptId } from "../services/crypto";
import blockchain from "../services/blockchain";
import emailService from "../services/email";

export const receiptRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const list = await db
      .select()
      .from(receipts)
      .where(eq(receipts.issuerId, ctx.user!.id))
      .orderBy(desc(receipts.issuedAt));
    return list;
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const r = await db
        .select()
        .from(receipts)
        .where(eq(receipts.id, input.id))
        .limit(1);
      return r[0] || null;
    }),

  create: authedQuery
    .input(
      z.object({
        receiptNo: z.string().min(1),
        businessName: z.string().min(1),
        businessEmail: z.string().email().optional(),
        businessPhone: z.string().optional(),
        businessAddress: z.string().optional(),
        customerName: z.string().min(1),
        customerEmail: z.string().email(),
        customerPhone: z.string().optional(),
        customerAddress: z.string().optional(),
        items: z.array(
          z.object({
            desc: z.string(),
            qty: z.number().min(1),
            price: z.number().min(0),
          })
        ),
        currency: z.string().default("UGX"),
        taxPercent: z.number().default(0),
        discountPercent: z.number().default(0),
        subtotal: z.number(),
        taxAmount: z.number(),
        discountAmount: z.number(),
        total: z.number(),
        notes: z.string().optional(),
        theme: z.string().default("midnight"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const receiptId = generateReceiptId();

      const serialized = JSON.stringify({
        receiptId,
        receiptNo: input.receiptNo,
        items: input.items,
        total: input.total,
        currency: input.currency,
        timestamp: Date.now(),
      });
      const fileHash = sha256Hash(serialized);

      const amountCents = Math.round(input.total * 100);

      const { txHash } = await blockchain.registerReceipt(
        fileHash,
        receiptId,
        input.receiptNo,
        input.customerEmail,
        amountCents,
        input.currency,
        false
      );

      const result = await db.insert(receipts).values({
        receiptId,
        receiptNo: input.receiptNo,
        businessName: input.businessName,
        businessEmail: input.businessEmail,
        businessPhone: input.businessPhone,
        businessAddress: input.businessAddress,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        customerAddress: input.customerAddress,
        items: JSON.stringify(input.items),
        currency: input.currency,
        taxPercent: input.taxPercent,
        discountPercent: input.discountPercent,
        subtotal: input.subtotal,
        taxAmount: input.taxAmount,
        discountAmount: input.discountAmount,
        total: input.total,
        notes: input.notes,
        theme: input.theme,
        fileHash,
        txHash,
        status: "issued",
        issuerId: ctx.user!.id,
        anchoredAt: new Date(),
      });

      await emailService.sendReceipt(
        input.customerEmail,
        receiptId,
        input.receiptNo,
        `${input.currency} ${input.total.toLocaleString()}`,
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify/${receiptId}`
      );

      await db.insert(auditLogs).values({
        event: "receipt_issued",
        entityType: "receipt",
        entityId: String(result[0].insertId),
        userId: ctx.user!.id,
        metadata: JSON.stringify({
          receiptId,
          receiptNo: input.receiptNo,
          total: input.total,
        }),
      });

      return { id: result[0].insertId, receiptId, txHash };
    }),

  markPaid: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const r = await db
        .select()
        .from(receipts)
        .where(eq(receipts.id, input.id))
        .limit(1);

      if (!r.length) throw new Error("Receipt not found");

      await blockchain.markReceiptPaid(r[0].fileHash!);

      await db
        .update(receipts)
        .set({ isPaid: true, status: "paid" })
        .where(eq(receipts.id, input.id));

      await db.insert(auditLogs).values({
        event: "receipt_paid",
        entityType: "receipt",
        entityId: String(input.id),
        userId: ctx.user!.id,
      });

      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(receipts)
        .set({ status: "cancelled" })
        .where(eq(receipts.id, input.id));

      await db.insert(auditLogs).values({
        event: "receipt_cancelled",
        entityType: "receipt",
        entityId: String(input.id),
        userId: ctx.user!.id,
      });

      return { success: true };
    }),
});
