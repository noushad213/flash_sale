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
    <div className="auth-container">
      <div className="bg-grid-aura"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="auth-card"
      >
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <User className="text-white w-8 h-8" strokeWidth={1.5} />
          </div>
          <h2 className="text-white text-3xl font-display uppercase tracking-widest mb-1">JOIN THE DROP</h2>
          <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.2em]">REGISTER_NODE_0XF2</p>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col">
          <div className="auth-input-group">
            <label className="auth-label">Full Name</label>
            <div className="auth-input-wrapper">
              <User size={18} />
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-input" 
                placeholder="John Drop"
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Email Address</label>
            <div className="auth-input-wrapper">
              <Mail size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input" 
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input" 
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="text-[10px] text-red-500 font-bold tracking-widest text-center mb-4">{error.toUpperCase()}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="auth-btn-primary"
          >
            {loading ? 'INITIALIZING...' : 'CREATE_ACCOUNT'} 
            {!loading && <ArrowRight size={18} strokeWidth={2.5} />}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest">
            Already have an account? <Link to="/login" className="text-white hover:underline underline-offset-8">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
