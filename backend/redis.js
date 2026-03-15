// redis.js — real Redis connection
const { createClient } = require('redis');
require('dotenv').config();

const client = process.env.REDIS_URL
  ? createClient({ url: process.env.REDIS_URL })
  : createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      }
    });

client.on('error', (err) => console.error('Redis error:', err));

client.connect();

module.exports = client;