import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const tables = [
  {
    name: 'users',
    sql: 'CREATE TABLE users (' +
      'id bigint unsigned AUTO_INCREMENT PRIMARY KEY,' +
      'unionId varchar(255),' +
      'name varchar(255),' +
      'email varchar(320),' +
      'passwordHash varchar(255),' +
      'avatar text,' +
      "role enum('admin', 'business', 'individual', 'verifier') NOT NULL DEFAULT 'individual'," +
      'walletAddress varchar(255),' +
      'isVerified boolean NOT NULL DEFAULT false,' +
      'createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
      'updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,' +
      'lastSignInAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP' +
      ')'
  },
  {
    name: 'documents',
    sql: 'CREATE TABLE documents (' +
      'id bigint unsigned AUTO_INCREMENT PRIMARY KEY,' +
      'verificationId varchar(50) NOT NULL UNIQUE,' +
      'title varchar(255) NOT NULL,' +
      'description text,' +
      'fileHash varchar(255) NOT NULL UNIQUE,' +
      'blockchainHash varchar(255),' +
      'txHash varchar(255),' +
      'ipfsCid varchar(255),' +
      'encryptedKey varchar(255),' +
      "status enum('draft', 'pending', 'verified', 'revoked', 'failed') NOT NULL DEFAULT 'draft'," +
      "docType enum('document', 'contract', 'receipt', 'certificate') NOT NULL DEFAULT 'document'," +
      'fileSize int,' +
      'mimeType varchar(100),' +
      'ownerId bigint unsigned NOT NULL,' +
      'anchoredAt timestamp NULL DEFAULT NULL,' +
      'createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
      'FOREIGN KEY (ownerId) REFERENCES users(id)' +
      ')'
  },
  {
    name: 'signers',
    sql: 'CREATE TABLE signers (' +
      'id bigint unsigned AUTO_INCREMENT PRIMARY KEY,' +
      'documentId bigint unsigned NOT NULL,' +
      'name varchar(255) NOT NULL,' +
      'email varchar(320) NOT NULL,' +
      "role varchar(100) NOT NULL DEFAULT 'Signatory'," +
      'signedAt timestamp NULL DEFAULT NULL,' +
      'txHash varchar(255),' +
      'token varchar(255) NOT NULL UNIQUE,' +
      'createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
      'FOREIGN KEY (documentId) REFERENCES documents(id)' +
      ')'
  },
  {
    name: 'contracts',
    sql: 'CREATE TABLE contracts (' +
      'id bigint unsigned AUTO_INCREMENT PRIMARY KEY,' +
      'verificationId varchar(50) NOT NULL UNIQUE,' +
      'title varchar(255) NOT NULL,' +
      'content text NOT NULL,' +
      'fileHash varchar(255),' +
      'txHash varchar(255),' +
      'ipfsCid varchar(255),' +
      "status enum('draft', 'finalized', 'revoked') NOT NULL DEFAULT 'draft'," +
      'ownerId bigint unsigned NOT NULL,' +
      'finalizedAt timestamp NULL DEFAULT NULL,' +
      'createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
      'FOREIGN KEY (ownerId) REFERENCES users(id)' +
      ')'
  },
  {
    name: 'contract_parties',
    sql: 'CREATE TABLE contract_parties (' +
      'id bigint unsigned AUTO_INCREMENT PRIMARY KEY,' +
      'contractId bigint unsigned NOT NULL,' +
      'name varchar(255) NOT NULL,' +
      'email varchar(320) NOT NULL,' +
      'role varchar(100) NOT NULL,' +
      'signedAt timestamp NULL DEFAULT NULL,' +
      'token varchar(255) NOT NULL UNIQUE,' +
      'createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
      'FOREIGN KEY (contractId) REFERENCES contracts(id)' +
      ')'
  },
  {
    name: 'contract_versions',
    sql: 'CREATE TABLE contract_versions (' +
      'id bigint unsigned AUTO_INCREMENT PRIMARY KEY,' +
      'contractId bigint unsigned NOT NULL,' +
      'content text NOT NULL,' +
      'wordCount int NOT NULL,' +
      'savedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
      'FOREIGN KEY (contractId) REFERENCES contracts(id)' +
      ')'
  },
  {
    name: 'receipts',
    sql: 'CREATE TABLE receipts (' +
      'id bigint unsigned AUTO_INCREMENT PRIMARY KEY,' +
      'receiptId varchar(50) NOT NULL UNIQUE,' +
      'receiptNo varchar(100) NOT NULL,' +
      'businessName varchar(255) NOT NULL,' +
      'businessEmail varchar(320),' +
      'businessPhone varchar(50),' +
      'businessAddress text,' +
      'customerName varchar(255) NOT NULL,' +
      'customerEmail varchar(320) NOT NULL,' +
      'customerPhone varchar(50),' +
      'customerAddress text,' +
      'items json NOT NULL,' +
      "currency varchar(10) NOT NULL DEFAULT 'UGX'," +
      'taxPercent float NOT NULL DEFAULT 0,' +
      'discountPercent float NOT NULL DEFAULT 0,' +
      'subtotal float NOT NULL,' +
      'taxAmount float NOT NULL,' +
      'discountAmount float NOT NULL,' +
      'total float NOT NULL,' +
      'isPaid boolean NOT NULL DEFAULT false,' +
      'notes text,' +
      "theme varchar(30) NOT NULL DEFAULT 'midnight'," +
      'fileHash varchar(255),' +
      'txHash varchar(255),' +
      'ipfsCid varchar(255),' +
      "status enum('draft', 'issued', 'paid', 'cancelled') NOT NULL DEFAULT 'draft'," +
      'issuerId bigint unsigned NOT NULL,' +
      'issuedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
      'anchoredAt timestamp NULL DEFAULT NULL,' +
      'FOREIGN KEY (issuerId) REFERENCES users(id)' +
      ')'
  },
  {
    name: 'audit_logs',
    sql: 'CREATE TABLE audit_logs (' +
      'id bigint unsigned AUTO_INCREMENT PRIMARY KEY,' +
      'event varchar(100) NOT NULL,' +
      'entityType varchar(50) NOT NULL,' +
      'entityId varchar(255) NOT NULL,' +
      'userId bigint unsigned,' +
      'documentId bigint unsigned,' +
      'ipAddress varchar(100),' +
      'userAgent text,' +
      'metadata json,' +
      'createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
      'FOREIGN KEY (userId) REFERENCES users(id),' +
      'FOREIGN KEY (documentId) REFERENCES documents(id)' +
      ')'
  }
];

async function run() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    for (const table of tables) {
      console.log('Creating table ' + table.name + '...');
      try {
        await connection.execute(table.sql);
        console.log('Table ' + table.name + ' created.');
      } catch (err) {
        console.error('Failed to create table ' + table.name + ':', err.message);
      }
    }
  } finally {
    await connection.end();
  }
}

run();
