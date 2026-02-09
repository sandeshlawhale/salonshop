import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/apiService';
import { User, Mail, Phone, MapPin, Camera, Shield, Bell, CreditCard, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        email: user?.email || '',
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
        } catch (err) {
            console.error('Profile update failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-neutral-50/50 min-h-screen py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center lg:text-left">
                    <h1 className="text-4xl font-black text-neutral-900 tracking-tight">My <span className="text-emerald-600">Profile</span></h1>
                    <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] mt-2">Manage your account information and preferences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Identity Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-[40px] border border-neutral-100 shadow-sm flex flex-col items-center text-center">
                            <div className="relative group cursor-pointer lg:mb-6">
                                <div className="w-24 h-24 bg-emerald-50 rounded-[32px] flex items-center justify-center text-emerald-600 font-black text-3xl border border-emerald-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                    {user?.firstName?.[0] || 'U'}
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-neutral-900 text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg group-hover:bg-emerald-600 transition-colors">
                                    <Camera size={16} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl font-black text-neutral-900">{user?.firstName} {user?.lastName}</h2>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">{user?.role || 'authorized user'}</p>
                            </div>
                        </div>

                        <nav className="bg-white p-4 rounded-[32px] border border-neutral-100 shadow-sm space-y-1">
                            {[
                                { icon: Shield, label: 'Secured Access', active: true },
                                { icon: Bell, label: 'Notifications' },
                                { icon: CreditCard, label: 'Payment Methods' }
                            ].map((item, idx) => (
                                <button
                                    key={idx}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${item.active ? 'bg-emerald-50 text-emerald-700' : 'text-neutral-500 hover:bg-neutral-50'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <ChevronRight size={14} className={item.active ? 'opacity-100' : 'opacity-30'} />
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Configuration Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-10 rounded-[40px] border border-neutral-100 shadow-sm space-y-10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black text-neutral-900 uppercase tracking-widest">Profile Information</h3>
                                {success && (
                                    <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-2">
                                        <CheckCircle2 size={16} />
                                        Profile Updated
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">First Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                            <input
                                                type="text"
                                                value={formData.firstName}
                                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                                className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 pl-12 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Last Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                            <input
                                                type="text"
                                                value={formData.lastName}
                                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                                className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 pl-12 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Email Endpoint</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                            <input
                                                type="email"
                                                disabled
                                                value={formData.email}
                                                className="w-full bg-neutral-100 border border-neutral-100 rounded-2xl p-4 pl-12 text-sm font-bold text-neutral-400 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Comms Protocol (Phone)</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 pl-12 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-16 bg-neutral-900 text-white rounded-[24px] font-black hover:bg-emerald-600 transition-all shadow-xl shadow-neutral-900/20 active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'UPDATE CONFIGURATION'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
