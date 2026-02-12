import React, { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    Camera,
    Shield,
    Banknote,
    CreditCard,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Sparkles,
    ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/apiService';
import { Button } from '../../components/ui/button';

export default function AgentProfile() {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        agentProfile: {
            bankDetails: {
                accountNumber: user?.agentProfile?.bankDetails?.accountNumber || '',
                ifscCode: user?.agentProfile?.bankDetails?.ifscCode || '',
                accountHolderName: user?.agentProfile?.bankDetails?.accountHolderName || '',
                bankName: user?.agentProfile?.bankDetails?.bankName || ''
            }
        }
    });

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        try {
            const res = await userAPI.updateProfile(formData);
            if (setUser) setUser(res.data);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Update failed:', err);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Profile Header */}
            <div className="relative group">
                <div className="h-56 bg-neutral-900 rounded-[56px] overflow-hidden relative border border-white/5 shadow-2xl shadow-neutral-900/40">
                    <div className="absolute inset-0 bg-linear-to-r from-emerald-600/20 to-transparent" />
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-[100px]" />
                    <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-[80px]" />
                </div>

                <div className="px-12 -mt-24 flex flex-col md:flex-row items-end justify-between gap-10 relative z-10">
                    <div className="flex items-end gap-10">
                        <div className="relative group">
                            <div className="w-44 h-44 bg-white rounded-[48px] p-2 shadow-2xl shadow-neutral-900/10 ring-8 ring-neutral-50/50 group-hover:ring-emerald-500/10 transition-all duration-700">
                                <div className="w-full h-full bg-neutral-100 rounded-[40px] flex items-center justify-center text-neutral-300 relative overflow-hidden group/avatar">
                                    <User size={72} className="group-hover/avatar:scale-110 transition-transform duration-500" />
                                    <button className="absolute inset-0 bg-neutral-900/60 opacity-0 group-hover/avatar:opacity-100 transition-all flex items-center justify-center text-white backdrop-blur-sm">
                                        <Camera size={28} />
                                    </button>
                                </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-xl">
                                <Shield size={20} />
                            </div>
                        </div>

                        <div className="pb-6 space-y-3">
                            <div className="flex items-center gap-4">
                                <h1 className="text-4xl font-black text-neutral-900 tracking-tighter tabular-nums">{user?.firstName} {user?.lastName}</h1>
                                <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-emerald-100 shadow-sm">Verified Partner</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="text-neutral-400 font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2 bg-neutral-50 px-3 py-1 rounded-lg">
                                    <Sparkles size={14} className="text-emerald-500" />
                                    {user?.agentProfile?.tier || 'Bronze'} Tier
                                </p>
                                <p className="text-neutral-400 font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2 bg-neutral-50 px-3 py-1 rounded-lg">
                                    <CreditCard size={14} className="text-neutral-400" />
                                    ID: {user?._id?.slice(-8).toUpperCase()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pb-6">
                        <div className="bg-white/80 backdrop-blur-2xl px-8 py-5 rounded-[40px] border border-neutral-100 shadow-xl flex items-center gap-10">
                            <div className="text-center group/stat">
                                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1 group-hover/stat:text-emerald-600 transition-colors">Yield</p>
                                <p className="text-xl font-black text-neutral-900 tracking-tighter tabular-nums italic">₹{(user?.agentProfile?.totalEarnings || 0).toLocaleString()}</p>
                            </div>
                            <div className="w-px h-10 bg-neutral-100" />
                            <div className="text-center group/stat">
                                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1 group-hover/stat:text-emerald-600 transition-colors">Grade</p>
                                <p className="text-xl font-black text-neutral-900 tracking-tighter uppercase tabular-nums italic">{user?.agentProfile?.tier?.charAt(0) || 'B'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Personal Details */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="flex items-center gap-4 px-2">
                        <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center">
                            <User size={20} />
                        </div>
                        <h2 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">Identity <span className="text-emerald-600">Configuration</span></h2>
                    </div>

                    <div className="bg-white p-12 rounded-[56px] border border-neutral-100 shadow-sm space-y-10 group/form">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1 group-focus-within/form:text-emerald-600 transition-colors">First Nomenclature</label>
                                <div className="relative group/input">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within/input:text-emerald-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full pl-14 pr-6 h-16 bg-neutral-50/50 border-2 border-transparent rounded-[24px] text-sm font-black outline-none focus:border-emerald-500/20 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all text-neutral-900 placeholder:text-neutral-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1 group-focus-within/form:text-emerald-600 transition-colors">Last Nomenclature</label>
                                <div className="relative group/input">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within/input:text-emerald-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full pl-14 pr-6 h-16 bg-neutral-50/50 border-2 border-transparent rounded-[24px] text-sm font-black outline-none focus:border-emerald-500/20 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all text-neutral-900 placeholder:text-neutral-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Secure Channel (Email)</label>
                                <div className="relative opacity-60">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300" size={20} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full pl-14 pr-6 h-16 bg-neutral-100 border-2 border-transparent rounded-[24px] text-sm font-black outline-none cursor-not-allowed text-neutral-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1 group-focus-within/form:text-emerald-600 transition-colors">Mobile Protocol</label>
                                <div className="relative group/input">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within/input:text-emerald-500 transition-colors" size={20} />
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className="w-full pl-14 pr-6 h-16 bg-neutral-50/50 border-2 border-transparent rounded-[24px] text-sm font-black outline-none focus:border-emerald-500/20 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all text-neutral-900"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-neutral-50 flex items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                {success ? (
                                    <div className="flex items-center gap-3 px-6 py-3 bg-emerald-50 text-emerald-600 font-black text-[10px] uppercase tracking-widest rounded-2xl animate-in fade-in slide-in-from-left-4 border border-emerald-100 shadow-sm shadow-emerald-500/5">
                                        <CheckCircle2 size={18} />
                                        Ledger Synchronized
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 text-neutral-400 font-black text-[10px] uppercase tracking-widest px-2">
                                        <AlertCircle size={18} />
                                        Local changes uncommitted
                                    </div>
                                )}
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-16 px-12 bg-neutral-900 hover:bg-emerald-600 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] active:scale-[0.98] transition-all min-w-[220px] shadow-2xl shadow-neutral-900/20 border-none"
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : 'Process Sync'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Banking/Side Panel */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4 px-2">
                        <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center">
                            <Banknote size={20} />
                        </div>
                        <h2 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">Settlement <span className="text-emerald-600">Node</span></h2>
                    </div>

                    <div className="p-10 bg-white border border-neutral-100 rounded-[56px] shadow-sm space-y-8 group/bank">
                        <div className="w-16 h-16 bg-emerald-50 rounded-[24px] flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-lg shadow-emerald-500/5 group-hover/bank:scale-110 group-hover/bank:rotate-6 transition-all duration-500">
                            <CreditCard size={32} />
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-black text-neutral-900 uppercase tracking-tight text-lg italic">Remittance Path</h4>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-relaxed opacity-80">Authorize your digital banking coordinates for commission disbursements.</p>
                        </div>

                        <div className="space-y-5 pt-2">
                            <div className="space-y-2.5">
                                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Asset Owner Name</label>
                                <input
                                    type="text"
                                    placeholder="LEGAL HOLDER NAME"
                                    className="w-full px-5 h-14 bg-neutral-50 border border-neutral-100 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500/20 transition-all"
                                    value={formData.agentProfile.bankDetails.accountHolderName}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        agentProfile: {
                                            ...formData.agentProfile,
                                            bankDetails: { ...formData.agentProfile.bankDetails, accountHolderName: e.target.value }
                                        }
                                    })}
                                />
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Ledger ID (Account)</label>
                                <input
                                    type="text"
                                    placeholder="ACCOUNT NUMBER"
                                    className="w-full px-5 h-14 bg-neutral-50 border border-neutral-100 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500/20 transition-all tabular-nums"
                                    value={formData.agentProfile.bankDetails.accountNumber}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        agentProfile: {
                                            ...formData.agentProfile,
                                            bankDetails: { ...formData.agentProfile.bankDetails, accountNumber: e.target.value }
                                        }
                                    })}
                                />
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Routing Protocol (IFSC)</label>
                                <input
                                    type="text"
                                    placeholder="IFSC IDENTIFIER"
                                    className="w-full px-5 h-14 bg-neutral-50 border border-neutral-100 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500/20 transition-all"
                                    value={formData.agentProfile.bankDetails.ifscCode}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        agentProfile: {
                                            ...formData.agentProfile,
                                            bankDetails: { ...formData.agentProfile.bankDetails, ifscCode: e.target.value }
                                        }
                                    })}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <div className="p-6 bg-neutral-900 rounded-[32px] text-center space-y-4 group/card relative overflow-hidden shadow-2xl border border-white/5">
                                <div className="space-y-1 relative z-10">
                                    <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">Contractual Yield</h4>
                                    <p className="text-4xl font-black text-emerald-500 italic tracking-tighter">{(user?.agentProfile?.commissionRate || 0.1) * 100}%</p>
                                    <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">Active Variable Commission</p>
                                </div>
                                <button type="button" className="text-[9px] font-black text-white uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto hover:text-emerald-400 transition-colors relative z-10 group/rev">
                                    Protocol Negotiation <ChevronRight size={14} className="group-hover/rev:translate-x-1 transition-transform" />
                                </button>

                                {/* Background effect */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-600/10 rounded-full blur-2xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
