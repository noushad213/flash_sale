const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const buyRoutes = require('./routes/buy');
const authRoutes = require('./auth');

const app = express();
app.use(cors());
app.use(express.json());

// Rate limiter — max 10 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { status: 'error', message: 'Too many requests. Slow down.' }
});

// Strict limiter for checkout — max 3 attempts per minute
const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { status: 'error', message: 'Too many checkout attempts.' }
});

app.use('/api', limiter);
app.use('/api/checkout', checkoutLimiter);
app.use('/api', buyRoutes);
app.use('/auth', authRoutes);

app.get('/health', async (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()) + 's',
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));