import { relations } from "drizzle-orm";
import {
  users,
  documents,
  signers,
  contracts,
  contractParties,
  contractVersions,
  receipts,
  auditLogs,
} from "./schema.js";

export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
  contracts: many(contracts),
  receipts: many(receipts),
  auditLogs: many(auditLogs),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  owner: one(users, { fields: [documents.ownerId], references: [users.id] }),
  signers: many(signers),
  auditLogs: many(auditLogs),
}));

export const signersRelations = relations(signers, ({ one }) => ({
  document: one(documents, {
    fields: [signers.documentId],
    references: [documents.id],
  }),
}));

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  owner: one(users, { fields: [contracts.ownerId], references: [users.id] }),
  parties: many(contractParties),
  versions: many(contractVersions),
}));

export const contractPartiesRelations = relations(contractParties, ({ one }) => ({
  contract: one(contracts, {
    fields: [contractParties.contractId],
    references: [contracts.id],
  }),
}));

export const contractVersionsRelations = relations(contractVersions, ({ one }) => ({
  contract: one(contracts, {
    fields: [contractVersions.contractId],
    references: [contracts.id],
  }),
}));

export const receiptsRelations = relations(receipts, ({ one }) => ({
  issuer: one(users, {
    fields: [receipts.issuerId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
  document: one(documents, {
    fields: [auditLogs.documentId],
    references: [documents.id],
  }),
}));
