// src/v1/controllers/product.controller.js
import * as productService from '../services/product.service.js';
import { isCloudinaryConfigured } from '../../config/cloudinary.js';

export const getProducts = async (req, res) => {
    try {
        const filters = req.query;
        console.log('[getProducts] Request filters:', filters);
        const result = await productService.listProducts(filters);
        res.json(result);
    } catch (error) {
        console.error('[getProducts] Error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        // req.body may contain string values if sent via FormData - coerce types
        const productData = { ...req.body };
        const warnings = [];

        // Coerce numeric fields
        ['price', 'compareAtPrice', 'costPerItem', 'inventoryCount'].forEach(k => {
            if (productData[k] !== undefined) {
                const n = Number(productData[k]);
                if (!Number.isNaN(n)) productData[k] = n;
            }
        });

        // Handle image uploads
        if (req.files && req.files.length > 0) {
            const imagePaths = [];
            for (const file of req.files) {
                if (file.path) imagePaths.push(file.path);
                else {
                    // When Cloudinary isn't configured we use memoryStorage fallback and files won't have a path
                    if (!isCloudinaryConfigured) {
                        console.warn('[createProduct] Image not uploaded (Cloudinary not configured):', file.originalname);
                        warnings.push(`Image '${file.originalname}' was received but not uploaded because Cloudinary is not configured on the server.`);
                    } else {
                        console.warn('[createProduct] Received file without path despite Cloudinary configured:', file.originalname);
                    }
                }
            }
            if (imagePaths.length > 0) productData.images = imagePaths;
        }

        const product = await productService.createProduct(productData);
        const response = { product };
        if (warnings.length) response.warnings = warnings;
        res.status(201).json(response);
    } catch (error) {
        console.error('[createProduct] Error:', error);
        if (error.name === 'ValidationError') {
            // format validation errors
            const details = Object.values(error.errors).map(e => e.message || e.path + ' ' + e.kind);
            return res.status(400).json({ message: 'Validation failed', details });
        }
        res.status(400).json({ message: error.message || 'Failed to create product' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const updateData = { ...req.body };
        const warnings = [];

        // Coerce numeric fields
        ['price', 'compareAtPrice', 'costPerItem', 'inventoryCount'].forEach(k => {
            if (updateData[k] !== undefined) {
                const n = Number(updateData[k]);
                if (!Number.isNaN(n)) updateData[k] = n;
            }
        });

        if (req.files && req.files.length > 0) {
            const imagePaths = [];
            for (const file of req.files) {
                if (file.path) imagePaths.push(file.path);
                else {
                    if (!isCloudinaryConfigured) {
                        console.warn('[updateProduct] Image not uploaded (Cloudinary not configured):', file.originalname);
                        warnings.push(`Image '${file.originalname}' was received but not uploaded because Cloudinary is not configured on the server.`);
                    } else {
                        console.warn('[updateProduct] Received file without path despite Cloudinary configured:', file.originalname);
                    }
                }
            }
            if (imagePaths.length > 0) updateData.images = imagePaths;
        }

        const product = await productService.updateProduct(req.params.id, updateData);
        const response = { product };
        if (warnings.length) response.warnings = warnings;
        res.json(response);
    } catch (error) {
        console.error('[updateProduct] Error:', error);
        if (error.name === 'ValidationError') {
            const details = Object.values(error.errors).map(e => e.message || e.path + ' ' + e.kind);
            return res.status(400).json({ message: 'Validation failed', details });
        }
        res.status(400).json({ message: error.message || 'Failed to update product' });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await productService.deleteProduct(req.params.id);
        res.json({ message: 'Product deleted successfully', product });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
