import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    Download,
    UserPlus,
    Loader2,
    Mail,
    Phone,
    ShieldCheck,
    Briefcase,
    TrendingUp,
    MapPin,
    ArrowUpRight
} from 'lucide-react';
import { userAPI } from '../../services/apiService';
import StatCard from '../../components/admin/StatCard';
import { toast } from 'react-hot-toast';

export default function AdminUsers() {
    const [salons, setSalons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        fetchSalons();
    }, []);

    const fetchSalons = async () => {
        try {
            setLoading(true);
            const res = await userAPI.getAll({ role: 'SALON_OWNER' });
            setSalons(res.data.users || []);
        } catch (err) {
            console.error('Failed to fetch salons:', err);
            toast.error('Salon registry synchronization failed');
        } finally {
            setLoading(false);
        }
    };

    const filteredSalons = salons.filter(salon => {
        const matchesSearch =
            `${salon.firstName} ${salon.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            salon.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || salon.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: salons.length,
        pending: salons.filter(s => s.status === 'PENDING').length,
        growth: '+8%'
    };

    const getStatusBadge = (status) => {
        const styles = {
            'ACTIVE': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
            'PENDING': 'bg-amber-50 text-amber-700 ring-amber-600/20',
            'REJECTED': 'bg-rose-50 text-rose-700 ring-rose-600/20',
            'DEACTIVE': 'bg-neutral-50 text-neutral-500 ring-neutral-600/20',
        };
        return (
            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${styles[status] || styles['PENDING']}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tighter uppercase">Salon Registry</h1>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Professional Partner Onboarding & Management</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-8 py-4 bg-neutral-900 hover:bg-emerald-600 text-white rounded-[24px] flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-neutral-900/10 active:scale-95">
                        <Download size={18} />
                        Export Ledger
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard
                    title="Total Partners"
                    value={stats.total}
                    icon={Users}
                    color="neutral"
                />
                <StatCard
                    title="Pending Review"
                    value={stats.pending}
                    icon={Clock}
                    color="amber"
                />
                <StatCard
                    title="Network Expansion"
                    value={stats.growth}
                    icon={TrendingUp}
                    color="emerald"
                />
            </div>

            {/* Registry Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
                <div className="relative group flex-1 max-w-md">
                    <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="SEARCH PROFESSIONAL REGISTRY..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 h-12 bg-neutral-50/50 border-2 border-neutral-100/50 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none shadow-sm focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500 transition-all"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-neutral-50 rounded-xl flex items-center gap-3 border border-neutral-100">
                        <Filter size={14} className="text-neutral-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-neutral-600"
                        >
                            <option value="All">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="PENDING">Pending</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Registry Ledger */}
            <div className="bg-white rounded-[48px] border border-neutral-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50/50">
                                <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Salon Professional</th>
                                <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Node Contact</th>
                                <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Intelligence Agent</th>
                                <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</th>
                                <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-10 py-32 text-center">
                                        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto mb-6"></div>
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Synchronizing Registry...</p>
                                    </td>
                                </tr>
                            ) : filteredSalons.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-10 py-32 text-center">
                                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <ShieldCheck size={32} className="text-neutral-200" />
                                        </div>
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest italic">No matching salon professionals in scope.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredSalons.map((salon) => (
                                    <tr key={salon._id} className="hover:bg-neutral-50/50 transition-all duration-300 group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400 border border-neutral-100 shrink-0 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm">
                                                    <span className="text-xs font-black">{(salon.firstName?.[0] || 'S')}{(salon.lastName?.[0] || 'P')}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-neutral-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{salon.firstName} {salon.lastName}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <MapPin size={10} className="text-neutral-300" />
                                                        <span className="text-[9px] text-neutral-400 font-black uppercase tracking-widest">Salon Partner</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-neutral-600">
                                                    <Mail size={12} className="text-neutral-300" />
                                                    <span className="text-[11px] font-bold">{salon.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-neutral-600">
                                                    <Phone size={12} className="text-neutral-300" />
                                                    <span className="text-[11px] font-bold">{salon.phone || 'NO PROTOCOL'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            {salon.salonOwnerProfile?.agentId ? (
                                                <div className="flex items-center gap-3 px-3 py-2 bg-neutral-900 rounded-xl border border-neutral-800 w-fit">
                                                    <Briefcase size={12} className="text-emerald-400" />
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                                        Assigned Executive
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest italic">Unassigned Node</span>
                                            )}
                                        </td>
                                        <td className="px-10 py-8">
                                            {getStatusBadge(salon.status)}
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <button className="p-4 bg-white shadow-sm border border-neutral-100 rounded-2xl text-neutral-400 hover:text-emerald-600 hover:border-emerald-100 transition-all active:scale-90">
                                                    <Eye size={18} />
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
    );
}
