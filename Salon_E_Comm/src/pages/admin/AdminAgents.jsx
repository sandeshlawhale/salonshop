import React, { useState, useEffect } from 'react';
import {
    Users,
    DollarSign,
    TrendingUp,
    Award,
    MessageSquare,
    FileText,
    Search,
    Filter,
    Loader2,
    ChevronRight
} from 'lucide-react';
import { userAPI, commissionAPI } from '../../services/apiService';
import StatCard from '../../components/admin/StatCard';

export default function AdminAgents() {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const res = await userAPI.getAgents();
            setAgents(res.data || []);
        } catch (err) {
            console.error('Failed to fetch agents:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const getTierColor = (tier) => {
        const tiers = {
            'SILVER': 'bg-neutral-50 text-neutral-700 ring-neutral-600/20',
            'GOLD': 'bg-amber-50 text-amber-700 ring-amber-600/20',
            'PLATINUM': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        };
        return tiers[tier] || 'bg-neutral-50 text-neutral-600';
    };

    const tiers = [
        { name: 'Silver', threshold: '< ₹50,000', rate: '5%', color: 'neutral' },
        { name: 'Gold', threshold: '₹50k - ₹1.5L', rate: '8%', color: 'amber' },
        { name: 'Platinum', threshold: '> ₹1.5L', rate: '12%', color: 'emerald' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Agent & Commission Analytics</h1>
                    <p className="text-sm text-neutral-500 font-medium">Track performance and manage high-value commission structures.</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Paid"
                    value="₹1.24L"
                    icon={DollarSign}
                    trend="up"
                    trendValue="12%"
                    color="emerald"
                />
                <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm shrink-0">
                        <Users className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Active Agents</span>
                        <span className="text-2xl font-black text-neutral-900">{agents.length}</span>
                        <span className="text-[11px] font-bold text-emerald-600 mt-1 uppercase tracking-widest">+2 Growth</span>
                    </div>
                </div>
                <StatCard
                    title="Platform ROI"
                    value="320%"
                    icon={TrendingUp}
                    trend="up"
                    trendValue="5.2%"
                    color="emerald"
                />
            </div>

            {/* Commission Tiers */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-neutral-900 tracking-tight">Commission Slabs</h2>
                    <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:scale-105 transition-transform">Executive Override</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tiers.map((tier) => (
                        <div key={tier.name} className={`group p-6 bg-white rounded-[28px] border border-neutral-100 shadow-sm hover:border-emerald-600/20 transition-all cursor-default`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 bg-${tier.color === 'neutral' ? 'neutral' : tier.color}-50 rounded-2xl flex items-center justify-center border border-${tier.color === 'neutral' ? 'neutral' : tier.color}-100 transition-all group-hover:rotate-12`}>
                                    <Award className={`w-6 h-6 text-${tier.color === 'neutral' ? 'neutral-600' : tier.color + '-600'}`} />
                                </div>
                                <span className="text-3xl font-black text-neutral-900 tracking-tighter">{tier.rate}</span>
                            </div>
                            <h3 className="text-sm font-black text-neutral-900 uppercase tracking-tight">{tier.name} Level</h3>
                            <p className="text-[10px] font-black text-neutral-400 mt-1 uppercase tracking-widest">Cap: {tier.threshold}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Agent Performance Table */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-lg font-black text-neutral-900 tracking-tight uppercase tracking-widest">Agent Registry</h2>
                    <div className="relative group max-w-sm flex-1">
                        <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH BY AUTH ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 h-12 bg-white border-2 border-neutral-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none shadow-sm focus:ring-4 focus:ring-emerald-500/5 transition-all"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-[40px] border border-neutral-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50/50">
                                    <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Executive</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Classification</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Gross Volume</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Commission</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">Ops</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-32 text-center">
                                            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Synchronizing Registry...</p>
                                        </td>
                                    </tr>
                                ) : agents.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-32 text-center text-neutral-400 font-black uppercase tracking-widest italic">
                                            No active executives in scope.
                                        </td>
                                    </tr>
                                ) : (
                                    agents.map((agent) => (
                                        <tr key={agent._id} className="hover:bg-neutral-50/50 transition-all duration-300 group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-600 border-2 border-neutral-50 shrink-0 group-hover:scale-110 transition-transform duration-500">
                                                        <span className="text-xs font-black">{agent.firstName?.[0]}{agent.lastName?.[0]}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-neutral-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{agent.firstName} {agent.lastName}</span>
                                                        <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">ID: {agent._id.slice(-6).toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ring-2 ring-inset group-hover:bg-neutral-900 group-hover:text-white transition-all ${getTierColor(agent.agentTier || 'SILVER')}`}>
                                                    {agent.agentTier || 'SILVER'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-base font-black text-neutral-900 tracking-tighter">₹{agent.totalSales?.toLocaleString() || '0'}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-base font-black text-emerald-600 tracking-tighter">₹{agent.commissionEarned?.toLocaleString() || '0'}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                    <button className="p-3 bg-white shadow-sm border-2 border-neutral-100 rounded-2xl text-neutral-400 hover:text-emerald-600 hover:border-emerald-100 transition-all">
                                                        <MessageSquare className="w-5 h-5" />
                                                    </button>
                                                    <button className="p-3 bg-white shadow-sm border-2 border-neutral-100 rounded-2xl text-neutral-400 hover:text-neutral-900 hover:border-neutral-200 transition-all">
                                                        <FileText className="w-5 h-5" />
                                                    </button>
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
        </div>
    );
}
