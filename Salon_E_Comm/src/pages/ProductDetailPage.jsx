import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productAPI } from "../services/apiService";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Loader2, ShoppingCart, ShieldCheck, Truck, RefreshCcw, Star, ChevronRight, Plus, Minus, Heart, Share2 } from "lucide-react";
import { Button } from "../components/ui/button";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await productAPI.getById(id);
        const data = res.data;
        if (data) {
          setProduct({
            ...data,
            description: data.description || `Premium ${data.name} specifically formulated for professional salon results.`,
            ingredients: data.ingredients || ["Organic Extracts", "Professional Grade Polymer", "Vitamin E", "Aloe Vera"],
            specs: data.specs || [
              { label: "Volume", value: "500ml" },
              { label: "Usage", value: "Professional Only" },
              { label: "pH Level", value: "5.5 (Balanced)" }
            ],
            bulkOptions: [
              { units: "10-49", discount: "5% OFF" },
              { units: "50-99", discount: "15% OFF" },
              { units: "100+", discount: "25% OFF" }
            ]
          });
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Product not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product._id || id, quantity);
    } catch (err) {
      alert("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-neutral-500 font-bold tracking-widest text-xs uppercase">Loading Luxury Item...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-4">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500">
          <X size={40} />
        </div>
        <h2 className="text-2xl font-black text-neutral-900">{error || "Product Not Found"}</h2>
        <Button onClick={() => navigate("/")} variant="outline" className="rounded-xl px-8 h-12">Return to Shop</Button>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={10} />
          <Link to={`/category/${product.category}`} className="hover:text-black transition-colors">{product.category}</Link>
          <ChevronRight size={10} />
          <span className="text-neutral-900">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Image Gallery */}
          <div className="space-y-6">
            <div className="relative aspect-square rounded-[40px] overflow-hidden bg-neutral-50 group border border-neutral-100 shadow-sm">
              <img
                src={product.images?.[0] || product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {discount > 0 && (
                <div className="absolute top-6 left-6 bg-blue-600 text-white text-[12px] font-black px-4 py-1.5 rounded-full shadow-lg">
                  -{discount}% B2B SAVING
                </div>
              )}
              <button className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur-md rounded-2xl text-neutral-400 hover:text-rose-500 transition-all shadow-md group-hover:scale-110">
                <Heart size={20} />
              </button>
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col">
            <div className="space-y-6 pb-8 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span className="bg-neutral-900 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">{product.category}</span>
                <div className="flex items-center gap-1 text-amber-500 ml-2">
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <span className="text-neutral-900 text-sm font-bold ml-1">4.9</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-neutral-900 leading-[1.1] tracking-tight">{product.name}</h1>

              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-black text-neutral-900 tracking-tighter">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-xl text-neutral-400 line-through font-medium">₹{product.originalPrice.toLocaleString()}</span>
                )}
              </div>

              <p className="text-neutral-500 font-medium leading-relaxed max-w-lg">
                {product.description}
              </p>
            </div>

            {/* Inventory & Quantity */}
            <div className="py-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-8">
                <div className="space-y-3 flex-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Inventory Status</label>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-bold text-neutral-900">{product.inventoryCount || 100} units currently in stock</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Select Quantity</label>
                  <div className="flex items-center bg-neutral-50 rounded-2xl p-1 border border-neutral-100 w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-white hover:rounded-xl transition-all font-bold text-neutral-600"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      className="bg-transparent w-12 text-center text-sm font-black focus:outline-none"
                      readOnly
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-white hover:rounded-xl transition-all font-bold text-neutral-600"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bulk Packages */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Professional Bulk Pricing</label>
                <div className="grid grid-cols-3 gap-4">
                  {product.bulkOptions.map((option) => (
                    <div key={option.units} className="group cursor-pointer p-4 rounded-2xl border-2 border-neutral-50 bg-neutral-50 hover:border-blue-600/20 hover:bg-blue-50/30 transition-all">
                      <p className="text-[10px] font-black text-neutral-400 group-hover:text-blue-600 transition-colors uppercase">{option.units} Units</p>
                      <p className="text-sm font-black text-neutral-900 mt-1">{option.discount}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  size="lg"
                  className="flex-1 h-16 bg-neutral-900 hover:bg-black rounded-[24px] text-base font-bold shadow-xl shadow-neutral-900/20 transition-all active:scale-[0.98]"
                >
                  {addingToCart ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    <ShoppingCart size={20} className="mr-2" />
                  )}
                  ADD TO SALON BASKET
                </Button>
                <button className="p-5 border-2 border-neutral-100 rounded-[24px] hover:bg-neutral-50 transition-colors">
                  <Share2 size={24} className="text-neutral-600" />
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center text-blue-600">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-tighter">Certified</span>
                    <span className="text-[11px] font-bold text-neutral-400">B2B Quality</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center text-blue-600">
                    <Truck size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-tighter">Express</span>
                    <span className="text-[11px] font-bold text-neutral-400">Salon Logistics</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center text-blue-600">
                    <RefreshCcw size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-tighter">Easy</span>
                    <span className="text-[11px] font-bold text-neutral-400">Vendor Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
