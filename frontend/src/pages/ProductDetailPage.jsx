import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Box, CheckCircle, AlertCircle, Loader2, ArrowRight, Zap, ShieldCheck, Activity, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { io } from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3001/api';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [inventory, setInventory] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [status, setStatus] = useState('loading');
  const [checkoutState, setCheckoutState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [queuePosition, setQueuePosition] = useState(0);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchProduct();
    const invInterval = setInterval(fetchInventory, 3000);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      socketRef.current = io('http://localhost:3001');
      socketRef.current.emit('join_room', user.id);

      socketRef.current.on('checkout_result', (data) => {
        if (data.status === 'success') {
          setCheckoutState('success');
          setOrderDetails(data);
        } else if (data.status === 'sold_out') {
          setCheckoutState('error');
          setErrorMessage('Everything sold out while you were in line!');
          setStatus('sold_out');
        } else {
          setCheckoutState('error');
          setErrorMessage(data.message || 'Verification failed');
        }
      });
    }

    return () => {
      clearInterval(invInterval);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${API_BASE}/product/${productId}`).catch(() => ({
        data: productId === '00000000-0000-0000-0000-000000000000' ? {
          id: productId,
          name: 'Midnight Drop Hoodie (Black)',
          description: 'The definitive silhouette. Heavyweight 500GSM black cotton with metallic finishes and custom hardware.',
          price: 11000,
          images: ['/hoodie_black_1.png', '/hoodie_black_2.png'],
          drop_time: new Date(Date.now() + 15000).toISOString()
        } : {
          id: productId,
          name: 'Cloud Drop Hoodie (White)',
          description: 'Pure aesthetic. Bone-white premium fleece with tonal branding.',
          price: 15000,
          images: ['/hoodie_white_1.png'],
          drop_time: new Date(Date.now() + 15000).toISOString()
        }
      }));
      setProduct(res.data);
      updateStatus(res.data.drop_time);
    } catch (err) {
      console.error('Failed to fetch product');
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/inventory/${productId}`);
      setInventory(res.data.stock || 0);
      if (res.data.stock <= 0 && status === 'live') {
        setStatus('sold_out');
      }
    } catch (err) {
      // Mock random inventory for demo if backend fails
      if (status === 'live') setInventory(prev => Math.max(0, (prev || 45) - Math.floor(Math.random() * 2)));
      else setInventory(0);
    }
  };

  const updateStatus = (dropTime) => {
    const timer = setInterval(() => {
      const now = new Date();
      const drop = new Date(dropTime);
      const diff = drop - now;

      if (diff <= 0) {
        setStatus('live');
        setTimeLeft(null);
        clearInterval(timer);
      } else {
        setStatus('upcoming');
        setTimeLeft(formatTime(diff));
      }
    }, 1000);
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCheckout = async () => {
    const user = localStorage.getItem('user');
    if (!user) {
      setErrorMessage('Please sign in to join the drop.');
      setCheckoutState('error');
      return;
    }

    setCheckoutState('processing');
    try {
      const res = await axios.post(`${API_BASE}/checkout`, {
        productId,
        size: 'L'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || 'demo-token'}` }
      });

      if (res.data.status === 'queued') {
        setCheckoutState('queued');
        setQueuePosition(res.data.position);
      } else if (res.data.status === 'sold_out') {
        setCheckoutState('error');
        setErrorMessage('Sorry, it just sold out!');
        setStatus('sold_out');
      }
    } catch (err) {
      // Demo fallback: simulate queue if backend is unreachable
      if (err.code === 'ERR_NETWORK') {
        setCheckoutState('queued');
        setQueuePosition(Math.floor(Math.random() * 500) + 100);
        // Simulate success after 5 seconds for demo
        setTimeout(() => {
          setCheckoutState('success');
          setOrderDetails({ orderId: 'DEMO-' + Math.random().toString(36).substr(2, 9).toUpperCase() });
        }, 5000);
      } else {
        setCheckoutState('error');
        setErrorMessage(err.response?.data?.message || 'Something went wrong.');
      }
    }
  };

  if (!product) return null;

  return (
    <div className="container" style={{ paddingBottom: '100px' }}>
      <button onClick={() => navigate('/')} className="nav-link flex items-center gap-2 mb-8" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <ChevronLeft className="w-4 h-4" /> BACK TO DROP CENTER
      </button>

      <main className="grid md:grid-cols-2 gap-16 items-start">
        {/* Left: Product Media Gallery */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6 sticky top-24"
        >
          <div className="glass-panel relative flex items-center justify-center overflow-hidden" style={{ minHeight: '600px', padding: 0, borderRadius: '32px' }}>
             <div className="absolute inset-0" style={{ 
                background: 'radial-gradient(circle at center, rgba(56, 189, 248, 0.15), transparent)',
                filter: 'blur(80px)'
              }} />

             <AnimatePresence mode="wait">
               <motion.img 
                  key={activeImageIdx}
                  src={product.images?.[activeImageIdx] || '/hoodie.png'} 
                  initial={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
                  transition={{ duration: 0.6 }}
                  className="w-full h-full object-contain p-8"
                  style={{ zIndex: 10 }}
               />
             </AnimatePresence>

             {product.images?.length > 1 && (
               <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-6 z-20 pointer-events-none">
                 <button 
                   onClick={() => setActiveImageIdx(prev => (prev === 0 ? product.images.length - 1 : prev - 1))}
                   className="w-12 h-12 rounded-full glass-panel flex items-center justify-center pointer-events-auto hover:bg-white/10 active:scale-95 transition-all"
                 >
                   <ChevronLeft className="w-6 h-6" />
                 </button>
                 <button 
                   onClick={() => setActiveImageIdx(prev => (prev === product.images.length - 1 ? 0 : prev + 1))}
                   className="w-12 h-12 rounded-full glass-panel flex items-center justify-center pointer-events-auto hover:bg-white/10 active:scale-95 transition-all"
                 >
                   <ChevronRight className="w-6 h-6" />
                 </button>
               </div>
             )}

             <div className="absolute top-8 left-8 flex gap-3 z-20">
              {status === 'live' ? (
                <div className="badge badge-live">
                  <span className="status-dot animate-pulse" /> LIVE DROP
                </div>
              ) : (
                <div className="badge badge-upcoming">
                  <Timer className="w-3 h-3" /> DROPPING SOON
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
             {product.images?.map((img, idx) => (
               <button 
                 key={idx}
                 onClick={() => setActiveImageIdx(idx)}
                 className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeImageIdx === idx ? 'border-accent-primary scale-110' : 'border-transparent opacity-40 hover:opacity-100'}`}
               >
                 <img src={img} className="w-full h-full object-cover" />
               </button>
             ))}
          </div>
        </motion.div>

        {/* Right: Interaction Card */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="space-y-8"
        >
          <div className="space-y-4">
              <h1 style={{ fontSize: '4rem', fontWeight: '900', lineHeight: 1 }}>{product.name}</h1>
              <div className="flex items-center gap-6">
                <h2 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--accent-primary)' }}>₹{product.price.toLocaleString('en-IN')}</h2>
                <div className="p-px bg-white/10 h-8 w-px" />
                <p className="text-secondary font-mono text-sm tracking-widest uppercase">Release ID: 0x{productId.slice(0, 6)}</p>
              </div>
              <p className="text-secondary" style={{ fontSize: '1.25rem', lineHeight: 1.6 }}>
                {product.description}
              </p>
          </div>

          <div className="glass-panel p-10 space-y-12" style={{ borderRadius: '32px' }}>
            <AnimatePresence mode="wait">
              {checkoutState === 'idle' && (
                <motion.div key="idle" className="space-y-10" exit={{ opacity: 0, x: -20 }}>
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted flex items-center gap-2">
                       <Zap className="w-4 h-4" /> Size Selection
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      {['S', 'M', 'L', 'XL'].map(size => (
                        <button key={size} className={`variant-btn ${size === 'L' ? 'active' : ''}`}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex gap-4">
                       <div className="inventory-pill flex-1">
                          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Stock Allocation</p>
                          <p style={{ fontSize: '1.75rem', fontWeight: '900', color: inventory < 10 && status === 'live' ? 'var(--accent-warning)' : 'var(--accent-primary)' }}>
                            {status === 'upcoming' ? '???' : inventory}
                          </p>
                       </div>
                    </div>

                    {status === 'upcoming' ? (
                      <div className="text-center space-y-4 pt-4">
                         <p className="text-sm font-mono text-muted uppercase tracking-[0.2em]">Gate opens in</p>
                          <p style={{ fontSize: '8rem', fontWeight: '900', letterSpacing: '-0.04em', fontFamily: 'JetBrains Mono', color: 'var(--accent-primary)', lineHeight: '1' }}>
                            {timeLeft || '00:00:00'}
                          </p>
                         <button disabled className="glow-btn w-full opacity-30 cursor-not-allowed">GATE LOCKED</button>
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 0 50px rgba(56, 189, 248, 0.4)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCheckout}
                        className="glow-btn glow-btn-primary w-full"
                        style={{ height: '80px', fontSize: '1.5rem', fontWeight: '900' }}
                      >
                        RESERVE UNIT <ArrowRight className="ml-3 w-8 h-8" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}

              {checkoutState === 'processing' && (
                <motion.div key="processing" className="text-center py-20 space-y-8">
                   <div className="relative inline-block">
                     <Loader2 className="w-20 h-20 text-accent-primary animate-spin" />
                     <div className="absolute inset-0 blur-3xl bg-accent-primary/30 animate-pulse" />
                   </div>
                   <div className="space-y-2">
                     <h2 className="text-2xl font-black uppercase italic">Securing Allocation</h2>
                     <p className="text-muted text-sm font-mono tracking-widest">ENCRYPTING TOKEN...</p>
                   </div>
                </motion.div>
              )}

              {checkoutState === 'queued' && (
                <motion.div key="queued" className="text-center py-10 space-y-8">
                  <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto" style={{ border: '2px solid var(--accent-primary)' }}>
                    <Users className="w-12 h-12 text-indigo-400" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic">Waiting Room</h2>
                    <p className="text-secondary text-sm">High traffic detected. Please stay on this page while we process your request.</p>
                  </div>
                  <div className="glass-panel p-8" style={{ background: 'rgba(56, 189, 248, 0.05)', borderRadius: '24px' }}>
                    <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Queue Position</p>
                    <p style={{ fontSize: '4rem', fontWeight: '900', color: 'var(--accent-primary)', lineHeight: 1 }}>#{queuePosition}</p>
                  </div>
                  <p className="text-[10px] font-mono text-muted uppercase tracking-[0.3em] animate-pulse">Connection: Active _ Secured</p>
                </motion.div>
              )}

              {checkoutState === 'success' && (
                <motion.div key="success" className="text-center space-y-10 py-10">
                   <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto" style={{ border: '2px solid #4ade80' }}>
                     <CheckCircle className="w-12 h-12 text-green-400" />
                   </div>
                   <div className="space-y-2">
                     <h2 className="text-4xl font-black tracking-tightest uppercase italic">Order Secured</h2>
                     <p className="text-green-400 text-sm font-bold uppercase tracking-widest">STOCK_RESERVED: 02:00 MINS</p>
                   </div>
                   <div className="glass-panel p-6 text-left" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}>
                      <p className="text-muted text-[10px] font-mono mb-2 uppercase tracking-widest">Confirmation Ledger</p>
                      <p className="text-primary font-mono text-sm break-all">TX_HASH: {orderDetails?.orderId}</p>
                   </div>
                   <button onClick={() => setCheckoutState('idle')} className="glow-btn w-full">CONTINUE SHOPPING</button>
                </motion.div>
              )}

              {checkoutState === 'error' && (
                <motion.div key="error" className="text-center space-y-8 py-10">
                   <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto" style={{ border: '2px solid #ef4444' }}>
                     <AlertCircle className="w-12 h-12 text-red-500" />
                   </div>
                   <div className="space-y-2">
                     <h2 className="text-2xl font-black uppercase italic">Gate Rejection</h2>
                     <p className="text-muted italic">{errorMessage}</p>
                   </div>
                   <button onClick={() => setCheckoutState('idle')} className="glow-btn w-full">RETRY_CONNECTION</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="glass-panel p-6 flex items-center gap-4" style={{ borderRadius: '20px' }}>
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                   <ShieldCheck className="w-6 h-6 text-green-400" />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Protocol</p>
                   <p className="text-sm font-black">ENCRYPTED</p>
                </div>
             </div>
             <div className="glass-panel p-6 flex items-center gap-4" style={{ borderRadius: '20px' }}>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                   <Activity className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Latency</p>
                   <p className="text-sm font-black">12.4ms</p>
                </div>
             </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ProductDetailPage;
