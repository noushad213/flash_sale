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

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
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