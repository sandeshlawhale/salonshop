// src/v1/services/product.service.js
import Product from '../models/Product.js';

export const listProducts = async (filters = {}) => {
    // Basic filtering
    const query = {};
    if (filters.category) {
        query.category = filters.category;
    }
    if (filters.status) {
        query.status = filters.status;
    } else {
        query.status = 'ACTIVE'; // Default to ACTIVE for public listing
    }

    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return { products: products, count: total, page: page, limit: limit };
};

export const createProduct = async (productData) => {
    // Ensure required fields and types
    if (!productData.name) throw new Error('Product name is required');

    // Generate slug from name if not provided
    const slugify = (text) => {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^a-z0-9\-]/g, '')    // Remove all non-alphanumeric chars except -
            .replace(/-+/g, '-')             // Replace multiple - with single -
            .replace(/^-+|-+$/g, '');        // Trim - from start/end
    };

    if (!productData.slug || productData.slug.trim() === '') {
        productData.slug = slugify(productData.name);
    }

    // Default category when not provided
    if (!productData.category || productData.category.trim() === '') {
        productData.category = 'Uncategorized';
    }

    // Coerce numeric fields (they may come as strings via FormData)
    ['price', 'compareAtPrice', 'costPerItem', 'inventoryCount'].forEach(key => {
        if (productData[key] !== undefined && productData[key] !== null && productData[key] !== '') {
            const n = Number(productData[key]);
            if (!Number.isNaN(n)) productData[key] = n;
        }
    });

    // Ensure unique slug (append suffix if exists)
    let baseSlug = productData.slug;
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await Product.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${baseSlug}-${counter++}`;
    }
    productData.slug = uniqueSlug;

    const product = await Product.create(productData);
    return product;
};

export const updateProduct = async (id, updateData) => {
    const product = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    });

    if (!product) {
        throw new Error('Product not found');
    }

    return product;
};

export const getProductById = async (id) => {
    const product = await Product.findById(id);
    if (!product) {
        throw new Error('Product not found');
    }
    return product;
};

export const deleteProduct = async (id) => {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
        throw new Error('Product not found');
    }
    return { product };
};
