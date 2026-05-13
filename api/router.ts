import { authRouter } from "./auth-router.js";
import { localAuthRouter } from "./routers/localAuth.js";
import { documentRouter } from "./routers/documents.js";
import { contractRouter } from "./routers/contracts.js";
import { receiptRouter } from "./routers/receipts.js";
import { verifyRouter } from "./routers/verify.js";
import { auditRouter } from "./routers/audit.js";
import { adminRouter } from "./routers/admin.js";
import { createRouter, publicQuery } from "./middleware.js";

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
