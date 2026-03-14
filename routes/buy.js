const express = require('express');
const router = express.Router();
const { checkout, seedInventory, getInventory } = require('../controllers/buyController');
const redis = require('../redis');
const db = require('../db');

router.post('/checkout', checkout);
router.post('/seed-inventory', seedInventory);
router.get('/inventory/:productId', getInventory);

router.get('/debug', async (req, res) => {
  res.json({
    redis_store: redis._store,
    orders: db.getAll(),
  });
});

router.get('/orders', async (req, res) => {
  res.json({ orders: db.getAll() });
});

module.exports = router;