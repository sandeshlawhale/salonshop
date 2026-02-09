import React, { useState, useEffect } from 'react';
import ProductCard from '../components/common/ProductCard';
import { productAPI } from '../services/apiService';
import { Button } from '../components/ui/button';
import { Loader2, ArrowRight, Sparkles, ShieldCheck, Zap, Heart, TrendingUp, Star } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await productAPI.getAll({ status: 'ACTIVE', limit: 8 });
      // The API returns { products: [], count: ... }
      setProducts(res.data?.products || []);
    } catch (err) {
      console.error('[HomePage] Failed to fetch products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50/50">
      {/* Global Luxury Badge */}
      <div className="flex justify-center pt-8 pb-4">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-black tracking-widest shadow-sm uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Exclusively for Verified Salon Owners
        </div>
      </div>

      {/* Hero Section - Luxury Emerald 3D Gradient */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12 lg:py-32 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 animate-in fade-in slide-in-from-left duration-1000 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-neutral-900 shadow-2xl shadow-neutral-900/20 text-white rounded-full text-[10px] font-black tracking-[0.2em] uppercase border border-neutral-800">
              <Sparkles size={12} className="text-emerald-400" />
              Direct-to-Professional Access
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-neutral-900 leading-[0.85] tracking-tighter">
              Purest <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 via-emerald-500 to-teal-600">Pro Quality.</span>
            </h1>
            <p className="text-xl text-neutral-500 max-w-lg leading-relaxed font-bold">
              Authentic luxury professional inventory. Direct distributor pricing. Verified salon-only gateway.
            </p>
            <div className="flex flex-col sm:row gap-5 pt-4">
              <Button size="lg" className="h-20 px-12 bg-neutral-900 hover:bg-emerald-600 text-white rounded-[32px] text-base font-black shadow-2xl shadow-neutral-900/20 active:scale-[0.98] transition-all group border-b-4 border-emerald-900/20">
                BROWSE INVENTORY
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="h-20 px-12 border-2 border-neutral-100 bg-white hover:bg-neutral-50 hover:border-emerald-200 rounded-[32px] text-base font-black active:scale-[0.98] transition-all shadow-xl shadow-neutral-900/5">
                AGENT PORTAL
              </Button>
            </div>

            <div className="flex items-center gap-12 pt-12">
              <div className="flex flex-col">
                <span className="text-4xl font-black text-neutral-900 tracking-tighter">1.2K+</span>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mt-1">Verified Partners</span>
              </div>
              <div className="w-px h-16 bg-neutral-200" />
              <div className="flex flex-col">
                <span className="text-4xl font-black text-neutral-900 tracking-tighter">24h</span>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mt-1">Global Dispatch</span>
              </div>
            </div>
          </div>

          <div className="relative group perspective-3000 hidden lg:block animate-in fade-in slide-in-from-right duration-1000">
            <div className="relative z-10 rounded-[64px] overflow-hidden shadow-2xl -rotate-2 -skew-x-2 transition-all duration-1000 group-hover:rotate-0 group-hover:skew-x-0 group-hover:scale-105 border-[16px] border-white ring-1 ring-neutral-200/50">
              <img
                src="https://orchidlifesciences.com/wp-content/uploads/2024/06/01-14-01-1024x704.jpg"
                alt="Elite Salon Supplies"
                className="w-full h-[600px] object-cover scale-110 group-hover:scale-100 transition-transform duration-[2000ms]"
              />
              <div className="absolute inset-0 bg-linear-to-t from-emerald-900/60 via-emerald-900/10 to-transparent mix-blend-multiply" />
              <div className="absolute bottom-16 left-12 right-12 text-white translate-y-6 group-hover:translate-y-0 transition-all duration-700 opacity-0 group-hover:opacity-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-emerald-500/20 backdrop-blur-2xl border border-white/20 rounded-2xl flex items-center justify-center">
                    <ShieldCheck size={28} className="text-emerald-300" />
                  </div>
                  <span className="font-black text-xl tracking-tight uppercase">Authenticity Guaranteed</span>
                </div>
                <p className="text-base font-bold text-white/90 leading-relaxed max-w-sm">Direct chain of custody from manufacturer to your salon chair.</p>
              </div>
            </div>
            {/* Ambient glows */}
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-emerald-400/20 rounded-full blur-[160px] -z-10 animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-teal-400/20 rounded-full blur-[160px] -z-10 animate-pulse delay-1000" />
          </div>
        </div>
      </section>

      {/* Featured Section - Pure White Cards on Neutral-50 */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3 text-emerald-600 mb-2">
                <TrendingUp size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Trending Now</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-neutral-900 leading-[0.9] tracking-tighter">Elite Backbar Selections.</h2>
              <p className="text-neutral-500 font-semibold text-lg">Curated collections for every professional service.</p>
            </div>
            <Button variant="link" className="group text-neutral-900 font-black p-0 h-auto hover:no-underline text-sm uppercase tracking-widest">
              View All Products
              <ArrowRight size={18} className="ml-3 group-hover:translate-x-1 transition-transform text-emerald-600" />
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white/50 rounded-[48px] border border-white backdrop-blur-sm">
              <div className="relative">
                <Loader2 className="animate-spin text-emerald-600" size={56} />
                <div className="absolute inset-0 blur-xl bg-emerald-400/30 -z-10" />
              </div>
              <p className="text-neutral-400 font-black tracking-[0.3em] text-[10px] uppercase">Retrieving Master Inventory...</p>
            </div>
          ) : error ? (
            <div className="text-center py-32 bg-white rounded-[40px] border border-neutral-100 shadow-sm">
              <p className="text-red-500 font-black mb-6 uppercase tracking-widest">{error}</p>
              <Button onClick={fetchProducts} variant="outline" className="rounded-2xl px-10 h-14 border-2">Try Again</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* If we have more than 4 products, they already list in rows because of the grid */}
              {products.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[40px] border border-neutral-100">
                  <p className="text-neutral-400 font-bold">No professional products available at the moment.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Shop By Category - Icon Matrix */}
      <section className="py-24 bg-white/40 backdrop-blur-xl border-y border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'Color', icon: Star },
              { name: 'Style', icon: Star },
              { name: 'Wash', icon: Star },
              { name: 'Tools', icon: Star },
              { name: 'Care', icon: Star },
              { name: 'Repair', icon: Star }
            ].map((cat) => (
              <div
                key={cat.name}
                onClick={() => navigate(`/category/${cat.name.toLowerCase()}`)}
                className="group cursor-pointer p-8 rounded-[32px] bg-white hover:bg-emerald-600 border border-neutral-100 hover:border-emerald-600 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-emerald-600/20 text-center"
              >
                <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-emerald-500 transition-all duration-500">
                  <cat.icon size={28} className="text-neutral-900 group-hover:text-white" />
                </div>
                <span className="text-xs font-black text-neutral-900 group-hover:text-white uppercase tracking-widest">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Pillars */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="group relative">
              <div className="absolute inset-0 bg-emerald-50 rounded-[40px] translate-x-3 translate-y-3 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform -z-10" />
              <div className="p-10 bg-white rounded-[40px] border border-neutral-100 h-full">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8">
                  <Zap size={32} className="text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tighter">Fast Hub Logistics</h3>
                <p className="text-neutral-500 text-sm leading-relaxed font-semibold">
                  Guaranteed 24-hour dispatch from regional professional distribution centers.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-emerald-50 rounded-[40px] translate-x-3 translate-y-3 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform -z-10" />
              <div className="p-10 bg-white rounded-[40px] border border-neutral-100 h-full">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8">
                  <ShieldCheck size={32} className="text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tighter">Direct Attribution</h3>
                <p className="text-neutral-500 text-sm leading-relaxed font-semibold">
                  Every order is verified and mapped to local agents to ensure seamless procurement workflows.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-emerald-50 rounded-[40px] translate-x-3 translate-y-3 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform -z-10" />
              <div className="p-10 bg-white rounded-[40px] border border-neutral-100 h-full">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8">
                  <Heart size={32} className="text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tighter">Dedicated Success</h3>
                <p className="text-neutral-500 text-sm leading-relaxed font-semibold">
                  24/7 dedicated support for salon owners through our expert agent network.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
