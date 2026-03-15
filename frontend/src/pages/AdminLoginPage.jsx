import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (username === 'noushad' && password === '123') {
        localStorage.setItem('admin_auth', 'true');
        navigate('/admin');
      } else {
        setError('Incorrect administrator credentials.');
        setIsLoading(false);
      }
    }, 1200); 
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-glass-orb"></div>
      <div className="admin-glass-orb-2"></div>
      
      <div className="admin-login-card">
        <div className="admin-card-header">
          <div className="admin-card-icon">
            <ShieldCheck size={28} strokeWidth={2} />
          </div>
          <h2 className="admin-card-title">Admin Uplink</h2>
          <p className="admin-card-subtitle">Authenticate to access the control panel.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-start gap-3 border border-red-100 animate-fade-in">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="admin-input-group">
            <label className="admin-input-label">Administrator ID</label>
            <div className="relative flex items-center">
              <User size={18} className="absolute left-4 text-gray-400 pointer-events-none" />
              <input 
                type="text" 
                required 
                placeholder="Enter username" 
                className="admin-input !pl-12"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-input-group">
            <label className="admin-input-label">Security Passphrase</label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-4 text-gray-400 pointer-events-none" />
              <input 
                type="password" 
                required 
                placeholder="••••••••" 
                className="admin-input !pl-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="admin-btn mt-8"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80 animate-ping"></div>
                Authorizing...
              </>
            ) : (
              <>
                Sign In <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
