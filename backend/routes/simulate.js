const express = require('express');
const router = express.Router();
const { checkoutQueue } = require('../queue/checkoutQueue');
const { query } = require('../db');
const redis = require('../redis');

router.post('/traffic', async (req, res) => {
  const { count = 100, productId } = req.body;
  
  if (!productId) return res.status(400).json({ error: 'Missing productId' });

  console.log(`Simulating ${count} requests for ${productId}`);

  // We simulate by adding many jobs to the queue
  // In a real simulation, we might use multiple fake user IDs
  const jobs = [];
  for (let i = 0; i < count; i++) {
    jobs.push({
      name: 'checkout',
      data: {
        userId: `fake-user-${Math.floor(Math.random() * 1000000)}`,
        productId,
        size: ['S', 'M', 'L', 'XL'][Math.floor(Math.random() * 4)]
      }
    });
  }

  await checkoutQueue.addBulk(jobs);
  
  const waitingCount = await checkoutQueue.getWaitingCount();
  if (req.io) {
    req.io.emit('admin_update', { 
      type: 'simulate_spike', 
      count,
      waitingCount
    });
  }

  res.json({ message: `Simulated ${count} requests`, waitingCount });
});

router.post('/reset-inventory', async (req, res) => {
  const { productId, count = 100 } = req.body;
  await redis.set(`inventory:${productId}`, count);
  await query('UPDATE products SET remaining_inventory = $1 WHERE id = $2', [count, productId]);
  await query('DELETE FROM orders WHERE product_id = $1', [productId]);
  
  if (req.io) req.io.emit('admin_update', { type: 'reset' });
  
  res.json({ message: 'System reset' });
});

module.exports = router;
