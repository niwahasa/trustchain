import { z } from "zod";
import jwt from "jsonwebtoken";
import { createRouter, publicQuery, authedQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import { users, auditLogs } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, generateSecureToken } from "../services/crypto.js";

function signToken(userId: number, email: string, role: string): string {
  return jwt.sign({ userId, email, role }, process.env.JWT_SECRET || "trustchain-secret-key-2025", {
    expiresIn: "7d",
  });
}

function verifyToken(token: string): { userId: number; email: string; role: string } | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "trustchain-secret-key-2025") as any;
  } catch {
    return null;
  }
}

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        email: z.string().email(),
        password: z.string().min(6).max(100),
        role: z.enum(["individual", "business", "verifier"]).default("individual"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existing.length) {
        throw new Error("Email already registered");
      }

      const passwordHash = await hashPassword(input.password);
      const result = await db.insert(users).values({
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role,
        unionId: generateSecureToken(),
      });

      const token = signToken(result[0].insertId, input.email, input.role);

      await db.insert(auditLogs).values({
        event: "user_registered",
        entityType: "user",
        entityId: String(result[0].insertId),
        metadata: JSON.stringify({ email: input.email, role: input.role }),
      });

      return { token, user: { id: result[0].insertId, name: input.name, email: input.email, role: input.role } };
    }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (!user.length) {
        throw new Error("Invalid email or password");
      }

      if (!user[0].passwordHash) {
        throw new Error("Please use OAuth login");
      }

      const valid = await verifyPassword(input.password, user[0].passwordHash);
      if (!valid) {
        throw new Error("Invalid email or password");
      }

      const token = signToken(user[0].id, user[0].email || input.email, user[0].role);

      await db.insert(auditLogs).values({
        event: "user_login",
        entityType: "user",
        entityId: String(user[0].id),
        metadata: JSON.stringify({ email: input.email }),
      });

      return {
        token,
        user: {
          id: user[0].id,
          name: user[0].name,
          email: user[0].email,
          role: user[0].role,
          avatar: user[0].avatar,
          walletAddress: user[0].walletAddress,
        },
      };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const authHeader = ctx.req.headers.get("x-auth-token");
    if (!authHeader) return null;

    const decoded = verifyToken(authHeader);
    if (!decoded) return null;

    const db = getDb();
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user.length) return null;

    return {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      role: user[0].role,
      avatar: user[0].avatar,
      walletAddress: user[0].walletAddress,
      isVerified: user[0].isVerified,
      createdAt: user[0].createdAt,
      unionId: user[0].unionId,
    };
  }),

  updateProfile: authedQuery
    .input(
      z.object({
        name: z.string().min(1).max(255).optional(),
        walletAddress: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const updates: Record<string, unknown> = {};
      if (input.name) updates.name = input.name;
      if (input.walletAddress !== undefined) updates.walletAddress = input.walletAddress;

      await db
        .update(users)
        .set(updates)
        .where(eq(users.id, ctx.user!.id));

      return { success: true };
    }),
});
