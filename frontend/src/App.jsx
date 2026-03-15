import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { Search, ShoppingBag, LayoutDashboard, Zap, LogIn, LogOut, Package, Lock } from 'lucide-react';
import CartDrawer from './components/CartDrawer';

const Navigation = ({ toggleCart, cartCount }) => {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <nav>
      <div className="container nav-content">
        <Link to="/" className="nav-logo">
          <div className="logo-diamond"></div>
          MIDNIGHT
        </Link>

        <div className="nav-links">
          {[
            { label: 'Electronics', links: [
              { name: 'Vortex Keyboard', path: '/product/22222222-2222-2222-2222-222222222222' },
              { name: 'Phones', locked: true },
              { name: 'Monitors', locked: true }
            ]},
            { label: 'Apparel', links: [
              { name: 'Midnight Hoodie', path: '/product/00000000-0000-0000-0000-000000000000' },
              { name: 'Trousers', path: '/products' },
              { name: 'Jeans', locked: true }
            ]},
            { label: 'Infrastructure', links: [
              { name: 'Telemetry', path: '/admin' },
              { name: 'Nodes', path: '/products' },
              { name: 'Support', path: '/support' }
            ]}
          ].map((group) => (
            <div key={group.label} className="nav-group">
              <button className="nav-link">{group.label}</button>
              <div className="dropdown">
                <h4 className="dropdown-header">Explore {group.label}</h4>
                {group.links.map((link) => (
                  link.locked ? (
                    <div key={link.name} className="dropdown-item locked">
                      <span>{link.name}</span>
                      <Lock size={12} />
                    </div>
                  ) : (
                    <Link key={link.name} to={link.path} className="dropdown-item">{link.name}</Link>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div>
            {user ? (
              <button onClick={handleLogout} className="nav-link font-bold">SIG_OUT</button>
            ) : (
              <Link to="/login" className="nav-link" style={{ fontWeight: '700' }}>GATEWAY_AUTH</Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button className="nav-link">
              <Search size={18} />
            </button>
            <button onClick={toggleCart} className="nav-link relative">
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span 
                  className="absolute border border-white" 
                  style={{ 
                    top: '6px', 
                    right: '12px', 
                    width: '8px', 
                    height: '8px', 
                    backgroundColor: '#ff453a',
                    borderRadius: '50%'
                  }}
                />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product) => {
    setCartItems(prev => [...prev, product]);
    setIsCartOpen(true); // Open cart immediately when added
  };

  const removeFromCart = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  return (
    <Router>
      <div style={{ paddingTop: '52px' }}>
        <Navigation toggleCart={toggleCart} cartCount={cartItems.length} />
        <CartDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          cartItems={cartItems}
          onRemove={removeFromCart}
        />
        <Routes>
          <Route path="/" element={<LandingPage addToCart={addToCart} />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
        
        <footer>
          <div className="container">
            <div className="footer-grid">
              {[
                { title: 'Shop and Learn', links: ['Archive', 'Mac', 'iPhone', 'Apparel', 'Vortex', 'Audio'] },
                { title: 'Services', links: ['Gateway+', 'Waistroom Logic', 'Midnight Music', 'Privacy Matrix'] },
                { title: 'Gateway Store', links: ['Find a Node', 'Genius Bar', 'Today at Midnight', 'Financing'] },
                { title: 'For Business', links: ['Midnight Business', 'Shop for Business', 'Healthcare'] },
                { title: 'Midnight Values', links: ['Accessibility', 'Environment', 'Privacy', 'About Midnight'] }
              ].map((col, idx) => (
                <div key={idx} className="footer-col">
                  <h4>{col.title}</h4>
                  <ul>
                    {col.links.map((link, lIdx) => (
                      <li key={lIdx}><a href="#">{link}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontSize: '12px', color: 'var(--fg2)' }}>© 2026 MIDNIGHT DROP INFRASTRUCTURE.</span>
               <div className="flex gap-4">
                 <span style={{ fontSize: '12px', color: 'var(--fg2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <span style={{ width: '6px', height: '6px', background: '#30d158', borderRadius: '50%' }}></span>
                   0XAF32:OK
                 </span>
               </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
