import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Zap, ArrowRight, Github, ShieldCheck } from 'lucide-react';
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
    submitLogin({ email, password });
  };

  const submitLogin = async (credentials) => {
    const identifier = (credentials.email || '').trim().toLowerCase();
    const pass = (credentials.password || '').trim();

    // Hardcoded & Local Users Demo Bypass
    const localUsers = JSON.parse(localStorage.getItem('VEO_LOCAL_USERS') || '[]');
    const matchedUser = localUsers.find(u => 
      (u.email.toLowerCase() === identifier || u.name.toLowerCase() === identifier) && 
      u.password === pass
    );

    if (identifier === 'lubaib' && pass === '1234' || matchedUser) {
      const user = matchedUser || { id: 'demo-user', name: 'Lubaib', email: 'lubaib@demo.com', phone: '+91 99999 88888' };
      localStorage.setItem('token', 'hardcoded-demo-token');
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:3001/auth/login', { 
        email: identifier, 
        password: pass 
      });
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
    <div className="auth-container">
      <div className="mesh-gradient-bg"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="auth-card"
      >
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm"
            >
              <Zap className="text-slate-900 w-8 h-8" fill="currentColor" fillOpacity={0.1} strokeWidth={1.5} />
            </motion.div>
          </div>
          <h2 className="text-slate-900 text-3xl font-bold tracking-tight mb-2">Welcome Back</h2>
          <p className="text-slate-500 text-sm font-medium">Please enter your details to sign in</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col">
          <div className="auth-input-group">
            <label className="auth-label">Email Address</label>
            <div className="auth-input-wrapper">
              <input 
                type="text" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input" 
                placeholder="Username or Email"
              />
              <Mail size={18} />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrapper">
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input" 
                placeholder="••••••••"
              />
              <Lock size={18} />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="auth-btn-primary group"
          >
            {loading ? 'Signing in...' : (
              <>
                Sign In 
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center flex flex-col gap-6">
          <p className="text-slate-500 text-sm font-medium">
            Don't have an account? 
            <Link to="/signup" className="text-slate-900 hover:text-black transition-colors ml-2 font-bold underline underline-offset-4 decoration-slate-200 hover:decoration-slate-400">Sign Up</Link>
          </p>
          <div className="pt-6 border-t border-slate-100">
            <Link 
              to="/admin-login" 
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-2 font-semibold"
            >
              <ShieldCheck size={14} /> Administrator Portal
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
