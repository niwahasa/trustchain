import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  float,
  boolean,
  json,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  unionId: varchar("unionId", { length: 255 }),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["admin", "business", "individual", "verifier"])
    .default("individual")
    .notNull(),
  walletAddress: varchar("walletAddress", { length: 255 }),
  isVerified: boolean("isVerified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const documents = mysqlTable("documents", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  verificationId: varchar("verificationId", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileHash: varchar("fileHash", { length: 255 }).notNull().unique(),
  blockchainHash: varchar("blockchainHash", { length: 255 }),
  txHash: varchar("txHash", { length: 255 }),
  ipfsCid: varchar("ipfsCid", { length: 255 }),
  encryptedKey: varchar("encryptedKey", { length: 255 }),
  status: mysqlEnum("status", ["draft", "pending", "verified", "revoked", "failed"])
    .default("draft")
    .notNull(),
  docType: mysqlEnum("docType", ["document", "contract", "receipt", "certificate"])
    .default("document")
    .notNull(),
  fileSize: int("fileSize"),
  mimeType: varchar("mimeType", { length: 100 }),
  ownerId: bigint("ownerId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  anchoredAt: timestamp("anchoredAt").default(null),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

export const signers = mysqlTable("signers", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  documentId: bigint("documentId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => documents.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  role: varchar("role", { length: 100 }).default("Signatory").notNull(),
  signedAt: timestamp("signedAt"),
  txHash: varchar("txHash", { length: 255 }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Signer = typeof signers.$inferSelect;
export type InsertSigner = typeof signers.$inferInsert;

export const contracts = mysqlTable("contracts", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  verificationId: varchar("verificationId", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  fileHash: varchar("fileHash", { length: 255 }),
  txHash: varchar("txHash", { length: 255 }),
  ipfsCid: varchar("ipfsCid", { length: 255 }),
  status: mysqlEnum("status", ["draft", "finalized", "revoked"])
    .default("draft")
    .notNull(),
  ownerId: bigint("ownerId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  finalizedAt: timestamp("finalizedAt").default(null),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

export const contractParties = mysqlTable("contract_parties", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  contractId: bigint("contractId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => contracts.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(),
  signedAt: timestamp("signedAt"),
  token: varchar("token", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContractParty = typeof contractParties.$inferSelect;
export type InsertContractParty = typeof contractParties.$inferInsert;

export const contractVersions = mysqlTable("contract_versions", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  contractId: bigint("contractId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => contracts.id),
  content: text("content").notNull(),
  wordCount: int("wordCount").notNull(),
  savedAt: timestamp("savedAt").defaultNow().notNull(),
});

export type ContractVersion = typeof contractVersions.$inferSelect;
export type InsertContractVersion = typeof contractVersions.$inferInsert;

export const receipts = mysqlTable("receipts", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  receiptId: varchar("receiptId", { length: 50 }).notNull().unique(),
  receiptNo: varchar("receiptNo", { length: 100 }).notNull(),
  businessName: varchar("businessName", { length: 255 }).notNull(),
  businessEmail: varchar("businessEmail", { length: 320 }),
  businessPhone: varchar("businessPhone", { length: 50 }),
  businessAddress: text("businessAddress"),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 50 }),
  customerAddress: text("customerAddress"),
  items: json("items").notNull(),
  currency: varchar("currency", { length: 10 }).default("UGX").notNull(),
  taxPercent: float("taxPercent").default(0).notNull(),
  discountPercent: float("discountPercent").default(0).notNull(),
  subtotal: float("subtotal").notNull(),
  taxAmount: float("taxAmount").notNull(),
  discountAmount: float("discountAmount").notNull(),
  total: float("total").notNull(),
  isPaid: boolean("isPaid").default(false).notNull(),
  notes: text("notes"),
  theme: varchar("theme", { length: 30 }).default("midnight").notNull(),
  fileHash: varchar("fileHash", { length: 255 }),
  txHash: varchar("txHash", { length: 255 }),
  ipfsCid: varchar("ipfsCid", { length: 255 }),
  status: mysqlEnum("status", ["draft", "issued", "paid", "cancelled"])
    .default("draft")
    .notNull(),
  issuerId: bigint("issuerId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
  anchoredAt: timestamp("anchoredAt").default(null),
});

export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = typeof receipts.$inferInsert;

export const auditLogs = mysqlTable("audit_logs", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  event: varchar("event", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  entityId: varchar("entityId", { length: 255 }).notNull(),
  userId: bigint("userId", { mode: "number", unsigned: true }).references(
    () => users.id
  ),
  documentId: bigint("documentId", { mode: "number", unsigned: true }).references(
    () => documents.id
  ),
  ipAddress: varchar("ipAddress", { length: 100 }),
  userAgent: text("userAgent"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
