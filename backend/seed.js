// seed.js
const { Pool } = require('pg');
const { createClient } = require('redis');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  }
});

const PRODUCTS = [
  {
    id: '00000000-0000-0000-0000-000000000000',
    name: 'Midnight Drop Hoodie (Black)',
    description: 'The definitive silhouette. Heavyweight 500GSM black cotton with metallic finishes.',
    price: 89.99,
    stock: 50,
    images: ['/hoodie_black_1.png', '/hoodie_black_2.png'],
    dropDelay: '10 seconds'
  },
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Cloud Drop Hoodie (White)',
    description: 'Pure aesthetic. Bone-white premium fleece with tonal branding.',
    price: 95.00,
    stock: 30,
    images: ['/hoodie_white_1.png'],
    dropDelay: '5 minutes'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Vortex Mechanical Keyboard',
    description: 'The definitive typing experience. Gasket mount, hot-swappable, per-key RGB.',
    price: 149.00,
    stock: 20,
    images: ['/keyboard.png'],
    dropDelay: '10 minutes'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Aerolite Gaming Mouse',
    description: 'Ultra-lightweight precision. 26k DPI sensor, 8000Hz polling rate.',
    price: 79.00,
    stock: 40,
    images: ['/mouse.png'],
    dropDelay: '2 minutes'
  }
];

async function seed() {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');

    // Sync schema (in case it changed)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        total_inventory INTEGER NOT NULL,
        remaining_inventory INTEGER NOT NULL,
        images TEXT[],
        drop_time TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    for (const prod of PRODUCTS) {
      await pool.query(`
        INSERT INTO products (id, name, description, price, total_inventory, remaining_inventory, images, drop_time)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() + INTERVAL '${prod.dropDelay}')
        ON CONFLICT (id) DO UPDATE SET 
          remaining_inventory = $6,
          images = $7,
          drop_time = NOW() + INTERVAL '${prod.dropDelay}';
      `, [prod.id, prod.name, prod.description, prod.price, prod.stock, prod.stock, prod.images]);
      
      await redisClient.set(`inventory:${prod.id}`, prod.stock);
      console.log(`Seeded: ${prod.name} (${prod.stock} units)`);
    }
    
    console.log('PostgreSQL and Redis seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
