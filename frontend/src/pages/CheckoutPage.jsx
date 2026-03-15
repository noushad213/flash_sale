import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, Terminal, AlertTriangle, CheckCircle2, ChevronRight, Copy, Clock, Lock, CreditCard, Truck, User } from 'lucide-react';
import { useTelemetry } from '../context/TelemetryContext';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const CheckoutPage = ({ timeRemaining, cartItems = [] }) => {
  const { socket, pushEvent, metrics } = useTelemetry();
  const [step, setStep] = useState(0); 
  const [isRejected, setIsRejected] = useState(false);
  const isLocked = timeRemaining > 0;

  // Use the ID from the first item in cart or fallback
  const firstItem = cartItems[0] || {};
  const productId = firstItem.id || 'void-hoodie'; 
  const productName = firstItem.name || 'VOID HOODIE';
  useEffect(() => {
    if (!isLocked && socket) {
      socket.emit('checkout_start', productId);

      socket.on('checkout_accepted', (data) => {
        setIsRejected(false);
        pushEvent({ type: 'CHECKOUT_START', productId: data.productId });
      });

      socket.on('checkout_rejected', (data) => {
        setIsRejected(true);
        console.error('Reservation rejected:', data.reason);
      });

      return () => {
        socket.emit('checkout_leave');
        socket.off('checkout_accepted');
        socket.off('checkout_rejected');
      };
    }
  }, [socket, isLocked, pushEvent, productId]);

  if (isRejected) {
    return (
      <div className="checkout-container flex items-center justify-center text-[#1d1d1f]" style={{ minHeight: '80vh', background: '#fff' }}>
        <div className="text-center p-12 bg-white rounded-[40px] border border-red-50 shadow-[0_32px_80px_-20px_rgba(255,0,0,0.1)] max-w-lg w-full mx-4">
          <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-10 border border-red-100 animate-pulse">
            <AlertTriangle size={48} />
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight uppercase italic">Access_Denied</h2>
          <p className="text-gray-500 text-lg mb-12 font-medium leading-relaxed">
            All available units for <span className="font-black text-black">VOID HOODIE</span> are currently being processed by other nodes. 
            Allocation failed.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="elliptical-btn w-full !bg-black !text-white h-20 !text-xl"
          >
            Back to Node Gallery
          </button>
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="checkout-container flex items-center justify-center" style={{ minHeight: '80vh', background: '#fff' }}>
        <div className="text-center p-12 bg-white rounded-[32px] border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] max-w-md w-full mx-4">
          <div className="w-20 h-20 bg-gray-50 text-gray-900 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100 shadow-inner">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-tight">Drop Standby</h2>
          <p className="text-gray-500 text-sm mb-10 font-medium">Checkout is currently restricted. Please wait for the synchronized drop event to conclude.</p>
          
          <div className="py-10 border-y border-gray-50 mb-10">
            <span className="text-[12px] text-gray-400 uppercase tracking-[0.4em] font-bold block mb-4">T-Minus</span>
            <span className="text-8xl font-light text-gray-900 font-mono tracking-tighter">
              {formatTime(timeRemaining)}
            </span>
          </div>

          <button 
            onClick={() => window.location.href = '/'}
            className="elliptical-btn w-full !bg-black !text-white h-14"
          >
            Return to Gallery
          </button>
        </div>
      </div>
    );
  }

  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [shippingData, setShippingData] = useState({ 
    name: loggedInUser.name || '', 
    address: '', 
    phone: loggedInUser.phone || '+91 99999 00000' // Default demo phone
  });

  const [orderId] = useState(`ORDER-${Math.random().toString(36).substring(7).toUpperCase()}`);
  const [orderRef] = useState(Math.random().toString(36).substring(2, 6).toUpperCase());

  // If user is logged in, skip the 'Personal Info' step
  useEffect(() => {
    if (loggedInUser.name && step === 0) {
      setStep(1);
    }
  }, [loggedInUser.name]);

  useEffect(() => {
    if (socket) {
      socket.on('payment_success', (data) => {
        setStep(3);
        pushEvent({ type: 'PAYMENT_SUCCESS', status: 'VERIFIED' });
      });
      return () => socket.off('payment_success');
    }
  }, [socket]);

  const handleNext = async (e) => {
    e.preventDefault();
    if (step === 0) setStep(1);
    else if (step === 1) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3001'}/api/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            productId: productId,
            size: 'L' // Default size
          })
        });

        const data = await response.json();
        
        if (data.status === 'queued') {
          // Successfully entered the waitroom/queue
          setStep(2);
          pushEvent({ 
            type: 'RESERVE_STOCK', 
            orderId: data.jobId, 
            ref: orderRef, 
            productId: productId, 
            customer: { ...shippingData, id: loggedInUser.id } 
          });
        } else if (data.status === 'sold_out') {
          setIsRejected(true);
        } else {
          alert(data.message || 'System busy. Try again.');
        }
      } catch (err) {
        console.error('Checkout error detail:', err);
        alert('Checkout bridge offline.');
      }
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on('checkout_result', (data) => {
        if (data.status === 'success') {
          setStep(3);
          pushEvent({ type: 'PAYMENT_SUCCESS', status: 'VERIFIED_BY_WORKER' });
        } else if (data.status === 'error') {
          alert(data.message);
        }
      });
      return () => socket.off('checkout_result');
    }
  }, [socket]);

  const steps = ['Details', 'Payment', 'Review'];

  return (
    <div className="checkout-container">
      <div className="checkout-wrapper">
        <header className="mb-8">
          <h1 className="checkout-title">Checkout</h1>
          <div className="step-indicator">
            {steps.map((s, i) => (
              <div key={s} className={`step-item ${i === step ? 'active' : ''}`}>
                <span className="step-num">{i + 1}</span>
                {s}
              </div>
            ))}
          </div>
        </header>

        <div className="checkout-grid">
          <div className="checkout-main">
            {step === 0 && (
              <div className="checkout-section">
                <h2 className="checkout-subtitle"><User size={18} className="inline mr-2" /> Personal Information</h2>
                <form onSubmit={handleNext} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="generic-label">Full Name</label>
                      <input 
                        required className="generic-input" placeholder="John Doe"
                        value={shippingData.name} onChange={e => setShippingData({...shippingData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="generic-label">Phone Number</label>
                      <input 
                        required className="generic-input" placeholder="+1 (555) 000-0000"
                        value={shippingData.phone} onChange={e => setShippingData({...shippingData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <button className="checkout-btn mt-6">Continue to Shipping</button>
                </form>
              </div>
            )}

            {step === 1 && (
              <div className="checkout-section">
                <h2 className="checkout-subtitle"><Truck size={18} className="inline mr-2" /> Shipping Address</h2>
                <form onSubmit={handleNext} className="space-y-4">
                  <div>
                    <label className="generic-label">Address</label>
                    <input 
                      required className="generic-input" placeholder="123 Midnight St, Silicon Valley, CA"
                      value={shippingData.address} onChange={e => setShippingData({...shippingData, address: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setStep(0)} className="checkout-btn bg-gray-100 !text-black hover:bg-gray-200">Back</button>
                    <button className="checkout-btn">Continue to Payment</button>
                  </div>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="checkout-section">
                <h2 className="checkout-subtitle"><CreditCard size={18} className="inline mr-2" /> Secure Payment</h2>
                <div className="text-center py-6">
                  <div className="qr-placeholder">
                    <span className="text-xs text-gray-400 font-mono">[GENERIC_PAYMENT_QR]</span>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-left mb-6">
                    <div className="flex gap-3">
                      <AlertTriangle className="text-yellow-600 shrink-0" size={20} />
                      <div>
                        <p className="text-sm font-semibold text-yellow-800">Final Step Required</p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Please include order code <span className="font-bold underline">{orderRef}</span> in your payment remarks.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-500 text-xs uppercase tracking-widest animate-pulse mb-8">
                    <Clock size={14} /> Awaiting Verification...
                  </div>

                  <button 
                    onClick={() => {
                      setStep(3);
                      socket.emit('admin_event', { type: 'SUCCESS', productId: productId });
                      pushEvent({ type: 'PAYMENT_SUCCESS', status: 'BYPASS_VERIFIED' });
                    }}
                    className="w-full py-4 border-2 border-black rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-xl shadow-black/5"
                  >
                    Direct System Bypass
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="checkout-section text-center py-10">
                {metrics.stockRemaining[productId] > 0 ? (
                  <>
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed</h2>
                    <p className="text-gray-500 text-sm mb-8">Thank you for your purchase. Your invoice has been generated.</p>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left mb-8 font-mono">
                       <p className="text-[10px] text-slate-400 uppercase mb-2">Invoice # {Math.random().toString(36).substring(7).toUpperCase()}</p>
                       <p className="text-xs font-bold text-slate-900">{productName.toUpperCase()} — ₹11,000.00</p>
                       <p className="text-[9px] text-slate-400 mt-4">Authorized by Node Cluster</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Zap size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Loyalty Reward Activated</h2>
                    <p className="text-gray-500 text-sm mb-8">
                       The {productName} has reached capacity, but your commitment has been noted. 
                       <span className="block mt-4 font-bold text-black font-display">WE BELIEVE IN YOU.</span>
                       As a thank you for participating in the drop, you've been granted Early Access to the next collection.
                    </p>
                  </>
                )}
                <button onClick={() => window.location.href = '/'} className="checkout-btn max-w-xs mx-auto">Return to Shop</button>
              </div>
            )}
          </div>

          <aside className="checkout-sidebar">
            <div className="summary-card">
              <h3 className="checkout-subtitle">Order Summary</h3>
              <div className="space-y-3">
                <div className="summary-row">
                  <span className="text-gray-500">Void Hoodie</span>
                  <span>₹11,000.00</span>
                </div>
                <div className="summary-row">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="summary-row">
                  <span className="text-gray-500">Tax</span>
                  <span>₹0.00</span>
                </div>
                <div className="summary-total">
                  <span>Total</span>
                  <span>₹11,000.00</span>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-gray-400">
                  <ShieldCheck size={16} />
                  <span className="text-[11px] uppercase tracking-wider">Secure Transmission</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Lock size={16} />
                  <span className="text-[11px] uppercase tracking-wider">Verified Merchant</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
