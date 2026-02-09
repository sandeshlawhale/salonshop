import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Package,
    AlertCircle
} from 'lucide-react';
import { productAPI, categoryAPI } from '../../services/apiService';
import ProductModal from '../../components/admin/ProductModal';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes] = await Promise.all([
                productAPI.getAll(),
                categoryAPI.getAll()
            ]);
            setProducts(prodRes.data.products || []);
            setCategories(catRes.data || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = () => {
        setCurrentProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product) => {
        setCurrentProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productAPI.delete(id);
                fetchData();
            } catch (err) {
                alert('Failed to delete product');
            }
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading && products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Synthesizing Inventory...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Product Ledger</h1>
                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Inventory Control & SKU Management</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group max-w-sm">
                        <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search products, SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 h-14 bg-white border-2 border-neutral-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-bold shadow-sm"
                        />
                    </div>
                    <div className="relative group">
                        <Filter className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="pl-12 pr-10 h-14 bg-white border-2 border-neutral-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-black uppercase tracking-widest appearance-none shadow-sm cursor-pointer"
                        >
                            <option value="All">All Tiers</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-3 px-8 h-14 bg-neutral-900 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-neutral-900/10 active:scale-[0.98] border-b-4 border-emerald-900/20"
                    >
                        <Plus className="w-5 h-5" />
                        Add Asset
                    </button>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-[40px] shadow-sm border border-neutral-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50/50">
                                <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Asset Details</th>
                                <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Classification</th>
                                <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Units In Stock</th>
                                <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">valuation</th>
                                <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Market Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-32 text-center text-neutral-400 font-black uppercase tracking-widest italic">
                                        Vault Empty. No assets match criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((p) => (
                                    <tr key={p._id} className="hover:bg-neutral-50/50 transition-all duration-300 group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-[24px] bg-neutral-100 border-2 border-neutral-50 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-500">
                                                    {p.images?.[0] ? (
                                                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-8 h-8 text-neutral-300" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-base font-black text-neutral-900 group-hover:text-emerald-600 transition-colors tracking-tight line-clamp-1">{p.name}</span>
                                                    <span className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em]">SKU: {p.sku || 'UNASSIGNED'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-black text-neutral-900 uppercase tracking-widest">{p.category || 'GENERAL'}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-lg font-black tracking-tighter ${p.inventoryCount < 10 ? 'text-rose-600' : 'text-neutral-900'}`}>
                                                    {p.inventoryCount}
                                                </span>
                                                {p.inventoryCount < 10 && (
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-md w-fit ring-1 ring-rose-200">
                                                        Critical Low
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-lg font-black text-neutral-900 tracking-tighter">₹{p.price?.toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ring-2 ring-inset transition-all ${p.status === 'ACTIVE'
                                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 group-hover:bg-emerald-600 group-hover:text-white'
                                                : 'bg-rose-50 text-rose-700 ring-rose-600/20 group-hover:bg-rose-600 group-hover:text-white'
                                                }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500">
                                                <button
                                                    onClick={() => handleEdit(p)}
                                                    className="p-3 bg-white shadow-sm border-2 border-neutral-100 text-neutral-400 hover:text-emerald-600 hover:border-emerald-100 rounded-2xl transition-all"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p._id)}
                                                    className="p-3 bg-white shadow-sm border-2 border-neutral-100 text-neutral-400 hover:text-rose-600 hover:border-rose-100 rounded-2xl transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Product Modal */}
            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={currentProduct}
                categories={categories}
                onSuccess={fetchData}
            />
        </div>
    );
}
