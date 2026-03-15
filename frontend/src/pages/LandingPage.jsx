import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { useTelemetry } from '../context/TelemetryContext';

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

const HoodieSequence = ({ timeRemaining, addToCart }) => {
  const targetRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const totalFrames = 192;

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  // Preload images
  useEffect(() => {
    let loadedCount = 0;
    const images = [];
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      img.src = `/hoodie_frames/frame_${i.toString().padStart(4, '0')}.png`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalFrames) setImagesLoaded(true);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalFrames) setImagesLoaded(true);
      };
      images.push(img);
    }
    imagesRef.current = images;
  }, []);

  const drawFrame = (index) => {
    const canvas = canvasRef.current;
    if (!canvas || !imagesRef.current[index]) return;
    const ctx = canvas.getContext('2d');
    const img = imagesRef.current[index];

    // Cover object-fit logic for canvas
    const canvasAspect = canvas.width / canvas.height;
    const imgAspect = img.width / img.height;
    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasAspect > imgAspect) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgAspect;
      offsetX = 0;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawWidth = canvas.height * imgAspect;
      drawHeight = canvas.height;
      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = 0;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const frame = Math.floor(latest * (totalFrames - 1));
    drawFrame(Math.min(totalFrames - 1, Math.max(0, frame)));
  });

  // Handle initial draw and resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth * window.devicePixelRatio;
        canvasRef.current.height = window.innerHeight * window.devicePixelRatio;
        drawFrame(0);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [imagesLoaded]);

  const handleAddHoodie = () => {
    addToCart({
      id: 'void-hoodie',
      name: 'Void Hoodie',
      price: 11000,
      image: '/hoodie_black_2.png'
    });
  };

  return (
    <section id="hoodie" ref={targetRef} style={{ height: '300vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden', background: '#000' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
        
        {!imagesLoaded && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Initializing Sequence...</span>
          </div>
        )}

        {/* Product Info - Top Left */}
        <div style={{ position: 'absolute', top: '48px', left: '48px', zIndex: 20, pointerEvents: 'none', textAlign: 'left' }}>
          <h2 className="font-display uppercase mb-2" style={{ fontSize: 'min(8vw, 96px)', lineHeight: '0.8', tracking: '-0.02em', color: '#fff', margin: 0 }}>
            Void<br />Hoodie
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3em', maxWidth: '300px', lineHeight: '1.6', margin: 0 }}>
            Heavyweight blackout knit. Engineered for the deep archive. Distributed node verification compliant.
          </p>
        </div>

        {/* Brand Overlay - Bottom Right */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          right: '0',
          zIndex: 40,
          background: '#000',
          padding: '28px 60px',
          borderTopLeftRadius: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          boxShadow: '-10px -10px 40px rgba(0,0,0,0.5)'
        }}>
          <span style={{
            color: '#fff',
            fontSize: '28px',
            fontWeight: '900',
            letterSpacing: '0.15em',
            fontFamily: 'var(--font-display)',
            lineHeight: '1'
          }}>MD</span>
          <div className="notch-logo" style={{ width: '28px', height: '28px', border: '3px solid #fff' }}></div>
        </div>

        <div style={{ position: 'absolute', top: '48px', right: '48px', zIndex: 20 }}>
          <Timer seconds={timeRemaining} />
        </div>

        {/* Action Buttons - Bottom Center */}
        <div style={{ position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)', zIndex: 30, display: 'flex', gap: '24px' }}>
          <button
            onClick={handleAddHoodie}
            className="elliptical-btn"
          >
            Add to Cart
          </button>
          <Link to="/details/void-hoodie" style={{ textDecoration: 'none' }}>
            <button className="elliptical-btn btn-outline-white">
              Check Details
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

const KeyboardSequence = ({ timeRemaining, addToCart }) => {
  const targetRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const totalFrames = 192;

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  // Preload images
  useEffect(() => {
    let loadedCount = 0;
    const images = [];
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      img.src = `/key_frames/frame_${i.toString().padStart(4, '0')}.png`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalFrames) setImagesLoaded(true);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalFrames) setImagesLoaded(true);
      };
      images.push(img);
    }
    imagesRef.current = images;
  }, []);

  const drawFrame = (index) => {
    const canvas = canvasRef.current;
    if (!canvas || !imagesRef.current[index]) return;
    const ctx = canvas.getContext('2d');
    const img = imagesRef.current[index];

    const canvasAspect = canvas.width / canvas.height;
    const imgAspect = img.width / img.height;
    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasAspect > imgAspect) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgAspect;
      offsetX = 0;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawWidth = canvas.height * imgAspect;
      drawHeight = canvas.height;
      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = 0;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const frame = Math.floor(latest * (totalFrames - 1));
    drawFrame(Math.min(totalFrames - 1, Math.max(0, frame)));
  });

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth * window.devicePixelRatio;
        canvasRef.current.height = window.innerHeight * window.devicePixelRatio;
        drawFrame(0);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [imagesLoaded]);

  const handleAddKeyboard = () => {
    addToCart({
      id: 'vortex-kb',
      name: 'Vortex Keyboard',
      price: 15000,
      image: '/keyboard/key1.png'
    });
  };

  return (
    <section id="keyboard" ref={targetRef} style={{ height: '300vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden', background: '#000' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />

        {!imagesLoaded && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Initializing Sequence...</span>
          </div>
        )}

        {/* Product Info - Top Left */}
        <div style={{ position: 'absolute', top: '48px', left: '48px', zIndex: 20, pointerEvents: 'none', textAlign: 'left' }}>
          <h2 className="font-display uppercase mb-2" style={{ fontSize: 'min(8vw, 96px)', lineHeight: '0.8', tracking: '-0.02em', color: '#fff', margin: 0 }}>
            Vortex<br />Keyboard
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3em', maxWidth: '300px', lineHeight: '1.6', margin: 0 }}>
            Mechanical precision. Double-shot PBT keycaps. Distributed node verification compliant.
          </p>
        </div>

        {/* Brand Overlay - Bottom Right */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          right: '0',
          zIndex: 40,
          background: '#000',
          padding: '28px 60px',
          borderTopLeftRadius: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          boxShadow: '-10px -10px 40px rgba(0,0,0,0.5)'
        }}>
          <span style={{
            color: '#fff',
            fontSize: '28px',
            fontWeight: '900',
            letterSpacing: '0.15em',
            fontFamily: 'var(--font-display)',
            lineHeight: '1'
          }}>MD</span>
          <div className="notch-logo" style={{ width: '28px', height: '28px', border: '3px solid #fff' }}></div>
        </div>

        <div style={{ position: 'absolute', top: '48px', right: '48px', zIndex: 20 }}>
          <Timer seconds={timeRemaining} />
        </div>

        {/* Action Buttons - Bottom Center */}
        <div style={{ position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)', zIndex: 30, display: 'flex', gap: '24px' }}>
          <button
            onClick={handleAddKeyboard}
            className="elliptical-btn"
          >
            Add to Cart
          </button>
          <Link to="/details/vortex-kb" style={{ textDecoration: 'none' }}>
            <button className="elliptical-btn btn-outline-white">
              Check Details
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};


const LandingPage = ({ addToCart, timeRemaining }) => {
  const location = useLocation();
  const isDropped = timeRemaining <= 0;
  const { socket } = useTelemetry();

  useEffect(() => {
    if (socket) {
      socket.emit('browsing_start');
      return () => socket.emit('browsing_stop');
    }
  }, [socket]);

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);


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

      {/* Dropping Soon Ticker Strip */}
      <div className="ticker-strip">
        <div className="ticker-content">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="ticker-item">
              <div className="ticker-dot" style={{ background: isDropped ? '#30d158' : '#ff3b30' }} />
              <span>{isDropped ? 'Drop Successful' : 'Dropping Soon'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Sequence Hoodie Section */}
      <HoodieSequence timeRemaining={timeRemaining} addToCart={addToCart} />

      {/* Scroll Sequence Keyboard Section */}
      <KeyboardSequence timeRemaining={timeRemaining} addToCart={addToCart} />
    </div>
  );
};

export default LandingPage;
