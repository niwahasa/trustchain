import { z } from "zod";
import { createRouter, adminQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import { users, documents, receipts, contracts, auditLogs } from "../../db/schema.js";
import { desc, eq, count } from "drizzle-orm";
import blockchain from "../services/blockchain.js";

export const adminRouter = createRouter({
  stats: adminQuery.query(async () => {
    const db = getDb();
    const [userCount] = await db.select({ value: count() }).from(users);
    const [docCount] = await db.select({ value: count() }).from(documents);
    const [receiptCount] = await db.select({ value: count() }).from(receipts);
    const [contractCount] = await db.select({ value: count() }).from(contracts);
    const [logCount] = await db.select({ value: count() }).from(auditLogs);
    const chainStats = await blockchain.getStats();

    return {
      users: userCount.value,
      documents: docCount.value,
      receipts: receiptCount.value,
      contracts: contractCount.value,
      auditLogs: logCount.value,
      chain: chainStats,
    };
  }),

  users: adminQuery.query(async () => {
    const db = getDb();
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        walletAddress: users.walletAddress,
        isVerified: users.isVerified,
        createdAt: users.createdAt,
        lastSignInAt: users.lastSignInAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
    return allUsers;
  }),

  updateUser: adminQuery
    .input(
      z.object({
        id: z.number(),
        role: z.enum(["admin", "business", "individual", "verifier"]).optional(),
        isVerified: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const updates: Record<string, unknown> = {};
      if (input.role) updates.role = input.role;
      if (input.isVerified !== undefined) updates.isVerified = input.isVerified;

      await db.update(users).set(updates).where(eq(users.id, input.id));
      return { success: true };
    }),

  documents: adminQuery.query(async () => {
    const db = getDb();
    const docs = await db
      .select()
      .from(documents)
      .orderBy(desc(documents.createdAt))
      .limit(500);
    return docs;
  }),
});
