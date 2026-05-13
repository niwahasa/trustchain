import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    console.log('Attempting to create users table...');
    await connection.execute(`
      CREATE TABLE \`users\` (
        \`id\` bigint unsigned AUTO_INCREMENT PRIMARY KEY,
        \`unionId\` varchar(255),
        \`name\` varchar(255),
        \`email\` varchar(320),
        \`passwordHash\` varchar(255),
        \`avatar\` text,
        \`role\` enum('admin', 'business', 'individual', 'verifier') NOT NULL DEFAULT 'individual',
        \`walletAddress\` varchar(255),
        \`isVerified\` boolean NOT NULL DEFAULT false,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`lastSignInAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created successfully');
  } catch (error) {
    console.error('Error creating users table:', error);
  } finally {
    await connection.end();
  }
}

test();
