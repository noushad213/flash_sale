const { Queue, Worker } = require('bullmq');
const redis = require('../redis');
require('dotenv').config();

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

const checkoutQueue = new Queue('checkoutQueue', { connection });

module.exports = { checkoutQueue, connection };