import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/apiService';
import { ShoppingBag, Package, Calendar, ChevronRight, ChevronDown, CheckCircle2, Clock, XCircle, AlertCircle, ExternalLink } from 'lucide-react';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await orderAPI.getMyOrders();
      const list = response?.data || response?.value || response || [];
      setOrders(Array.isArray(list) ? list : []);
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: { color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock },
      PAID: { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2 },
      PROCESSING: { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: Package },
      SHIPPED: { color: 'text-blue-600 bg-blue-50 border-blue-100', icon: Package },
      DELIVERED: { color: 'text-emerald-700 bg-emerald-100 border-emerald-200', icon: CheckCircle2 },
      CANCELLED: { color: 'text-red-600 bg-red-50 border-red-100', icon: XCircle },
      REFUNDED: { color: 'text-neutral-600 bg-neutral-50 border-neutral-100', icon: AlertCircle }
    };
    return configs[status] || { color: 'text-neutral-500 bg-neutral-50 border-neutral-100', icon: Clock };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <Clock className="animate-spin text-emerald-600" size={48} />
          <div className="absolute inset-0 blur-xl bg-emerald-400/20 -z-10" />
        </div>
        <p className="text-neutral-400 font-black tracking-[0.4em] text-[10px] uppercase">Retrieving your order ledger...</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50/50 min-h-screen py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black text-neutral-900 tracking-tighter">My <span className="text-emerald-600">Orders</span></h1>
            <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] mt-3 flex items-center gap-2">
              <ShoppingBag size={14} className="text-emerald-600" />
              {orders.length} TOTAL PURCHASES
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-white border border-neutral-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-neutral-900 hover:bg-neutral-50 transition-all shadow-sm flex items-center gap-2"
          >
            Sourcing Collection <ExternalLink size={14} />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 border border-neutral-100 shadow-2xl text-center space-y-8">
            <div className="w-32 h-32 bg-neutral-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-neutral-50/50">
              <Package size={48} className="text-neutral-200" />
            </div>
            <div className="max-w-sm mx-auto space-y-4">
              <h2 className="text-3xl font-black text-neutral-900">No Orders Found</h2>
              <p className="text-neutral-500 font-medium">You haven't placed any orders yet. Start shopping to build your salon inventory.</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="h-16 px-12 bg-neutral-900 text-white rounded-[24px] font-black hover:bg-emerald-600 transition-all shadow-xl shadow-neutral-900/10 uppercase tracking-widest text-xs"
            >
              EXPLORE THE CATALOGUE
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => {
              const statusCfg = getStatusConfig(order.status);
              const StatusIcon = statusCfg.icon;
              const isExpanded = expandedOrder === order._id;

              return (
                <div key={order._id} className={`bg-white rounded-[32px] border transition-all duration-500 overflow-hidden ${isExpanded ? 'border-emerald-200 shadow-2xl' : 'border-neutral-100 shadow-sm hover:shadow-xl'}`}>
                  {/* Order Card Header */}
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row justify-between gap-6 items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-black text-neutral-900 tracking-tighter">#{order.orderNumber || order._id.slice(-8).toUpperCase()}</h3>
                          <div className={`px-4 py-1.5 rounded-full border ${statusCfg.color} flex items-center gap-2`}>
                            <StatusIcon size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{order.status}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-neutral-400 text-[10px] font-bold uppercase tracking-[0.15em]">
                          <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="w-1 h-1 bg-neutral-200 rounded-full" />
                          <span>{order.items.length} Items</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Total Amount</p>
                        <p className="text-3xl font-black text-neutral-900 tracking-tighter leading-none">₹{order.total.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-neutral-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-neutral-50 rounded-lg text-[9px] font-black text-neutral-500 uppercase tracking-widest border border-neutral-100">
                          {order.paymentMethod?.toUpperCase() || 'Razorpay Virtual'}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isExpanded ? 'text-emerald-600' : 'text-neutral-400 hover:text-neutral-900'}`}
                      >
                        {isExpanded ? 'Compress Details' : 'View Details'}
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Section */}
                  {isExpanded && (
                    <div className="bg-neutral-50/50 p-8 border-t border-neutral-100 animate-in slide-in-from-top-4 duration-500">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Item Analysis */}
                        <div className="space-y-6">
                          <h4 className="text-xs font-black text-neutral-400 uppercase tracking-[0.3em]">Order items</h4>
                          <div className="space-y-4">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-neutral-100 shadow-sm">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-neutral-50 rounded-xl flex items-center justify-center border border-neutral-100 text-neutral-300">
                                    <Package size={20} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-neutral-900">{item.name}</p>
                                    <p className="text-[10px] font-bold text-neutral-400 mt-0.5 uppercase tracking-widest">Qty: {item.quantity} x ₹{item.priceAtPurchase.toLocaleString()}</p>
                                  </div>
                                </div>
                                <span className="text-sm font-black text-neutral-900 px-3">₹{(item.priceAtPurchase * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Logistics & Timeline */}
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <h4 className="text-xs font-black text-neutral-400 uppercase tracking-[0.3em]">Order Status Timeline</h4>
                            <div className="space-y-6 pl-4 border-l-2 border-emerald-100">
                              {(order.timeline || [
                                { status: 'PENDING', timestamp: order.createdAt, note: 'Order placed successfully' },
                                { status: order.status, timestamp: new Date(), note: `System current state marked as ${order.status}` }
                              ]).map((evt, idx) => (
                                <div key={idx} className="relative">
                                  <div className="absolute -left-[21px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-emerald-500" />
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-black text-neutral-900 uppercase tracking-widest">{evt.status}</span>
                                      <span className="text-[10px] font-bold text-neutral-400">{new Date(evt.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-[10px] text-neutral-500 leading-relaxed max-w-sm">{evt.note}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shipping Destination */}
                          <div className="bg-emerald-600 p-6 rounded-[24px] text-white space-y-3 shadow-xl shadow-emerald-600/20">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Shipping Address</h4>
                            <div className="space-y-1">
                              <p className="text-sm font-black">{order.shippingAddress?.name || 'Authorized Salon Owner'}</p>
                              <p className="text-[11px] font-medium opacity-90 leading-relaxed">
                                {order.shippingAddress?.street},<br />
                                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}
                              </p>
                              <p className="text-[11px] font-bold mt-2 flex items-center gap-2">
                                <span className="opacity-60 text-[10px] tracking-widest uppercase">COMMS:</span>
                                {order.shippingAddress?.phone}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
