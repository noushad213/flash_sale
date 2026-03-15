import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Activity, Zap, ShieldAlert,
  RefreshCcw, Power, Play, LogOut,
  Search, Bell, MessageSquare,
  LayoutDashboard, ShoppingBag, User,
  FileText, Calendar, Columns, MapPin, MoreHorizontal, Command, Menu
} from 'lucide-react';
import { useTelemetry } from '../context/TelemetryContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
);

const AdminPage = () => {
  const { events, metrics, resetMetrics, pushEvent } = useTelemetry();
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    navigate('/admin-login');
  };

  const chartData = {
    labels: metrics.rps.map((_, i) => `${i}s`),
    datasets: [{
      label: 'Requests',
      data: metrics.rps,
      borderColor: '#3b7ddd',
      backgroundColor: 'rgba(59, 125, 221, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: metrics.rps.map((r, i) => i % 5 === 0 && i !== 0 ? 4 : 0),
      pointBackgroundColor: '#3b7ddd',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      borderWidth: 2
    }]
  };

  const handleSimulateBurst = () => {
    const products = ['void-hoodie', 'vortex-kb'];
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const prod = products[Math.floor(Math.random() * products.length)];
        pushEvent({ type: 'CHECKOUT_START', productId: prod, status: 'pending' });

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
    <div className="flex h-screen bg-[#020617] font-sans text-white overflow-hidden">

      {/* Sidebar - High Contrast Style */}
      <aside className={`${isSidebarOpen ? 'w-[280px] translate-x-0' : 'w-0 -translate-x-full overflow-hidden'} bg-[#000] border-r-4 border-[#1e293b] flex flex-col h-full shrink-0 transition-all duration-300 ease-in-out z-20`}>
        <div className="p-6 flex items-center gap-3 text-white border-b-4 border-[#1e293b] whitespace-nowrap min-w-[280px]">
          <ShieldAlert size={24} className="text-[#facc15]" />
          <span className="text-xl font-black tracking-tighter uppercase italic">
            Command_Center
          </span>
        </div>

        <div className="flex-1 py-4 custom-scrollbar whitespace-nowrap min-w-[280px]">
          <div className="flex flex-col gap-2 px-4 mt-6">
            <div className="bg-[#facc15] text-[#000] px-4 py-3 rounded-none flex items-center justify-between border-4 border-[#fef08a] cursor-pointer">
              <div className="flex items-center gap-3">
                <LayoutDashboard size={20} />
                <span className="text-sm font-black uppercase">Tactical_Grid</span>
              </div>
            </div>

            <div className="text-[#64748b] px-4 py-3 rounded-none flex items-center gap-3 hover:text-white transition-colors cursor-pointer group">
              <Activity size={20} className="group-hover:text-blue-400" />
              <span className="text-sm font-black uppercase">Live_Telemetry</span>
            </div>

            <div className="text-[#64748b] px-4 py-3 rounded-none flex items-center gap-3 hover:text-white transition-colors cursor-pointer group">
              <ShoppingBag size={20} className="group-hover:text-orange-400" />
              <span className="text-sm font-black uppercase">Settlements</span>
            </div>

            <div className="mt-auto pt-10">
              <button
                onClick={handleLogout}
                className="w-full hc-btn hc-btn-red"
              >
                <LogOut size={18} /> TERMINATE_SESSION
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Component */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">

        {/* Top Navbar */}
        <header className="h-[70px] bg-[#000] border-b-4 border-[#1e293b] flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-6">
            <Menu size={24} className="text-white cursor-pointer hover:text-[#facc15]" onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="relative hidden md:flex items-center">
              <span className="text-[10px] font-bold text-[#facc15] uppercase tracking-[0.2em] border border-[#facc15]/30 px-2 py-0.5 rounded">System_Status: Optimal</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end mr-4">
              <span className="text-[10px] font-black text-slate-500 uppercase">Administrator</span>
              <span className="text-xs font-bold text-white uppercase italic">Noushad_Node_01</span>
            </div>
            <div className="w-10 h-10 rounded-none border-2 border-[#facc15] p-0.5">
              <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover grayscale" />
            </div>
          </div>
        </header>

        {/* Dashboard Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#020617] p-8">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
            <div>
              <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
                Global_Control <span className="text-[#facc15] not-italic text-sm tracking-[0.3em] font-normal opacity-50 block sm:inline ml-0 sm:ml-4">V.4.2_SECURE</span>
              </h1>
            </div>
            <div className="hc-controls-bar">
              <button onClick={resetMetrics} className="hc-btn hc-btn-yellow">RESET_INTEL</button>
              <button onClick={handleSimulateBurst} className="hc-btn hc-btn-orange">INJECT_LOAD</button>
              <button
                onClick={() => setKillSwitchActive(!killSwitchActive)}
                className={`hc-btn ${killSwitchActive ? 'hc-btn-green' : 'hc-btn-red'}`}
              >
                {killSwitchActive ? 'RESTORE_NODE' : 'KILL_SWITCH'}
              </button>
            </div>
          </div>

          {/* Stats Grid using index.css .hc-stat-card classes */}
          <div className="hc-stats-grid">
            <div className="hc-stat-card hc-stat-card-blue">
              <div className="hc-stat-header">
                <span className="hc-stat-label">Total_Requests</span>
                <Activity size={24} />
              </div>
              <h2 className="hc-stat-value">{metrics.totalRequests.toLocaleString()}</h2>
              <span className="text-[10px] font-black uppercase mt-4 opacity-70">Traffic_Intensity: High</span>
            </div>

            <div className="hc-stat-card hc-stat-card-yellow">
              <div className="hc-stat-header">
                <span className="hc-stat-label">Active_Queue</span>
                <Users size={24} />
              </div>
              <h2 className="hc-stat-value">{metrics.activeQueue}</h2>
              <span className="text-[10px] font-black uppercase mt-4 opacity-70">Congestion_Level: Nominal</span>
            </div>

            <div className="hc-stat-card hc-stat-card-green">
              <div className="hc-stat-header">
                <span className="hc-stat-label">Verified_Trans</span>
                <Zap size={24} />
              </div>
              <h2 className="hc-stat-value">{metrics.successCount}</h2>
              <span className="text-[10px] font-black uppercase mt-4 opacity-70">Success_Rate: 98.4%</span>
            </div>

            <div className="hc-stat-card hc-stat-card-red">
              <div className="hc-stat-header">
                <span className="hc-stat-label">Gate_Blocked</span>
                <ShieldAlert size={24} />
              </div>
              <h2 className="hc-stat-value">{metrics.rejectedCount}</h2>
              <span className="text-[10px] font-black uppercase mt-4 opacity-70">Threat_Neutralized: Active</span>
            </div>
          </div>

          <div className="hc-main-grid">
            {/* Chart Area */}
            <div className="hc-main-col">
              <div className="hc-panel hc-panel-chart">
                <div className="hc-panel-header">
                  <h5 className="hc-panel-title hc-panel-title-yellow">Telemetry_Pulse</h5>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Live_Feed_01</span>
                </div>
                <div className="h-[400px] w-full">
                  <Line data={{
                    ...chartData,
                    datasets: [{
                      ...chartData.datasets[0],
                      borderColor: '#facc15',
                      backgroundColor: 'rgba(250, 204, 21, 0.1)',
                    }]
                  }} options={{
                    responsive: true, maintainAspectRatio: false,
                    animation: { duration: 0 },
                    scales: {
                      y: { grid: { color: '#1e293b' }, ticks: { color: '#64748b', font: { weight: 'bold' } } },
                      x: { grid: { display: false }, ticks: { color: '#64748b', font: { weight: 'bold' } } }
                    },
                    plugins: { legend: { display: false } }
                  }} />
                </div>
              </div>

              {/* Pending Settlements - High Contrast */}
              <div className="hc-panel hc-panel-settlements">
                <div className="hc-panel-header">
                  <h5 className="hc-panel-title hc-panel-title-orange">Pending_Settlements</h5>
                  <span className="hc-badge hc-badge-orange uppercase tracking-tighter">Authorization_Required</span>
                </div>

                <div className="mt-6">
                  {metrics.pendingPayments.filter(p => p.status === 'PENDING').length === 0 ? (
                    <div className="hc-empty-state">
                      All Protocols Cleared. No Pending Nodes.
                    </div>
                  ) : (
                    metrics.pendingPayments.filter(p => p.status === 'PENDING').map(p => (
                      <div key={p.id} className="hc-settlement-item">
                        <div className="hc-settlement-info">
                          <div className="hc-settlement-ref">#{p.ref}</div>
                          <div>
                            <p className="hc-settlement-customer">{p.customer?.name || 'UNKNOWN_IDENTITY'}</p>
                            <p className="hc-settlement-amount"><span>VAL:</span> ${p.amount}</p>
                          </div>
                        </div>
                        <div className="hc-settlement-actions">
                          <button
                            onClick={() => pushEvent({ type: 'PAYMENT_REJECTED', orderId: p.id })}
                            className="hc-btn hc-btn-red"
                          >
                            REJECT
                          </button>
                          <button
                            onClick={() => pushEvent({ type: 'PAYMENT_VERIFIED', orderId: p.id })}
                            className="hc-btn hc-btn-green"
                          >
                            VERIFY
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Live Traffic Ledger */}
            <div className="hc-panel hc-panel-ledger">
              <div className="hc-ledger-header">
                <h5 className="hc-panel-title hc-panel-title-blue">Traffic_Ledger</h5>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="text-[10px] font-black text-blue-400 uppercase">Syncing...</span>
                </div>
              </div>
              <div className="hc-ledger-content">
                {events.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-700 italic font-black uppercase text-sm">Waiting_For_Input...</div>
                ) : (
                  [...events].reverse().map((ev) => (
                    <div key={ev.id} className="hc-ledger-item">
                      <span className="hc-ledger-time">[{String(ev.timestamp).split('T')[1]?.split('.')[0] || '00:00:00'}]</span>
                      <span className={`hc-ledger-type ${ev.type === 'SUCCESS' ? 'hc-ledger-type-green' :
                          ev.type === 'REJECTED' ? 'hc-ledger-type-red' : 'hc-ledger-type-blue'
                        }`}>
                        {ev.type}
                      </span>
                      <span className="hc-ledger-product italic text-slate-500">{ev.productId || 'GATEWAY'}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
