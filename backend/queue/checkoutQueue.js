const { Queue, Worker } = require('bullmq');
const redis = require('../redis');
require('dotenv').config();

const connection = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    };

const checkoutQueue = new Queue('checkoutQueue', { connection });

module.exports = { checkoutQueue, connection };