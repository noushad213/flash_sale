const { v4: uuidv4 } = require('uuid');
const redis = require('../redis');
const pool = require('../db');

const INVENTORY_KEY = (productId) => `inventory:${productId}`;
const USER_LOCK_KEY = (userId, productId) => `lock:${userId}:${productId}`;

// Lua script — atomic check + decrement. Runs as one unit on Redis.
// Returns -1 if sold out, else returns remaining stock.
const LUA_DECR = `
  local stock = tonumber(redis.call('GET', KEYS[1]))
  if stock == nil or stock <= 0 then
    return -1
  end
  return redis.call('DECR', KEYS[1])
`;

exports.checkout = async (req, res) => {
  const { userId, productId, size } = req.body;

  if (!userId || !productId || !size) {
    return res.status(400).json({ status: 'error', message: 'Missing fields.' });
  }

  try {
    // Step 1: prevent the same user from buying twice
    const lockKey = USER_LOCK_KEY(userId, productId);
    const alreadyBought = await redis.set(lockKey, '1', {
      NX: true,   // only set if key doesn't exist
      EX: 86400,  // expires in 24h
    });

    if (alreadyBought === null) {
      return res.status(200).json({ status: 'rejected', message: 'You have already purchased this item.' });
    }

    // Step 2: atomic inventory decrement via Lua
    const remaining = await redis.eval(LUA_DECR, {
      keys: [INVENTORY_KEY(productId)],
      arguments: [],
    });

    if (remaining === -1) {
      // Undo the user lock so they can try other products
      await redis.del(lockKey);
      return res.status(200).json({ status: 'sold_out', message: 'Sorry, this item is sold out.' });
    }

    // Step 3: write confirmed order to Postgres
    const orderId = uuidv4();
    await pool.query(
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
    return res.status(500).json({ status: 'error', message: 'Something went wrong. Try again.' });
  }
};

// Seed inventory into Redis — call this once when the drop goes live
exports.seedInventory = async (req, res) => {
  const { productId, quantity } = req.body;
  await redis.set(INVENTORY_KEY(productId), quantity);
  return res.status(200).json({ message: `Inventory set: ${quantity} units for product ${productId}` });
};

// Get current stock — frontend polls this
exports.getInventory = async (req, res) => {
  const { productId } = req.params;
  const stock = await redis.get(INVENTORY_KEY(productId));
  return res.status(200).json({ productId, stock: parseInt(stock) || 0 });
};