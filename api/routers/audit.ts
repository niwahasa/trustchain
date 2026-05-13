import { createRouter, authedQuery, adminQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import { auditLogs } from "../../db/schema.js";
import { eq, desc } from "drizzle-orm";

export const auditRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const logs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, ctx.user!.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(500);
    return logs;
  }),

  all: adminQuery.query(async () => {
    const db = getDb();
    const logs = await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(1000);
    return logs;
  }),
});
