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
    <div className="flex h-screen bg-[#f5f7fb] font-sans text-slate-600 overflow-hidden">
      
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-[260px] translate-x-0' : 'w-0 -translate-x-full overflow-hidden'} bg-[#222e3c] text-[#adb5bd] flex flex-col h-full shrink-0 transition-all duration-300 ease-in-out`}>
        <div className="p-6 flex items-center gap-2 text-white border-b border-[#2b394a] whitespace-nowrap min-w-[260px]">
          <Command size={22} className="text-[#3b7ddd]" />
          <span className="text-lg font-semibold tracking-wide flex items-center gap-2 uppercase">
            Midnight Drop
          </span>
        </div>
        
        <div className="flex-1 py-4 custom-scrollbar whitespace-nowrap min-w-[260px]">
          <div className="flex flex-col gap-1 px-3 mt-4">
            <div className="bg-[#1c2631] text-white px-3 py-2.5 mx-1 rounded flex items-center justify-between border-l-2 border-[#3b7ddd]">
              <div className="flex items-center gap-3">
                <LayoutDashboard size={18} className="text-[#3b7ddd]" />
                <span className="text-sm font-medium">Dashboards</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Component */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Navbar */}
        <header className="h-[60px] bg-white border-b border-[#e5e9f2] flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <Menu size={20} className="text-slate-400 cursor-pointer" onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search..." className="bg-[#f5f7fb] border-none rounded-2xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300 w-64 text-slate-600" />
            </div>
            <span className="text-sm font-medium text-slate-500 hidden lg:block cursor-pointer">Mega Menu ▾</span>
          </div>
          <div className="flex items-center gap-5 text-slate-500">
            <div className="relative cursor-pointer hover:text-slate-700 transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#3b7ddd] text-white text-[10px] flex items-center justify-center font-bold">4</span>
            </div>
            <MessageSquare size={20} className="cursor-pointer hidden sm:block hover:text-slate-700 transition-colors"/>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold cursor-pointer overflow-hidden border border-slate-200">
               <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={handleLogout}
              className="text-sm font-medium text-red-500 hover:text-red-600 flex items-center gap-1.5 transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        {/* Dashboard Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f5f7fb] p-6 lg:p-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-[#495057] flex items-center gap-3">
                E-Commerce <span className="font-normal text-slate-500">Dashboard</span>
                {killSwitchActive && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold uppercase ml-2 flex items-center gap-1"><ShieldAlert size={12}/> Offline</span>}
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={resetMetrics} 
                className="bg-white border text-[#495057] border-[#ced4da] px-4 py-1.5 rounded text-sm hover:bg-slate-50 transition shadow-sm flex items-center gap-1.5"
              >
                Reset Data
              </button>
              <button 
                onClick={handleSimulateBurst} 
                className="bg-white border text-[#495057] border-[#ced4da] px-4 py-1.5 rounded text-sm hover:bg-slate-50 transition shadow-sm flex items-center gap-1.5"
              >
                 Inject Load
              </button>
              <button 
                onClick={() => setKillSwitchActive(!killSwitchActive)} 
                className={`${killSwitchActive ? 'bg-green-500 hover:bg-green-600' : 'bg-[#3b7ddd] hover:bg-[#326abc]'} text-white px-4 py-1.5 rounded text-sm transition shadow-sm flex items-center gap-1.5`}
              >
                 {killSwitchActive ? 'Restore System' : 'Kill Switch'}
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Requests', val: metrics.totalRequests, icon: Activity, pct: '3.65%', pos: true },
              { label: 'Active Queue', val: metrics.activeQueue, icon: Users, pct: '-5.25%', pos: false },
              { label: 'Success (Verified)', val: metrics.successCount, icon: Zap, pct: '4.65%', pos: true },
              { label: 'Rejected / Blocked', val: metrics.rejectedCount, icon: ShieldAlert, pct: '2.35%', pos: true }
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-[#e5e9f2] flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h5 className="text-[#6c757d] font-semibold text-sm">{stat.label}</h5>
                  <div className="w-10 h-10 rounded-full bg-[#e8f1fb] text-[#3b7ddd] flex items-center justify-center shrink-0">
                    <stat.icon size={20} />
                  </div>
                </div>
                <h2 className="text-3xl font-medium text-[#495057] mb-3">{stat.val}</h2>
                <div className="flex items-center gap-2 text-xs mt-auto">
                  <span className={`px-1.5 py-0.5 rounded font-bold ${stat.pos ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {stat.pos ? '+' : ''}{stat.pct}
                  </span>
                  <span className="text-[#adb5bd]">Since last week</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Chart */}
            <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-[#e5e9f2]">
              <div className="flex justify-between items-center mb-6">
                <h5 className="text-[#495057] font-semibold">Telemetry Pulse</h5>
                <div className="flex gap-2">
                  <select className="border border-slate-200 rounded px-2 py-1 text-sm text-slate-600 bg-slate-50 outline-none">
                    <option>Jan</option>
                  </select>
                  <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={20}/></button>
                </div>
              </div>
              <div className="h-[300px] w-full">
                 <Line data={chartData} options={{ 
                  responsive: true, maintainAspectRatio: false, 
                  animation: { duration: 0 },
                  scales: { 
                    y: { grid: { color: '#f8f9fa' }, ticks: { color: '#adb5bd', font: { size: 11 } }, border: { display:false } }, 
                    x: { grid: { display: false }, ticks: { color: '#adb5bd', font: { size: 11 } }, border: { display:false } } 
                  },
                  plugins: { legend: { display: false } }
                }} />
              </div>
            </div>

            {/* Live Ledger (Replacing Sales by State in Reference) */}
            <div className="bg-white rounded-lg p-0 shadow-sm border border-[#e5e9f2] flex flex-col overflow-hidden max-h-[400px]">
              <div className="p-5 border-b border-[#e5e9f2] flex justify-between items-center bg-white z-10">
                <h5 className="text-[#495057] font-semibold">Live Traffic Ledger</h5>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 bg-slate-50/50">
                {events.length === 0 ? (
                  <div className="flex items-center justify-center p-8 text-sm text-slate-400">Waiting for data...</div>
                ) : (
                  [...events].reverse().map((ev) => (
                    <div key={ev.id} className="flex gap-3 text-sm p-3 hover:bg-white rounded-lg transition-colors border-b border-transparent hover:border-slate-100">
                      <div className="flex-shrink-0 mt-0.5">
                        {ev.type === 'CHECKOUT_START' ? <Activity size={14} className="text-[#3b7ddd]"/> : 
                         ev.type === 'SUCCESS' ? <Zap size={14} className="text-green-500"/> : 
                         <ShieldAlert size={14} className="text-red-500"/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#495057] font-medium truncate">{ev.productId || 'GATEWAY'}</p>
                        <p className="text-xs text-[#adb5bd]">{ev.type}</p>
                      </div>
                      <div className="text-xs text-[#adb5bd] whitespace-nowrap">
                         {String(ev.timestamp).split('T')[1]?.split('.')[0] || '00:00:00'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Pending Settlements Table */}
          <div className="bg-white rounded-lg shadow-sm border border-[#e5e9f2] mb-6 overflow-hidden">
             <div className="p-5 border-b border-[#e5e9f2] flex justify-between items-center">
                <h5 className="text-[#495057] font-semibold">Pending Settlements</h5>
                <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={20}/></button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#e5e9f2] text-xs uppercase text-[#adb5bd] bg-[#f8f9fa]">
                      <th className="p-4 font-semibold">Reference</th>
                      <th className="p-4 font-semibold">Customer</th>
                      <th className="p-4 font-semibold">Amount</th>
                      <th className="p-4 font-semibold">Product</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.pendingPayments.filter(p => p.status === 'PENDING').length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-[#adb5bd] text-sm py-12">
                          <ShoppingBag size={32} className="mx-auto text-slate-200 mb-3" />
                          No pending settlements requiring authorization.
                        </td>
                      </tr>
                    ) : (
                      metrics.pendingPayments.filter(p => p.status === 'PENDING').map(p => (
                        <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="p-4 align-middle">
                            <span className="text-sm font-medium text-[#495057]">{p.ref}</span>
                          </td>
                          <td className="p-4 align-middle">
                             <div className="text-sm text-[#495057]">{p.customer?.name || 'Unknown'}</div>
                             <div className="text-xs text-[#adb5bd]">{p.customer?.phone || 'N/A'}</div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="text-sm font-semibold text-[#495057]">${p.amount}</div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="text-sm text-[#6c757d]">{p.productId}</div>
                          </td>
                          <td className="p-4 align-middle">
                            <span className="bg-[#e8f1fb] text-[#3b7ddd] px-2 py-1 rounded text-xs font-semibold">In Progress</span>
                          </td>
                          <td className="p-4 align-middle flex justify-end gap-2">
                             <button 
                               onClick={() => pushEvent({ type: 'PAYMENT_REJECTED', orderId: p.id })}
                               className="px-3 py-1.5 text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 rounded transition"
                             >
                               Reject
                             </button>
                             <button 
                               onClick={() => pushEvent({ type: 'PAYMENT_VERIFIED', orderId: p.id })}
                               className="px-3 py-1.5 text-xs font-medium bg-[#3b7ddd] text-white hover:bg-[#326abc] rounded transition shadow-sm"
                             >
                               Verify
                             </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
