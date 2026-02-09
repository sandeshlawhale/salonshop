import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, Eye, Heart, Star } from 'lucide-react';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product._id || product.id, 1);
      // alert(`✓ ${product.name} added to cart!`);
    } catch (err) {
      console.error('Add to cart error:', err);
      alert(`Failed to add to cart: ${err.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  const imgPlaceholder = "https://placehold.co/600x400/f3f4f6/999999?text=Image+Unavailable";

  return (
    <div className="group bg-white rounded-[32px] border border-neutral-100 p-4 hover:shadow-2xl hover:shadow-neutral-200/50 transition-all duration-500 overflow-hidden relative">
      {/* Image Wrapper */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-50 cursor-pointer"
        onClick={() => navigate(`/product/${product._id || product.id}`)}
      >
        <img
          src={product.images?.[0] || product.image || imgPlaceholder}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1500ms]"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && (
            <span className="bg-emerald-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-xl shadow-emerald-600/20">
              -{discount}%
            </span>
          )}
          {product.status === 'NEW' && (
            <span className="bg-neutral-900 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg">
              NEW
            </span>
          )}
        </div>

        {/* Action Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/product/${product._id || product.id}`); }}
            className="p-3 bg-white text-neutral-900 rounded-full hover:scale-110 transition-transform shadow-xl"
          >
            <Eye size={20} />
          </button>
          <button
            onClick={handleAddCart}
            disabled={isAdding}
            className="p-3 bg-white text-neutral-900 rounded-full hover:scale-110 transition-transform shadow-xl disabled:opacity-50"
          >
            <ShoppingCart size={20} className={isAdding ? 'animate-bounce' : ''} />
          </button>
        </div>

        <button
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full text-neutral-400 hover:text-red-500 transition-colors shadow-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <Heart size={18} />
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 px-1 pb-2">
        <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
          <span>{product.category}</span>
          <div className="flex items-center gap-0.5 text-amber-500">
            <Star size={10} fill="currentColor" />
            <span className="text-neutral-900">4.8</span>
          </div>
        </div>

        <h3
          className="text-base font-black text-neutral-900 line-clamp-1 cursor-pointer hover:text-emerald-600 transition-colors mb-3 tracking-tight"
          onClick={() => navigate(`/product/${product._id || product.id}`)}
        >
          {product.name}
        </h3>

        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-black text-neutral-900 tracking-tight">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-xs text-neutral-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>

          <button
            onClick={handleAddCart}
            disabled={isAdding}
            className="flex items-center justify-center w-12 h-12 bg-neutral-900 hover:bg-emerald-600 text-white rounded-2xl transition-all active:scale-95 shadow-lg shadow-neutral-900/10 hover:shadow-emerald-600/20"
          >
            {isAdding ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
