import React from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose, cartItems, onRemove }) => {
  const total = cartItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`cart-backdrop ${isOpen ? 'active' : ''}`} 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`cart-drawer ${isOpen ? 'active' : ''}`}>
        <div className="cart-header">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} />
            <h2 className="text-sm font-bold tracking-widest uppercase m-0">Your Bag</h2>
          </div>
          <button onClick={onClose} className="cart-close">
            <X size={24} />
          </button>
        </div>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <p>YOUR BAG IS EMPTY</p>
              <button onClick={onClose} className="elliptical-btn" style={{ minWidth: 'auto', padding: '12px 32px' }}>
                START SHOPPING
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="cart-item">
                  <div className="cart-item-img">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="cart-item-info">
                    <h3 className="uppercase text-[11px] font-bold tracking-widest m-0">{item.name}</h3>
                    <p className="text-[10px] text-gray-500 m-0">${item.price}</p>
                  </div>
                  <button onClick={() => onRemove(index)} className="cart-item-remove">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="flex justify-between mb-4 border-b border-gray-100 pb-4">
              <span className="text-[11px] font-bold uppercase tracking-widest">Total</span>
              <span className="text-[11px] font-bold">${total}</span>
            </div>
            <button className="elliptical-btn w-full" style={{ background: '#000', color: '#fff' }}>
              CHECKOUT
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
