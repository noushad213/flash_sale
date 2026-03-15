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

const { checkoutQueue } = require('../queue/checkoutQueue');

exports.checkout = async (req, res) => {
  const { productId, size } = req.body;
  const userId = req.user.id; // Corrected: use actual userId from token

  if (!productId || !size) {
    return res.status(400).json({ status: 'error', message: 'Missing fields.' });
  }

  try {
    // 1. Idempotency Check (Don't let user buy twice)
    const existingOrder = await query(
      'SELECT id FROM orders WHERE user_id = $1 AND product_id = $2 AND status != \'failed\'',
      [userId, productId]
    );
    if (existingOrder.rows.length > 0) {
      return res.status(400).json({ status: 'error', message: 'You already have an active order.' });
    }

    // 2. Check if product exists and drop started
    const productResult = await query('SELECT * FROM products WHERE id = $1', [productId]);
    const product = productResult.rows[0];
    if (!product) return res.status(404).json({ status: 'error', message: 'Product not found.' });

    if (new Date() < new Date(product.drop_time)) {
      return res.status(400).json({ status: 'error', message: 'Sale not started.' });
    }

    // 3. Check Redis for Sold Out (fast fail before queue)
    const stock = await redis.get(INVENTORY_KEY(productId));
    if (parseInt(stock) <= 0) {
      return res.status(200).json({ status: 'sold_out', message: 'Sold out!' });
    }

    // 4. Add to Queue
    const job = await checkoutQueue.add('checkout', {
      userId,
      productId,
      size,
    });

    const waitingCount = await checkoutQueue.getWaitingCount();

    // Broadcast to admins that a new request arrived
    if (req.io) {
      req.io.emit('admin_update', { 
        type: 'new_request', 
        waitingCount 
      });
    }

    return res.status(202).json({
      status: 'queued',
      message: 'You are in the waiting room.',
      jobId: job.id,
      position: waitingCount
    });

  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(500).json({ status: 'error', message: 'Something went wrong.' });
  }
};

exports.seedInventory = async (req, res) => {
  const { productId, quantity } = req.body;
  await redis.set(INVENTORY_KEY(productId), String(quantity));
  // Also sync to PostgreSQL
  await query(
    'UPDATE products SET remaining_inventory = $1 WHERE id = $2',
    [quantity, productId]
  );
  return res.status(200).json({ message: `Inventory set: ${quantity} units for ${productId}` });
};

exports.getInventory = async (req, res) => {
  const { productId } = req.params;
  const stock = await redis.get(INVENTORY_KEY(productId));
  return res.status(200).json({ productId, stock: parseInt(stock) || 0 });
};