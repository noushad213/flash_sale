// db.js — real PostgreSQL connection
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'flashsale',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

const query = async (sql, params) => {
  const result = await pool.query(sql, params);
  return result;
};

const getAll = async () => {
  const result = await pool.query('SELECT * FROM orders');
  return result.rows;
};

module.exports = { query, getAll };