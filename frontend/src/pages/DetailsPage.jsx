import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Zap, Activity, Clock, Lock, ArrowRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DetailsPage = ({ addToCart, timeRemaining }) => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);
  const isDropped = timeRemaining <= 0;

  const products = {
    'void-hoodie': {
      name: 'Void Hoodie',
      price: 11000,
      description: 'The pinnacle of tech-wear engineering. Heavyweight 500GSM blackout knit with integrated reinforced seams and tactical magnetic hardware.',
      images: ['/hoodie_black_2.png', '/hoodie_black_1.png', '/hoodie_v2.png']
    },
    'vortex-kb': {
      name: 'Vortex Keyboard',
      price: 15000,
      description: 'Precision mechanical interface. CNC machined aluminium housing with double-shot PBT keycaps and custom-lubed switches. Distributed node verification compliant.',
      images: ['/keyboard/key1.png', '/keyboard/key1.1.png', '/keyboard/key1.2.png']
    }
  };

  const product = products[productId] || products['void-hoodie'];

  return (
    <div className="bg-[#050505] min-h-screen text-white overflow-x-hidden font-sans">
      {/* Navigation */}
      <nav className="p-8 flex justify-between items-center sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 text-xs font-bold tracking-[0.3em] uppercase opacity-40 hover:opacity-100 transition-all"
        >
          <ChevronLeft size={16} /> Back to Gallery
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <div className={`w-1.5 h-1.5 rounded-full ${isDropped ? 'bg-[#30d158]' : 'bg-[#ff3b30] shadow-[0_0_10px_rgba(255,59,48,0.5)]'}`} />
            <span className="text-[10px] uppercase tracking-widest font-black">
              {isDropped ? 'Drop Live' : 'Drop Locked'}
            </span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-8 py-16 grid lg:grid-cols-2 gap-24 items-start">
        {/* Gallery */}
        <div className="space-y-8 sticky top-32">
          <div className="aspect-[4/5] bg-white/2 rounded-[40px] border border-white/5 overflow-hidden flex items-center justify-center relative group">
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeImg}
                src={product.images[activeImg]} 
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full object-contain p-12"
              />
            </AnimatePresence>
          </div>
          <div className="flex gap-4">
            {product.images.map((img, i) => (
              <button 
                key={i}
                onClick={() => setActiveImg(i)}
                className={`w-20 h-20 rounded-2xl border-2 transition-all ${activeImg === i ? 'border-white opacity-100' : 'border-transparent opacity-20 hover:opacity-50'}`}
              >
                <img src={img} className="w-full h-full object-cover rounded-xl" />
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-12 py-8">
          <div className="space-y-4">
            <h1 className="text-8xl font-black uppercase tracking-tight leading-[0.85]">{product.name}</h1>
            <div className="flex items-center gap-8 pt-4">
              <span className="text-5xl font-light tracking-tighter text-white/90">₹{product.price.toLocaleString('en-IN')}</span>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex items-center gap-2 opacity-40">
                <Star size={14} fill="white" />
                <span className="text-xs font-bold tracking-widest">LIMITED ALLOCATION</span>
              </div>
            </div>
          </div>

          <p className="text-xl text-white/50 leading-relaxed font-light">
            {product.description}
          </p>


          <div className="pt-12 space-y-8">
            <div className="bg-white/5 rounded-[32px] p-8 border border-white/10 flex flex-col gap-8">

              {!isDropped ? (
                <div className="space-y-6 text-center py-4">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#ff3b30]/10 border border-[#ff3b30]/20 rounded-full">
                    <Lock size={14} className="text-[#ff3b30]" />
                    <span className="text-[10px] uppercase tracking-[0.4em] font-black text-[#ff3b30]">Allocation Locked</span>
                  </div>
                  <p className="text-xs text-white/30 uppercase tracking-widest">Waiting for synchronized drop sequence</p>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    addToCart({ ...product, id: productId, image: product.images[0] });
                    navigate('/checkout');
                  }}
                  className="w-full bg-white text-black h-20 rounded-full font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
                >
                  Buy Now <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsPage;
