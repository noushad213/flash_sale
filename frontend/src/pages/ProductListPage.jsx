import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/products`);
      if (res.data && res.data.length > 0) {
        setProducts(res.data);
      } else {
        // Fallback mock
        throw new Error('No products found');
      }
    } catch (err) {
      console.warn('Failed to fetch products from backend, using fallback.', err.message);
      // Fallback 
      const ids = [
        '00000000-0000-0000-0000-000000000000',
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333'
      ];
      setProducts([
        { id: ids[0], name: 'Midnight Drop Hoodie (Black)', tag: 'V1.0 // OUTERWEAR', price: 89.99, image: '/hoodie_black_1.png' },
        { id: ids[1], name: 'Cloud Drop Hoodie (White)', tag: 'V1.0 // ESSENTIALS', price: 95.00, image: '/hoodie_white_1.png' },
        { id: ids[2], name: 'Vortex Mechanical Keyboard', tag: 'V1.0 // HARDWARE', price: 149.00, image: '/keyboard.png' },
        { id: ids[3], name: 'Aerolite Gaming Mouse', tag: 'V1.0 // HARDWARE', price: 79.00, image: '/mouse.png' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page bg-white min-h-screen">
      <section className="container py-40">
        <header className="mb-40 space-y-12">
          <p className="font-mono tracking-[0.4em]">Volume 01 // Archive</p>
          <h1 className="text-black uppercase leading-none">
            THE DROP <br />
            <span className="italic font-extralight text-muted">CENTER</span>
          </h1>
        </header>

        <div className="space-y-60">
          {products.map((product, idx) => (
            <div key={product.id} className="space-y-16">
              <div className="museum-card aspect-[21/9] flex items-center justify-center">
                <Link to={`/product/${product.id}`} className="w-full h-full">
                  <motion.img 
                    src={product.image || product.images?.[0] || '/hoodie_light.png'} 
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="object-cover w-full h-full"
                  />
                </Link>
                <div className="absolute top-12 left-12 badge bg-white/80 backdrop-blur-md border-black/5 text-black px-6 py-3 text-[10px] tracking-widest font-mono rounded-full">
                  {idx === 0 ? 'NOW LIVE' : 'UPCOMING'}
                </div>
              </div>

              <div className="flex justify-between items-end border-b border-black/5 pb-16">
                <div className="space-y-4">
                  <p className="font-mono uppercase text-muted tracking-widest text-xs">UNIT {idx + 1}.0 // {product.tag?.split(' // ')[1] || 'ARCHIVE'}</p>
                  <h2 className="text-5xl font-light">{product.name}</h2>
                </div>
                <div className="text-right space-y-8">
                   <p className="text-5xl font-thin tracking-tighter">₹{product.price.toLocaleString('en-IN')}</p>
                  <Link to={`/product/${product.id}`}>
                    <button className="line-btn text-xs">Provision Access <ArrowUpRight className="inline w-4 h-4 ml-2" /></button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductListPage;
