import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { agentAPI, payoutAPI } from '../../services/apiService';
import {
    Wallet,
    ArrowUpRight,
    History,
    CheckCircle2,
    Clock,
    AlertCircle,
    Plus,
    TrendingUp,
    Loader2,
    DollarSign
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../context/AuthContext';

export default function AgentPayouts() {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requestAmount, setRequestAmount] = useState('');
    const [requesting, setRequesting] = useState(false);
    const { user } = useAuth();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await agentAPI.getPayouts();
            const data = Array.isArray(res.data) ? res.data : (res.data?.payouts || []);
            setPayouts(data);
        } catch (err) {
            console.error('Failed to fetch my payouts', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRequestPayout = async (e) => {
        e.preventDefault();
        if (!requestAmount || isNaN(requestAmount) || requestAmount <= 0) return;

        setRequesting(true);
        try {
            await agentAPI.requestPayout(Number(requestAmount));
            setRequestAmount('');
            fetchData();
            // Show toast/success (replacing alert)
            toast.success('Payout request submitted successfully!');
        } catch (err) {
            console.error('Payout request error:', err);
            const errorMessage = err.response?.data?.message || 'Failed to submit payout request';
            toast.error(errorMessage);
        } finally {
            setRequesting(false);
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

    const totalWithdrawn = payouts
        .filter(p => p.status === 'PAID' || p.status === 'COMPLETED')
        .reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div>
                <h1 className="text-4xl font-black text-neutral-900 tracking-tighter">Earnings & <span className="text-emerald-600">Disbursements</span></h1>
                <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] mt-2">Manage your professional wallet and withdrawal requests</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Available Balance - Primary Card */}
                <div className="bg-emerald-600 rounded-[40px] p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-600/20 group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />
                    <div className="relative z-10 space-y-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                            <Wallet size={24} className="text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">Available Balance</p>
                            <h2 className="text-4xl font-black tracking-tighter mt-1">₹{user?.agentProfile?.wallet?.available.toLocaleString() || '0'}</h2>
                        </div>
                        <p className="text-[10px] font-bold text-emerald-100/60 uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle2 size={12} />
                            Ready for withdrawal
                        </p>
                    </div>
                </div>

                {/* Pending Balance */}
                <div className="bg-white rounded-[40px] p-8 border border-neutral-100 shadow-sm relative overflow-hidden group hover:border-amber-500/20 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 space-y-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Pending Audit</p>
                            <h2 className="text-4xl font-black text-neutral-900 tracking-tighter mt-1">₹{user?.agentProfile?.wallet?.pending.toLocaleString() || '0'}</h2>
                        </div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            Clearing period active
                        </p>
                    </div>
                </div>

                {/* Total Withdrawn */}
                <div className="bg-white rounded-[40px] p-8 border border-neutral-100 shadow-sm relative overflow-hidden group hover:border-blue-500/20 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 space-y-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <ArrowUpRight size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Total Withdrawn</p>
                            <h2 className="text-4xl font-black text-neutral-900 tracking-tighter mt-1">₹{totalWithdrawn.toLocaleString()}</h2>
                        </div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            Lifetime processed payouts
                        </p>
                    </div>
                </div>
            </div>

            {/* Withdrawal Section */}
            <div className="bg-neutral-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-neutral-900/20">
                <div className="absolute inset-0 bg-neutral-800/50" />
                <div className="absolute -right-20 -top-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="space-y-4 max-w-lg">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                            <TrendingUp size={12} />
                            Request Payout
                        </div>
                        <h3 className="text-2xl font-black tracking-tight">Withdraw Funds</h3>
                        <p className="text-neutral-400 text-sm font-medium leading-relaxed">
                            Transfer your available earnings properly to your registered bank account.
                            Minimum withdrawal amount is ₹500. Requests are processed within 24-48 hours.
                        </p>
                    </div>

                    <form onSubmit={handleRequestPayout} className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-white/30">₹</span>
                            <input
                                type="number"
                                value={requestAmount}
                                onChange={(e) => setRequestAmount(e.target.value)}
                                placeholder="Amount"
                                className="w-full sm:w-48 pl-8 pr-4 h-14 bg-white/5 border-2 border-white/10 rounded-2xl focus:border-emerald-500/50 focus:ring-0 outline-none font-black text-xl text-white placeholder:text-white/10 hover:border-white/20 transition-all"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={requesting || !requestAmount}
                            className="h-14 px-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-emerald-600/20 border-none whitespace-nowrap"
                        >
                            {requesting ? <Loader2 className="animate-spin" size={16} /> : 'Process Request'}
                        </Button>
                    </form>
                </div>
            </div>

            {/* History Section */}
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center">
                        <History size={20} />
                    </div>
                    <h2 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">Audit Trail</h2>
                </div>

                <div className="bg-white rounded-[40px] border border-neutral-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-50 bg-neutral-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Transaction Asset</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Reference Hash</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Disbursement</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Timestamp</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="animate-spin text-emerald-600" size={40} />
                                                <p className="text-neutral-400 font-black text-[10px] uppercase tracking-widest">Synchronizing Ledger...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : payouts.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-32 text-center">
                                            <div className="max-w-xs mx-auto space-y-4">
                                                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto text-neutral-300">
                                                    <DollarSign size={32} />
                                                </div>
                                                <p className="text-neutral-500 font-bold italic uppercase tracking-widest text-[10px]">No disbursements found in registry.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    payouts.map((payout) => (
                                        <tr key={payout._id} className="hover:bg-neutral-50/50 transition-all duration-300 group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-500 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                        <Plus size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-neutral-900 uppercase tracking-tight text-xs">Payout Withdrawal</p>
                                                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">External Remittance</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <code className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                                                    #{payout._id?.slice(-8).toUpperCase()}
                                                </code>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-black text-neutral-900 text-lg tracking-tighter tabular-nums">-₹{payout.amount.toLocaleString()}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-bold text-neutral-600">{new Date(payout.createdAt).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black border ${getStatusColor(payout.status)} uppercase tracking-widest`}>
                                                    {payout.status === 'COMPLETED' || payout.status === 'PAID' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                                    {payout.status}
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
