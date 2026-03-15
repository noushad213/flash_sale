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
  const { events, metrics, resetMetrics, pushEvent, socket } = useTelemetry();
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    navigate('/');
  };

  const chartData = {
    labels: metrics.rps.map((_, i) => `${i}s`),
    datasets: [{
      label: 'Requests',
      data: metrics.rps,
      borderColor: '#6366f1', // Indigo accent
      backgroundColor: 'rgba(99, 102, 241, 0.05)',
      fill: true,
      tension: 0.4,
      pointRadius: metrics.rps.map((r, i) => i % 5 === 0 && i !== 0 ? 4 : 0),
      pointBackgroundColor: '#6366f1',
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
    <div className="flex h-screen bg-[#f1f3f9] font-sans text-slate-900 overflow-hidden">

      {/* Sidebar - Isolated from global styles */}
      <aside 
        className={`bg-white border-r border-slate-200 flex flex-col h-full shrink-0 transition-all duration-300 ease-in-out z-40 shadow-2xl shadow-slate-200/50 overflow-hidden`}
        style={{ width: isSidebarOpen ? '280px' : '0' }}
      >
        <div className="p-10 flex items-center justify-center border-b border-slate-50 min-w-[280px]">
           <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
             <Command size={24} className="text-white" />
           </div>
        </div>

        <div className="flex-1 py-10 px-4 overflow-y-auto min-w-[280px]">
          <div className="flex flex-col gap-2">
            {[
              { label: 'Overview', icon: LayoutDashboard, active: true },
              { label: 'Live Traffic', icon: Activity, active: false },
              { label: 'Stock Nodes', icon: ShoppingBag, active: false }
            ].map((item, idx) => (
              <div 
                key={idx}
                className={`flex items-center gap-4 px-5 py-4 rounded-[20px] transition-all cursor-pointer group ${item.active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <item.icon size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-slate-50 min-w-[280px]">
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-[20px] bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2"
          >
            <Power size={14} /> Exit Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Top Navbar - Fixed & Refined */}
        <header className="h-[90px] bg-white/70 backdrop-blur-xl border-b border-white flex items-center justify-between px-10 shrink-0 z-30">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-3 bg-white hover:bg-slate-50 rounded-2xl transition-all border border-slate-100 shadow-sm text-slate-600 active:scale-95"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end px-4">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Lead Operator</span>
              <span className="text-xs font-bold text-slate-900 px-4 py-2 bg-slate-100/50 rounded-xl">Noushad_Admin</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-10 custom-scrollbar">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-14 gap-8">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Operations <span className="text-slate-300 font-light italic">Terminal</span>
              </h1>
              <p className="text-sm text-slate-400 font-medium mt-1">Real-time node synchronization & inventory lifecycle.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={resetMetrics} className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">Clear Log</button>
              <button onClick={handleSimulateBurst} className="px-6 py-3 rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100">Run Simulation</button>
              <button
                onClick={() => setKillSwitchActive(!killSwitchActive)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${killSwitchActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}
              >
                {killSwitchActive ? 'Resume Network' : 'Emergency Stop'}
              </button>
            </div>
          </div>

          {/* Stats Hub */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {[
              { label: 'Network Traffic', value: metrics.totalVisitors, icon: Users, color: 'text-indigo-600', dot: 'bg-indigo-600' },
              { label: 'Active Sessions', value: metrics.browsingUsers, icon: Activity, color: 'text-sky-500', dot: 'bg-sky-500' },
              { label: 'Checkout Hub', value: metrics.checkingOutUsers, icon: Zap, color: 'text-violet-500', dot: 'bg-violet-500' },
              { label: 'Packet Drop', value: metrics.rejectedCount, icon: ShieldAlert, color: 'text-rose-500', dot: 'bg-rose-500' }
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-slate-200/60 rounded-[32px] p-10 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${stat.dot}`} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <stat.icon size={18} className={`${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
                </div>
                <h2 className="text-6xl font-light tracking-tighter text-slate-900">{stat.value.toLocaleString()}</h2>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Live Visualization */}
            <div className="lg:col-span-2 space-y-10">
              <div className="bg-white border border-slate-200/60 rounded-[40px] p-10 shadow-sm">
                <div className="flex items-center justify-between mb-12">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Load Distribution</h5>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Live Monitor</span>
                </div>
                <div className="h-[400px]">
                  <Line data={chartData} options={{
                    responsive: true, maintainAspectRatio: false,
                    animation: { duration: 0 },
                    scales: {
                      y: { grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { color: 'rgba(0,0,0,0.3)', font: { size: 10, weight: 'bold' } }, border: { display: false } },
                      x: { grid: { display: false }, ticks: { color: 'rgba(0,0,0,0.3)', font: { size: 10, weight: 'bold' } } }
                    },
                    plugins: { legend: { display: false } }
                  }} />
                </div>
              </div>

              {/* Transaction Stream */}
              <div className="bg-white border border-slate-200/60 rounded-[40px] p-10 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Security Ledger</h5>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-4">
                  {events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-200">
                      <Search size={40} className="mb-4 opacity-50" />
                      <p className="text-[11px] font-black uppercase tracking-widest">No Active Packets</p>
                    </div>
                  ) : (
                    [...events].reverse().map((ev) => (
                      <div key={ev.id} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors px-4 rounded-xl">
                        <div className="flex items-center gap-6">
                          <span className="text-[10px] font-mono text-slate-300">[{String(ev.timestamp).split('T')[1]?.split('.')[0] || '00:00:00'}]</span>
                          <span className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{ev.productId || 'CORE_SYSTEM'}</span>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full border ${ev.type === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            ev.type === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                          }`}>
                          {ev.type}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Allocation Engine */}
            <div className="space-y-10">
              <div className="bg-white border border-slate-200/60 rounded-[40px] p-10 shadow-sm h-full">
                <div className="flex items-center justify-between mb-12">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Inventory Node</h5>
                </div>

                <div className="space-y-8">
                   {Object.entries(metrics.stockRemaining).map(([id, count]) => (
                     <div key={id} className="p-8 rounded-[32px] bg-slate-50/50 border border-slate-100 group hover:border-indigo-200 transition-all">
                        <div className="flex justify-between items-start mb-6">
                          <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">{id.replace('-', ' ')}</span>
                          <div className="px-2.5 py-1 bg-emerald-500 rounded-full flex items-center gap-1.5">
                             <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                             <span className="text-[8px] text-white font-black uppercase">Active</span>
                          </div>
                        </div>
                        <div className="flex items-baseline gap-2 mb-6 text-slate-900">
                           <span className="text-5xl font-light leading-none">{count}</span>
                           <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Units Left</span>
                        </div>
                        <div className="space-y-3">
                           <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                              <span>Allocation Progress</span>
                              <span className={metrics.reservations[id] > 0 ? 'text-indigo-600' : ''}>{metrics.reservations[id] || 0} Reserved</span>
                           </div>
                           <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${(count/2)*100}%` }} />
                           </div>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="mt-16 p-8 rounded-[32px] bg-indigo-50/30 border border-indigo-100">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldAlert size={16} className="text-indigo-600" />
                    <span className="text-[10px] font-black uppercase text-indigo-900 tracking-widest">Node Policy</span>
                  </div>
                  <p className="text-[11px] text-indigo-900/60 leading-relaxed font-medium">
                    Automated reconciliation is enabled. All reservations are verified against current node health before final commit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
