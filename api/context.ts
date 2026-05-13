import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import jwt from "jsonwebtoken";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // Try OAuth first
  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // OAuth not available, try local auth
  }

  // If no OAuth user, try local auth token
  if (!ctx.user) {
    try {
      const authToken = opts.req.headers.get("x-auth-token");
      if (authToken) {
        const decoded: any = jwt.verify(
          authToken,
          process.env.JWT_SECRET || "trustchain-secret-key-2025"
        );
        if (decoded?.userId) {
          const db = getDb();
          const user = await db
            .select()
            .from(users)
            .where(eq(users.id, decoded.userId))
            .limit(1);
          if (user.length) {
            ctx.user = user[0];
          }
        }
      }
    } catch {
      // Local auth failed
    }
  }

  return ctx;
}
