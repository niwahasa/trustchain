import { authRouter } from "./auth-router";
import { localAuthRouter } from "./routers/localAuth";
import { documentRouter } from "./routers/documents";
import { contractRouter } from "./routers/contracts";
import { receiptRouter } from "./routers/receipts";
import { verifyRouter } from "./routers/verify";
import { auditRouter } from "./routers/audit";
import { adminRouter } from "./routers/admin";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  document: documentRouter,
  contract: contractRouter,
  receipt: receiptRouter,
  verify: verifyRouter,
  audit: auditRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
