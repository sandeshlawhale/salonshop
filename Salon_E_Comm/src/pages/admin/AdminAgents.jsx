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
    ChevronRight,
    Plus,
    X,
    Mail,
    Phone,
    User as UserIcon,
    Lock,
    IndianRupee,
    Briefcase,
    ShieldCheck,
    ArrowUpRight
} from 'lucide-react';
import { userAPI, adminAPI } from '../../services/apiService';
import StatCard from '../../components/admin/StatCard';
import { toast } from 'react-hot-toast';

export default function AdminAgents() {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Registration Modal State
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [regLoading, setRegLoading] = useState(false);
    const [regData, setRegData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: ''
    });

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const res = await userAPI.getAgents();
            setAgents(res.data.users || []);
        } catch (err) {
            console.error('Failed to fetch agents:', err);
            toast.error('Registry synchronization failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handleRegisterAgent = async (e) => {
        e.preventDefault();
        setRegLoading(true);
        try {
            await adminAPI.createAgent(regData);
            toast.success('Agent Executive created successfully!');
            setShowRegisterModal(false);
            setRegData({ firstName: '', lastName: '', email: '', phone: '', password: '' });
            fetchAgents(); // Refresh list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Creation failed');
        } finally {
            setRegLoading(false);
        }
    };

    const deriveTier = (earnings) => {
        if (earnings >= 150000) return 'PLATINUM';
        if (earnings >= 50000) return 'GOLD';
        return 'SILVER';
    };

    const getTierColor = (tier) => {
        const tiers = {
            'SILVER': 'bg-neutral-50 text-neutral-700 ring-neutral-600/20',
            'GOLD': 'bg-amber-50 text-amber-700 ring-amber-600/20',
            'PLATINUM': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        };
        return tiers[tier] || 'bg-neutral-50 text-neutral-600';
    };

    const stats = {
        totalPaid: agents.reduce((sum, a) => sum + (a.agentProfile?.totalEarnings || 0), 0),
        activeCount: agents.filter(a => a.status === 'ACTIVE').length,
        growth: '+12%'
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tighter uppercase">Executive Registry</h1>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">High-Value Agent Performance & Analytics</p>
                </div>
                <button
                    onClick={() => setShowRegisterModal(true)}
                    className="px-8 py-4 bg-neutral-900 hover:bg-emerald-600 text-white rounded-[24px] flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-neutral-900/10 active:scale-95"
                >
                    <Plus size={18} />
                    Onboard Executive
                </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard
                    title="Gross Payout"
                    value={`₹${stats.totalPaid.toLocaleString()}`}
                    icon={IndianRupee}
                    color="emerald"
                />
                <StatCard
                    title="Active Portfolio"
                    value={stats.activeCount}
                    icon={Briefcase}
                    color="neutral"
                />
                <StatCard
                    title="Network Velocity"
                    value={stats.growth}
                    icon={TrendingUp}
                    color="emerald"
                />
            </div>

            {/* Agent Performance Table */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
                    <div className="relative group flex-1 max-w-md">
                        <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH REGISTRY..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 h-12 bg-neutral-50/50 border-2 border-neutral-100/50 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none shadow-sm focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-neutral-50 rounded-xl flex items-center gap-3 border border-neutral-100">
                            <Filter size={14} className="text-neutral-400" />
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Global Filter</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[48px] border border-neutral-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50/50">
                                    <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Executive Intelligence</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Classification</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Gross Yield</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Available</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">Ops</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-32 text-center">
                                            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto mb-6"></div>
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Synchronizing Registry Intelligence...</p>
                                        </td>
                                    </tr>
                                ) : agents.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-32 text-center">
                                            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <ShieldCheck size={32} className="text-neutral-200" />
                                            </div>
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest italic">Registry is currently sanitized and empty.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    agents.filter(a =>
                                        `${a.firstName} ${a.lastName} ${a.email}`.toLowerCase().includes(searchTerm.toLowerCase())
                                    ).map((agent) => (
                                        <tr key={agent._id} className="hover:bg-neutral-50/50 transition-all duration-300 group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400 border border-neutral-100 shrink-0 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm">
                                                        <span className="text-xs font-black">{(agent.firstName?.[0] || 'E')}{(agent.lastName?.[0] || 'X')}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-neutral-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{agent.firstName} {agent.lastName}</span>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                                            <span className="text-[9px] text-neutral-400 font-black uppercase tracking-widest">{agent.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset ${getTierColor(deriveTier(agent.agentProfile?.totalEarnings || 0))}`}>
                                                    {deriveTier(agent.agentProfile?.totalEarnings || 0)}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-1.5">
                                                    <IndianRupee size={14} className="text-neutral-400" />
                                                    <span className="text-lg font-black text-neutral-900 tracking-tighter">{(agent.agentProfile?.totalEarnings || 0).toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className="text-lg font-black text-emerald-600 tracking-tighter">₹{(agent.agentProfile?.wallet?.available || 0).toLocaleString()}</span>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                    <button className="p-4 bg-white shadow-sm border border-neutral-100 rounded-2xl text-neutral-400 hover:text-emerald-600 hover:border-emerald-100 transition-all active:scale-90">
                                                        <MessageSquare size={18} />
                                                    </button>
                                                    <button className="p-4 bg-white shadow-sm border border-neutral-100 rounded-2xl text-neutral-400 hover:text-neutral-900 hover:border-neutral-200 transition-all active:scale-90">
                                                        <ArrowUpRight size={18} />
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

            {/* Registration Modal */}
            {showRegisterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                        <div className="p-10 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-neutral-900 tracking-tighter uppercase">Onboard Executive</h3>
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Manual Node Provisioning</p>
                            </div>
                            <button
                                onClick={() => setShowRegisterModal(false)}
                                className="p-4 hover:bg-white rounded-2xl transition-all shadow-sm active:scale-90"
                            >
                                <X className="w-6 h-6 text-neutral-400" />
                            </button>
                        </div>

                        <form onSubmit={handleRegisterAgent} className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Legal First Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-11 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                                            value={regData.firstName}
                                            onChange={e => setRegData({ ...regData, firstName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Legal Last Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-11 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                                            value={regData.lastName}
                                            onChange={e => setRegData({ ...regData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Corporate Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-11 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                                        value={regData.email}
                                        onChange={e => setRegData({ ...regData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Phone Protocol</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                                        <input
                                            type="tel"
                                            required
                                            className="w-full pl-11 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                                            value={regData.phone}
                                            onChange={e => setRegData({ ...regData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Node Access Key</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            className="w-full pl-11 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                                            value={regData.password}
                                            onChange={e => setRegData({ ...regData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={regLoading}
                                className="w-full py-6 bg-neutral-900 hover:bg-emerald-600 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl transition-all shadow-2xl shadow-neutral-900/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4"
                            >
                                {regLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        PROVISION NODE
                                        <ArrowUpRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
