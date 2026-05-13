import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    console.log('Connected to MySQL');
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('Tables:', rows);
    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
