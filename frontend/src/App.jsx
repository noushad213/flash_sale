import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import DetailsPage from './pages/DetailsPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminLoginPage from './pages/AdminLoginPage';
import { Search, ShoppingBag, LayoutDashboard, Zap, LogIn, LogOut, Package, Lock } from 'lucide-react';
import CartDrawer from './components/CartDrawer';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import { TelemetryProvider, useTelemetry } from './context/TelemetryContext';

const Navigation = ({ toggleCart, cartCount }) => {
  const location = useLocation();
  const [user, setUser] = useState(null);

  const { socket } = useTelemetry();
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      if (socket && parsed.id) {
        socket.emit('join_room', parsed.id);
      }
    }
  }, [location, socket]);

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
            {
              label: 'Electronics', links: [
                { name: 'Vortex Keyboard', path: '/#keyboard' },
                { name: 'Phones', locked: true },
                { name: 'Monitors', locked: true }
              ]
            },
            {
              label: 'Apparel', links: [
                { name: 'Midnight Hoodie', path: '/#hoodie' },
                { name: 'Trousers', locked: true },
                { name: 'Jeans', locked: true }
              ]
            },
            {
              label: 'Infrastructure', links: [
                { name: 'Telemetry', path: '/admin' },
                { name: 'Nodes', path: '/products' },
                { name: 'Support', path: '/support' }
              ]
            }
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
              <div className="flex items-center gap-4">
                <Link to="/profile" className="nav-link font-bold text-accent">USER_LEDGER</Link>
                <button onClick={handleLogout} className="nav-link font-bold">SIG_OUT</button>
              </div>
            ) : (
              <Link to="/login" className="nav-link border border-black/20 px-8 font-extrabold hover:bg-black hover:text-white transition-all">LOGIN</Link>
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

const AppContent = ({ cartItems, isCartOpen, setIsCartOpen, removeFromCart, addToCart }) => {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';
  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const { metrics, socket } = useTelemetry();
  const [timeRemaining, setTimeRemaining] = useState(9999); // 9999 = waiting for admin to start

  useEffect(() => {
    // When server sends a sync (RST or initial value), snap to it
    if (!socket) return;
    const handleSync = (t) => setTimeRemaining(t);
    socket.on('sync_timer', handleSync);
    // Request current timer immediately
    socket.emit('get_timer');
    return () => socket.off('sync_timer', handleSync);
  }, [socket]);

  useEffect(() => {
    // Only run local countdown when in active range (1-9998)
    if (timeRemaining <= 0 || timeRemaining >= 9999) return;
    const tick = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { clearInterval(tick); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [Math.min(timeRemaining, 1)]); // restart when crossing 0↔1+

  return (
    <div style={{ paddingTop: isAdmin ? '0' : '52px' }}>
      {!isAdmin && <Navigation toggleCart={toggleCart} cartCount={cartItems.length} />}
      {!isAdmin && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          onRemove={removeFromCart}
          timeRemaining={timeRemaining}
        />
      )}

      <Routes>
        <Route path="/" element={<LandingPage addToCart={addToCart} timeRemaining={timeRemaining} />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/product/:productId" element={<ProductDetailPage />} />
        <Route path="/details/:productId" element={<DetailsPage addToCart={addToCart} timeRemaining={timeRemaining} />} />
        <Route path="/checkout" element={<CheckoutPage timeRemaining={timeRemaining} cartItems={cartItems} />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>

      {!isAdmin && (
        <footer>
          <div className="container">
            <div className="footer-grid">
              {[
                {
                  title: 'Shop and Learn', links: [
                    { name: 'Archive', path: '#' },
                    { name: 'Mac', path: '#' },
                    { name: 'iPhone', path: '#' },
                    { name: 'Apparel', path: '#' },
                    { name: 'Vortex', path: '#' },
                    { name: 'Audio', path: '#' }
                  ]
                },
                {
                  title: 'Services', links: [
                    { name: 'Gateway+', path: '#' },
                    { name: 'Waistroom Logic', path: '#' },
                    { name: 'Midnight Music', path: '#' },
                    { name: 'Privacy Matrix', path: '#' }
                  ]
                },
                {
                  title: 'Gateway Store', links: [
                    { name: 'Find a Node', path: '#' },
                    { name: 'Genius Bar', path: '#' },
                    { name: 'Today at Midnight', path: '#' },
                    { name: 'Financing', path: '#' }
                  ]
                },
                {
                  title: 'For Business', links: [
                    { name: 'Midnight Business', path: '#' },
                    { name: 'Shop for Business', path: '#' },
                    { name: 'Healthcare', path: '#' },
                    { name: 'Admin', path: '/admin-login' }
                  ]
                },
                {
                  title: 'Midnight Values', links: [
                    { name: 'Accessibility', path: '#' },
                    { name: 'Environment', path: '#' },
                    { name: 'Privacy', path: '#' },
                    { name: 'About Midnight', path: '#' }
                  ]
                }
              ].map((col, idx) => (
                <div key={idx} className="footer-col">
                  <h4>{col.title}</h4>
                  <ul>
                    {col.links.map((link, lIdx) => (
                      <li key={lIdx}>
                        {link.path === '#' ? (
                          <a href="#">{link.name}</a>
                        ) : (
                          <Link to={link.path}>{link.name}</Link>
                        )}
                      </li>
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
      )}
    </div>
  );
};

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product) => {
    setCartItems(prev => [...prev, product]);
    setIsCartOpen(true);
  };

  const removeFromCart = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <TelemetryProvider>
      <Router>
        <AppContent
          cartItems={cartItems}
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          removeFromCart={removeFromCart}
          addToCart={addToCart}
        />
      </Router>
    </TelemetryProvider>
  );
}

export default App;
