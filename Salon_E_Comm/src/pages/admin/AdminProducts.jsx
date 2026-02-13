import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Package,
    AlertCircle,
    TrendingUp,
    Briefcase,
    IndianRupee,
    Loader2,
    ArrowUpRight,
    Trophy,
    ShieldCheck
} from 'lucide-react';
import { productAPI, categoryAPI } from '../../services/apiService';
import ProductModal from '../../components/admin/ProductModal';
import StatCard from '../../components/admin/StatCard';
import { toast } from 'react-hot-toast';
import { Skeleton } from "@/components/ui/skeleton";
import TableRowSkeleton from '../../components/common/TableRowSkeleton';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');


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
            toast.error('Inventory synchronization failed');
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
                toast.success('Product deleted successfully');
                fetchData();
            } catch (err) {
                toast.error('Failed to delete asset');
            }
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const stats = {
        totalAssets: products.length,
        lowStock: products.filter(p => p.inventoryCount < 10).length,
        totalValue: products.reduce((sum, p) => sum + (p.price * p.inventoryCount || 0), 0)
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tighter uppercase">Products</h1>
                    <p className="text-sm font-medium text-neutral-500 mt-1">Manage your product inventory</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="px-8 py-4 bg-neutral-900 hover:bg-emerald-600 text-white rounded-[24px] flex items-center gap-3 font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-neutral-900/10 active:scale-95"
                >
                    <Plus size={18} />
                    Add New Product
                </button>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard
                    title="Total Value"
                    value={`₹${stats.totalValue.toLocaleString()}`}
                    icon={IndianRupee}
                    color="emerald"
                />
                <StatCard
                    title="Total Products"
                    value={stats.totalAssets}
                    icon={Package}
                    color="neutral"
                />
                <StatCard
                    title="Low Stock"
                    value={stats.lowStock}
                    icon={AlertCircle}
                    color={stats.lowStock > 0 ? 'rose' : 'emerald'}
                    trend={stats.lowStock > 0 ? 'down' : 'up'}
                />
            </div>


            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
                <div className="relative group flex-1 max-w-md">
                    <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 h-12 bg-neutral-50/50 border-2 border-neutral-100/50 rounded-2xl text-sm font-medium outline-none shadow-sm focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500 transition-all"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-neutral-50 rounded-xl flex items-center gap-3 border border-neutral-100">
                        <Filter size={14} className="text-neutral-400" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-transparent text-xs font-bold uppercase tracking-wide outline-none cursor-pointer text-neutral-600 min-w-[120px]"
                        >
                            <option value="All">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat.name}>{cat.name.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>


            <div className="bg-white rounded-[48px] border border-neutral-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50/50">
                                <th className="px-10 py-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Product</th>
                                <th className="px-10 py-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Category</th>
                                <th className="px-10 py-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Stock</th>
                                <th className="px-10 py-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Price</th>
                                <th className="px-10 py-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                                <th className="px-10 py-6 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRowSkeleton key={i} cellCount={6} />
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-10 py-32 text-center">
                                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <ShieldCheck size={32} className="text-neutral-200" />
                                        </div>
                                        <p className="text-sm font-medium text-neutral-500">No products found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((p) => (
                                    <tr key={p._id} className="hover:bg-neutral-50/50 transition-all duration-300 group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-[24px] bg-neutral-100 border border-neutral-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-500 shadow-sm">
                                                    {p.images?.[0] ? (
                                                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-8 h-8 text-neutral-300" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-neutral-900 group-hover:text-emerald-600 transition-colors tracking-tight line-clamp-1 uppercase">{p.name}</span>
                                                    <span className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em] mt-1">SKU: {p.sku || p._id.slice(-6).toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="text-[10px] font-black text-neutral-900 uppercase tracking-widest bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200 shadow-sm">{p.category || 'GENERAL'}</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-1.5">
                                                <span className={`text-xl font-black tracking-tighter ${p.inventoryCount < 10 ? 'text-rose-600' : 'text-neutral-900'}`}>
                                                    {p.inventoryCount}
                                                </span>
                                                {p.inventoryCount < 10 && (
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-md w-fit ring-1 ring-rose-200">
                                                        Supply Risk
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-1.5">
                                                <IndianRupee size={14} className="text-neutral-400" />
                                                <span className="text-xl font-black text-neutral-900 tracking-tighter">{(p.price || 0).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset transition-all ${p.status === 'ACTIVE'
                                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                                : 'bg-rose-50 text-rose-700 ring-rose-600/20'
                                                }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500">
                                                <button
                                                    onClick={() => handleEdit(p)}
                                                    className="p-4 bg-white shadow-sm border border-neutral-100 text-neutral-400 hover:text-emerald-600 hover:border-emerald-100 rounded-2xl transition-all active:scale-90"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p._id)}
                                                    className="p-4 bg-white shadow-sm border border-neutral-100 text-neutral-400 hover:text-rose-600 hover:border-rose-100 rounded-2xl transition-all active:scale-90"
                                                >
                                                    <Trash2 size={18} />
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
