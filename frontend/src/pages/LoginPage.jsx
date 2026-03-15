import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Zap, ArrowRight, Github } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:3001/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 100px)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-10 w-full" 
        style={{ maxWidth: '440px' }}
      >
        <div className="text-center space-y-4 mb-10">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
            <Zap className="text-white w-6 h-6" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>WELCOME BACK</h2>
          <p className="text-sm text-muted">Initialize your session to catch the next drop.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-panel" 
                style={{ padding: '14px 14px 14px 44px', borderRadius: '12px' }} 
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted uppercase tracking-widest">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-panel" 
                style={{ padding: '14px 14px 14px 44px', borderRadius: '12px' }} 
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-bold">{error.toUpperCase()}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="glow-btn glow-btn-primary w-full" 
            style={{ height: '54px' }}
          >
            {loading ? 'AUTHENTICATING...' : 'SIGN IN'} <ArrowRight className="w-4 h-4" />
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#020617] px-2 text-muted font-bold">Or continue with</span></div>
          </div>

          <button type="button" className="glow-btn w-full" style={{ height: '54px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <Github className="w-5 h-5" /> GITHUB
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-8">
          New to the drop? <Link to="/signup" className="text-primary font-bold" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Register here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
