import React, { useState } from 'react';
import {
    Settings,
    Shield,
    CreditCard,
    Bell,
    Database,
    Globe,
    Zap,
    Save,
    Loader2,
    AlertTriangle,
    Lock,
    RefreshCcw
} from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function AdminSettings() {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('GENERAL');

    const tabs = [
        { id: 'GENERAL', label: 'Platform Settings', icon: Globe },
        { id: 'PAYMENTS', label: 'Gateway Config', icon: CreditCard },
        { id: 'SECURITY', label: 'Access Control', icon: Shield },
        { id: 'NOTIFICATIONS', label: 'Comms Engine', icon: Bell },
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-neutral-900 tracking-tighter">System <span className="text-emerald-600">Configuration</span></h1>
                    <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] mt-2">Adjust core parameters and global platform variables</p>
                </div>

                <div className="flex bg-white p-1.5 rounded-[24px] border border-neutral-100 shadow-sm overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-neutral-900 text-white shadow-xl shadow-neutral-900/10'
                                    : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50'
                                }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-12 rounded-[56px] border border-neutral-100 shadow-sm space-y-10 relative overflow-hidden">
                        <div className="relative z-10 space-y-10">
                            {activeTab === 'GENERAL' && (
                                <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Platform Identity</label>
                                            <input
                                                type="text"
                                                defaultValue="Salon E-Comm"
                                                className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-neutral-900"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Locale Configuration</label>
                                            <select className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-neutral-900 appearance-none">
                                                <option>India (IST) - ₹ INR</option>
                                                <option>USA (EST) - $ USD</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-black text-neutral-900 uppercase tracking-tight text-sm">Automated Procurement</h4>
                                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Enable AI-driven restock notifications for high-velocity items.</p>
                                            </div>
                                            <div className="w-14 h-8 bg-emerald-600 rounded-full relative p-1 cursor-pointer">
                                                <div className="w-6 h-6 bg-white rounded-full shadow-sm absolute right-1" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'PAYMENTS' && (
                                <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                                    <div className="p-8 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-6">
                                        <AlertTriangle className="text-amber-600 shrink-0" size={24} />
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Production Gateway Active</h4>
                                            <p className="text-[10px] font-bold text-amber-700/80 uppercase tracking-widest leading-relaxed">Changes to Razorpay credentials will affect real-time settlement channels.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Gateway API Node (Key ID)</label>
                                        <div className="relative">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                                            <input
                                                type="password"
                                                defaultValue="••••••••••••••••"
                                                className="w-full pl-14 pr-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-neutral-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-8 border-t border-neutral-50 flex items-center justify-between relative z-10">
                            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                <RefreshCcw size={12} className="animate-spin-slow" />
                                Last verified: 6 mins ago
                            </p>
                            <Button className="h-14 px-10 bg-neutral-900 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl shadow-neutral-900/10">
                                <Save size={16} />
                                Persist Changes
                            </Button>
                        </div>

                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full -mr-48 -mt-48 blur-3xl" />
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="p-10 bg-neutral-900 rounded-[48px] text-white space-y-8 relative overflow-hidden">
                        <div className="relative z-10 space-y-6">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                                <Database size={28} className="text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black tracking-tight mb-2">Internal Diagnostics</h4>
                                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">System load and database health status reports.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">CPU LOAD / 2.4GHz</span>
                                    <span className="text-xs font-black text-emerald-400">14%</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="w-[14%] h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                </div>
                            </div>

                            <Button variant="outline" className="w-full h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 text-[9px] font-black uppercase tracking-widest rounded-xl">
                                Run Stress Test
                            </Button>
                        </div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mb-32 blur-3xl opacity-50" />
                    </div>

                    <div className="p-10 bg-white border border-neutral-100 rounded-[48px] shadow-sm space-y-6">
                        <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400">
                            <Zap size={28} />
                        </div>
                        <h4 className="font-black text-neutral-900 uppercase tracking-tight">Rapid Deployment</h4>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-relaxed">Enable zero-downtime maintenance mode for backend synchronization.</p>
                        <Button className="w-full h-12 bg-neutral-50 text-neutral-900 hover:bg-neutral-100 text-[9px] font-black uppercase tracking-widest rounded-xl border-none">
                            Initialize Mode
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
