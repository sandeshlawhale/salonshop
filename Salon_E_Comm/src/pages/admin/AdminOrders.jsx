import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Eye,
    UserPlus,
    ChevronRight,
    Clock,
    CheckCircle2,
    Truck,
    AlertCircle,
    Loader2,
    MoreVertical,
    Calendar,
    Hash,
    User as UserIcon,
    Briefcase,
    IndianRupee
} from 'lucide-react';
import { orderAPI, userAPI } from '../../services/apiService';
import { toast } from 'react-hot-toast';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [assigningOrderId, setAssigningOrderId] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [orderRes, agentRes] = await Promise.all([
                orderAPI.getAll(),
                userAPI.getAgents()
            ]);
            setOrders(orderRes.data.allOrders || []);
            setAgents(agentRes.data || []);
        } catch (err) {
            console.error('Failed to fetch orders/agents:', err);
            toast.error('Failed to synchronize order registry');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssignAgent = async (orderId, agentId) => {
        if (!agentId) return;
        try {
            await orderAPI.assignAgent(orderId, agentId);
            setAssigningOrderId(null);
            toast.success('Agent executive assigned to shipment');
            fetchData();
        } catch (err) {
            toast.error('Failed to assign agent');
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await orderAPI.updateStatus(orderId, newStatus);
            toast.success(`Order status updated to ${newStatus}`);
            fetchData();
        } catch (err) {
            toast.error('Failed to update shipment status');
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        const styles = {
            'PENDING': 'bg-amber-50 text-amber-700 ring-amber-600/20',
            'PAID': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
            'PROCESSING': 'bg-blue-50 text-blue-700 ring-blue-600/20',
            'SHIPPED': 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
            'DELIVERED': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
            'COMPLETED': 'bg-emerald-600 text-white ring-emerald-600/20',
            'CANCELLED': 'bg-rose-50 text-rose-700 ring-rose-600/20',
        };
        return (
            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${styles[status] || styles['PENDING']}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Logistics & Order Ledger</h1>
                    <p className="text-sm text-neutral-500 font-medium">Coordinate high-value salon fulfillment and agent attribution.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-6 py-3 bg-neutral-900 hover:bg-emerald-600 text-white rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95">
                        <Calendar size={16} />
                        Export Ledger
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md group">
                    <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="SEARCH BY ORDER ID OR SALON..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 h-12 bg-white border-2 border-neutral-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none shadow-sm focus:ring-4 focus:ring-emerald-500/5 transition-all"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white border-2 border-neutral-100 rounded-2xl flex items-center gap-3">
                        <Filter size={14} className="text-neutral-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-neutral-600"
                        >
                            <option value="All">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="PAID">Paid</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-[40px] border border-neutral-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50/50">
                                <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Shipment</th>
                                <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Salon Pro</th>
                                <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Commission Ops</th>
                                <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Revenue</th>
                                <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-32 text-center">
                                        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Synchronizing Shipments...</p>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-32 text-center text-neutral-400 font-black uppercase tracking-widest italic">
                                        No matching shipments in registry.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-neutral-50/50 transition-all duration-300 group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-400 shrink-0">
                                                    <Hash size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-neutral-900 group-hover:text-emerald-600 transition-colors tracking-tight uppercase">
                                                        {order.orderNumber?.split('-')[2] || order._id.slice(-6).toUpperCase()}
                                                    </span>
                                                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-0.5">
                                                        {new Date(order.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                                                    <UserIcon size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-neutral-900 uppercase tracking-tight">
                                                        {order.customerId?.firstName} {order.customerId?.lastName}
                                                    </span>
                                                    <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest line-clamp-1">
                                                        {order.customerId?.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {order.agentId ? (
                                                <div className="flex items-center gap-3 px-3 py-2 bg-neutral-900 rounded-xl border border-neutral-800 w-fit">
                                                    <Briefcase size={12} className="text-emerald-400" />
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                                        {order.agentId.firstName} {order.agentId.lastName}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    {assigningOrderId === order._id ? (
                                                        <select
                                                            className="text-[10px] font-black uppercase tracking-widest bg-white border-2 border-emerald-500 rounded-xl px-3 py-2 outline-none animate-in fade-in slide-in-from-top-1"
                                                            onChange={(e) => handleAssignAgent(order._id, e.target.value)}
                                                            onBlur={() => setAssigningOrderId(null)}
                                                            autoFocus
                                                        >
                                                            <option value="">ASSIGN AGENT...</option>
                                                            {agents.map(agent => (
                                                                <option key={agent._id} value={agent._id}>{agent.firstName.toUpperCase()} {agent.lastName.toUpperCase()}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <button
                                                            onClick={() => setAssigningOrderId(order._id)}
                                                            className="flex items-center gap-2 px-4 py-2 bg-neutral-50 hover:bg-neutral-900 border border-neutral-100 hover:border-neutral-900 text-neutral-400 hover:text-white rounded-xl transition-all group/btn"
                                                        >
                                                            <UserPlus size={14} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Assign</span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-1">
                                                <IndianRupee size={14} className="text-neutral-400" />
                                                <span className="text-base font-black text-neutral-900 tracking-tighter">
                                                    {(order.total || 0).toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <button className="p-3 bg-white shadow-sm border-2 border-neutral-100 rounded-2xl text-neutral-400 hover:text-emerald-600 hover:border-emerald-100 transition-all">
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <div className="relative group/more">
                                                    <button className="p-3 bg-white shadow-sm border-2 border-neutral-100 rounded-2xl text-neutral-400 hover:text-neutral-900 hover:border-neutral-200 transition-all">
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-3xl shadow-2xl border border-neutral-100 p-2 hidden group-hover/more:block z-50 animate-in zoom-in-95 origin-top-right">
                                                        {['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'].map(s => (
                                                            <button
                                                                key={s}
                                                                onClick={() => handleUpdateStatus(order._id, s)}
                                                                className={`w-full text-left px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 transition-colors ${order.status === s ? 'text-emerald-600 bg-emerald-50' : 'text-neutral-400'}`}
                                                            >
                                                                Mark {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
