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

exports.checkout = async (req, res) => {
  const { productId, size } = req.body;
  const userId = req.user.id;

  if (!productId || !size) {
    return res.status(400).json({ status: 'error', message: 'Missing fields.' });
  }

  try {
    // Step 0: check product exists and drop time has started
    const productResult = await query(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    );

    const product = productResult.rows[0];

    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found.' });
    }

    if (new Date() < new Date(product.drop_time)) {
      return res.status(400).json({
        status: 'error',
        message: 'Sale has not started yet.',
        drop_time: product.drop_time
      });
    }

    // Step 1: atomic inventory decrement via Lua
    let remaining;
    try {
      remaining = await redis.eval(LUA_DECR, {
        keys: [INVENTORY_KEY(productId)],
        arguments: [],
      });
    } catch (redisErr) {
      console.error('Redis error:', redisErr);
      return res.status(503).json({
        status: 'error',
        message: 'System busy. Please try again in a moment.'
      });
    }

    if (remaining === -1) {
      return res.status(200).json({ status: 'sold_out', message: 'Sorry, this item is sold out.' });
    }

    // Step 2: write confirmed order to PostgreSQL
    const orderId = uuidv4();
    await query(
      `INSERT INTO orders (id, user_id, product_id, size, status, created_at)
       VALUES ($1, $2, $3, $4, 'confirmed', NOW())`,
      [orderId, userId, productId, size]
    );

    return res.status(200).json({
      status: 'success',
      message: 'Order confirmed!',
      orderId,
      remaining,
    });

  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(500).json({ status: 'error', message: 'Something went wrong.' });
  }
};

exports.seedInventory = async (req, res) => {
  const { productId, quantity } = req.body;
  await redis.set(INVENTORY_KEY(productId), String(quantity));
  return res.status(200).json({ message: `Inventory set: ${quantity} units for ${productId}` });
};

exports.getInventory = async (req, res) => {
  const { productId } = req.params;
  const stock = await redis.get(INVENTORY_KEY(productId));
  return res.status(200).json({ productId, stock: parseInt(stock) || 0 });
};