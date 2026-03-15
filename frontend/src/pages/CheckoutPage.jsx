import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, Terminal, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useTelemetry } from '../context/TelemetryContext';

const CheckoutPage = () => {
  const { pushEvent, metrics } = useTelemetry();
  const [step, setStep] = useState(0); // 0: Prov, 1: Identity, 2: Settlement, 3: Success
  const [orderRef] = useState(Math.random().toString(36).substring(2, 6).toUpperCase());
  const [shippingData, setShippingData] = useState({ name: '', address: '', phone: '', node: 'NODE_0X32' });
  const [orderId] = useState(`DROP-${Math.random().toString(36).substring(7).toUpperCase()}`);

  const steps = [
    { label: 'PROVISIONING', icon: Cpu },
    { label: 'IDENTITY', icon: Terminal },
    { label: 'SETTLEMENT', icon: ShieldCheck },
    { label: 'SECURED', icon: CheckCircle2 }
  ];

  // Initial Handshake
  useEffect(() => {
    pushEvent({ 
      type: 'CHECKOUT_START', 
      productId: 'void-hoodie',
      text: 'USER_INITIATED_GATE_HANDSHAKE' 
    });
  }, [pushEvent]);

  // Automatic transition from Provisioning to Identity
  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => setStep(1), 3500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Monitor metrics for manual admin verification
  useEffect(() => {
    const currentOrder = metrics.pendingPayments.find(p => p.id === orderId);
    if (currentOrder && currentOrder.status === 'VERIFIED') {
      setStep(3);
    }
  }, [metrics.pendingPayments, orderId]);

  const handleReserve = (e) => {
    e.preventDefault();
    pushEvent({
      type: 'RESERVE_STOCK',
      orderId,
      ref: orderRef,
      productId: 'void-hoodie',
      amount: 180,
      customer: shippingData,
      text: `STOCK_RESERVED_FOR_${shippingData.name.toUpperCase()}`
    });
    setStep(2);
  };

  const logs = [
    { text: 'GATEWAY_HANDSHAKE: INITIATED', type: 'info' },
    { text: 'ENCRYPTING_SESSION_NODE... [OK]', type: 'info' },
    { text: 'ACQUIRING_PESSIMISTIC_LOCK_0X32...', type: 'warning' },
    { text: 'BUFFERING_CONCURRENT_REQUESTS...', type: 'info' },
  ];

  return (
    <div className="checkout-container">
      <div className="bg-grid-aura"></div>

      <div className="checkout-content max-w-6xl mx-auto px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          <div className="lg:col-span-8 flex flex-col gap-12">
            <div>
              <h1 className="font-display text-7xl uppercase tracking-tighter mb-4 text-white">The Gate</h1>
              <div className="w-24 h-[1px] bg-white/20"></div>
            </div>

            <div className="flex justify-between items-center relative py-8 px-4">
              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2 -z-0"></div>
              {steps.map((s, idx) => {
                const Icon = s.icon;
                const active = idx <= step;
                const current = idx === step;
                return (
                  <div key={idx} className="relative z-10 flex flex-col items-center gap-4">
                    <div className={`p-4 rounded-full border transition-all duration-700 ${
                      current ? 'border-white bg-white text-black scale-110 shadow-[0_0_30px_rgba(255,255,255,0.4)]' : 
                      active ? 'border-white bg-black text-white' : 
                      'border-white/10 bg-black text-white/20'
                    }`}>
                      <Icon size={22} strokeWidth={current ? 2.5 : 1} />
                    </div>
                    <span className={`text-[9px] font-bold tracking-[0.25em] uppercase ${active ? 'text-white' : 'text-white/20'}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {step === 0 && (
              <div className="terminal-window h-[350px]">
                <div className="terminal-header">
                  <span className="text-[9px] font-bold text-white/30 tracking-[0.2em]">PROVISIONING_GATEWAY...</span>
                </div>
                <div className="terminal-body p-8">
                  {logs.map((log, i) => (
                    <div key={i} className="terminal-line flex gap-4 mb-3 animate-fade-in" style={{ animationDelay: `${i * 0.7}s` }}>
                      <span className="text-white/10 font-mono text-[10px] w-20">[{new Date().toLocaleTimeString([], {hour12: false})}]</span>
                      <span className={`font-mono text-[10px] ${log.type === 'warning' ? 'text-yellow-400' : 'text-white/80'}`}>
                        {log.text}
                      </span>
                    </div>
                  ))}
                  <div className="cursor-blink w-1.5 h-3.5 bg-white/40 ml-24 mt-2"></div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="glass-card p-12 border border-white/5 animate-fade-in">
                <div className="mb-10 text-left">
                  <h3 className="text-[11px] font-bold tracking-[0.4em] uppercase text-white/40 mb-2 m-0">Phase 02</h3>
                  <h2 className="text-3xl font-display uppercase text-white m-0">Identification</h2>
                </div>
                <form onSubmit={handleReserve} className="flex flex-col gap-8">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Full Name</label>
                    <input 
                      required placeholder="NAME" 
                      className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:border-white transition-all outline-none text-white tracking-widest rounded-lg"
                      value={shippingData.name} onChange={e => setShippingData({...shippingData, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Contact Number</label>
                      <input 
                        required placeholder="PHONE" 
                        className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:border-white transition-all outline-none text-white tracking-widest rounded-lg"
                        value={shippingData.phone} onChange={e => setShippingData({...shippingData, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Protocol Node</label>
                      <input 
                        disabled value="AUTO_ASSIGN: 0XF2"
                        className="w-full bg-white/5 border border-white/5 p-4 text-sm outline-none text-white/20 tracking-widest rounded-lg cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Shipping Address</label>
                    <input 
                      required placeholder="STREET, CITY, ZIP" 
                      className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:border-white transition-all outline-none text-white tracking-widest rounded-lg"
                      value={shippingData.address} onChange={e => setShippingData({...shippingData, address: e.target.value})}
                    />
                  </div>
                  <button className="elliptical-btn w-full mt-4 py-5" style={{ background: '#fff', color: '#000' }}>
                    COMMIT_IDENTITY_&_RESERVE
                  </button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="glass-card p-12 border border-white/5 animate-fade-in text-center">
                <div className="mb-10 text-left">
                  <h3 className="text-[11px] font-bold tracking-[0.4em] uppercase text-white/40 mb-2 m-0">Phase 03</h3>
                  <h2 className="text-3xl font-display uppercase text-white m-0">Settlement Gate</h2>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="bg-white p-6 rounded-2xl inline-block mb-10 shadow-[0_0_60px_rgba(255,255,255,0.15)] transform hover:scale-105 transition-transform duration-500">
                    <div className="w-56 h-56 bg-gray-50 flex flex-col items-center justify-center border-4 border-black border-double gap-4">
                        <span className="text-[9px] text-black font-bold uppercase tracking-[0.3em] text-center px-6 leading-relaxed">
                          SCAN_QR_FOR_PAYMENT<br/>[SUPPORTED_UPI_QR]
                        </span>
                    </div>
                  </div>

                  <div className="w-full grid grid-cols-2 gap-8 mb-10">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-left">
                      <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] mb-2 font-bold">Ref Code</p>
                      <p className="text-4xl font-display tracking-[0.15em] text-white m-0">{orderRef}</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-left">
                      <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] mb-2 font-bold">Expires In</p>
                      <p className="text-4xl font-display tracking-[0.15em] text-yellow-500 m-0 animate-pulse">14:59</p>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-8 rounded-2xl text-left flex gap-6">
                    <div className="mt-1">
                      <AlertTriangle className="text-yellow-500" size={24} />
                    </div>
                    <p className="text-[10px] text-white/60 leading-relaxed uppercase tracking-widest m-0">
                      IMPORTANT: YOUR UNIT IS RESERVED. INCLUDE REF CODE <span className="text-yellow-500 font-bold underline">{orderRef}</span> IN REMARKS TO VALIDATE DROP.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="glass-card p-12 border border-white/5 animate-bounce-in text-center">
                <div className="mb-12">
                   <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto border border-green-500/40 mb-6 transition-all duration-1000 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                      <CheckCircle2 size={48} className="text-green-500" />
                   </div>
                   <h2 className="text-6xl font-display uppercase tracking-tighter text-white m-0">Secured</h2>
                </div>
                <p className="text-[11px] text-white/40 uppercase tracking-[0.4em] mb-12">TRANSACTION_HASH: {orderId}</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="elliptical-btn w-full" 
                  style={{ background: '#fff', color: '#000' }}
                >
                  RETURN_TO_DECK
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 h-fit sticky top-24">
            <div className="glass-card p-10 border border-white/5">
              <h3 className="text-[11px] font-bold tracking-[0.3em] uppercase text-white/40 mb-8 m-0">Summary</h3>
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center text-white">
                  <span className="uppercase font-bold tracking-widest text-xs">Void Hoodie</span>
                  <span className="font-mono">$180.00</span>
                </div>
                <div className="h-[1px] bg-white/5"></div>
                <div className="flex justify-between items-center text-white">
                  <span className="font-bold uppercase tracking-[0.3em] text-xs">Total</span>
                  <span className="font-mono text-2xl font-bold">$180.00</span>
                </div>
                {step < 3 && (
                   <div className="animate-pulse bg-white/5 p-4 rounded-lg flex items-center gap-4 border border-white/5 mt-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                      <span className="text-[9px] font-bold tracking-widest text-white/30 uppercase">Gate Locked: Awaiting_Settlement</span>
                   </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
