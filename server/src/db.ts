import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const initDB = async () => {
  const client = await pool.connect();
  try {
    console.log('Initializing Database Schema...');
    
    // Tenants Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Clients Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(50) PRIMARY KEY,
        tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Taxonomies Table (Stores JSONB for flexible values)
    await client.query(`
      CREATE TABLE IF NOT EXISTS taxonomies (
        id VARCHAR(50) PRIMARY KEY,
        tenant_id VARCHAR(50) REFERENCES tenants(id),
        client_id VARCHAR(50) REFERENCES clients(id),
        campaign_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_string VARCHAR(100),
        generated_strings JSONB, 
        values_data JSONB
      );
    `);
    
    console.log('Database Schema Ready.');
  } catch (error) {
    console.error('Error initializing DB:', error);
  } finally {
    client.release();
  }
};
