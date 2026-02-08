// src/v1/services/order.service.js
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { ObjectId } from 'mongodb';
import * as notificationService from './notification.service.js';

export const createOrder = async (userId, orderData) => {
    const { items, referralCode, shippingAddress, paymentMethod } = orderData;

    // 1. Validate Items & Calculate Prices
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
        let product;

        // Try by ObjectId only if it's a valid MongoDB ObjectId format
        if (ObjectId.isValid(item.productId) && typeof item.productId === 'string' && item.productId.length === 24) {
            product = await Product.findById(item.productId);
        }

        // If not found by ObjectId, try to find by slug
        if (!product) {
            product = await Product.findOne({ slug: item.productId });
        }

        // If still not found, try numeric ID matching slug pattern
        if (!product && !isNaN(item.productId)) {
            product = await Product.findOne({ slug: `product-${item.productId}` });
        }

        if (!product) {
            throw new Error(`Product ${item.productId} not found`);
        }

        // Check inventory
        if (typeof product.inventoryCount === 'number' && product.inventoryCount < item.quantity) {
            throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.inventoryCount}`);
        }

        const price = product.price; // Use backend price for security
        subtotal += price * item.quantity;

        orderItems.push({
            productId: product._id,
            name: product.name,
            quantity: item.quantity,
            priceAtPurchase: price,
            image: product.images?.[0]
        });

        // Decrement inventory
        if (typeof product.inventoryCount === 'number') {
            const before = product.inventoryCount;
            product.inventoryCount = product.inventoryCount - item.quantity;
            if (product.inventoryCount < 0) {
                product.inventoryCount = 0;
            }
            await product.save();
            console.log(`Inventory updated for ${product.name}: ${before} -> ${product.inventoryCount}`);
        }
    }

    // 2. Calculate Totals
    const taxRate = 0.05; // 5% flat tax for simplicity
    const tax = subtotal * taxRate;
    const shippingCost = subtotal > 50 ? 0 : 10; // Free shipping over $50
    const total = subtotal + tax + shippingCost;

    // 3. Determine agent and salon owner logic
    const salonOwner = await User.findById(userId);
    let agentId = null;

    // Agent attribution logic
    if (orderData.agentId) {
        agentId = orderData.agentId;
    } else if (salonOwner && salonOwner.salonOwnerProfile.agentId) {
        agentId = salonOwner.salonOwnerProfile.agentId;
    } else if (referralCode) {
        const agent = await User.findOne({ 'agentProfile.referralCode': referralCode, role: 'AGENT' });
        if (agent) agentId = agent._id;
    }

    // 4. Calculate Commission & Rewards
    const commissionSlabService = await import('./commissionSlab.service.js');
    const commissionRate = await commissionSlabService.getCommissionRate(subtotal);
    const agentCommissionAmount = agentId ? (subtotal * (commissionRate / 100)) : 0;
    const salonRewardPointsAmount = Math.floor(subtotal / 100); // 1 point per 100 currency units

    // 4a. Handle Reward Points Redemption (On-Demand Maturity)
    let pointsUsed = 0;
    let finalTotal = total;

    if (orderData.pointsToRedeem && orderData.pointsToRedeem > 0) {
        const walletService = await import('./wallet.service.js');
        // Reconcile first to make points available
        await walletService.reconcileMaturedPoints(userId);

        // Re-fetch user to get latest available balance after reconciliation
        const updatedSalon = await User.findById(userId);
        const availablePoints = updatedSalon.salonOwnerProfile.rewardPoints.available;

        pointsUsed = Math.min(orderData.pointsToRedeem, availablePoints, subtotal); // Can't redeem more than total subtotal

        if (pointsUsed > 0) {
            await walletService.redeemPoints(userId, pointsUsed, null); // Order ID will be updated after creation
            finalTotal = total - pointsUsed;
            console.log(`[order] Applied ${pointsUsed} points discount. New total: ${finalTotal}`);
        }
    }

    // 5. Generate Order Number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await Order.create({
        orderNumber,
        customerId: userId,
        agentId,
        items: orderItems,
        subtotal,
        tax,
        shippingCost,
        total: finalTotal, // Use discounted total
        pointsUsed, // Track points used
        shippingAddress: shippingAddress || null,
        paymentMethod: paymentMethod || 'card',
        paymentStatus: 'UNPAID',
        agentCommission: {
            rate: commissionRate,
            amount: agentCommissionAmount,
            isCredited: false
        },
        salonRewardPoints: {
            amount: salonRewardPointsAmount,
            isCredited: false
        },
        timeline: [{ status: 'PENDING', note: `Order created - ${pointsUsed > 0 ? `Redeemed ${pointsUsed} points. ` : ''}Payment Method: ${paymentMethod || 'card'}` }]
    });

    // Update the redemption transaction with the final order ID if possible, 
    // but for now, the description already handles it or we can just leave it.
    // Actually, let's just use the order._id in a follow-up if needed.


    // Notify Customer
    await notificationService.createNotification({
        userId: userId,
        role: 'CUSTOMER',
        title: 'Order Created',
        message: `Your order ${order.orderNumber} has been successfully placed.`,
        type: 'ORDER'
    });

    // Notify Agent
    if (agentId) {
        await notificationService.createNotification({
            userId: agentId,
            role: 'AGENT',
            title: 'New Order Assigned',
            message: `New order ${order.orderNumber} has been placed with your referral code.`,
            type: 'ORDER'
        });
    }

    return order;
};

export const getMyOrders = async (userId, filters = {}) => {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;
    const query = { customerId: userId };

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
        .populate('agentId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return { orders: orders, count: total, page: page, limit: limit };
};

export const getAssignedOrders = async (agentId, filters = {}) => {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;
    const query = { agentId };

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
        .populate('customerId', 'firstName lastName email')
        .populate('agentId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return { assignedOrders: orders, count: total, page: page, limit: limit };
};

export const assignAgent = async (orderId, agentId) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    order.agentId = agentId || null;
    order.timeline.push({ status: 'AGENT_ASSIGNED', note: `Agent assigned: ${agentId}` });

    await order.save();
    return order;
};

export const getAgentOrders = async (agentId) => {
    return await Order.find({ agentId: agentId })
        .populate('customerId', 'firstName lastName email')
        .sort({ createdAt: -1 });
};

export const getAllOrders = async (filters = {}) => {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;

    // Build query excluding pagination params
    const query = { ...filters };
    delete query.page;
    delete query.limit;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
        .populate('customerId', 'firstName lastName email')
        .populate('agentId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return { allOrders: orders, count: total, page: page, limit: limit };
};

export const updateOrderStatus = async (orderId, status) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    const prevStatus = order.status;
    order.status = status;
    order.timeline.push({ status, note: `Status updated to ${status}` });

    // Notify Customer
    await notificationService.createNotification({
        userId: order.customerId,
        role: 'CUSTOMER',
        title: `Order ${status}`,
        message: `Your order ${order.orderNumber} status has been updated to ${status}.`,
        type: 'ORDER'
    });

    // Notify Agent if Cancelled
    if (status === 'CANCELLED' && order.agentId) {
        await notificationService.createNotification({
            userId: order.agentId,
            role: 'AGENT',
            title: 'Order Cancelled',
            message: `Order ${order.orderNumber} assigned to you has been cancelled.`,
            type: 'ORDER'
        });
    }

    console.log(`[order] Updating status for order ${order.orderNumber}: ${prevStatus} -> ${status}`);
    // 4. Handle Rewards & Commissions Lifecycle
    const isTerminalSuccess = (status === 'COMPLETED' || status === 'DELIVERED');
    const isProcessingSuccess = (status === 'PAID' || status === 'COMPLETED' || status === 'DELIVERED');

    // Credit logic (move to PENDING/LOCKED)
    if (isProcessingSuccess) {
        const walletService = await import('./wallet.service.js');
        await walletService.creditOrderRewards(order);

        const commissionService = await import('./commission.service.js');
        await commissionService.calculateCommission(order);
    }

    // Unlock logic (move to AVAILABLE/POINTS)
    if (isTerminalSuccess) {
        const walletService = await import('./wallet.service.js');
        await walletService.unlockOrderRewards(order);

        const commissionService = await import('./commission.service.js');
        await commissionService.approveCommission(order._id);
    }

    await order.save();
    console.log(`[order] Order ${order.orderNumber} saved with status ${order.status}`);
    return order;
};
