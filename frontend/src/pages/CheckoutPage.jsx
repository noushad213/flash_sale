import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, Terminal, AlertTriangle, CheckCircle2, ChevronRight, Copy, Clock, Lock, CreditCard, Truck, User } from 'lucide-react';
import { useTelemetry } from '../context/TelemetryContext';

const CheckoutPage = () => {
  const { pushEvent, metrics } = useTelemetry();
  const [step, setStep] = useState(0); 
  const [shippingData, setShippingData] = useState({ name: '', address: '', phone: '' });
  const [orderId] = useState(`ORDER-${Math.random().toString(36).substring(7).toUpperCase()}`);
  const [orderRef] = useState(Math.random().toString(36).substring(2, 6).toUpperCase());

  useEffect(() => {
    pushEvent({ type: 'CHECKOUT_START', productId: 'void-hoodie' });
  }, [pushEvent]);

  useEffect(() => {
    const currentOrder = metrics.pendingPayments.find(p => p.id === orderId);
    if (currentOrder && currentOrder.status === 'VERIFIED') setStep(3);
  }, [metrics.pendingPayments, orderId]);

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 0) setStep(1);
    else if (step === 1) {
      pushEvent({ type: 'RESERVE_STOCK', orderId, ref: orderRef, productId: 'void-hoodie', customer: shippingData });
      setStep(2);
    }
  };

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
                  <div className="flex items-center justify-center gap-2 text-gray-500 text-xs uppercase tracking-widest animate-pulse">
                    <Clock size={14} /> Awaiting Verification...
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="checkout-section text-center py-10">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed</h2>
                <p className="text-gray-500 text-sm mb-8">Thank you for your purchase. Your order ID is {orderId}.</p>
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
                  <span>$180.00</span>
                </div>
                <div className="summary-row">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="summary-row">
                  <span className="text-gray-500">Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="summary-total">
                  <span>Total</span>
                  <span>$180.00</span>
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
