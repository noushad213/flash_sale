const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const buyRoutes = require('./routes/buy');
const authRoutes = require('./auth');
const simulateRoutes = require('./routes/simulate');

const http = require('http');
const { Server } = require('socket.io');

const { initWorker } = require('./queue/queueWorker');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize Worker
initWorker(io);

// Pass io to routes via middleware
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// Tactical Grid Cache & Real-time Telemetry State
// ─────────────────────────────────────────────────────────────────────────────
let stats = {
  totalVisitors: 0,
  browsingUsers: 0,
  checkingOutUsers: 0,
  rejectedCount: 0,
  stock: {
    'void-hoodie': 2,
    'vortex-kb': 2
  },
  reservations: {
    'void-hoodie': 0,
    'vortex-kb': 0
  }
};

const broadcastStats = () => {
  io.emit('stats_update', stats);
};

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // 1. Total Visitors tracking
  stats.totalVisitors++;
  broadcastStats();

  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  // 2. Browsing Telemetry
  socket.on('browsing_start', () => {
    stats.browsingUsers++;
    socket.isBrowsing = true;
    broadcastStats();
  });

  socket.on('browsing_stop', () => {
    if (socket.isBrowsing) {
      stats.browsingUsers--;
      socket.isBrowsing = false;
      broadcastStats();
    }
  });

  // 3. Checkout Reservation Logic (Soft Stock)
  socket.on('checkout_start', (productId) => {
    const available = stats.stock[productId] - stats.reservations[productId];
    
    if (available > 0) {
      stats.checkingOutUsers++;
      stats.reservations[productId]++;
      socket.checkoutProduct = productId;
      socket.emit('checkout_accepted', { productId, remaining: available - 1 });
      console.log(`[RESERVE] User ${socket.id} reserved 1 ${productId}`);
    } else {
      stats.rejectedCount++;
      socket.emit('checkout_rejected', { productId, reason: 'OUT_OF_STOCK' });
      console.log(`[REJECT] User ${socket.id} rejected for ${productId}`);
    }
    broadcastStats();
  });

  socket.on('checkout_leave', () => {
    if (socket.checkoutProduct) {
      stats.checkingOutUsers--;
      stats.reservations[socket.checkoutProduct]--;
      console.log(`[RELEASE] User ${socket.id} released ${socket.checkoutProduct}`);
      socket.checkoutProduct = null;
      broadcastStats();
    }
  });

  // 4. Manual Telemetry Events (from Admin panel buttons or simulation)
  socket.on('admin_event', (event) => {
    if (event.type === 'SUCCESS') {
      stats.stock[event.productId] = Math.max(0, stats.stock[event.productId] - 1);
      // If they were in checkout, release the reservation but permanent stock drop
      if (socket.checkoutProduct === event.productId) {
        stats.reservations[event.productId]--;
        stats.checkingOutUsers--;
        socket.checkoutProduct = null;
      }
    }
    if (event.type === 'REJECTED') {
      stats.rejectedCount++;
    }
    broadcastStats();
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Auto-cleanup on disconnect
    if (socket.isBrowsing) stats.browsingUsers--;
    
    if (socket.checkoutProduct) {
      stats.checkingOutUsers--;
      stats.reservations[socket.checkoutProduct]--;
      console.log(`[AUTO-RELEASE] Disconnect: Released ${socket.checkoutProduct}`);
    }
    
    broadcastStats();
  });
});

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
app.use('/api/simulate', simulateRoutes);

app.get('/health', async (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()) + 's',
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));