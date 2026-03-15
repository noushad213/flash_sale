const { Worker } = require('bullmq');
const { connection } = require('./checkoutQueue');
const { v4: uuidv4 } = require('uuid');
const redis = require('../redis');
const { query } = require('../db');

const INVENTORY_KEY = (productId) => `inventory:${productId}`;
const LUA_DECR = `
  local stock = tonumber(redis.call('GET', KEYS[1]))
  if stock == nil or stock <= 0 then
    return -1
  end
  return redis.call('DECR', KEYS[1])
`;

// This function simulates the core checkout logic that was previously in the controller
const processCheckout = async (job, io) => {
  const { userId, productId, size } = job.data;
  const INVENTORY_KEY_STR = INVENTORY_KEY(productId);

  try {
    // 1. Atomic decrement
    // Note: In worker, we use ioredis/redis client directly
    // BullMQ connection uses ioredis
    
    // For simplicity in this hackathon setup, we'll use the existing redis client from ../redis
    // assuming it's available and connected.
    
    const remaining = await redis.eval(LUA_DECR, {
      keys: [INVENTORY_KEY_STR],
      arguments: [],
    });

    if (remaining === -1) {
      if (io) io.to(userId).emit('checkout_result', { status: 'sold_out', message: 'Sold out!' });
      return { status: 'sold_out' };
    }

    // 2. Create PENDING order
    const orderId = uuidv4();
    await query(
      `INSERT INTO orders (id, user_id, product_id, size, status, created_at)
       VALUES ($1, $2, $3, $4, 'pending', NOW())`,
      [orderId, userId, productId, size]
    );

    // 3. Simulate Payment (20% failure)
    const paymentSuccess = Math.random() > 0.2;

    if (paymentSuccess) {
      await query("UPDATE orders SET status = 'confirmed' WHERE id = $1", [orderId]);
      
      // Sync DB inventory
      query('UPDATE products SET remaining_inventory = remaining_inventory - 1 WHERE id = $1', [productId])
        .catch(err => console.error('DB Sync Error:', err));

      if (io) io.to(userId).emit('checkout_result', { 
        status: 'success', 
        orderId, 
        remaining,
        message: 'Order confirmed!' 
      });
      
      // Update global admin stats
      if (io) io.emit('admin_update', { type: 'new_order', productId, remaining });
      
      return { status: 'success', orderId };
    } else {
      // Rollback
      await redis.incr(INVENTORY_KEY_STR);
      await query("UPDATE orders SET status = 'failed' WHERE id = $1", [orderId]);
      
      if (io) io.to(userId).emit('checkout_result', { 
        status: 'error', 
        message: 'Payment failed. Spot released.' 
      });
      
      return { status: 'payment_failed' };
    }

  } catch (err) {
    console.error('Worker Error:', err);
    if (io) io.to(userId).emit('checkout_result', { status: 'error', message: 'Internal error' });
    throw err;
  }
};

const initWorker = (io) => {
  const worker = new Worker('checkoutQueue', async (job) => {
    return await processCheckout(job, io);
  }, { connection });

  worker.on('completed', job => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err);
  });
  
  return worker;
};

module.exports = { initWorker };
