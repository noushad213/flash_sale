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
              <User className="text-slate-900 w-8 h-8" fill="currentColor" fillOpacity={0.1} strokeWidth={1.5} />
            </motion.div>
          </div>
          <h2 className="text-slate-900 text-3xl font-bold tracking-tight mb-2">Create Account</h2>
          <p className="text-slate-500 text-sm font-medium">Join our community and start shopping</p>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col">
          <div className="auth-input-group">
            <label className="auth-label">Full Name</label>
            <div className="auth-input-wrapper">
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-input" 
                placeholder="John Doe"
              />
              <User size={18} />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Email Address</label>
            <div className="auth-input-wrapper">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input" 
                placeholder="name@example.com"
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
            {loading ? 'Creating account...' : (
              <>
                Create Account 
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-500 text-sm font-medium">
            Already have an account? 
            <Link to="/login" className="text-slate-900 hover:text-black transition-colors ml-2 font-bold underline underline-offset-4 decoration-slate-200 hover:decoration-slate-400">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
