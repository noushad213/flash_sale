// seed_demo_users.js - Creates 3 demo users for the flash sale demo
require('dotenv').config();
const bcrypt = require('bcrypt');
const { query } = require('./db');

async function seedUsers() {
  console.log('Seeding demo users...');
  
  const demoUsers = [
    { name: 'Lubaib', email: 'lubaib@midnight.io', password: '1234' },
    { name: 'Operator-02', email: 'op02@midnight.io', password: '1234' },
    { name: 'Operator-03', email: 'op03@midnight.io', password: '1234' },
  ];

  for (const u of demoUsers) {
    try {
      const hash = await bcrypt.hash(u.password, 10);
      const id = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await query(
        'INSERT INTO users (id, name, email, password_hash) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET name = $2',
        [id, u.name, u.email, hash]
      );
      console.log(`✅ ${u.name} | ${u.email} | pass: ${u.password}`);
    } catch (err) {
      console.error(`❌ Failed for ${u.email}:`, err.message);
    }
  }

  // Seed inventory to Redis
  const redis = require('./redis');
  await redis.set('inventory:void-hoodie', '2');
  await redis.set('inventory:vortex-kb', '2');
  console.log('\n✅ Redis inventory reset to 2 units each.');
  
  console.log('\n=== DEMO CREDENTIALS ===');
  console.log('Admin:       lubaib@midnight.io / 1234  → /admin-login');
  console.log('User 1:      lubaib@midnight.io / 1234  → /login');
  console.log('User 2:      op02@midnight.io   / 1234  → /login');
  console.log('User 3:      op03@midnight.io   / 1234  → /login');
  console.log('========================');
  
  process.exit(0);
}

seedUsers();
