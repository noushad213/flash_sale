import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Lock, CreditCard, Truck, User, Zap } from 'lucide-react';
import { useTelemetry } from '../context/TelemetryContext';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const CheckoutPage = ({ timeRemaining, cartItems = [] }) => {
  const { socket, pushEvent, metrics } = useTelemetry();
  const [step, setStep] = useState(0);
  const [soldOut, setSoldOut] = useState(false);
  const isLocked = timeRemaining > 0;

  const firstItem = cartItems[0] || {};
  const productId = firstItem.id || 'void-hoodie';
  const productName = firstItem.name || 'Void Hoodie';

  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [shippingData, setShippingData] = useState({
    name: loggedInUser.name || '',
    address: '',
    phone: '+91 99999 00000'
  });

  const [invoiceId] = useState(`INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`);

  // Skip personal info if logged in
  useEffect(() => {
    if (loggedInUser.name && step === 0) setStep(1);
  }, [loggedInUser.name]);

  // Register checkout presence
  useEffect(() => {
    if (!isLocked && socket) {
      socket.emit('checkout_start', productId);
      return () => socket.emit('checkout_leave');
    }
  }, [socket, isLocked, productId]);

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 0) setStep(1);
    else if (step === 1) {
      pushEvent({
        type: 'RESERVE_STOCK',
        orderId: invoiceId,
        ref: invoiceId.split('-')[1],
        productId,
        customer: { ...shippingData, id: loggedInUser.id }
      });
      setStep(2);
    }
  };

  // Listen for server's atomic buy decision
  useEffect(() => {
    if (!socket) return;
    const handleBuyResult = ({ success, reason }) => {
      console.log('[buy_result received]', { success, reason });
      setSoldOut(!success);
      setStep(3);
    };
    socket.on('buy_result', handleBuyResult);
    return () => socket.off('buy_result', handleBuyResult);
  }, [socket]);

  const handleBuy = () => {
    if (!socket) {
      alert('Connection lost. Please refresh.');
      return;
    }
    console.log('[buy_attempt sending]', { productId });
    socket.emit('buy_attempt', { productId });
  };

  const downloadInvoice = () => {
    const now = new Date();
    const content = `MIDNIGHT DROP — OFFICIAL INVOICE
=====================================
Invoice No : ${invoiceId}
Date       : ${now.toLocaleDateString('en-IN')}
Time       : ${now.toLocaleTimeString('en-IN')}
=====================================
Customer   : ${loggedInUser.name || shippingData.name}
Email      : ${loggedInUser.email || 'guest@midnight.io'}
Address    : ${shippingData.address || 'N/A'}
=====================================
Item       : ${productName.toUpperCase()}
Quantity   : 1
Unit Price : ₹11,000.00
Tax        : ₹0.00
Shipping   : FREE
-------------------------------------
TOTAL      : ₹11,000.00
=====================================
Status     : CONFIRMED ✓
Node Auth  : MIDNIGHT_CLUSTER_01
=====================================
Thank you for participating in the Drop.
MIDNIGHT DROP INFRASTRUCTURE © 2026
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoiceId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Locked state - timer still running
  if (isLocked) {
    return (
      <div className="checkout-container flex items-center justify-center" style={{ minHeight: '80vh', background: '#fff' }}>
        <div className="text-center p-12 bg-white rounded-[32px] border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] max-w-md w-full mx-4">
          <div className="w-20 h-20 bg-gray-50 text-gray-900 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-tight">
            {timeRemaining >= 9999 ? 'Awaiting Drop' : 'Drop Standby'}
          </h2>
          <p className="text-gray-500 text-sm mb-10 font-medium">
            {timeRemaining >= 9999
              ? 'The admin will start the timer. Stand by.'
              : 'Checkout is locked. Wait for the drop timer to hit zero.'}
          </p>
          <div className="py-10 border-y border-gray-50 mb-10">
            <span className="text-[12px] text-gray-400 uppercase tracking-[0.4em] font-bold block mb-4">
              {timeRemaining >= 9999 ? 'Status' : 'T-Minus'}
            </span>
            <span className="text-8xl font-light text-gray-900 font-mono tracking-tighter">
              {timeRemaining >= 9999 ? '⏳' : formatTime(timeRemaining)}
            </span>
          </div>
          <button onClick={() => window.location.href = '/'} className="elliptical-btn w-full !bg-black !text-white h-14">
            Return to Gallery
          </button>
        </div>
      </div>
    );
  }

  const steps = ['Details', 'Shipping', 'Buy'];

  return (
    <div className="checkout-container">
      <div className="checkout-wrapper">
        <header className="mb-8">
          <h1 className="checkout-title">Checkout</h1>
          {step < 3 && (
            <div className="step-indicator">
              {steps.map((s, i) => (
                <div key={s} className={`step-item ${i === step ? 'active' : ''}`}>
                  <span className="step-num">{i + 1}</span>
                  {s}
                </div>
              ))}
            </div>
          )}
        </header>

        <div className="checkout-grid">
          <div className="checkout-main">

            {/* STEP 0: Personal Info */}
            {step === 0 && (
              <div className="checkout-section">
                <h2 className="checkout-subtitle"><User size={18} className="inline mr-2" /> Personal Info</h2>
                <form onSubmit={handleNext} className="space-y-4">
                  <div>
                    <label className="generic-label">Full Name</label>
                    <input required className="generic-input" placeholder="John Doe"
                      value={shippingData.name} onChange={e => setShippingData({ ...shippingData, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="generic-label">Phone</label>
                    <input required className="generic-input" placeholder="+91 99999 00000"
                      value={shippingData.phone} onChange={e => setShippingData({ ...shippingData, phone: e.target.value })} />
                  </div>
                  <button className="checkout-btn mt-6">Continue</button>
                </form>
              </div>
            )}

            {/* STEP 1: Shipping */}
            {step === 1 && (
              <div className="checkout-section">
                <h2 className="checkout-subtitle"><Truck size={18} className="inline mr-2" /> Shipping Address</h2>
                <form onSubmit={handleNext} className="space-y-4">
                  <div>
                    <label className="generic-label">Address</label>
                    <input required className="generic-input" placeholder="123 Midnight St, City"
                      value={shippingData.address} onChange={e => setShippingData({ ...shippingData, address: e.target.value })} />
                  </div>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(0)} className="checkout-btn bg-gray-100 !text-black hover:bg-gray-200 flex-1">Back</button>
                    <button type="submit" className="checkout-btn flex-1">Continue to Payment</button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 2: BUY NOW */}
            {step === 2 && (
              <div className="checkout-section">
                <h2 className="checkout-subtitle"><CreditCard size={18} className="inline mr-2" /> Confirm & Buy</h2>
                <div className="bg-slate-50 rounded-3xl p-6 mb-6 border border-slate-100 font-mono text-sm space-y-3">
                  <div className="flex justify-between"><span className="text-slate-400">Item</span><span className="font-bold">{productName}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Address</span><span className="font-bold text-xs truncate max-w-[200px]">{shippingData.address}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Total</span><span className="font-black text-xl">₹11,000</span></div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-slate-400">Units Left</span>
                    <span className={`font-black text-xs px-3 py-1 rounded-full ${(metrics.stockRemaining[productId] ?? 0) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {metrics.stockRemaining[productId] ?? 0} LEFT
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleBuy}
                  className="w-full py-5 bg-black text-white rounded-[20px] text-sm font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-black/20 active:scale-95"
                >
                  ⚡ BUY NOW — CONFIRM ORDER
                </button>
                <p className="text-center text-xs text-slate-400 mt-4">No refunds. All sales final per Drop Policy.</p>
              </div>
            )}

            {/* STEP 3: Invoice or Sold Out */}
            {step === 3 && (
              <div className="checkout-section text-center py-10">
                {!soldOut ? (
                  <>
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
                    <p className="text-gray-500 text-sm mb-6">Your drop is secured. Download your invoice below.</p>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left mb-6 font-mono">
                      <p className="text-[10px] text-slate-400 uppercase mb-1">Invoice No</p>
                      <p className="text-sm font-black text-slate-900">{invoiceId}</p>
                      <p className="text-xs font-bold text-slate-700 mt-3">{productName.toUpperCase()} — ₹11,000.00</p>
                      <p className="text-[9px] text-slate-400 mt-2">Customer: {loggedInUser.name || shippingData.name}</p>
                      <p className="text-[9px] text-slate-400">Ship to: {shippingData.address}</p>
                      <p className="text-[9px] text-slate-400 mt-2">Authorized by Midnight Node Cluster ✓</p>
                    </div>
                    <button onClick={downloadInvoice} className="checkout-btn mb-4 flex items-center justify-center gap-2 mx-auto">
                      ⬇ Download Invoice
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Zap size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-4">YOU ALMOST HAD IT.</h2>
                    <div className="bg-slate-950 text-white p-8 rounded-3xl mb-8">
                      <p className="text-lg font-light mb-4">The drop reached capacity milliseconds before your order settled.</p>
                      <p className="text-2xl font-black text-indigo-400">BUT WE SAW YOU.</p>
                      <p className="text-sm text-slate-300 mt-4">You've been added to the <span className="text-white font-black">Priority Access List</span> for the next drop. You're already in.</p>
                    </div>
                  </>
                )}
                <button onClick={() => window.location.href = '/'} className="checkout-btn max-w-xs mx-auto bg-gray-100 !text-black hover:bg-gray-200">
                  Return to Shop
                </button>
              </div>
            )}
          </div>

          <aside className="checkout-sidebar">
            <div className="summary-card">
              <h3 className="checkout-subtitle">Order Summary</h3>
              <div className="space-y-3">
                <div className="summary-row">
                  <span className="text-gray-500">{productName}</span>
                  <span>₹11,000.00</span>
                </div>
                <div className="summary-row">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
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
