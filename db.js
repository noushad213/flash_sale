// db.js — mock, replace with real Pool later
const orders = []; // in-memory store

const query = async (sql, params) => {
  // simulate INSERT into orders
  if (sql.trim().startsWith('INSERT INTO orders')) {
    const order = {
      id: params[0],
      user_id: params[1],
      product_id: params[2],
      size: params[3],
      status: 'confirmed',
      created_at: new Date().toISOString(),
    };
    orders.push(order);
    return { rowCount: 1 };
  }

  // simulate SELECT orders
  if (sql.trim().startsWith('SELECT')) {
    return { rows: orders };
  }

  return { rows: [], rowCount: 0 };
};

// expose so you can inspect during dev
const getAll = () => orders;

module.exports = { query, getAll };