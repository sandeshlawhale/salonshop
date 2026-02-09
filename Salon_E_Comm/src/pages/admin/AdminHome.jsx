import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    ShoppingBag,
    Users,
    DollarSign,
    ArrowRight,
    MoreVertical
} from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import { orderAPI, productAPI, userAPI, commissionAPI } from '../../services/apiService';

export default function AdminHome() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        activeAgents: 0,
        totalCommissions: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [ordersRes, productsRes, usersRes, commissionsRes] = await Promise.all([
                    orderAPI.getAll({ limit: 5 }),
                    productAPI.getAll(),
                    userAPI.getAll(),
                    commissionAPI.getAll()
                ]);

                const orders = ordersRes.data.value || ordersRes.data || [];
                const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
                const agents = (usersRes.data || []).filter(u => u.role === 'AGENT');
                const totalCommissions = (commissionsRes.data || []).reduce((sum, c) => sum + (c.amountEarned || 0), 0);

                setStats({
                    totalRevenue,
                    totalOrders: ordersRes.data.Count || orders.length,
                    activeAgents: agents.filter(a => a.isActive).length,
                    totalCommissions
                });
                setRecentOrders(orders);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    trend="up"
                    trendValue="12%"
                    color="blue"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={ShoppingBag}
                    trend="up"
                    trendValue="8%"
                    color="emerald"
                />
                <StatCard
                    title="Active Agents"
                    value={stats.activeAgents}
                    icon={Users}
                    color="amber"
                />
                <StatCard
                    title="Commissions Paid"
                    value={`₹${stats.totalCommissions.toLocaleString()}`}
                    icon={TrendingUp}
                    color="rose"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                    <div className="p-6 border-b border-neutral-50 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-neutral-900">Recent Orders</h3>
                        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50/50">
                                    <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {recentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-neutral-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-neutral-900">#{order.orderNumber || order._id.slice(-6).toUpperCase()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-600">
                                                    {order.customerId?.firstName?.[0] || 'C'}
                                                </div>
                                                <span className="text-sm text-neutral-700 font-medium">{order.customerId?.firstName} {order.customerId?.lastName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${order.status === 'DELIVERED' || order.status === 'COMPLETED'
                                                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                                    : order.status === 'PENDING'
                                                        ? 'bg-amber-50 text-amber-700 ring-amber-600/20'
                                                        : 'bg-blue-50 text-blue-700 ring-blue-600/20'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-neutral-900">₹{order.total?.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-all opacity-0 group-hover:opacity-100">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions / Stats */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                        <h3 className="text-lg font-bold text-neutral-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all">
                                <Package className="w-6 h-6" />
                                <span className="text-xs font-bold">Add Product</span>
                            </button>
                            <button className="flex flex-col items-center gap-2 p-4 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all">
                                <Users className="w-6 h-6" />
                                <span className="text-xs font-bold">Add Agent</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-neutral-900 p-6 rounded-2xl shadow-lg border border-neutral-800 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-2">Platform Health</h3>
                            <p className="text-neutral-400 text-sm mb-4">Everything is running smoothly today.</p>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs">
                                    <span className="text-neutral-400">Inventory Status</span>
                                    <span className="text-emerald-400 font-bold">Good</span>
                                </div>
                                <div className="w-full bg-neutral-800 h-1.5 rounded-full">
                                    <div className="bg-emerald-500 h-full w-[85%] rounded-full"></div>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-neutral-400">Agent Performance</span>
                                    <span className="text-blue-400 font-bold">High</span>
                                </div>
                                <div className="w-full bg-neutral-800 h-1.5 rounded-full">
                                    <div className="bg-blue-500 h-full w-[92%] rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Icon for Quick Actions
function Package(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16.5 9.4 7.5 4.21" />
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.29 7 12 12 20.71 7" />
            <line x1="12" y1="22" x2="12" y2="12" />
        </svg>
    );
}
