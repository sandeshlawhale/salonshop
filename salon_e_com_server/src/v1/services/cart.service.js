import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { ObjectId } from 'mongodb';

export const getCart = async (userId) => {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
        cart = await Cart.create({ userId, items: [] });
    }

    return cart;
};

export const addToCart = async (userId, productId, quantity = 1) => {
    try {
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }

        let product;

        if (ObjectId.isValid(productId) && typeof productId === 'string' && productId.length === 24) {
            product = await Product.findById(productId);
        }

        if (!product) {
            product = await Product.findOne({ slug: productId });
        }

        if (!product && !isNaN(productId)) {
            product = await Product.findOne({ slug: `product-${productId}` });
        }

        if (!product) {
            throw new Error(`Product not found: ${productId}`);
        }

        const existingItem = cart.items.find(
            item => item.productId === productId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                productId: productId,
                productName: product.name,
                productImage: product.images?.[0] || product.image || '',
                price: product.price,
                quantity: quantity
            });
        }

        const savedCart = await cart.save();
        return savedCart;
    } catch (error) {
        throw error;
    }
};

export const removeFromCart = async (userId, productId) => {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
        throw new Error('Cart not found');
    }

    cart.items = cart.items.filter(
        item => item.productId.toString() !== productId.toString()
    );

    await cart.save();
    return cart;
};

export const updateCartItem = async (userId, productId, quantity) => {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
        throw new Error('Cart not found');
    }

    if (quantity <= 0) {
        cart.items = cart.items.filter(
            item => item.productId.toString() !== productId.toString()
        );
    } else {
        const item = cart.items.find(
            item => item.productId.toString() === productId.toString()
        );

        if (item) {
            item.quantity = quantity;
        } else {
            throw new Error('Product not found in cart');
        }
    }

    await cart.save();
    return cart;
};

export const clearCart = async (userId) => {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
        throw new Error('Cart not found');
    }

    cart.items = [];
    await cart.save();
    return cart;
};

export const getCartTotal = async (userId) => {
    const cart = await getCart(userId);
    return {
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice,
        itemCount: cart.items.length
    };
};
