import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Zap, ArrowRight, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:3001/auth/register', { name, email, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 100px)' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-10 w-full" 
        style={{ maxWidth: '440px' }}
      >
        <div className="text-center space-y-4 mb-10">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto" style={{ background: 'linear-gradient(135deg, var(--accent-highlight), var(--accent-secondary))' }}>
            <User className="text-white w-6 h-6" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>JOIN THE DROP</h2>
          <p className="text-sm text-muted">Create an account to gain early access to limited releases.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted uppercase tracking-widest">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full glass-panel" 
                style={{ padding: '14px 14px 14px 44px', borderRadius: '12px' }} 
                placeholder="John Drop"
              />
            </div>
          </div>

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
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted uppercase tracking-widest">Create Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-panel" 
                style={{ padding: '14px 14px 14px 44px', borderRadius: '12px' }} 
                placeholder="Min. 8 characters"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-bold">{error.toUpperCase()}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="glow-btn glow-btn-primary w-full" 
            style={{ height: '54px', background: 'linear-gradient(135deg, var(--accent-highlight), var(--accent-secondary))' }}
          >
            {loading ? 'CREATING ACCOUNT...' : 'REGISTER'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-8">
          Already have an account? <Link to="/login" className="text-primary font-bold" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupPage;
