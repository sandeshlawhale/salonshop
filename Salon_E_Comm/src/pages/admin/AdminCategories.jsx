import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Layers,
    AlertCircle,
    Loader2,
    CheckCircle2,
    FolderOpen
} from 'lucide-react';
import { categoryAPI } from '../../services/apiService';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCatName, setNewCatName] = useState('');
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await categoryAPI.getAll();
            setCategories(res.data || []);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            setError('Failed to load categories');
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
        setError('');
        try {
            await categoryAPI.create(newCatName);
            setNewCatName('');
            fetchCategories();
        } catch (err) {
            console.error('Failed to add category:', err);
            setError(err.response?.data?.message || 'Failed to add category');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? Products in this category might become uncategorized.')) {
            try {
                await categoryAPI.delete(id);
                fetchCategories();
            } catch (err) {
                alert('Failed to delete category');
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Category Management</h1>
                    <p className="text-sm text-neutral-500 font-medium">Organize your salon inventory with professional classifications.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
                {/* Add Category Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-6 sticky top-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                                <Plus className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-neutral-900 tracking-tight">NEW TIER</h3>
                        </div>

                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Classification Name</label>
                                <input
                                    type="text"
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    placeholder="e.g. Elite Skin Care"
                                    className="w-full px-4 py-3.5 bg-white border-2 border-neutral-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-sm shadow-sm"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-[10px] font-black uppercase tracking-tight">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={adding || !newCatName.trim()}
                                className="w-full h-14 bg-neutral-900 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-neutral-900/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 border-b-4 border-emerald-900/20 active:scale-[0.98]"
                            >
                                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                Commit Category
                            </button>
                        </form>
                    </div>
                </div>

                {/* Categories List */}
                <div className="lg:col-span-2 space-y-4">
                    {loading && categories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-[40px] border border-neutral-100 shadow-sm">
                            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                            <p className="text-neutral-400 font-black tracking-widest text-[10px] uppercase">Decrypting Classifications...</p>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-6 bg-white rounded-[40px] border border-neutral-100 shadow-sm text-center">
                            <div className="w-20 h-20 bg-neutral-50 rounded-[32px] flex items-center justify-center text-neutral-200">
                                <FolderOpen size={48} />
                            </div>
                            <div className="space-y-2">
                                <p className="text-xl font-black text-neutral-900 tracking-tight">Vault Empty</p>
                                <p className="text-neutral-400 font-bold text-sm uppercase tracking-widest">No classifications defined in registry.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {categories.map((cat) => (
                                <div key={cat._id} className="group bg-white p-6 rounded-[32px] border border-neutral-100 hover:border-emerald-600/20 hover:shadow-2xl hover:shadow-emerald-600/5 transition-all flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 transition-all duration-500 group-hover:rotate-6 border border-transparent group-hover:border-emerald-100 shadow-sm">
                                            <Layers className="w-6 h-6 text-neutral-400 group-hover:text-emerald-600 transition-colors" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-base font-black text-neutral-900 group-hover:text-emerald-600 transition-colors tracking-tight uppercase leading-none">{cat.name}</span>
                                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Registry Level 1</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(cat._id)}
                                        className="p-3 text-neutral-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100 border-2 border-transparent hover:border-rose-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
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
