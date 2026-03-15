import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Package, Clock, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3001/api';

const ProfilePage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const res = await axios.get(`${API_BASE}/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      setError('Failed to fetch orders from server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px', minHeight: '100vh' }}>
      <button onClick={() => navigate('/')} className="nav-link flex items-center gap-2 mb-8" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <ChevronLeft className="w-4 h-4" /> REVERT_TO_BASE
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="space-y-4">
          <h1 className="text-4xl font-display uppercase tracking-widest text-white">USER_LEDGER</h1>
          <p className="font-mono text-muted text-xs uppercase tracking-widest">Protocol [PROFILE_DATA] // Verified</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted animate-pulse font-mono tracking-widest text-sm">
            FETCHING_LEDGER_DATA...
          </div>
        ) : error ? (
          <div className="text-red-500 font-mono text-sm border border-red-500/30 p-4 rounded bg-red-500/5">
            ERR: {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="glass-panel text-center py-20 text-muted uppercase tracking-widest font-mono text-xs">
            NO_RECORDS_FOUND
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order, i) => (
              <div key={order.id} className="glass-panel flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                    <Package className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold tracking-widest uppercase mb-1">{order.product_id?.slice(0, 8)} Drop</h3>
                    <p className="text-xs font-mono text-muted">ID: {order.id}</p>
                  </div>
                </div>
                
                <div className="flex gap-12 mt-4 md:mt-0">
                  <div className="text-center">
                    <p className="text-[10px] text-muted uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      {order.status === 'success' ? (
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className={`text-xs font-bold uppercase tracking-widest ${order.status === 'success' ? 'text-green-500' : 'text-yellow-500'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted uppercase tracking-widest mb-1">Timestamp</p>
                    <p className="font-mono text-sm text-white/80">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProfilePage;
