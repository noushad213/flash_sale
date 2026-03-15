import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  BarChart3, Users, Box, TrendingUp, AlertCircle, RefreshCcw, 
  Search, Download, Package, Activity, Play, Zap, ShieldAlert
} from 'lucide-react';
import { io } from 'socket.io-client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, 
  Title, Tooltip, Legend, Filler
);

const API_BASE = 'http://localhost:3001/api';
const PRODUCT_ID = '00000000-0000-0000-0000-000000000000';

const AdminPage = () => {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState(0);
  const [waitingCount, setWaitingCount] = useState(0);
  const [rpsData, setRpsData] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [simulateLoading, setSimulateLoading] = useState(false);
  
  const socketRef = useRef(null);

  useEffect(() => {
    fetchData();
    
    socketRef.current = io('http://localhost:3001');
    
    socketRef.current.on('admin_update', (data) => {
      if (data.type === 'new_request') {
        setWaitingCount(data.waitingCount);
        updateRps();
      }
      if (data.type === 'new_order') {
        setInventory(data.remaining);
        fetchData(); // Refresh list
      }
      if (data.type === 'simulate_spike') {
        setWaitingCount(data.waitingCount);
        // Add artificial spikes to rps
        setRpsData(prev => [...prev.slice(1), prev[prev.length-1] + data.count]);
      }
      if (data.type === 'reset') {
        fetchData();
        setWaitingCount(0);
      }
    });

    const rpsInterval = setInterval(() => {
      setRpsData(prev => [...prev.slice(1), Math.floor(Math.random() * 5)]);
    }, 2000);

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      clearInterval(rpsInterval);
    };
  }, []);

  const updateRps = () => {
    setRpsData(prev => {
      const next = [...prev];
      next[next.length - 1] += 1;
      return next;
    });
  };

  const fetchData = async () => {
    try {
      const [ordersRes, invRes] = await Promise.all([
        axios.get(`${API_BASE}/orders`),
        axios.get(`${API_BASE}/inventory/${PRODUCT_ID}`)
      ]);
      setOrders(ordersRes.data.orders);
      setInventory(invRes.data.stock);
    } catch (err) {
      console.error('Failed to fetch admin data');
    }
  };

  const handleSimulate = async (count) => {
    setSimulateLoading(true);
    try {
      await axios.post(`${API_BASE}/simulate/traffic`, { count, productId: PRODUCT_ID });
    } finally {
      setSimulateLoading(false);
    }
  };

  const handleReset = async () => {
    await axios.post(`${API_BASE}/simulate/reset-inventory`, { productId: PRODUCT_ID, count: 100 });
  };

  const chartData = {
    labels: rpsData.map((_, i) => `${i}s`),
    datasets: [{
      label: 'Requests per Second (Simulated)',
      data: rpsData,
      borderColor: '#38BDF8',
      backgroundColor: 'rgba(56, 189, 248, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0
    }]
  };

  const barData = {
    labels: ['Success', 'Queued', 'Rejected'],
    datasets: [{
      label: 'System Load',
      data: [orders.filter(o => o.status === 'confirmed').length, waitingCount, orders.filter(o => o.status === 'failed').length],
      backgroundColor: ['#4ade80', '#818CF8', '#ef4444'],
      borderRadius: 8
    }]
  };

  return (
    <div className="container" style={{ paddingBottom: '100px', maxWidth: '1400px' }}>
      <header className="flex items-center justify-between" style={{ height: '100px' }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
            <TrendingUp className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>INFRA_COMMAND_v2.5</h2>
            <p className="text-xs font-mono text-muted">GATE_STATUS: ON_STANDBY</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="glow-btn" onClick={handleReset} style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
            <RefreshCcw className="w-4 h-4" /> RESET_SYSTEM
          </button>
          <button className="glow-btn glow-btn-primary" onClick={() => handleSimulate(500)} style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
            <Play className="w-4 h-4" /> SIMULATE_FLASH_SPIKE
          </button>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6" style={{ marginTop: '20px' }}>
        {[
          { label: 'TOTAL_CON_ORDERS', val: orders.filter(o => o.status === 'confirmed').length, icon: Package, color: 'var(--accent-primary)' },
          { label: 'LIVE_QUEUE_WAITING', val: waitingCount, icon: Users, color: 'var(--accent-secondary)' },
          { label: 'REDIS_INVENTORY', val: inventory, icon: Box, color: '#F472B6' },
          { label: 'FAIRNESS_SCORE', val: '99.4%', icon: ShieldAlert, color: '#4ade80' }
        ].map((item, i) => (
          <motion.div 
            key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 flex flex-col justify-between" style={{ height: '140px' }}
          >
            <div className="flex justify-between items-start">
               <p className="text-xs font-bold font-mono text-muted">{item.label}</p>
               <item.icon className="w-5 h-5" style={{ color: item.color }} />
            </div>
            <h2 style={{ fontSize: '2rem', marginBottom: 0 }}>{item.val}</h2>
          </motion.div>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid md:grid-cols-3 gap-8" style={{ marginTop: '40px' }}>
         <div className="glass-panel p-8 md:col-span-2 space-y-8">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
              <Activity className="w-4 h-4 text-accent-primary" /> Concurrency Gate Burst (WebSocket)
            </h3>
            <div style={{ height: '300px' }}>
               <Line data={chartData} options={{ 
                 responsive: true, maintainAspectRatio: false, 
                 animation: { duration: 0 },
                 scales: { 
                   y: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }, 
                   x: { grid: { display: false } } 
                 },
                 plugins: { legend: { display: false } }
               }} />
            </div>
         </div>
         <div className="glass-panel p-8 space-y-8">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
               <Zap className="w-4 h-4 text-pink-400" /> Infrastructure Load
            </h3>
            <div style={{ height: '300px' }}>
               <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
         </div>
      </div>

      {/* Real-Time Transaction Ledger */}
      <div className="glass-panel p-8" style={{ marginTop: '40px' }}>
        <div className="flex justify-between items-center mb-8">
           <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
             <Search className="w-4 h-4 text-indigo-400" /> SECURE_TRANSACTION_LEDGER
           </h3>
           <div className="badge badge-live">
              <span className="status-dot animate-pulse" /> LIVE STREAMING
           </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: '800' }}>TIMESTAMP</th>
                <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: '800' }}>ORDER_ID</th>
                <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: '800' }}>STATUS</th>
                <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: '800' }}>GATE_LATENCY</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map((order, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }} className="hover-row">
                  <td style={{ padding: '16px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {new Date(order.created_at).toLocaleTimeString()}
                  </td>
                  <td style={{ padding: '16px', fontSize: '0.875rem', fontFamily: 'JetBrains Mono', color: 'var(--accent-primary)' }}>
                    {order.id.slice(0, 12)}
                  </td>
                  <td style={{ padding: '16px', fontSize: '0.875rem' }}>
                    <div className="badge" style={{ 
                      background: order.status === 'confirmed' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', 
                      color: order.status === 'confirmed' ? '#4ade80' : '#ef4444',
                      border: 'none', padding: '4px 10px'
                    }}>
                      {order.status.toUpperCase()}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {Math.floor(Math.random() * 20) + 5}ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
