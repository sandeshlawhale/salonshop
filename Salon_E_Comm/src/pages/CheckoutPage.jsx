import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI, paymentAPI, userAPI, authAPI } from '../services/apiService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  ChevronRight,
  Loader2,
  AlertCircle,
  Package,
  Zap,
  IndianRupee,
  Link2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { user } = useAuth();
  const [shippingMethod, setShippingMethod] = useState('default');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [agentId, setAgentId] = useState('');
  const [agents, setAgents] = useState([]);
  const [agentVerified, setAgentVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingAddress, setShippingAddress] = useState({ name: '', street: '', city: '', state: '', zip: '', phone: '' });
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Rewards System
  const [availablePoints, setAvailablePoints] = useState(0);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [pointsError, setPointsError] = useState('');

  const navigate = useNavigate();
  const { items: cartItems, getCartTotal, clearCart } = useCart();
  const { totalPrice } = getCartTotal();

  const displayItems = cartItems || [];
  const subtotal = totalPrice || 0;
  const discount = subtotal > 0 ? -Math.round(subtotal * 0.10) : 0; // 10% B2B discount
  const tax = Math.round((subtotal + discount) * 0.18); // 18% tax on discounted price
  const shipping = subtotal > 5000 ? 0 : 500; // Free above 5k
  const totalBeforePoints = subtotal + discount + tax + shipping;
  const total = totalBeforePoints - pointsToRedeem;

  useEffect(() => {
    if (!loading && displayItems.length === 0) {
      navigate('/cart');
    }

    // Auto-set agent if salon owner has one
    if (user?.role === 'SALON_OWNER' && user?.salonOwnerProfile?.agentId) {
      const agent = user.salonOwnerProfile.agentId;
      setAgentId(typeof agent === 'object' ? agent._id : agent);
      setAgentVerified(true);
    }

    const fetchAgents = async () => {
      try {
        const list = await userAPI.getAgents();
        setAgents(Array.isArray(list?.data) ? list.data : (Array.isArray(list) ? list : []));
      } catch (err) {
        console.warn('Failed to load agents', err);
      }
    };

    // Fetch latest user data for points
    const fetchUserData = async () => {
      try {
        const res = await authAPI.me();
        // authAPI.me returns the user object directly in res.data
        const currentUser = res.data;
        const points = currentUser.salonOwnerProfile?.rewardPoints?.available || 0;
        setAvailablePoints(points);
      } catch (err) {
        console.error('Failed to fetch user points', err);
      }
    };

    fetchAgents();
    fetchUserData();
  }, [displayItems.length, loading, navigate, user]);

  const handleVerifyAgent = () => {
    if (agentId) {
      const selected = agents.find(a => a._id === agentId);
      if (selected) {
        setAgentVerified(true);
      }
    }
  };

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    if (displayItems.length === 0) {
      navigate('/');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zip) {
        setError('Please fill the shipping address (street, city, zip)');
        setLoading(false);
        return;
      }

      const orderData = {
        items: displayItems.map(item => ({
          name: item.productName || item.name,
          quantity: item.quantity,
          price: item.price,
          productId: item.productId
        })),
        subtotal,
        discount,
        tax,
        shipping,
        total,
        shippingAddress,
        paymentMethod,
        shippingMethod,
        agentId: agentId || null,
        status: 'PENDING',
        pointsToRedeem: pointsToRedeem > 0 ? pointsToRedeem : undefined
      };

      const createdOrderRes = await orderAPI.create(orderData);
      const createdOrder = createdOrderRes.data;

      if (!createdOrder || !createdOrder._id) {
        throw new Error('Failed to create order on server');
      }

      if (paymentMethod === 'cod') {
        try { await clearCart(); } catch (clearErr) { console.warn('Failed to clear cart:', clearErr); }
        // Simple success feedback before navigation
        toast.success('Order placed successfully!');
        navigate('/my-orders');
        return;
      }

      setPaymentProcessing(true);
      console.log('Creating Razorpay order...');
      const razorOrderRes = await paymentAPI.createOrder({ amount: total, orderId: createdOrder._id, currency: 'INR' });
      console.log('Razorpay Order Response:', razorOrderRes);
      const razorOrder = razorOrderRes.data;

      const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!loaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || window?.__RAZORPAY_KEY_ID || '';
      console.log('Razorpay Key ID present:', !!keyId);

      const options = {
        key: keyId,
        amount: razorOrder.amount,
        currency: razorOrder.currency,
        name: 'SalonPro',
        description: `Order ${createdOrder.orderNumber}`,
        order_id: razorOrder.id,
        handler: async function (response) {
          console.log('Razorpay Payment Success:', response);
          try {
            const verifyRes = await paymentAPI.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: createdOrder._id
            });

            if (verifyRes && verifyRes.data && verifyRes.data.status === 'success') {
              try {
                await clearCart();
              } catch (clearErr) { console.warn('Failed to clear cart:', clearErr); }
              navigate('/my-orders');
            } else {
              setError('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            setError('Payment verification failed: ' + (err.message || 'Unknown error'));
          } finally {
            setPaymentProcessing(false);
          }
        },
        prefill: {
          name: '',
          email: ''
        },
        notes: { orderId: createdOrder._id },
        theme: { color: '#059669' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError('Payment failed: ' + (response.error?.description || 'Unknown error'));
        setPaymentProcessing(false);
      });

      rzp.open();

    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
      setPaymentProcessing(false);
    } finally {
      setLoading(false);
    }
  };

  const getAgentName = () => {
    if (user?.role === 'SALON_OWNER' && user?.salonOwnerProfile?.agentId) {
      const agent = user.salonOwnerProfile.agentId;
      if (typeof agent === 'object') {
        return `${agent.firstName} ${agent.lastName}`;
      }
    }
    const selected = agents.find(a => a._id === agentId);
    return selected ? `${selected.firstName} ${selected.lastName}` : '';
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Checkout <span className="text-emerald-600">& Attribution</span></h1>
          <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] mt-2">Finalize your professional inventory acquisition</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Section - Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Shipping */}
            <div className="bg-white rounded-[40px] border border-neutral-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-neutral-50 flex items-center gap-4 bg-neutral-50/50">
                <div className="w-10 h-10 bg-neutral-900 text-white rounded-2xl flex items-center justify-center font-black">1</div>
                <h2 className="text-lg font-black text-neutral-900 uppercase tracking-widest">Shipping Logistics</h2>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Recipient Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={shippingAddress.name}
                        onChange={e => setShippingAddress(s => ({ ...s, name: e.target.value }))}
                        className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 pl-12 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Contact Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                      <input
                        type="tel"
                        placeholder="+91 00000 00000"
                        value={shippingAddress.phone}
                        onChange={e => setShippingAddress(s => ({ ...s, phone: e.target.value }))}
                        className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 pl-12 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Street Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                      <input
                        type="text"
                        placeholder="123 Luxury Lane, Business District"
                        value={shippingAddress.street}
                        onChange={e => setShippingAddress(s => ({ ...s, street: e.target.value }))}
                        className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 pl-12 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">City</label>
                    <input
                      type="text"
                      placeholder="Mumbai"
                      value={shippingAddress.city}
                      onChange={e => setShippingAddress(s => ({ ...s, city: e.target.value }))}
                      className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">State</label>
                      <input
                        type="text"
                        placeholder="MH"
                        value={shippingAddress.state}
                        onChange={e => setShippingAddress(s => ({ ...s, state: e.target.value }))}
                        className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">ZIP / PIN</label>
                      <input
                        type="text"
                        placeholder="400001"
                        value={shippingAddress.zip}
                        onChange={e => setShippingAddress(s => ({ ...s, zip: e.target.value }))}
                        className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Agent - Only visible if assigned */}
            {user?.role === 'SALON_OWNER' && user?.salonOwnerProfile?.agentId && (
              <div className="bg-white rounded-[40px] border border-neutral-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-neutral-50 flex items-center gap-4 bg-neutral-50/50">
                  <div className="w-10 h-10 bg-neutral-900 text-white rounded-2xl flex items-center justify-center font-black">2</div>
                  <h2 className="text-lg font-black text-neutral-900 uppercase tracking-widest">Agent Attribution</h2>
                </div>
                <div className="p-8 space-y-6">
                  <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-[32px] flex items-center gap-6 shadow-sm border-dashed">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100 animate-pulse">
                      <Link2 size={32} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 items-center flex gap-2">
                        <ShieldCheck size={12} />
                        Identity Verified Relationship
                      </p>
                      <h4 className="text-xl font-black text-neutral-900 tracking-tight">
                        {getAgentName()}
                      </h4>
                      <p className="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-widest">Your Dedicated Professional Agent</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            <div className="bg-white rounded-[40px] border border-neutral-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-neutral-50 flex items-center gap-4 bg-neutral-50/50">
                <div className="w-10 h-10 bg-neutral-900 text-white rounded-2xl flex items-center justify-center font-black">3</div>
                <h2 className="text-lg font-black text-neutral-900 uppercase tracking-widest">Payment Protocol</h2>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'upi', label: 'UPI / QR', icon: Zap, sub: 'GPay, PhonePe' },
                    { id: 'card', label: 'CARDS', icon: CreditCard, sub: 'Debit / Credit' },
                    { id: 'cod', label: 'COD', icon: Truck, sub: 'Pay on arrival' }
                  ].map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`cursor-pointer p-6 rounded-[32px] border-2 transition-all flex flex-col items-center text-center gap-3 ${paymentMethod === method.id
                        ? 'bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-500/10'
                        : 'bg-white border-neutral-100 hover:border-neutral-200'
                        }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === method.id ? 'bg-emerald-500 text-white' : 'bg-neutral-50 text-neutral-400'
                        }`}>
                        <method.icon size={24} />
                      </div>
                      <div>
                        <p className={`text-xs font-black uppercase tracking-widest ${paymentMethod === method.id ? 'text-emerald-700' : 'text-neutral-900'
                          }`}>{method.label}</p>
                        <p className="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-tighter">{method.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Order Summary */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-2xl shadow-neutral-900/10 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto custom-scrollbar flex flex-col">
              <h3 className="text-lg font-black text-neutral-900 uppercase tracking-widest mb-6 border-b border-neutral-50 pb-4">Master Invoice</h3>

              <div className="space-y-4 mb-6 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar shrink-0">
                {displayItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center group">
                    <div className="relative">
                      <img
                        src={item.productImage || item.image || 'https://via.placeholder.com/64?text=Product'}
                        alt={item.productName || item.name || 'Product'}
                        className="w-16 h-16 rounded-2xl object-cover border border-neutral-100 group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-neutral-900 text-white rounded-lg flex items-center justify-center text-[10px] font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-neutral-900 truncate uppercase tracking-tight">{item.productName || item.name}</p>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">₹{item.price?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-50 pt-6 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-black text-neutral-400 uppercase tracking-widest">Inventory Total</span>
                  <span className="font-black text-neutral-900">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-black text-emerald-600 uppercase tracking-widest">B2B Volume Tier</span>
                  <span className="font-black text-emerald-600">-₹{Math.abs(discount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-black text-neutral-400 uppercase tracking-widest">Master GST (18%)</span>
                  <span className="font-black text-neutral-900">₹{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-black text-neutral-400 uppercase tracking-widest">Logistics</span>
                  <span className={`font-black uppercase ${shipping === 0 ? 'text-emerald-500' : 'text-neutral-900'}`}>
                    {shipping === 0 ? 'COMPLIMENTARY' : `₹${shipping}`}
                  </span>
                </div>
              </div>

              {/* Rewards Redemption UI */}
              <div className="pt-4 border-t border-neutral-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                    <Zap size={12} /> Balance: {availablePoints}
                  </span>
                </div>
                {/* Condition: Min 3 items (quantity) */}
                {(displayItems.reduce((acc, item) => acc + item.quantity, 0) >= 3 && availablePoints > 0) ? (
                  <div className="bg-neutral-50 p-6 rounded-[32px] border border-neutral-100 space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={pointsToRedeem || ''}
                        placeholder="Redeem Points"
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setPointsError('');
                          if (val > availablePoints) {
                            setPointsError(`Max available: ${availablePoints}`);
                            setPointsToRedeem(availablePoints);
                          } else if (val > subtotal) { // Limit to subtotal or totalBeforePoints? Backend limits to subtotal.
                            setPointsError(`Max redeemable: ₹${subtotal}`);
                            setPointsToRedeem(subtotal);
                          } else {
                            setPointsToRedeem(val);
                          }
                        }}
                        className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                      <button
                        onClick={() => setPointsToRedeem(Math.min(availablePoints, subtotal))}
                        className="px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-100"
                      >
                        Max
                      </button>
                    </div>
                    {pointsError && <p className="text-[9px] text-red-500 font-bold">{pointsError}</p>}
                    {pointsToRedeem > 0 && (
                      <div className="flex justify-between items-center text-xs animate-in fade-in slide-in-from-top-1">
                        <span className="font-black text-emerald-600 uppercase tracking-widest">Points Applied</span>
                        <span className="font-black text-emerald-600">-₹{pointsToRedeem}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[9px] text-neutral-400 font-bold italic">Add 3+ items to redeem points.</p>
                )}
              </div>
            </div>

            <div className="border-t border-neutral-900 border-dashed mt-6 pt-6 mb-8">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1">Grand Payable</p>
                  <p className="text-3xl font-black text-neutral-900 tracking-tighter flex items-center gap-1">
                    <IndianRupee size={24} className="text-emerald-500" />
                    {total.toLocaleString()}
                  </p>
                </div>
                <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-widest">
                  Verified Checkout
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 mb-6 animate-in shake duration-500">
                <AlertCircle size={18} />
                <p className="text-[10px] font-black uppercase tracking-widest text-center">{error}</p>
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={loading || paymentProcessing || (!agentVerified && agentId)}
              className="w-full h-16 bg-neutral-900 text-white rounded-[24px] font-black hover:bg-emerald-600 transition-all shadow-2xl shadow-neutral-900/20 active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs disabled:opacity-50"
            >
              {loading || paymentProcessing ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <ShieldCheck size={20} />
                  AUTHORIZE PAYMENT
                </>
              )}
            </button>

            <div className="mt-4 flex flex-col items-center gap-2 pb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50/50 rounded-full border border-emerald-100/50">
                <ShieldCheck size={10} className="text-emerald-600" />
                <span className="text-[8px] font-black text-emerald-800 uppercase tracking-widest">SECURE 256-BIT SSL ENCRYPTION</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
