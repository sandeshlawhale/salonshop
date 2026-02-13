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



    // 4a. Handle Reward Points Redemption
    let pointsUsed = 0;
    let finalTotalWithDiscount = total;

    if (orderData.pointsToRedeem && orderData.pointsToRedeem > 0) {
        // Condition: User must have 3 products (quantity or distinct?)
        // Spec: "tevhach kru shaknar jevha user 3 product order krel" -> "Only when user orders 3 products"
        // Interpretation: Total quantity >= 3 OR Distinct items >= 3. 
        // Let's go with Total Quantity >= 3 as it's more standard for "buy 3 things".
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

        if (totalQuantity < 3) {
            throw new Error('Rewards can only be redeemed on orders with at least 3 items.');
        }

        const rewardService = await import('./reward.service.js');

        // Re-check available points
        const user = await User.findById(userId);
        const availablePoints = user?.salonOwnerProfile?.rewardPoints?.available || 0;

        if (availablePoints < orderData.pointsToRedeem) {
            throw new Error(`Insufficient points. Available: ${availablePoints}`);
        }

        pointsUsed = Math.min(orderData.pointsToRedeem, subtotal); // Max discount is subtotal (shipping/tax might be separate, safely limiting to subtotal)

        if (pointsUsed > 0) {
            // We do NOT redeem yet. We redeem after order creation to ensure consistency? 
            // Or we redeem now. If order fails, we must rollback. 
            // Better: Deduct now.
            await rewardService.redeemPoints(userId, pointsUsed, null); // Order ID update later
            finalTotalWithDiscount = total - pointsUsed;
            console.log(`[order] Applied ${pointsUsed} points discount. New total: ${finalTotalWithDiscount}`);
        }
    } else {
        finalTotalWithDiscount = total;
    }

    // Calculate potential points to learn (1 point per 1 Rupee of final paid amount)
    const salonRewardPointsAmount = Math.floor(finalTotalWithDiscount);

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
        total: finalTotalWithDiscount, // Use discounted total
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
            earned: salonRewardPointsAmount, // Potential earn
            redeemed: pointsUsed,
            isCredited: false
        },
        timeline: [{ status: 'PENDING', note: `Order created - ${pointsUsed > 0 ? `Redeemed ${pointsUsed} points. ` : ''}Payment Method: ${paymentMethod || 'card'}` }]
    });

    // Update the redemption transaction with the final order ID
    if (pointsUsed > 0) {
        // We need to find the specific redemption entry we just made? 
        // Or simpler: We update the last entry for this user that matches the amount and type='REDEEMED' and orderId=null?
        // Actually, let's just do a direct update if possible, or leave it. 
        // Better: In createOrder we passed null. Let's update it now.
        await User.updateOne(
            { _id: userId, 'salonOwnerProfile.rewardHistory': { $elemMatch: { type: 'REDEEMED', amount: -pointsUsed, orderId: null } } },
            { $set: { 'salonOwnerProfile.rewardHistory.$.orderId': order._id } }
        );
    }


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

    // Condition 1: Add LOCKED points when PAID OR COMPLETED (if not already added)
    // Checks if we need to add points (if status is hitting PAID/COMPLETED/DELIVERED and no points credited yet)
    // We check if points were already earned to avoid double crediting
    if ((status === 'PAID' || status === 'COMPLETED' || status === 'DELIVERED') && (!order.salonRewardPoints.earned || order.salonRewardPoints.earned === 0)) {
        const rewardService = await import('./reward.service.js');
        // Calculate points: 1 point = 1 Rupee of total paid
        const pointsToEarn = Math.floor(order.total);

        if (pointsToEarn > 0) {
            // Update Order record
            order.salonRewardPoints.earned = pointsToEarn;

            // Add to User Profile (Locked)
            await rewardService.addPoints(order.customerId, order._id, pointsToEarn);
            console.log(`[order] Credited ${pointsToEarn} LOCKED points to user ${order.customerId}`);
        }
    }

    // Condition 2: Unlock points when COMPLETED
    if (status === 'COMPLETED' && prevStatus !== 'COMPLETED') {
        const rewardService = await import('./reward.service.js');
        await rewardService.unlockPoints(order.customerId, order._id);
        console.log(`[order] Unlocked points for user ${order.customerId}`);
    }

    // 4b. Handle Agent Commissions & Wallet
    const walletService = await import('./wallet.service.js');

    // Credit Pending Commission (PAID or COMPLETED)
    if (status === 'PAID' || status === 'COMPLETED') {
        await walletService.creditOrderRewards(order);
    }

    // Unlock Available Commission (COMPLETED)
    if (status === 'COMPLETED') {
        await walletService.unlockOrderRewards(order);
    }

    // Calculate Commission if not already done (for legacy/safety)
    const isProcessingSuccess = (status === 'PAID' || status === 'COMPLETED');
    if (isProcessingSuccess) {
        const commissionService = await import('./commission.service.js');
        await commissionService.calculateCommission(order);
    }

    await order.save();
    console.log(`[order] Order ${order.orderNumber} saved with status ${order.status}`);
    return order;
};
