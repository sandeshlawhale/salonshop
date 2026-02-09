import React, { useState, useEffect } from 'react';
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
            await payoutAPI.request(Number(requestAmount));
            setRequestAmount('');
            fetchData();
            // Show toast/success (replacing alert)
            alert('Payout request submitted successfully!');
        } catch (err) {
            console.error('Payout request error:', err);
            alert('Failed to submit payout request');
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

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div>
                <h1 className="text-4xl font-black text-neutral-900 tracking-tighter">Earnings & <span className="text-emerald-600">Disbursements</span></h1>
                <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] mt-2">Manage your professional wallet and withdrawal requests</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Wallet Balance Card */}
                <div className="lg:col-span-2 group relative">
                    <div className="absolute inset-0 bg-neutral-900 rounded-[56px] translate-x-3 translate-y-3 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform -z-10" />
                    <div className="bg-neutral-900 p-12 rounded-[56px] text-white relative overflow-hidden shadow-2xl shadow-neutral-900/40 border border-white/5">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black tracking-widest uppercase border border-white/10">
                                    <Wallet size={14} />
                                    Portfolio Liquidity
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-7xl font-black tracking-tighter">₹{user?.agentProfile?.wallet?.available.toLocaleString() || '0'}</h2>
                                    <p className="text-emerald-400 font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                                        <TrendingUp size={14} />
                                        Assets cleared for withdrawal
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleRequestPayout} className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[40px] w-full md:w-80 space-y-6 group/form">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1 group-focus-within/form:text-emerald-400 transition-colors">Withdraw Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-white/30">₹</span>
                                        <input
                                            type="number"
                                            value={requestAmount}
                                            onChange={(e) => setRequestAmount(e.target.value)}
                                            placeholder="Min. ₹500"
                                            className="w-full pl-8 pr-4 h-14 bg-white/5 border-2 border-white/10 rounded-2xl focus:border-emerald-500/50 focus:ring-0 outline-none font-black text-xl text-white placeholder:text-white/10 hover:border-white/20 transition-all"
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={requesting || !requestAmount}
                                    className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-[0.98] shadow-xl shadow-emerald-600/20 border-none"
                                >
                                    {requesting ? <Loader2 className="animate-spin" size={20} /> : 'Process Liquidity'}
                                </Button>
                            </form>
                        </div>
                        {/* Background decoration */}
                        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-600/10 rounded-full blur-[100px]" />
                        <div className="absolute top-1/2 -left-12 w-48 h-48 bg-white/5 rounded-full blur-[80px]" />
                    </div>
                </div>

                {/* Quick Stats Sidebar */}
                <div className="space-y-6">
                    <div className="p-8 bg-white rounded-[40px] border border-neutral-100 shadow-sm space-y-4 group hover:border-emerald-600/20 transition-all">
                        <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                            <ArrowUpRight size={24} />
                        </div>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Total Yield</p>
                        <h3 className="text-3xl font-black text-neutral-900 tracking-tighter">₹{user?.agentProfile?.totalEarnings.toLocaleString() || '0'}</h3>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Lifetime performance commission</p>
                    </div>

                    <div className="p-8 bg-white rounded-[40px] border border-neutral-100 shadow-sm space-y-4 group hover:border-amber-600/20 transition-all">
                        <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                            <Clock size={24} />
                        </div>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Pending Audit</p>
                        <h3 className="text-3xl font-black text-neutral-900 tracking-tighter">₹{user?.agentProfile?.wallet?.pending.toLocaleString() || '0'}</h3>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Awaiting clearing period</p>
                    </div>
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
