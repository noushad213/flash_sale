import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Timer = ({ seconds }) => {
  const formatTime = (totalSeconds) => {
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ 
      background: 'rgba(255,255,255,0.05)', 
      backdropFilter: 'blur(32px)',
      padding: '24px 44px',
      borderRadius: '32px',
      border: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      pointerEvents: 'auto',
      width: 'fit-content'
    }}>
      <div className="flex items-center gap-4 mb-2">
        <div style={{ width: '10px', height: '10px', background: seconds > 0 ? '#ff3b30' : '#30d158', borderRadius: '50%', boxShadow: seconds > 0 ? '0 0 16px rgba(255, 59, 48, 0.6)' : '0 0 16px rgba(48, 209, 88, 0.6)' }} className={seconds > 0 ? "animate-pulse" : ""}></div>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.4em' }}>
          {seconds > 0 ? 'Drop Window Active' : 'Drop Successful'}
        </span>
      </div>
      <span style={{ color: '#fff', fontSize: '80px', fontWeight: '200', fontFamily: 'var(--font-display)', letterSpacing: '0.05em', lineHeight: '1' }}>
        {seconds > 0 ? formatTime(seconds) : 'LIVE'}
      </span>
    </div>
  );
};

const LandingPage = ({ addToCart, timeRemaining }) => {
  const location = useLocation();
  const isDropped = timeRemaining <= 0;

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const images = ["/hoodie_black_2.png", "/hoodie_black_1.png", "/hoodie_back_light_bg.png"];
  const [currentIdx, setCurrentIdx] = useState(0);

  const kbImages = ["/keyboard/key1.png", "/keyboard/key1.1.png", "/keyboard/key1.2.png"];
  const [kbIdx, setKbIdx] = useState(0);

  const nextSlide = () => setCurrentIdx((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentIdx((prev) => (prev - 1 + images.length) % images.length);

  const nextKb = () => setKbIdx((prev) => (prev + 1) % kbImages.length);
  const prevKb = () => setKbIdx((prev) => (prev - 1 + kbImages.length) % kbImages.length);

  const handleAddHoodie = () => {
    addToCart({
      id: 'void-hoodie',
      name: 'Void Hoodie',
      price: 11000,
      image: '/hoodie_black_2.png'
    });
  };

  const handleAddKeyboard = () => {
    addToCart({
      id: 'vortex-kb',
      name: 'Vortex Keyboard',
      price: 15000,
      image: '/keyboard/key1.png'
    });
  };

  return (
    <div className="landing-wrapper">
      {/* Header Section */}
      <section className="bg-white py-24 text-center border-b border-gray-100">
        <h1 
          className="text-black uppercase m-0 leading-none"
          style={{ 
            fontSize: '5.3vw', 
            fontWeight: '200', 
            letterSpacing: '0.15em',
            whiteSpace: 'nowrap',
            display: 'inline-block'
          }}
        >
          The Dropping Zone
        </h1>
      </section>

      {/* First Full Screen Image: Interactive Hoodie Gallery */}
      <section id="hoodie" className="panel-full relative w-full overflow-hidden bg-black" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img 
            src={images[currentIdx]} 
            alt="Void Hoodie Drop" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>

        {/* Product Info - Top Left */}
        <div style={{ position: 'absolute', top: '48px', left: '48px', zIndex: 20, pointerEvents: 'none', textAlign: 'left' }}>
          <h2 className="font-display uppercase mb-2" style={{ fontSize: 'min(8vw, 96px)', lineHeight: '0.8', tracking: '-0.02em', color: '#fff', margin: 0 }}>
            Void<br/>Hoodie
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3em', maxWidth: '300px', lineHeight: '1.6', margin: 0 }}>
            Heavyweight blackout knit. Engineered for the deep archive. Distributed node verification compliant.
          </p>
        </div>

        <div style={{ position: 'absolute', top: '48px', right: '48px', zIndex: 20 }}>
          <Timer seconds={timeRemaining} />
        </div>

        {/* Carousel Navigation */}
        <button 
          onClick={prevSlide}
          style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', zIndex: 30, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
        >
          <ChevronLeft size={64} strokeWidth={1} />
        </button>
        <button 
          onClick={nextSlide}
          style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', zIndex: 30, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
        >
          <ChevronRight size={64} strokeWidth={1} />
        </button>

        {/* Action Buttons - Bottom Center */}
        <div style={{ position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)', zIndex: 30, display: 'flex', gap: '24px' }}>
          <button 
            onClick={handleAddHoodie}
            className="elliptical-btn"
          >
            Add to Cart
          </button>
          <button className="elliptical-btn btn-outline-white">
            Check Details
          </button>
        </div>
      </section>

      {/* Second Full Screen Image: Interactive Keyboard Gallery */}
      <section id="keyboard" className="panel-full relative w-full overflow-hidden bg-black" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img 
            src={kbImages[kbIdx]} 
            alt="Vortex Keyboard Drop" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>

        {/* Product Info - Top Left */}
        <div style={{ position: 'absolute', top: '48px', left: '48px', zIndex: 20, pointerEvents: 'none', textAlign: 'left' }}>
          <h2 className="font-display uppercase mb-2" style={{ fontSize: 'min(8vw, 96px)', lineHeight: '0.8', tracking: '-0.02em', color: '#fff', margin: 0 }}>
            Vortex<br/>Keyboard
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3em', maxWidth: '300px', lineHeight: '1.6', margin: 0 }}>
            Mechanical precision. Double-shot PBT keycaps. Distributed node verification compliant.
          </p>
        </div>

        <div style={{ position: 'absolute', top: '48px', right: '48px', zIndex: 20 }}>
          <Timer seconds={timeRemaining} />
        </div>

        {/* Carousel Navigation */}
        <button 
          onClick={prevKb}
          style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', zIndex: 30, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
        >
          <ChevronLeft size={64} strokeWidth={1} />
        </button>
        <button 
          onClick={nextKb}
          style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', zIndex: 30, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
        >
          <ChevronRight size={64} strokeWidth={1} />
        </button>

        {/* Action Buttons - Bottom Center */}
        <div style={{ position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)', zIndex: 30, display: 'flex', gap: '24px' }}>
          <button 
            onClick={handleAddKeyboard}
            className="elliptical-btn"
          >
            Add to Cart
          </button>
          <button className="elliptical-btn btn-outline-white">
            Check Details
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
