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
    Calendar
} from 'lucide-react';
import { orderAPI, userAPI } from '../../services/apiService';

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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssignAgent = async (orderId, agentId) => {
        try {
            await orderAPI.assignAgent(orderId, agentId);
            setAssigningOrderId(null);
            fetchData();
        } catch (err) {
            alert('Failed to assign agent');
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await orderAPI.updateStatus(orderId, newStatus);
            fetchData();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        const styles = {
            'PENDING': 'bg-amber-50 text-amber-700 ring-amber-600/20',
            'PROCESSING': 'bg-blue-50 text-blue-700 ring-blue-600/20',
            'SHIPPED': 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
            'DELIVERED': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
            'CANCELLED': 'bg-rose-50 text-rose-700 ring-rose-600/20',
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ring-1 ring-inset ${styles[status] || styles['PENDING']}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Order Management</h1>
                    <p className="text-sm text-neutral-500 font-medium">Track and manage high-end salon shipments efficiently.</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-sm group">
                        <Search className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search Order ID, Customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm"
                        />
                    </div>
                    <div className="relative group">
                        <Filter className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-8 py-2 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm appearance-none cursor-pointer font-bold text-neutral-600"
                        >
                            <option value="All">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-bold rounded-xl transition-all flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Last 30 Days
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Order Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Customer</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Assigned Agent</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Total</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                                        <p className="text-neutral-400 font-bold text-[10px] uppercase tracking-widest">Fetching Shipments...</p>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center text-neutral-400 font-medium">
                                        No orders found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-neutral-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-neutral-900 group-hover:text-blue-600 transition-colors">#{order._id.slice(-8).toUpperCase()}</span>
                                                <span className="text-[11px] font-bold text-neutral-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border border-blue-200 shadow-sm shrink-0">
                                                    <span className="text-xs font-black">{order.user?.firstName?.[0]}{order.user?.lastName?.[0]}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-neutral-900">{order.user?.firstName} {order.user?.lastName}</span>
                                                    <span className="text-[11px] text-neutral-400 font-medium line-clamp-1">{order.user?.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {order.agent ? (
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-xl border border-green-100 w-fit">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                    <span className="text-[11px] font-bold text-green-700">{order.agent.firstName} {order.agent.lastName}</span>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    {assigningOrderId === order._id ? (
                                                        <select
                                                            className="text-[11px] font-bold bg-white border border-neutral-200 rounded-lg px-2 py-1 outline-none"
                                                            onChange={(e) => handleAssignAgent(order._id, e.target.value)}
                                                            onBlur={() => setAssigningOrderId(null)}
                                                            autoFocus
                                                        >
                                                            <option value="">Select Agent</option>
                                                            {agents.map(agent => (
                                                                <option key={agent._id} value={agent._id}>{agent.firstName} {agent.lastName}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <button
                                                            onClick={() => setAssigningOrderId(order._id)}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-600 rounded-xl transition-all group/btn"
                                                        >
                                                            <UserPlus className="w-3.5 h-3.5" />
                                                            <span className="text-[11px] font-bold uppercase tracking-tight">Assign Agent</span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-black text-neutral-900">₹{order.totalAmount?.toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button className="p-2.5 bg-white shadow-sm border border-neutral-100 rounded-xl text-neutral-400 hover:text-blue-600 hover:border-blue-600/20 transition-all">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <div className="relative group/more">
                                                    <button className="p-2.5 bg-white shadow-sm border border-neutral-100 rounded-xl text-neutral-400 hover:text-neutral-900 transition-all">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                    <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-2xl shadow-2xl border border-neutral-100 p-2 hidden group-hover/more:block z-10 animate-in zoom-in-95 origin-bottom-right">
                                                        {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
                                                            <button
                                                                key={s}
                                                                onClick={() => handleUpdateStatus(order._id, s)}
                                                                className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold hover:bg-neutral-50 transition-colors ${order.status === s ? 'text-blue-600 bg-blue-50' : 'text-neutral-600'}`}
                                                            >
                                                                Mark as {s}
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
