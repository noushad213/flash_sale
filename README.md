# ⚡ MIDNIGHT DROP GATEWAY

A premium, high-concurrency Flash Sale Platform engineered for the modern collector. Built to handle massive traffic spikes while ensuring iron-clad inventory integrity and a cinematic user experience.

## 🚀 Key Features

- **Virtual Waiting Room**: Intelligent FIFO queue system using BullMQ to manage traffic surges without crashing the database.
- **Concurrency Gate**: Atomic inventory management via Redis Lua scripts to prevent overselling.
- **Cinematic UX**: High-fidelity dark mode aesthetic with glassmorphism, Framer Motion animations, and real-time WebSocket feedback.
- **Infrastructure Dashboard**: Live telemetry, RPS burst monitoring, and a "Flash Spike" simulator for stress-testing.
- **Secure Provisioning**: JWT-based authentication with protected purchase gateways.
- **Multi-Release Support**: Scalable architecture for handling multiple product drops with unique inventory and pricing.

---

## 🛠️ Infrastructure Setup

### 1. Start Services (Docker)
Ensure you have Docker installed, then run:
```bash
docker-compose up -d
```
*This starts PostgreSQL and Redis with the correct credentials.*

### 2. Backend Setup
```bash
cd backend
npm install
node seed.js  # Populate product drops
npm run dev   # Start API server
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev   # Launch the gateway
```

---

## 🕹️ Demo Flow (Winning Strategy)

1. **Dashboard Monitoring**: Open `/admin` to see the live infrastructure health.
2. **The Drop Center**: Browse the available releases at `/`.
3. **The Waiting Room**: Open a product page and click **RESERVE NOW**. You will see your real-time queue position.
4. **Stress Test**: Go back to the Admin Dashboard and hit **SIMULATE_FLASH_SPIKE**. Watch the telemetry charts spike and the queue backlog grow in real-time.

---

## 🏗️ Tech Stack

- **Frontend**: React, Vite, Framer Motion, Lucide, TailwindCSS (for utility), Socket.io-client.
- **Backend**: Node.js, Express, PostgreSQL, Redis, BullMQ, Socket.io.
- **Integrity**: ioredis, pg, bcrypt, jsonwebtoken.

*Engineered for the night.*