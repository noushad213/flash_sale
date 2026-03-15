import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, Users, Box, TrendingUp, Activity, Play, Zap, ShieldAlert, 
  Search, RefreshCcw, Command, Trash2, Power
} from 'lucide-react';
import { useTelemetry } from '../context/TelemetryContext';
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

const AdminPage = () => {
  const { events, metrics, resetMetrics, pushEvent } = useTelemetry();
  const [isLive, setIsLive] = useState(true);
  const [killSwitchActive, setKillSwitchActive] = useState(false);

  // Sync RPS data for the chart
  const hartData = {
    labels: metrics.rps.map((_, i) => `${i}s`),
    datasets: [{
      label: 'GATE_BURST_RPS',
      data: metrics.rps,
      borderColor: '#ff453a',
      backgroundColor: 'rgba(255, 69, 58, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0
    }]
  };

  const handleSimulateBurst = () => {
    // Simulate multi-hit burst
    const products = ['void-hoodie', 'vortex-kb'];
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const prod = products[Math.floor(Math.random() * products.length)];
        pushEvent({ 
          type: 'CHECKOUT_START', 
          productId: prod,
          status: 'pending'
        });
        
        // Randomly succeed or fail based on current simulated load
        setTimeout(() => {
          const success = Math.random() > 0.3;
          pushEvent({
            type: success ? 'SUCCESS' : 'REJECTED',
            productId: prod,
            text: success ? `TRANSACTION_COMMIT: ${prod}` : `GATE_LOCKED: CONGESTION`
          });
        }, Math.random() * 2000);
      }, i * 50);
    }
  };

  return (
    <div className="admin-war-room min-h-screen bg-[#050505] text-white p-8">
      {/* Dashboard Header */}
      <header className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <div className={`p-4 rounded-2xl ${killSwitchActive ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white'}`}>
            <Command size={32} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-display text-4xl uppercase tracking-tighter m-0">War Room</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`}></span>
              <p className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase m-0">
                {killSwitchActive ? 'SYSTEM_LOCKED_BY_ADMIN' : 'GATE_STATUS: ON_STANDBY'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            className="elliptical-btn" 
            style={{ minWidth: 'auto', padding: '12px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            onClick={resetMetrics}
          >
            <RefreshCcw size={16} className="mr-2" /> RESET
          </button>
          <button 
            className="elliptical-btn" 
            style={{ minWidth: 'auto', padding: '12px 24px', background: killSwitchActive ? '#ff453a' : '#fff', color: killSwitchActive ? '#fff' : '#000' }}
            onClick={() => setKillSwitchActive(!killSwitchActive)}
          >
            <Power size={16} className="mr-2" /> KILL_SWITCH
          </button>
          <button 
            className="elliptical-btn" 
            style={{ minWidth: 'auto', padding: '12px 32px', background: '#fff', color: '#000' }}
            onClick={handleSimulateBurst}
          >
            <Play size={16} className="mr-2" fill="currentColor" /> INJECT_BURST
          </button>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'CONCURRENT_REQUESTS', val: metrics.totalRequests, icon: Activity, color: '#38BDF8' },
          { label: 'ACTIVE_QUEUE', val: metrics.activeQueue, icon: Users, color: '#818CF8' },
          { label: 'ATOMIC_SUCCESS', val: metrics.successCount, icon: Zap, color: '#4ade80' },
          { label: 'LOCKED_REJECTIONS', val: metrics.rejectedCount, icon: ShieldAlert, color: '#ff453a' }
        ].map((item, i) => (
          <div key={i} className="glass-card p-8 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: item.color }}></div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">{item.label}</span>
              <item.icon size={18} style={{ color: item.color }} />
            </div>
            <h2 className="text-5xl font-display tracking-tighter m-0">{item.val}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Real-Time Pulse Chart */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-10 border border-white/5">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[11px] font-bold tracking-[0.3em] uppercase text-white/40">GATE_BURST_TELEMETRY</h3>
              <span className="text-[10px] font-mono text-white/20">UNITS: REQUESTS/SEC</span>
            </div>
            <div style={{ height: '350px' }}>
              <Line data={hartData} options={{ 
                responsive: true, maintainAspectRatio: false, 
                animation: { duration: 0 },
                scales: { 
                  y: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true, border: { display: false } }, 
                  x: { grid: { display: false }, border: { display: false } } 
                },
                plugins: { legend: { display: false } }
              }} />
            </div>
          </div>

          {/* New Pending Payments Verification Queue */}
          <div className="glass-card p-10 border border-white/5">
            <h3 className="text-[11px] font-bold tracking-[0.3em] uppercase text-white/40 mb-8">PENDING_SETTLEMENTS</h3>
            <div className="space-y-4">
              {metrics.pendingPayments.filter(p => p.status === 'PENDING').length === 0 ? (
                <div className="text-[10px] text-white/20 uppercase tracking-[0.2em] py-4">No pending settlements found.</div>
              ) : (
                metrics.pendingPayments.filter(p => p.status === 'PENDING').map(p => (
                  <div key={p.id} className="bg-white/5 p-6 rounded-xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="bg-white text-black font-display text-xl px-4 py-2 rounded-lg tracking-widest">{p.ref}</div>
                      <div>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest m-0 leading-tight">Identity: {p.customer?.name || 'UNKNOWN'}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest m-0 leading-tight">Phone: {p.customer?.phone || 'N/A'}</p>
                        <p className="text-sm font-bold text-white uppercase m-0 mt-1">${p.amount} — {p.productId}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => pushEvent({ type: 'PAYMENT_REJECTED', orderId: p.id })}
                        className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all"
                      >
                        Reject
                      </button>
                      <button 
                         onClick={() => pushEvent({ type: 'PAYMENT_VERIFIED', orderId: p.id })}
                         className="bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-black px-6 py-2 rounded-lg text-[10px] font-bold uppercase transition-all"
                      >
                        Verify Payment
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Live Transaction Ledger */}
        <div className="glass-card flex flex-col border border-white/5 overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-[11px] font-bold tracking-[0.3em] uppercase text-white/40">LIVE_GATE_LEDGER</h3>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[9px] font-bold text-white/30 uppercase">Streaming</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px]">
            {events.length === 0 ? (
              <div className="flex items-center justify-center h-full text-white/10 uppercase tracking-widest text-center px-10">
                Waiting for incoming packets...
              </div>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="flex gap-4 mb-3 border-l border-white/5 pl-4 py-1 hover:bg-white/5 transition-colors">
                  <span className="text-white/20">[{ev.timestamp}]</span>
                  <span className={`${
                    ev.type === 'CHECKOUT_START' ? 'text-blue-400' : 
                    ev.type === 'SUCCESS' ? 'text-green-400' : 
                    'text-red-400'
                  }`}>
                    {ev.type}
                  </span>
                  <span className="text-white/50">{ev.productId || 'GATE'}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
