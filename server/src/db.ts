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
        dictionaries JSONB,
        structures JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migration: Add columns if they don't exist (for existing deployments)
    await client.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS dictionaries JSONB;`);
    await client.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS structures JSONB;`);

    // Taxonomies Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS taxonomies (
        id VARCHAR(50) PRIMARY KEY,
        tenant_id VARCHAR(50) REFERENCES tenants(id),
        client_id VARCHAR(50) REFERENCES clients(id),
        campaign_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_string VARCHAR(100),
        generated_strings JSONB, 
        values_data JSONB,
        cid VARCHAR(255),
        platform VARCHAR(100)
      );
    `);

    // Migration: Add columns to taxonomies if they don't exist
    await client.query(`ALTER TABLE taxonomies ADD COLUMN IF NOT EXISTS cid VARCHAR(255);`);
    await client.query(`ALTER TABLE taxonomies ADD COLUMN IF NOT EXISTS platform VARCHAR(100);`);
    
    // Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(128) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'trafficker',
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );
    `);

    // Seed Initial Data
    await seedData(client);

    console.log('Database Schema Ready.');
  } catch (error) {
    console.error('Error initializing DB:', error);
  } finally {
    client.release();
  }
};

const seedData = async (client: any) => {
  console.log('Seeding initial data...');
  
  // 1. Seed Initial Users
  const initialUsers = [
    ['usr_jose_001', 'jose.rodriguez@lobueno.co', 'Jose Rodriguez', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jose'],
    ['usr_santiago_002', 'santiago.rodriguez@lobueno.co', 'Santiago Rodriguez Rivera', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Santiago'],
    ['usr_gerardo_003', 'gerardo.riarte@buentipo.com', 'Gerardo Carlos Riarte', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gerardo'],
    ['usr_christian_004', 'christian.martinez@lobueno.co', 'Christian Eduardo Martinez Moreno', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Christian'],
    ['usr_joffre_005', 'joffre@buentipo.com', 'Joffre Carmona', 'trafficker', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joffre'],
    ['usr_admin_000', 'admin@governance.com', 'Super Admin', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'],
    ['usr_planner_007', 'planner@governance.com', 'Demo Planner', 'planner', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Planner']
  ];

  for (const user of initialUsers) {
    await client.query(`
      INSERT INTO users (id, email, name, role, avatar)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET 
        role = EXCLUDED.role,
        name = EXCLUDED.name,
        email = EXCLUDED.email
    `, user);
  }

  // 2. Seed Initial Tenant
  const tenantId = 'tenant_001';
  await client.query(`
    INSERT INTO tenants (id, name)
    VALUES ($1, $2)
    ON CONFLICT (id) DO NOTHING
  `, [tenantId, 'Buentipo Governance']);

  // 3. Seed Initial Client with Master Schema
  const clientId = 'client_master_001';
  const masterSchema = {
    dictionaries: {
      "country": ["Mexico", "Colombia", "Brazil", "Chile", "Peru"],
      "budgetSource": ["Brand", "Performance", "Ecommerce"],
      "campaignName": ["SS22GiftOfTheGame", "SS23Curry10", "FW24BlackDays", "AlwaysOn"],
      "provider": ["Meta", "Meta Ads", "Google Ads", "TikTok", "YouTube", "DV360", "Spotify", "Amazon Ads", "LinkedIn", "Pinterest", "Snapchat", "X"],
      "objective": ["Reach", "VideoViews", "Traffic", "Conversions", "CatalogSales", "AppInstalls"],
      "channel": ["Social Media", "Carrusel", "Video", "Imagen", "Story", "Paid Search", "Display", "Online Video", "Connected TV", "Influencer", "Programmatic", "Audio", "Native", "Affiliate"],
      "funnel": ["Attract", "Consider", "Convert"],
      "audienceStrategy": ["Prospecting", "Retargeting", "Retention", "DABA", "DPA"],
      "audienceSegment": ["Broad", "Affinity", "InMarket", "LAL1to3", "SocialEngagers", "SiteVisitors", "AddToCart"],
      "placement": ["Auto", "Feeds", "StoriesReels", "RightColumn"],
      "creativeFormat": ["Video", "SingleImage", "Carousel", "Collection", "RichMedia"],
      "creativeSpecs": ["Static", "06Sec", "10Sec", "15Sec", "30Sec", "1x1", "9x16", "16x9"],
      "creativeConcept": ["Anthem", "ProductFocus", "Lifestyle", "Promo", "UGC", "Testimonial"],
      "creativeVariation": ["Main", "Men", "Women", "CoGender", "Cutdown"]
    },
    structures: {
      "campaign": "{country}/{budgetSource}/{campaignName}/{provider}/{objective}/{channel}/{funnel}",
      "adset": "{parentCampaign}/{audienceStrategy}/{audienceSegment}/{placement}",
      "ad": "{parentCampaignName}/{parentProvider}/{creativeFormat}/{creativeSpecs}/{creativeConcept}/{creativeVariation}"
    }
  };

  await client.query(`
    INSERT INTO clients (id, tenant_id, name, dictionaries, structures)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (id) DO NOTHING
  `, [
    clientId, 
    tenantId, 
    'Standard Config', 
    JSON.stringify(masterSchema.dictionaries), 
    JSON.stringify(masterSchema.structures)
  ]);

  console.log('Seeding Complete.');
};
