import React, { useState, useEffect } from 'react';
import { payoutAPI } from '../../services/apiService';
import {
    DollarSign,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Search,
    Filter,
    Eye,
    Loader2,
    TrendingUp,
    CreditCard,
    Users,
    IndianRupee,
    Briefcase,
    ShieldCheck,
    Archive,
    Download
} from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import { toast } from 'react-hot-toast';

export default function AdminPayouts() {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dataStats, setDataStats] = useState({
        total: 0,
        pending: 0,
        paid: 0
    });

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            const res = await payoutAPI.getAll();
            const data = Array.isArray(res.data) ? res.data : (res.data?.payouts || []);
            setPayouts(data);

            const pending = data.filter(p => p.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0);
            const paid = data.filter(p => p.status === 'PAID' || p.status === 'COMPLETED').reduce((acc, curr) => acc + curr.amount, 0);
            setDataStats({
                total: pending + paid,
                pending: pending,
                paid: paid
            });
        } catch (err) {
            console.error('Failed to fetch payouts', err);
            toast.error('Capital ledger synchronization failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            await payoutAPI.updateStatus(id, status);
            toast.success('Disbursement protocol finalized');
            fetchPayouts();
        } catch (err) {
            console.error('Update payout status error:', err);
            toast.error('Failed to finalize protocol');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'COMPLETED': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 shadow-emerald-100',
            'PAID': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 shadow-emerald-100',
            'PENDING': 'bg-amber-50 text-amber-700 ring-amber-600/20 shadow-amber-100',
            'CANCELLED': 'bg-rose-50 text-rose-700 ring-rose-600/20 shadow-rose-100',
        };
        return (
            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ring-1 ring-inset shadow-sm ${styles[status] || 'bg-neutral-50 text-neutral-500'}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tighter uppercase">Capital Operations</h1>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Global Disbursement & Commission Settlement Ledger</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-8 py-4 bg-neutral-900 hover:bg-emerald-600 text-white rounded-[24px] flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-neutral-900/10 active:scale-95">
                        <Download size={18} />
                        Export Audit
                    </button>
                    <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[24px] flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/10 active:scale-95">
                        <Briefcase size={18} />
                        Batch Finalize
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard
                    title="Gross Disbursement"
                    value={`₹${dataStats.total.toLocaleString()}`}
                    icon={IndianRupee}
                    color="neutral"
                />
                <StatCard
                    title="Pending Liquidity"
                    value={`₹${dataStats.pending.toLocaleString()}`}
                    icon={Clock}
                    color="amber"
                />
                <StatCard
                    title="Settled Capital"
                    value={`₹${dataStats.paid.toLocaleString()}`}
                    icon={ShieldCheck}
                    color="emerald"
                    trend="up"
                />
            </div>

            {/* Filter Terminal */}
            <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative group flex-1 max-w-md">
                    <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="SEARCH TRANSACTION OR ENTITY ID..."
                        className="w-full pl-12 pr-4 h-12 bg-neutral-50/50 border-2 border-neutral-100/50 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none shadow-sm focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500 transition-all placeholder:text-neutral-400"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-neutral-50 rounded-xl flex items-center gap-3 border border-neutral-100">
                        <Filter size={14} className="text-neutral-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Protocol Filter</span>
                    </div>
                </div>
            </div>

            {/* Capital Ledger */}
            <div className="bg-white rounded-[48px] border border-neutral-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50/50">
                                <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Commission Entity</th>
                                <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Transaction Asset</th>
                                <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Disbursement</th>
                                <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Audit Nodes</th>
                                <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</th>
                                <th className="px-10 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-10 py-32 text-center">
                                        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto mb-6"></div>
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest animate-pulse">Accessing Core Capital Vault...</p>
                                    </td>
                                </tr>
                            ) : payouts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-10 py-32 text-center text-neutral-400 font-black uppercase tracking-widest italic">
                                        Vault Clear. No pending disbursements in registry.
                                    </td>
                                </tr>
                            ) : (
                                payouts.map((payout) => (
                                    <tr key={payout._id} className="hover:bg-neutral-50/50 transition-all duration-300 group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-neutral-900 rounded-2xl flex items-center justify-center text-white border border-white/5 shrink-0 group-hover:bg-emerald-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl shadow-neutral-900/10">
                                                    <span className="text-xs font-black">{(payout.userId?.firstName?.[0] || payout.agentName?.[0] || 'A')}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-neutral-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{payout.userId?.firstName} {payout.userId?.lastName || payout.agentName || 'Verified Agent'}</span>
                                                    <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mt-1">ID: {payout.userId?._id?.slice(-6).toUpperCase() || payout.agentId?.slice(-6).toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <code className="text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                                    TXN-{payout._id?.slice(-8).toUpperCase()}
                                                </code>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-xl font-black text-neutral-900 tracking-tighter">₹{payout.amount.toLocaleString()}</span>
                                                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mt-1">Settlement Balance</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-neutral-600">
                                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                                    <span className="text-[10px] font-black uppercase tracking-tight">{new Date(payout.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-neutral-400">
                                                    <Clock size={12} />
                                                    <span className="text-[10px] font-black uppercase tracking-tight">{new Date(payout.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            {getStatusBadge(payout.status)}
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500">
                                                <button className="p-4 bg-white shadow-sm border border-neutral-100 text-neutral-400 hover:text-neutral-900 rounded-2xl transition-all active:scale-90">
                                                    <Eye size={18} />
                                                </button>
                                                {payout.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(payout._id, 'PAID')}
                                                        className="px-6 py-4 bg-neutral-900 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-neutral-900/10 active:scale-95"
                                                    >
                                                        Execute Payout
                                                    </button>
                                                )}
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
