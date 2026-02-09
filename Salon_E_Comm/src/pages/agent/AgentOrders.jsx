import React, { useState, useEffect } from 'react';
import {
    ShoppingBag,
    Search,
    Filter,
    Calendar,
    ChevronRight,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    Loader2,
    ExternalLink
} from 'lucide-react';
import { orderAPI } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

export default function AgentOrders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const res = await orderAPI.getAssigned();
                setOrders(res.data.assignedOrders || res.data || []);
            } catch (err) {
                console.error('Failed to fetch orders:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'DELIVERED':
            case 'COMPLETED':
                return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'PROCESSING':
                return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'SHIPPED':
                return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'CANCELLED':
                return 'bg-red-50 text-red-600 border-red-100';
            default:
                return 'bg-neutral-50 text-neutral-600 border-neutral-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'DELIVERED':
            case 'COMPLETED':
                return <CheckCircle2 size={12} />;
            case 'PROCESSING':
                return <Clock size={12} />;
            case 'SHIPPED':
                return <Truck size={12} />;
            case 'CANCELLED':
                return <Package size={12} />;
            default:
                return <Package size={12} />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Assigned <span className="text-emerald-600">Portfolio</span></h1>
                    <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] mt-2">Track and manage orders from your salon network</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group min-w-[300px]">
                        <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by Order ID or Salon..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-100 rounded-2xl text-xs font-bold outline-none shadow-sm focus:ring-4 focus:ring-emerald-500/5 transition-all"
                        />
                    </div>

                    <div className="flex bg-white p-1 rounded-2xl border border-neutral-100 shadow-sm">
                        {['ALL', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === status
                                    ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/10'
                                    : 'text-neutral-400 hover:text-neutral-900'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[40px] border border-neutral-100">
                    <div className="relative">
                        <Loader2 className="animate-spin text-emerald-600" size={48} />
                        <div className="absolute inset-0 bg-emerald-600/10 blur-xl rounded-full" />
                    </div>
                    <p className="text-neutral-400 font-black tracking-widest text-[10px] uppercase animate-pulse">Synchronizing Data Assets...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[40px] border border-neutral-100 text-center">
                    <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-300">
                        <ShoppingBag size={40} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-neutral-900 uppercase tracking-widest">No Active Orders</h3>
                        <p className="text-neutral-400 font-bold max-w-sm mx-auto text-sm leading-relaxed">Your assignment queue is currently empty. Orders from your network will appear here automatically.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredOrders.map((order) => (
                        <div key={order._id} className="group bg-white rounded-[32px] border border-neutral-100 p-6 hover:shadow-2xl hover:shadow-neutral-900/5 transition-all duration-500 relative overflow-hidden">
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 border ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-sm font-black text-neutral-900 uppercase tracking-tight">#{order.orderNumber || order._id.slice(-8).toUpperCase()}</h3>
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-tighter">
                                                <span className="text-neutral-900">{order.customerId?.firstName} {order.customerId?.lastName}</span> • {order.items?.length || 0} Units
                                            </p>
                                            <div className="w-1 h-1 bg-neutral-200 rounded-full" />
                                            <p className="text-[10px] font-bold text-neutral-400 flex items-center gap-1 uppercase tracking-widest">
                                                <Calendar size={12} />
                                                {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12 w-full lg:w-auto border-t lg:border-t-0 pt-6 lg:pt-0">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Order Value</span>
                                        <span className="text-lg font-black text-neutral-900 tracking-tight">₹{order.total?.toLocaleString()}</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Yield (Comm.)</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-black text-emerald-600 tracking-tight">+₹{Math.round((order.total || 0) * (user?.agentProfile?.commissionRate || 0.1)).toLocaleString()}</span>
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        </div>
                                    </div>

                                    <button className="h-14 px-8 bg-neutral-900 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.98] flex items-center gap-2 shadow-lg shadow-neutral-900/10">
                                        Manifest <ExternalLink size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Background accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity -mr-16 -mt-16 rounded-full blur-3xl pointer-events-none" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
