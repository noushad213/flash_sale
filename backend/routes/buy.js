const express = require('express');
const router = express.Router();
const { checkout, seedInventory, getInventory } = require('../controllers/buyController');
const authMiddleware = require('../middleware');
const { query } = require('../db');

// ─── PROTECTED ROUTES (need JWT token) ───────────────
router.post('/checkout', authMiddleware, checkout);

router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ orders: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch orders' });
  }
});

// ─── PUBLIC ROUTES ────────────────────────────────────
router.post('/seed-inventory', seedInventory);

router.get('/inventory/:productId', getInventory);

router.get('/product/:productId', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, total_inventory, remaining_inventory, drop_time FROM products WHERE id = $1',
      [req.params.productId]
    );
    if (!result.rows[0])
      return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch product' });
  }
});

router.get('/products', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, description, price, total_inventory, remaining_inventory, drop_time, images FROM products ORDER BY created_at ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch products' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const result = await query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json({ orders: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch orders' });
  }
});

router.get('/debug', async (req, res) => {
  try {
    const result = await query('SELECT * FROM orders');
    res.json({
      redis: 'real redis connected',
      orders: result.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Debug failed' });
  }
});

module.exports = router;