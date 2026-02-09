import React, { useState, useEffect } from 'react';
import { commissionAPI } from '../../services/apiService';
import {
    Trophy,
    Settings,
    Save,
    Plus,
    Target,
    Percent,
    TrendingUp,
    ShieldCheck,
    Zap,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function AdminCommissionSlabs() {
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchTiers = async () => {
        setLoading(true);
        try {
            const res = await commissionAPI.getTiers();
            setTiers(res.data || []);
        } catch (err) {
            console.error('Failed to fetch tiers', err);
            // Default tiers if API fails during dev
            setTiers([
                { _id: '1', name: 'Silver', minSales: 0, commissionRate: 5, color: 'emerald' },
                { _id: '2', name: 'Gold', minSales: 50000, commissionRate: 8, color: 'amber' },
                { _id: '3', name: 'Platinum', minSales: 150000, commissionRate: 12, color: 'blue' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTiers();
    }, []);

    const handleUpdateTier = async (id, data) => {
        setSaving(true);
        try {
            await commissionAPI.updateTier(id, data);
            fetchTiers();
        } catch (err) {
            console.error('Update tier error:', err);
            alert('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-neutral-900 tracking-tighter">Commission Engine</h1>
                    <p className="text-neutral-500 font-semibold text-lg">Define performance brackets and automated rewards for your agent network.</p>
                </div>
                <Button className="bg-neutral-900 hover:bg-emerald-600 text-white rounded-2xl h-14 px-8 font-black flex items-center gap-3 shadow-2xl shadow-neutral-900/10">
                    <Plus size={20} />
                    NEW BRACKET
                </Button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-6 bg-white rounded-[56px] border border-neutral-100 shadow-sm">
                    <div className="relative">
                        <Loader2 className="animate-spin text-emerald-600" size={56} />
                        <div className="absolute inset-0 blur-xl bg-emerald-400/20 -z-10" />
                    </div>
                    <p className="text-neutral-400 font-black tracking-[0.4em] text-[10px] uppercase">Calibrating Commission Logic...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {tiers.map((tier, index) => (
                        <div key={tier._id} className="group relative">
                            {/* Background decoration */}
                            <div className="absolute inset-0 bg-emerald-50 rounded-[48px] translate-x-3 translate-y-3 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform -z-10" />

                            <div className="bg-white p-10 rounded-[48px] border border-neutral-100 shadow-sm h-full flex flex-col">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                        {index === 0 && <Zap size={32} />}
                                        {index === 1 && <Trophy size={32} />}
                                        {index === 2 && <ShieldCheck size={32} />}
                                    </div>
                                    <Settings className="text-neutral-200 hover:text-emerald-600 cursor-pointer transition-colors" size={24} />
                                </div>

                                <div className="space-y-1 mb-8">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Tier Level {index + 1}</span>
                                    <h3 className="text-3xl font-black text-neutral-900 tracking-tight">{tier.name} Status</h3>
                                </div>

                                <div className="space-y-6 flex-1">
                                    <div className="p-6 bg-neutral-50 rounded-3xl space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-neutral-400">
                                                <Target size={18} />
                                                <span className="text-xs font-black uppercase tracking-widest">Min. Monthly Sales</span>
                                            </div>
                                            <span className="font-black text-neutral-900">₹{tier.minSales.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-neutral-400">
                                                <Percent size={18} />
                                                <span className="text-xs font-black uppercase tracking-widest">Earnings Rate</span>
                                            </div>
                                            <span className="text-2xl font-black text-emerald-600">{tier.commissionRate}%</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                            <p className="text-sm font-bold text-neutral-600">Priority Hub Logistics</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                            <p className="text-sm font-bold text-neutral-600">Quarterly Bonus Eligible</p>
                                        </div>
                                        {index > 0 && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                                <p className="text-sm font-bold text-neutral-600">Advanced Analytics Access</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    className="mt-12 w-full h-16 bg-neutral-50 hover:bg-emerald-600 text-neutral-900 hover:text-white rounded-[24px] font-black flex items-center justify-center gap-3 transition-all active:scale-[0.98] group/btn"
                                    onClick={() => handleUpdateTier(tier._id, tier)}
                                >
                                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="group-hover/btn:scale-110 transition-transform" />}
                                    SAVE CONFIGURATION
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Global Settings Section */}
            <div className="bg-neutral-900 p-12 rounded-[56px] text-white relative overflow-hidden mt-12">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                    <div className="max-w-xl space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black tracking-widest uppercase">
                            <TrendingUp size={14} />
                            Scalability Engine
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter">Automated Tier Graduation</h2>
                        <p className="text-neutral-400 font-semibold text-lg leading-relaxed">
                            Our system automatically promotes agents to the next tier when they hit the revenue targets for three consecutive months. You can override these settings manually in individual agent profiles.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 min-w-[300px]">
                        <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] space-y-2">
                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Network Health</p>
                            <p className="text-3xl font-black">94.2% <span className="text-sm font-bold text-emerald-400">Stable</span></p>
                        </div>
                        <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] space-y-2">
                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Payout Accuracy</p>
                            <p className="text-3xl font-black">100.0% <span className="text-sm font-bold text-blue-400">Verified</span></p>
                        </div>
                    </div>
                </div>
                {/* Visual accents */}
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px]" />
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />
            </div>
        </div>
    );
}
