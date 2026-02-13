import React, { useState, useEffect } from 'react';
import { X, Upload, Package, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { productAPI } from '../../services/apiService';

export default function ProductModal({ isOpen, onClose, product, categories, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        subcategory: '',
        brand: '',
        originalPrice: '',
        price: '',
        inventoryCount: '',
        description: '',
        status: 'ACTIVE',
        featured: false,
        returnable: true
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [keptExistingImages, setKeptExistingImages] = useState([]);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                sku: product.sku || '',
                category: product.category || '',
                subcategory: product.subcategory || '',
                brand: product.brand || '',
                price: product.price || '',
                originalPrice: product.originalPrice || '',
                inventoryCount: product.inventoryCount || '',
                description: product.description || '',
                status: product.status || 'ACTIVE',
                featured: product.featured || false,
                returnable: product.returnable !== undefined ? product.returnable : true
            });
            // Handle existing images
            const existing = product.images && product.images.length > 0 ? product.images :
                (product.imageUrl || product.image ? [product.imageUrl || product.image] : []);
            setImagePreviews(existing);
            setKeptExistingImages(existing);
        } else {
            setFormData({
                name: '',
                sku: '',
                category: categories?.[0]?.name || '',
                subcategory: '',
                brand: '',
                price: '',
                originalPrice: '',
                inventoryCount: '',
                description: '',
                status: 'ACTIVE',
                featured: false,
                returnable: true
            });
            setImagePreviews([]);
        }
        setImageFiles([]);
        setError('');
    }, [product, isOpen, categories]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = imagePreviews.length + files.length;

        if (totalImages > 5) {
            setError('You can upload a maximum of 5 images per product.');
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
        const invalidFiles = files.filter(file => !validTypes.includes(file.type));

        if (invalidFiles.length > 0) {
            setError('Invalid file format. Only JPG, PNG, WEBP, and AVIF are allowed.');
            return;
        }

        if (files.length > 0) {
            setImageFiles(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
            setError('');
        }
    };

    const handleRemoveImage = (index) => {
        const targetSrc = imagePreviews[index];

        // Remove from previews
        setImagePreviews(prev => prev.filter((_, i) => i !== index));

        if (targetSrc.startsWith('blob:')) {
            // It's a newly uploaded file
            // Count how many blob images were before this one to find index in imageFiles
            const blobsBefore = imagePreviews.slice(0, index).filter(src => src.startsWith('blob:')).length;
            setImageFiles(prev => prev.filter((_, i) => i !== blobsBefore));
        } else {
            // It's an existing image
            setKeptExistingImages(prev => prev.filter(img => img !== targetSrc));
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            // Send kept existing images
            // We need to append them as 'images' or handle explicitly in backend.
            // Backend Controller Logic:
            // if (imagePaths.length > 0) {
            //     const existingImages = updateData.images ? ... : [];
            //     updateData.images = [...existingImages, ...imagePaths];
            // }
            // So we need to put keptExistingImages into formData or data.
            // But FormData 'images' usually expects files.
            // The backend controller looks for `req.body.images` for existing ones (strings) and `req.files` for new ones.
            // So we append `images` to formData for each kept string.

            keptExistingImages.forEach(img => {
                data.append('images', img);
            });

            if (imageFiles.length > 0) {
                imageFiles.forEach(file => {
                    data.append('images', file);
                });
            }

            if (product) {
                await productAPI.update(product._id, data);
            } else {
                await productAPI.create(data);
            }

            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Failed to save product:', err);
            setError(err.response?.data?.message || 'Failed to save product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh]">
                {/* Left: Image Upload Zone */}
                <div className="w-full md:w-2/5 bg-neutral-50 p-8 flex flex-col items-center justify-start border-b md:border-b-0 md:border-r border-neutral-100 overflow-y-auto">
                    <div className="w-full aspect-square rounded-3xl border-2 border-dashed border-neutral-200 bg-white relative group overflow-hidden flex flex-col items-center justify-center text-center p-4 mb-4">
                        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center z-10">
                            <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-neutral-400" />
                            </div>
                            <h4 className="text-sm font-bold text-neutral-900 mb-1">Upload Images</h4>
                            <p className="text-xs text-neutral-500 px-8">Upload product images (JPG, PNG).</p>
                            <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" multiple />
                        </label>
                    </div>

                    {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 gap-4 w-full">
                            {imagePreviews.map((src, index) => (
                                <div key={index} className="aspect-square rounded-xl overflow-hidden relative group border border-neutral-100 bg-white">
                                    <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-white/90 text-rose-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Form Section */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">{product ? 'Edit Product' : 'Add New Product'}</h2>
                            <p className="text-sm text-neutral-500 font-medium">Enter product details below.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 text-left">
                        {error && (
                            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-medium">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Keratin Smooth Shampoo"
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Brand</label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    placeholder="e.g. L'Oreal"
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">SKU Code</label>
                                <input
                                    type="text"
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleChange}
                                    placeholder="e.g. KER-500-BK"
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-sm text-neutral-400"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-sm cursor-pointer"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.filter(c => !c.parent).map(cat => (
                                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Status</label>
                                <div className="flex items-center gap-4 py-2">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="ACTIVE"
                                            checked={formData.status === 'ACTIVE'}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.status === 'ACTIVE' ? 'border-blue-600 bg-blue-600' : 'border-neutral-200'}`}>
                                            {formData.status === 'ACTIVE' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                        </div>
                                        <span className={`text-sm font-bold ${formData.status === 'ACTIVE' ? 'text-neutral-900' : 'text-neutral-400'}`}>Active</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="DRAFT"
                                            checked={formData.status === 'DRAFT'}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.status === 'DRAFT' ? 'border-rose-600 bg-rose-600' : 'border-neutral-200'}`}>
                                            {formData.status === 'DRAFT' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                        </div>
                                        <span className={`text-sm font-bold ${formData.status === 'DRAFT' ? 'text-neutral-900' : 'text-neutral-400'}`}>Draft</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Subcategory</label>
                                <select
                                    name="subcategory"
                                    value={formData.subcategory}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-sm cursor-pointer"
                                >
                                    <option value="">Select Subcategory</option>
                                    {categories
                                        .filter(c => c.parent === categories.find(cat => cat.name === formData.category)?._id)
                                        .map(cat => (
                                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                                        ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Original Price (₹)</label>
                                <input
                                    type="number"
                                    name="originalPrice"
                                    value={formData.originalPrice}
                                    onChange={handleChange}
                                    placeholder="MSRP"
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-black text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-6 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="featured"
                                    checked={formData.featured}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded-md text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="text-sm font-bold text-neutral-700">Featured Product</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="returnable"
                                    checked={formData.returnable}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded-md text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="text-sm font-bold text-neutral-700">Returnable</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Price (₹)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-black text-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Inventory Count</label>
                                <input
                                    type="number"
                                    name="inventoryCount"
                                    value={formData.inventoryCount}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-black text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the product and its professional benefits..."
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-sm min-h-[100px] resize-none"
                            />
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold rounded-[20px] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-[20px] shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                                {product ? 'Update Product' : 'Save Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
