const express = require('express');
const cors = require('cors');
require('dotenv').config();

const buyRoutes = require('./routes/buy');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', buyRoutes);

app.get('/health', async (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()) + 's',
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));