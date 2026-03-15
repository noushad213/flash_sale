import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Activity, Zap, ShieldAlert,
  Power, Command, Search, Clock, Package, BarChart2, LogOut
} from 'lucide-react';
import { useTelemetry } from '../context/TelemetryContext';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const AdminPage = () => {
  const { events, metrics, resetMetrics, pushEvent, socket } = useTelemetry();
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    navigate('/');
  };

  const timerVal = metrics.dropTimeRemaining;
  const isCountingDown = timerVal > 0 && timerVal < 9999;
  const isLive = timerVal === 0;

  const timerDisplay = timerVal >= 9999
    ? '⏳ STANDBY'
    : isLive
    ? '🔴 LIVE'
    : `${Math.floor(timerVal / 60)}:${String(timerVal % 60).padStart(2, '0')}`;

  const chartData = {
    labels: metrics.rps.map((_, i) => `${i}s`),
    datasets: [{
      label: 'Requests',
      data: metrics.rps,
      borderColor: '#818cf8',
      backgroundColor: 'rgba(129,140,248,0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2
    }]
  };

  const handleSimulateBurst = () => {
    const products = ['void-hoodie', 'vortex-kb'];
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const prod = products[Math.floor(Math.random() * products.length)];
        socket.emit('checkout_start', prod);
        pushEvent({ type: 'CHECKOUT_START', productId: prod, text: `BURST: ${prod}` });
        setTimeout(() => {
          const success = Math.random() > 0.4;
          pushEvent({ type: success ? 'SUCCESS' : 'REJECTED', productId: prod });
          socket.emit('admin_event', { type: success ? 'SUCCESS' : 'REJECTED', productId: prod });
        }, Math.random() * 1200 + 300);
      }, i * 50);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0f', color: '#e2e8f0', fontFamily: 'Inter, -apple-system, sans-serif', overflow: 'hidden' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: '260px', flexShrink: 0,
        background: 'linear-gradient(180deg, #0f0f1a 0%, #0a0a14 100%)',
        borderRight: '1px solid rgba(99,102,241,0.15)',
        display: 'flex', flexDirection: 'column',
        padding: '0',
        boxShadow: '4px 0 32px rgba(0,0,0,0.5)'
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 24px', borderBottom: '1px solid rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99,102,241,0.4)'
          }}>
            <Command size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.2em', color: '#fff', textTransform: 'uppercase' }}>Midnight</div>
            <div style={{ fontSize: '9px', color: 'rgba(99,102,241,0.8)', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>Admin Terminal</div>
          </div>
        </div>

        {/* Timer Block */}
        <div style={{ padding: '20px', flex: 1 }}>
          <div style={{
            background: 'rgba(99,102,241,0.07)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '16px', padding: '20px', marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(148,163,184,0.7)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Drop Timer</span>
              <Clock size={12} color={isLive ? '#4ade80' : isCountingDown ? '#f87171' : '#6366f1'} />
            </div>

            <div style={{
              fontSize: '32px', fontWeight: 200, fontFamily: 'monospace',
              color: isLive ? '#4ade80' : isCountingDown ? '#f87171' : '#94a3b8',
              letterSpacing: '0.05em', marginBottom: '16px',
              textShadow: isLive ? '0 0 20px rgba(74,222,128,0.5)' : isCountingDown ? '0 0 20px rgba(248,113,113,0.5)' : 'none'
            }}>
              {timerDisplay}
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { label: '-10S', action: () => socket.emit('adjust_timer', -10), color: '#374151' },
                { label: 'RST', action: () => socket.emit('reset_timer'), color: '#3730a3', glow: true },
                { label: '+10S', action: () => socket.emit('adjust_timer', 10), color: '#374151' },
              ].map(btn => (
                <button key={btn.label} onClick={btn.action} style={{
                  flex: 1, padding: '8px 4px',
                  background: btn.glow ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'rgba(255,255,255,0.05)',
                  border: btn.glow ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px', color: '#fff', fontSize: '9px', fontWeight: 900,
                  cursor: 'pointer', letterSpacing: '0.1em',
                  boxShadow: btn.glow ? '0 0 16px rgba(99,102,241,0.3)' : 'none',
                  transition: 'all 0.2s'
                }}>
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stat mini tiles */}
          {[
            { label: 'Operators', value: metrics.totalRegisteredUsers || 1, color: '#818cf8' },
            { label: 'Online', value: metrics.totalVisitors, color: '#38bdf8' },
            { label: 'Checkout', value: metrics.checkingOutUsers, color: '#a78bfa' },
            { label: 'Rejected', value: metrics.rejectedCount, color: '#f87171' },
          ].map(s => (
            <div key={s.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 14px', borderRadius: '10px', marginBottom: '6px',
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)'
            }}>
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{s.label}</span>
              <span style={{ fontSize: '18px', fontWeight: 300, color: s.color, fontFamily: 'monospace' }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Exit */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(99,102,241,0.1)' }}>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '12px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '12px', color: '#f87171', fontSize: '9px', fontWeight: 900,
            cursor: 'pointer', letterSpacing: '0.2em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.2s'
          }}>
            <LogOut size={12} /> Exit Admin
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top Bar */}
        <header style={{
          height: '64px', flexShrink: 0,
          background: 'rgba(10,10,20,0.9)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(99,102,241,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px rgba(74,222,128,0.8)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Operations Terminal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={resetMetrics} style={{
                padding: '7px 14px', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                color: '#94a3b8', fontSize: '9px', fontWeight: 800, cursor: 'pointer',
                letterSpacing: '0.15em', textTransform: 'uppercase'
              }}>Clear Log</button>
              <button onClick={handleSimulateBurst} style={{
                padding: '7px 14px', background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.2))',
                border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px',
                color: '#818cf8', fontSize: '9px', fontWeight: 800, cursor: 'pointer',
                letterSpacing: '0.15em', textTransform: 'uppercase'
              }}>Simulate</button>
              <button onClick={() => setKillSwitchActive(!killSwitchActive)} style={{
                padding: '7px 14px',
                background: killSwitchActive ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
                border: killSwitchActive ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                color: killSwitchActive ? '#4ade80' : '#f87171',
                fontSize: '9px', fontWeight: 800, cursor: 'pointer',
                letterSpacing: '0.15em', textTransform: 'uppercase'
              }}>{killSwitchActive ? 'Resume' : 'Emergency Stop'}</button>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '16px' }}>
              <div style={{ fontSize: '9px', color: '#4ade80', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Lead Operator</div>
              <div style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 600 }}>Lubaib_Admin</div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>

          {/* Live User Nodes */}
          <div style={{
            background: 'rgba(15,15,26,0.8)', border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: '20px', padding: '20px', marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '9px', fontWeight: 900, color: '#475569', letterSpacing: '0.2em', textTransform: 'uppercase', marginRight: '8px' }}>Live Nodes:</span>

            {/* Admin always shown */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
              border: '1px solid rgba(99,102,241,0.3)', borderRadius: '100px',
              padding: '6px 14px 6px 6px'
            }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 900, color: '#fff' }}>LB</div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#e2e8f0', lineHeight: 1 }}>Lubaib</div>
                <div style={{ fontSize: '8px', color: '#818cf8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Admin</div>
              </div>
            </div>

            {Array.from({ length: Math.max(0, metrics.browsingUsers) }).map((_, i) => (
              <div key={`b${i}`} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)',
                borderRadius: '100px', padding: '6px 14px 6px 6px'
              }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 900, color: '#fff' }}>U{i+2}</div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#e2e8f0', lineHeight: 1 }}>Op-0{i+2}</div>
                  <div style={{ fontSize: '8px', color: '#38bdf8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Browsing</div>
                </div>
              </div>
            ))}

            {Array.from({ length: Math.max(0, metrics.checkingOutUsers) }).map((_, i) => (
              <div key={`c${i}`} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)',
                borderRadius: '100px', padding: '6px 14px 6px 6px',
                boxShadow: '0 0 12px rgba(167,139,250,0.15)'
              }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>🔥</div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#e2e8f0', lineHeight: 1 }}>Node Active</div>
                  <div style={{ fontSize: '8px', color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Checkout</div>
                </div>
              </div>
            ))}

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px rgba(74,222,128,0.8)' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#4ade80' }}>{metrics.totalVisitors} Online</span>
            </div>
          </div>

          {/* Main Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>

            {/* LEFT COL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Chart */}
              <div style={{
                background: 'rgba(15,15,26,0.8)', border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: '20px', padding: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 900, color: '#475569', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Request Volume</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#818cf8', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', padding: '4px 10px', borderRadius: '100px', letterSpacing: '0.1em' }}>LIVE</span>
                </div>
                <div style={{ height: '200px' }}>
                  <Line data={chartData} options={{
                    responsive: true, maintainAspectRatio: false,
                    animation: { duration: 0 },
                    scales: {
                      y: { grid: { color: 'rgba(99,102,241,0.06)' }, ticks: { color: '#334155', font: { size: 9, weight: 'bold' } }, border: { display: false } },
                      x: { grid: { display: false }, ticks: { color: '#334155', font: { size: 9, weight: 'bold' } } }
                    },
                    plugins: { legend: { display: false } }
                  }} />
                </div>
              </div>

              {/* Event Ledger */}
              <div style={{
                background: 'rgba(15,15,26,0.8)', border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: '20px', padding: '24px', flex: 1
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 900, color: '#475569', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Transaction Ledger</span>
                  <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 700 }}>{events.length} events</span>
                </div>
                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {events.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#1e293b' }}>
                      <Search size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                      <p style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#334155' }}>No packets yet</p>
                    </div>
                  ) : (
                    [...events].reverse().map(ev => (
                      <div key={ev.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 12px', borderRadius: '10px', marginBottom: '4px',
                        background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.03)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '9px', fontFamily: 'monospace', color: '#334155' }}>{ev.timestamp}</span>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{ev.productId || 'SYSTEM'}</span>
                        </div>
                        <span style={{
                          fontSize: '8px', fontWeight: 900, padding: '3px 10px', borderRadius: '100px',
                          textTransform: 'uppercase', letterSpacing: '0.1em',
                          background: ev.type === 'SUCCESS' || ev.type === 'PAYMENT_SUCCESS' ? 'rgba(74,222,128,0.1)' :
                                      ev.type === 'REJECTED' ? 'rgba(248,113,113,0.1)' : 'rgba(129,140,248,0.1)',
                          color: ev.type === 'SUCCESS' || ev.type === 'PAYMENT_SUCCESS' ? '#4ade80' :
                                 ev.type === 'REJECTED' ? '#f87171' : '#818cf8',
                          border: `1px solid ${ev.type === 'SUCCESS' || ev.type === 'PAYMENT_SUCCESS' ? 'rgba(74,222,128,0.2)' :
                                  ev.type === 'REJECTED' ? 'rgba(248,113,113,0.2)' : 'rgba(129,140,248,0.2)'}`
                        }}>{ev.type}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Inventory */}
              <div style={{
                background: 'rgba(15,15,26,0.8)', border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: '20px', padding: '24px'
              }}>
                <div style={{ fontSize: '10px', fontWeight: 900, color: '#475569', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '20px' }}>Inventory Node</div>
                {Object.entries(metrics.stockRemaining).map(([id, count]) => {
                  const reserved = metrics.reservations?.[id] || 0;
                  const available = Math.max(0, count - reserved);
                  const pct = (available / 2) * 100;
                  return (
                    <div key={id} style={{
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '14px', padding: '16px', marginBottom: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{id.replace('-', ' ')}</span>
                        <div style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: available > 0 ? '#4ade80' : '#f87171',
                          boxShadow: available > 0 ? '0 0 8px rgba(74,222,128,0.6)' : '0 0 8px rgba(248,113,113,0.6)'
                        }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '40px', fontWeight: 200, color: available > 0 ? '#e2e8f0' : '#f87171', lineHeight: 1, fontFamily: 'monospace' }}>{available}</span>
                        <span style={{ fontSize: '9px', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>left</span>
                      </div>
                      <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: '99px',
                          background: available > 0 ? 'linear-gradient(90deg,#6366f1,#8b5cf6)' : '#f87171',
                          width: `${pct}%`, transition: 'width 0.5s ease'
                        }} />
                      </div>
                      {reserved > 0 && (
                        <div style={{ fontSize: '8px', color: '#a78bfa', marginTop: '6px', fontWeight: 700 }}>{reserved} reserved</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pending Verifications */}
              <div style={{
                background: 'rgba(15,15,26,0.8)', border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: '20px', padding: '24px', flex: 1
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 900, color: '#475569', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Confirmations</span>
                  {metrics.pendingPayments.filter(p => p.status === 'PENDING').length > 0 && (
                    <span style={{ fontSize: '8px', fontWeight: 900, color: '#fbbf24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', padding: '3px 8px', borderRadius: '100px' }}>
                      {metrics.pendingPayments.filter(p => p.status === 'PENDING').length} pending
                    </span>
                  )}
                </div>

                {metrics.pendingPayments.filter(p => p.status === 'PENDING').length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#1e293b' }}>
                    <div style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#334155' }}>All Confirmed</div>
                  </div>
                ) : (
                  metrics.pendingPayments.filter(p => p.status === 'PENDING').map(p => (
                    <div key={p.id} style={{
                      background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.12)',
                      borderRadius: '12px', padding: '12px', marginBottom: '8px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#e2e8f0' }}>{p.ref}</div>
                        <div style={{ fontSize: '8px', color: '#64748b', fontFamily: 'monospace' }}>{p.productId}</div>
                      </div>
                      <button onClick={() => {
                        socket.emit('verify_payment', { userId: p.id.split('-')[1] || 'demo', orderId: p.id, productId: p.productId || 'void-hoodie' });
                        pushEvent({ type: 'PAYMENT_VERIFIED', orderId: p.id });
                      }} style={{
                        padding: '6px 12px', background: 'linear-gradient(135deg,#6366f1,#7c3aed)',
                        border: 'none', borderRadius: '8px', color: '#fff',
                        fontSize: '8px', fontWeight: 900, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase'
                      }}>Verify</button>
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
