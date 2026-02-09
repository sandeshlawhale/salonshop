import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Layers,
    AlertCircle,
    Loader2,
    CheckCircle2,
    FolderOpen,
    ShieldCheck,
    Archive,
    Zap,
    TrendingUp
} from 'lucide-react';
import { categoryAPI } from '../../services/apiService';
import { toast } from 'react-hot-toast';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCatName, setNewCatName] = useState('');
    const [adding, setAdding] = useState(false);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await categoryAPI.getAll();
            setCategories(res.data || []);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            toast.error('Classification registry sync failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCatName.trim()) return;

        setAdding(true);
        try {
            await categoryAPI.create(newCatName);
            setNewCatName('');
            toast.success('Asset classification committed');
            fetchCategories();
        } catch (err) {
            console.error('Failed to add category:', err);
            toast.error(err.response?.data?.message || 'Failed to commit category');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Confirm permanent deletion of this classification tier? Assets may be affected.')) {
            try {
                await categoryAPI.delete(id);
                toast.success('Classification Tier purged');
                fetchCategories();
            } catch (err) {
                toast.error('Failed to purge classification');
            }
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tighter uppercase">Catalog Architecture</h1>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Define structural tiers for inventory organization</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-neutral-900 rounded-xl flex items-center gap-3 border border-neutral-800 shadow-xl shadow-neutral-900/10">
                        <TrendingUp size={14} className="text-emerald-400" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
                            {categories.length} Registered Tiers
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                {/* Provisioning Terminal */}
                <div className="lg:col-span-1">
                    <div className="bg-neutral-900 p-10 rounded-[48px] border border-neutral-800 shadow-2xl shadow-neutral-900/40 space-y-8 relative overflow-hidden group">
                        {/* Background flare */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 transition-all duration-700" />

                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
                                <Plus size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white tracking-tight uppercase">Provision Tier</h3>
                                <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Structural Entry</p>
                            </div>
                        </div>

                        <form onSubmit={handleAddCategory} className="relative z-10 space-y-6">
                            <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 ml-1">Classification Name</label>
                                <input
                                    type="text"
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    placeholder="e.g. PREMIUM SKINCARE"
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-black text-[11px] uppercase tracking-widest placeholder:text-neutral-700"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={adding || !newCatName.trim()}
                                className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-[24px] shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
                            >
                                {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck size={20} />}
                                Commit to Registry
                            </button>
                        </form>

                        <div className="relative z-10 p-5 bg-white/5 border border-white/5 rounded-3xl">
                            <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest leading-relaxed">
                                Note: All newly committed classifications are immediately broadcasted to the global catalog engine.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Classification Ledger */}
                <div className="lg:col-span-2 space-y-6">
                    {loading && categories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[56px] border border-neutral-100 shadow-sm">
                            <div className="relative">
                                <Loader2 className="animate-spin text-emerald-600" size={56} />
                                <div className="absolute inset-0 bg-emerald-600/10 blur-xl rounded-full" />
                            </div>
                            <p className="text-neutral-400 font-black tracking-[0.4em] text-[10px] uppercase animate-pulse">Decrypting Architecture...</p>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-8 bg-white rounded-[56px] border border-neutral-100 shadow-sm text-center">
                            <div className="w-24 h-24 bg-neutral-50 rounded-[40px] flex items-center justify-center text-neutral-100 border border-neutral-50">
                                <FolderOpen size={48} />
                            </div>
                            <div className="space-y-3">
                                <p className="text-xl font-black text-neutral-900 tracking-tighter uppercase italic">Vault Registry Empty</p>
                                <p className="text-neutral-400 font-black text-[10px] uppercase tracking-widest">No structural classifications defined.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {categories.map((cat, index) => (
                                <div key={cat._id} className="group bg-white p-8 rounded-[40px] border border-neutral-100 hover:border-emerald-600/20 hover:shadow-2xl hover:shadow-emerald-600/5 transition-all flex items-center justify-between relative overflow-hidden">
                                    {/* Hover gradient trace */}
                                    <div className="absolute inset-0 bg-linear-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className="w-16 h-16 bg-neutral-50 rounded-[28px] flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 group-hover:rotate-12 border border-neutral-100 group-hover:border-emerald-500 shadow-sm">
                                            {index % 2 === 0 ? <Layers size={28} /> : <Archive size={28} />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-lg font-black text-neutral-900 group-hover:text-emerald-600 transition-all tracking-tighter uppercase leading-none">{cat.name}</span>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Zap size={10} className="text-emerald-500" />
                                                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Active Tier {index + 1}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(cat._id)}
                                        className="relative z-10 w-12 h-12 bg-neutral-50 text-neutral-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 flex items-center justify-center group-hover:scale-100 scale-90 opacity-0 group-hover:opacity-100 active:scale-90"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
