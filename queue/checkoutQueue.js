const { Queue, Worker } = require('bullmq');
const { checkout } = require('../controllers/buyController');

const connection = { host: 'localhost', port: 6379 };

const checkoutQueue = new Queue('checkout', { connection });

const worker = new Worker('checkout', async (job) => {
  const { userId, productId, size } = job.data;
  return await checkout(userId, productId, size);
}, { connection, concurrency: 1 });

module.exports = checkoutQueue;