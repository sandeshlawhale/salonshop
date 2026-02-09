import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    ShoppingBag,
    TrendingUp,
    Copy,
    CheckCircle2,
    ChevronRight,
    Gift
} from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import { orderAPI, commissionAPI, authAPI } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

export default function AgentHome() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalEarnings: 0,
        monthlyEarnings: 0,
        totalOrders: 0,
        pendingCommission: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchAgentData = async () => {
            try {
                const [ordersRes, commissionsRes] = await Promise.all([
                    orderAPI.getAssigned({ limit: 5 }),
                    commissionAPI.getMyCommissions()
                ]);

                const myOrders = ordersRes.data.assignedOrders || [];
                const myCommissions = commissionsRes.data.commissions || [];

                const totalEarnings = myCommissions.reduce((sum, c) => sum + (c.amountEarned || 0), 0);
                const pendingCommission = myCommissions
                    .filter(c => c.status === 'PENDING')
                    .reduce((sum, c) => sum + (c.amountEarned || 0), 0);

                setStats({
                    totalEarnings,
                    monthlyEarnings: totalEarnings, // Placeholder for actual monthly logic
                    totalOrders: ordersRes.data.count || myOrders.length,
                    pendingCommission
                });
                setRecentOrders(myOrders);
            } catch (error) {
                console.error('Failed to fetch agent data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAgentData();
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(user?.agentProfile?.referralCode || 'REF-SALON-2024');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome & Tier */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-neutral-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5">
                <div className="relative z-10 space-y-3">
                    <h2 className="text-4xl font-black tracking-tighter">Welcome back, <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-400">{user?.firstName}!</span> 👋</h2>
                    <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs max-w-sm leading-relaxed">Executive Dashboard // {user?.agentProfile?.tier || 'Silver'} Classification</p>
                    <div className="flex items-center gap-4 mt-6">
                        <div className="px-5 py-2.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Monthly Yield</p>
                            <p className="text-xl font-black tracking-tighter">₹1,240.00</p>
                        </div>
                        <div className="px-5 py-2.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Growth Forecast</p>
                            <p className="text-xl font-black tracking-tighter text-emerald-400">+12%</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 bg-emerald-500/10 backdrop-blur-2xl rounded-[32px] p-8 border border-emerald-500/20 min-w-[320px]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300/60">Tier Status</span>
                            <h3 className="text-lg font-black text-white uppercase tracking-widest">{user?.agentProfile?.tier || 'Silver'}</h3>
                        </div>
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                            <Gift className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="w-full bg-white/5 h-2.5 rounded-full mb-4 group cursor-help">
                        <div className="bg-linear-to-r from-emerald-500 to-teal-400 h-full w-[65%] rounded-full shadow-[0_0_15px_rgba(52,211,153,0.4)] transition-all duration-1000 group-hover:w-[70%]"></div>
                    </div>
                    <p className="text-[10px] font-black text-emerald-300/80 uppercase tracking-widest leading-loose">
                        ₹3,760 more until <span className="text-white">Gold Tier</span> (12% base)
                    </p>
                </div>

                {/* Background accents */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full -mr-40 -mt-40 blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full -ml-40 -mb-40 blur-[100px]"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Yield"
                    value={`₹${stats.totalEarnings.toLocaleString()}`}
                    icon={DollarSign}
                    color="emerald"
                />
                <StatCard
                    title="Net Revenue"
                    value={`₹${stats.monthlyEarnings.toLocaleString()}`}
                    icon={TrendingUp}
                    color="emerald"
                />
                <StatCard
                    title="Portfolio Size"
                    value={stats.totalOrders}
                    icon={ShoppingBag}
                    color="emerald"
                />
                <StatCard
                    title="Comm. Coefficient"
                    value={`${(user?.agentProfile?.commissionRate || 0.1) * 100}%`}
                    icon={CheckCircle2}
                    color="emerald"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Referral Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-neutral-100 group">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-neutral-900 tracking-tighter">Refer & Scale</h3>
                        </div>
                        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest leading-loose mb-8">Onboard new salons to your node and earn <span className="text-emerald-600 font-black">₹500 per unit</span>.</p>

                        <div className="relative group/copy mb-2">
                            <div className="absolute -inset-1 bg-linear-to-r from-emerald-500 to-teal-400 rounded-2xl blur opacity-10 group-focus-within/copy:opacity-25 transition-opacity"></div>
                            <div className="relative flex items-center gap-2 p-2 bg-neutral-50 rounded-2xl border border-neutral-100">
                                <code className="flex-1 px-4 text-xs font-black text-neutral-900 uppercase tracking-widest">{user?.agentProfile?.referralCode || 'SALON-AGENT-01'}</code>
                                <button
                                    onClick={copyToClipboard}
                                    className="p-3 bg-white shadow-sm border border-neutral-100 rounded-xl transition-all active:scale-95 text-neutral-400 hover:text-emerald-600"
                                >
                                    {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-900 p-8 rounded-[40px] shadow-2xl border border-white/5 text-center relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4">Matured Balance</h3>
                            <p className="text-5xl font-black text-white tracking-tighter mb-8">₹{stats.pendingCommission.toLocaleString()}</p>
                            <button
                                className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] disabled:opacity-30 disabled:grayscale"
                                disabled={stats.pendingCommission === 0}
                            >
                                Initiate Withdrawal
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
                    </div>
                </div>

                {/* Recent Orders Table */}
                <div className="lg:col-span-2 bg-white rounded-[40px] shadow-sm border border-neutral-100 overflow-hidden">
                    <div className="p-8 border-b border-neutral-50 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-neutral-900 tracking-tighter">Assigned Traffic</h3>
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Real-time portfolio monitoring</p>
                        </div>
                        <button className="px-5 py-2.5 bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-neutral-900/10">
                            Full Ledger
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Client Console</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Logistics</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Gross Yield</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Comm.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {recentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center">
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest italic">No assigned traffic detected in current cycle.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    recentOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-neutral-50/50 transition-all duration-300 group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-400 font-black text-xs group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                        {(order.customerId?.firstName || 'S')[0]}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-neutral-900 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">{order.customerId?.firstName} {order.customerId?.lastName}</span>
                                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">#{order.orderNumber || order._id.slice(-6).toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ring-1 ring-inset ${order.status === 'DELIVERED' || order.status === 'COMPLETED'
                                                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                                    : 'bg-neutral-900 text-white'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-base font-black text-neutral-900 tracking-tighter transition-all group-hover:scale-110 inline-block origin-left">₹{order.total?.toLocaleString()}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-base font-black text-emerald-600 tracking-tighter">₹{Math.round((order.total || 0) * (user?.agentProfile?.commissionRate || 0.1))}</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
