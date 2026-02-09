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
    Users
} from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function AdminPayouts() {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
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
            setStats({
                total: pending + paid,
                pending: pending,
                paid: paid
            });
        } catch (err) {
            console.error('Failed to fetch payouts', err);
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
            fetchPayouts();
        } catch (err) {
            console.error('Update payout status error:', err);
            alert('Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED':
            case 'PAID': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-neutral-50 text-neutral-600 border-neutral-100';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tight uppercase">Capital <span className="text-emerald-600">Operations</span></h1>
                    <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] mt-2">Manage agent commissions and payout disbursements.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-2xl border-2 border-neutral-100 font-black text-[10px] uppercase tracking-widest px-6 h-12 hover:bg-neutral-50">
                        Export Audit
                    </Button>
                    <Button className="bg-neutral-900 hover:bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest px-6 h-12 shadow-lg shadow-neutral-900/10 border-none transition-all">
                        Batch Process
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm relative overflow-hidden group hover:border-emerald-600/20 transition-all">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center text-white">
                                <TrendingUp size={24} />
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-emerald-100">Live Registry</span>
                        </div>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Total Disbursements</p>
                        <h3 className="text-3xl font-black text-neutral-900 tracking-tighter tabular-nums">₹{stats.total.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm relative overflow-hidden group hover:border-amber-600/20 transition-all">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                                <Clock size={24} />
                            </div>
                            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-amber-100">High Priority</span>
                        </div>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Pending Liquidity</p>
                        <h3 className="text-3xl font-black text-neutral-900 tracking-tighter tabular-nums">₹{stats.pending.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm relative overflow-hidden group hover:border-blue-600/20 transition-all">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                <Users size={24} />
                            </div>
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-blue-100">Active Agents</span>
                        </div>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Average Payout</p>
                        <h3 className="text-3xl font-black text-neutral-900 tracking-tighter tabular-nums">₹{(stats.paid / (payouts.length || 1)).toFixed(0).toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-3xl border border-neutral-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search agents or transaction IDs..."
                            className="w-full pl-12 pr-4 h-12 bg-neutral-50/50 border border-neutral-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 font-bold text-xs uppercase tracking-widest outline-none transition-all placeholder:text-neutral-400"
                        />
                    </div>
                </div>
            </div>

            {/* Payouts Table */}
            <div className="bg-white rounded-[40px] border border-neutral-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-50 bg-neutral-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Agent Entity</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Transaction Asset</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Disbursement</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Audit Timestamp</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] text-right">Protocol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="animate-spin text-emerald-600" size={40} />
                                            <p className="text-neutral-400 font-black text-[10px] uppercase tracking-widest">Accessing Digital Ledger...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : payouts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-32 text-center">
                                        <div className="max-w-xs mx-auto space-y-4">
                                            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto text-neutral-300">
                                                <AlertCircle size={32} />
                                            </div>
                                            <p className="text-neutral-400 font-black text-[10px] uppercase tracking-widest">No active requests found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                payouts.map((payout) => (
                                    <tr key={payout._id} className="hover:bg-neutral-50/50 transition-all duration-300 group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-neutral-900 border border-white/10 rounded-2xl flex items-center justify-center text-white font-black text-lg group-hover:bg-emerald-600 transition-all duration-500">
                                                    {payout.userId?.firstName?.charAt(0) || payout.agentName?.charAt(0) || 'A'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-neutral-900 uppercase tracking-tight text-xs">{payout.userId?.firstName} {payout.userId?.lastName || payout.agentName || 'Verified Agent'}</p>
                                                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">ID: {payout.userId?._id?.slice(-6).toUpperCase() || payout.agentId?.slice(-6).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <code className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                                                #{payout._id?.slice(-8).toUpperCase()}
                                            </code>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-black text-neutral-900 text-lg tracking-tighter tabular-nums">₹{payout.amount.toLocaleString()}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-[11px] font-black text-neutral-600 uppercase tracking-tight">{new Date(payout.createdAt).toLocaleDateString()}</p>
                                            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{new Date(payout.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black border ${getStatusColor(payout.status)} uppercase tracking-widest`}>
                                                {payout.status === 'COMPLETED' || payout.status === 'PAID' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                                {payout.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-neutral-100">
                                                    <Eye size={18} className="text-neutral-400" />
                                                </Button>
                                                {payout.status === 'PENDING' && (
                                                    <Button
                                                        onClick={() => handleUpdateStatus(payout._id, 'PAID')}
                                                        className="h-10 px-4 bg-neutral-900 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-neutral-900/10"
                                                    >
                                                        Finalize
                                                    </Button>
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
