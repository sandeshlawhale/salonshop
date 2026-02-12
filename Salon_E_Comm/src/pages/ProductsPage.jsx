import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import { productAPI, categoryAPI } from '../services/apiService';
import { Loader2, Filter, X, ChevronDown, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../components/ui/sheet";

const PriceRangeFilter = ({ min, max, onChange }) => {
    const [localMin, setLocalMin] = useState(min);
    const [localMax, setLocalMax] = useState(max);

    useEffect(() => {
        setLocalMin(min);
    }, [min]);

    useEffect(() => {
        setLocalMax(max);
    }, [max]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (localMin !== min) onChange('minPrice', localMin);
            if (localMax !== max) onChange('maxPrice', localMax);
        }, 1000);

        return () => clearTimeout(handler);
    }, [localMin, localMax, min, max, onChange]);

    return (
        <div className="flex items-center gap-2">
            <input
                type="number"
                placeholder="Min"
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            />
            <span className="text-neutral-400">-</span>
            <input
                type="number"
                placeholder="Max"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            />
        </div>
    );
};

export default function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const currentSearch = searchParams.get('search') || '';
    const [searchTerm, setSearchTerm] = useState(currentSearch);

    useEffect(() => {
        setSearchTerm(currentSearch);
    }, [currentSearch]);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 12;

    // Filter States
    const currentCategory = searchParams.get('category') || '';
    // const currentSearch = searchParams.get('search') || ''; // Moved up
    const currentSort = searchParams.get('sort') || 'newest';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
        window.scrollTo(0, 0);
    }, [searchParams, page]);

    const fetchCategories = async () => {
        try {
            const res = await categoryAPI.getAll();
            setCategories(res?.data || []);
        } catch (err) {
            console.error('Failed to fetch categories', err);
            setCategories([]);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page,
                limit,
                search: currentSearch,
                category: currentCategory === 'all' ? '' : currentCategory,
                sort: currentSort,
                status: 'ACTIVE'
            };
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;

            const res = await productAPI.getAll(params);
            setProducts(res.data?.products || []);
            setTotal(res.data?.count || 0);
        } catch (err) {
            console.error('Failed to load products', err);
            setError('Failed to load products. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateFilters = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        newParams.set('page', 1); // Reset to page 1 on filter change
        setPage(1);
        setSearchParams(newParams);
    };

    const clearFilters = () => {
        setSearchParams({});
        setPage(1);
    };

    const FilterSection = () => (
        <div className="space-y-8">
            {/* Categories */}
            <div>
                <h3 className="font-bold text-neutral-900 mb-4">Categories</h3>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <input
                            type="radio"
                            id="cat-all"
                            name="category"
                            checked={!currentCategory || currentCategory === 'all'}
                            onChange={() => updateFilters('category', '')}
                            className="accent-emerald-600 w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="cat-all" className="text-sm text-neutral-600 cursor-pointer hover:text-emerald-600">All Products</label>
                    </div>
                    {categories.map((cat) => {
                        return (
                            <div key={cat._id} className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    id={`cat-${cat.name}`}
                                    name="category"
                                    checked={currentCategory === cat.name}
                                    onChange={() => updateFilters('category', cat.name)}
                                    className="accent-emerald-600 w-4 h-4 cursor-pointer"
                                />
                                <label htmlFor={`cat-${cat.name}`} className="text-sm text-neutral-600 cursor-pointer hover:text-emerald-600 capitalize">
                                    {cat.name}
                                </label>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="font-bold text-neutral-900 mb-4">Price Range</h3>
                <PriceRangeFilter min={minPrice} max={maxPrice} onChange={updateFilters} />
            </div>

            {/* Sort */}
            <div>
                <h3 className="font-bold text-neutral-900 mb-4">Sort By</h3>
                <select
                    value={currentSort}
                    onChange={(e) => updateFilters('sort', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                    <option value="newest">Newest Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                </select>
            </div>

            {/* Clear Filters */}
            <Button onClick={clearFilters} variant="outline" className="w-full border-neutral-200 hover:bg-neutral-50 hover:text-red-500">
                Clear All Filters
            </Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-50/50 pb-20 pt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Product Inventory</h1>
                        <p className="text-neutral-500 text-sm mt-1">
                            Showing {products.length} of {total} results
                            {currentSearch && <span> for "<span className="text-emerald-600 font-bold">{currentSearch}</span>"</span>}
                        </p>
                    </div>

                    {/* Desktop Search Bar */}
                    <div className="hidden md:flex items-center relative max-w-md w-full mx-8">
                        <Search className="absolute left-4 text-neutral-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search within results..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && updateFilters('search', searchTerm)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-bold"
                        />
                    </div>

                    {/* Mobile Filter Toggle */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="gap-2 border-neutral-200">
                                    <Filter size={16} /> Filters
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[540px]">
                                <SheetHeader className="mb-6">
                                    <SheetTitle>Filters</SheetTitle>
                                    <SheetDescription>Refine your search results.</SheetDescription>
                                </SheetHeader>
                                <FilterSection />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Sidebar - Desktop */}
                    <div className="hidden md:block col-span-1">
                        <div className="bg-white p-6 rounded-[24px] border border-neutral-100 sticky top-24">
                            <FilterSection />
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="col-span-1 md:col-span-3">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-6">
                                <Loader2 className="animate-spin text-emerald-600" size={48} />
                                <p className="text-neutral-400 font-bold text-xs uppercase tracking-widest">Loading Inventory...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-20 bg-white rounded-[24px] border border-neutral-100">
                                <p className="text-red-500 font-bold mb-4">{error}</p>
                                <Button onClick={fetchProducts} variant="outline">Try Again</Button>
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map((product) => (
                                        <ProductCard key={product._id || product.id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {total > limit && (
                                    <div className="flex justify-center mt-12 gap-2">
                                        <Button
                                            variant="outline"
                                            disabled={page === 1}
                                            onClick={() => setPage(page - 1)}
                                            className="border-neutral-200 hover:bg-emerald-50 hover:border-emerald-200"
                                        >
                                            Previous
                                        </Button>
                                        <div className="flex items-center px-4 font-bold text-neutral-900 bg-white border border-neutral-200 rounded-lg">
                                            Page {page} of {Math.ceil(total / limit)}
                                        </div>
                                        <Button
                                            variant="outline"
                                            disabled={page * limit >= total}
                                            onClick={() => setPage(page + 1)}
                                            className="border-neutral-200 hover:bg-emerald-50 hover:border-emerald-200"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-32 bg-white rounded-[24px] border border-neutral-100">
                                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search size={24} className="text-neutral-400" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-2">No Products Found</h3>
                                <p className="text-neutral-500 max-w-xs mx-auto mb-6">Try adjusting your filters or search query.</p>
                                <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
