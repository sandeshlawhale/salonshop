import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { agentAPI } from '../../services/apiService';
import {
    Wallet,
    ArrowUpRight,
    History,
    CheckCircle2,
    Clock,
    TrendingUp,
    Loader2,
    DollarSign,
    Calendar,
    ArrowRightCircle,
    ChevronLeft,
    ChevronRight,
    Filter,
    Package
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '../../context/AuthContext';

const TableRowSkeleton = ({ columns }) => (
    <tr>
        {Array.from({ length: columns }).map((_, i) => (
            <td key={i} className="px-8 py-6">
                <Skeleton className="h-4 w-full" />
            </td>
        ))}
    </tr>
);

export default function AgentPayouts() {
    const [transactions, setTransactions] = useState([]);
    const [settlements, setSettlements] = useState([]);
    const [loadingTrans, setLoadingTrans] = useState(true);
    const [loadingSetts, setLoadingSetts] = useState(true);

    // Pagination & Filtering
    const [transPage, setTransPage] = useState(1);
    const [transTotalPages, setTransTotalPages] = useState(1);
    const [settPage, setSettPage] = useState(1);
    const [settTotalPages, setSettTotalPages] = useState(1);
    const [monthFilter, setMonthFilter] = useState('');

    const { user } = useAuth();

    const fetchTransactions = useCallback(async () => {
        setLoadingTrans(true);
        try {
            const params = {
                page: transPage,
                limit: 10,
                month: monthFilter
            };
            const res = await agentAPI.getTransactions(params);
            if (res.data.items) {
                setTransactions(res.data.items);
                setTransTotalPages(res.data.pagination.pages);
            } else {
                setTransactions(Array.isArray(res.data) ? res.data : []);
                setTransTotalPages(1);
            }
        } catch (err) {
            console.error('Failed to fetch transactions', err);
            toast.error('Failed to load commission records');
        } finally {
            setLoadingTrans(false);
        }
    }, [transPage, monthFilter]);

    const fetchSettlements = useCallback(async () => {
        setLoadingSetts(true);
        try {
            const params = {
                page: settPage,
                limit: 5
            };
            const res = await agentAPI.getSettlements(params);
            if (res.data.items) {
                setSettlements(res.data.items);
                setSettTotalPages(res.data.pagination.pages);
            } else {
                setSettlements(Array.isArray(res.data) ? res.data : []);
                setSettTotalPages(1);
            }
        } catch (err) {
            console.error('Failed to fetch settlements', err);
            toast.error('Failed to load settlement history');
        } finally {
            setLoadingSetts(false);
        }
    }, [settPage]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    useEffect(() => {
        fetchSettlements();
    }, [fetchSettlements]);

    const nextSettlementDate = () => {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return nextMonth.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div>
                <h1 className="text-4xl font-black text-neutral-900 tracking-tighter uppercase">Earnings & <span className="text-emerald-600">Settlements</span></h1>
                <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] mt-2">Automated Monthly Settlement Engine</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Current Month Earnings */}
                <div className="bg-emerald-600 rounded-[40px] p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-600/20 group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />
                    <div className="relative z-10 space-y-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                            <TrendingUp size={24} className="text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">Current Month Earnings</p>
                            <h2 className="text-4xl font-black tracking-tighter mt-1">₹{user?.agentProfile?.currentMonthEarnings?.toLocaleString() || '0'}</h2>
                        </div>
                        <p className="text-[10px] font-bold text-emerald-100/60 uppercase tracking-widest flex items-center gap-2">
                            <Clock size={12} />
                            Next Settlement: {nextSettlementDate()}
                        </p>
                    </div>
                </div>

                {/* Lifetime Earnings */}
                <div className="bg-white rounded-[40px] p-8 border border-neutral-100 shadow-sm relative overflow-hidden group hover:border-emerald-500/20 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 space-y-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                            <ArrowUpRight size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Lifetime Earnings</p>
                            <h2 className="text-4xl font-black text-neutral-900 tracking-tighter mt-1">₹{user?.agentProfile?.totalEarnings?.toLocaleString() || '0'}</h2>
                        </div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            Total commissions earned
                        </p>
                    </div>
                </div>

                {/* Last Settlement */}
                <div className="bg-white rounded-[40px] p-8 border border-neutral-100 shadow-sm relative overflow-hidden group hover:border-amber-500/20 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 space-y-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100 shadow-sm">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Last Settlement Date</p>
                            <h2 className="text-2xl font-black text-neutral-900 tracking-tighter mt-1">
                                {user?.agentProfile?.lastSettlementDate
                                    ? new Date(user.agentProfile.lastSettlementDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                    : 'N/A'}
                            </h2>
                        </div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            Automatically processed
                        </p>
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className="bg-neutral-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-neutral-900/20">
                <div className="absolute inset-0 bg-neutral-800/50" />
                <div className="absolute -right-20 -top-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                            <CheckCircle2 size={12} />
                            Settlement Policy
                        </div>
                        <h3 className="text-2xl font-black tracking-tight uppercase">Zero-Touch Settlement Engine</h3>
                        <p className="text-neutral-400 text-sm font-medium leading-relaxed">
                            Your commissions are calculated instantly on order completion and settled automatically to your registered bank account on the 1st of every month.
                            Track your earnings ledger below.
                        </p>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center">
                            <History size={20} />
                        </div>
                        <h2 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">Commission Ledger</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-10 px-3 bg-white border border-neutral-200 rounded-xl flex items-center gap-2 hover:border-emerald-500/30 transition-all cursor-pointer shadow-sm">
                            <Filter size={12} className="text-neutral-400" />
                            <input
                                type="month"
                                value={monthFilter}
                                onChange={(e) => {
                                    setMonthFilter(e.target.value);
                                    setTransPage(1);
                                }}
                                className="bg-transparent text-[8px] font-black uppercase tracking-widest outline-none cursor-pointer text-neutral-600 appearance-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] border border-neutral-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-50 bg-neutral-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Transaction</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Amount</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Month</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {loadingTrans ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRowSkeleton key={i} columns={5} />
                                    ))
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-32 text-center">
                                            <div className="w-12 h-12 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-300 mx-auto mb-4">
                                                <Package size={24} />
                                            </div>
                                            <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">No commission records found.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((trx) => (
                                        <tr key={trx._id} className="hover:bg-neutral-50/50 transition-all group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${trx.status === 'SETTLED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                        <DollarSign size={14} />
                                                    </div>
                                                    <span className="font-black text-xs uppercase tracking-tight">Order Commission</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-black text-neutral-900 border-l border-transparent group-hover:border-emerald-500/20 transition-all">
                                                ₹{trx.amount.toLocaleString()}
                                            </td>
                                            <td className="px-8 py-6 text-xs font-bold text-neutral-500 uppercase">{trx.month}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${trx.status === 'SETTLED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                    {trx.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-[10px] text-neutral-400 font-bold uppercase tracking-tighter">
                                                {new Date(trx.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {transTotalPages > 1 && (
                        <div className="px-8 py-4 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between">
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                Page {transPage} of {transTotalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setTransPage(p => Math.max(1, p - 1))}
                                    disabled={transPage === 1}
                                    className="p-1.5 bg-white border border-neutral-200 rounded-lg disabled:opacity-30"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <button
                                    onClick={() => setTransPage(p => Math.min(transTotalPages, p + 1))}
                                    disabled={transPage === transTotalPages}
                                    className="p-1.5 bg-white border border-neutral-200 rounded-lg disabled:opacity-30"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Settlements Table */}
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center">
                        <ArrowRightCircle size={20} />
                    </div>
                    <h2 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">Settlement History</h2>
                </div>

                <div className="bg-white rounded-[40px] border border-neutral-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-50 bg-neutral-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Settlement ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Amount</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Month</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Processed On</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {loadingSetts ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRowSkeleton key={i} columns={4} />
                                    ))
                                ) : settlements.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center text-neutral-400 font-bold uppercase tracking-widest text-[10px]">
                                            No automated settlements processed yet.
                                        </td>
                                    </tr>
                                ) : (
                                    settlements.map((sett) => (
                                        <tr key={sett._id} className="hover:bg-neutral-50/50 transition-all group">
                                            <td className="px-8 py-6">
                                                <code className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                                    {sett.setid || `SET-${sett._id.slice(-6).toUpperCase()}`}
                                                </code>
                                            </td>
                                            <td className="px-8 py-6 font-black text-neutral-900 text-lg tracking-tighter group-hover:text-emerald-600 transition-colors">
                                                ₹{sett.amount.toLocaleString()}
                                            </td>
                                            <td className="px-8 py-6 text-xs font-bold text-neutral-500 uppercase">{sett.month}</td>
                                            <td className="px-8 py-6 text-[10px] text-neutral-400 font-bold uppercase tracking-tighter">
                                                {new Date(sett.settledAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {settTotalPages > 1 && (
                        <div className="px-8 py-4 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between">
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                Page {settPage} of {settTotalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setSettPage(p => Math.max(1, p - 1))}
                                    disabled={settPage === 1}
                                    className="p-1.5 bg-white border border-neutral-200 rounded-lg disabled:opacity-30"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <button
                                    onClick={() => setSettPage(p => Math.min(settTotalPages, p + 1))}
                                    disabled={settPage === settTotalPages}
                                    className="p-1.5 bg-white border border-neutral-200 rounded-lg disabled:opacity-30"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
