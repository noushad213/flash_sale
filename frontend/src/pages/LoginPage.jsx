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
    <div className="auth-container">
      <div className="mesh-gradient-bg"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="auth-card"
      >
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-1 rounded-full border border-accent/20"
            >
              <Zap className="text-accent w-10 h-10" strokeWidth={1} />
            </motion.div>
          </div>
          <h2 className="text-white text-4xl font-display uppercase tracking-[0.1em] mb-2">AUTH_GATEWAY</h2>
          <p className="text-accent/60 text-[10px] font-bold uppercase tracking-[0.4em]">Initialize Protocol 0XAF32</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col">
          <div className="auth-input-group">
            <label className="auth-label">Identity_Credential</label>
            <div className="auth-input-wrapper">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input" 
                placeholder="name@node.infrastructure"
              />
              <Mail size={18} />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Security_Key</label>
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

          {error && <p className="text-[10px] text-red-400 font-bold tracking-widest text-center mb-6">ERR_GATEWAY: {error.toUpperCase()}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="auth-btn-primary"
          >
            {loading ? 'VALIDATING...' : 'ACCESS_SYSTEM'} 
            {!loading && <ArrowRight size={18} strokeWidth={2.5} />}
          </button>

          <div className="auth-divider">
            <span>OR_OAUTH_LINK</span>
          </div>

          <button 
            type="button" 
            className="auth-btn-secondary"
          >
            <Github size={20} /> SYNC_GITHUB
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest leading-loose">
            No authorized node detected? <br />
            <Link to="/signup" className="text-accent hover:text-white transition-colors underline underline-offset-8">REQUEST_PROVISIONING</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
