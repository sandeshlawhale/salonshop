// src/v1/services/commission.service.js
import Commission from '../models/Commission.js';
import User from '../models/User.js';

export const calculateCommission = async (order) => {
    // Only calculate if agent exists and commission not already calculated
    if (!order.agentId || order.commissionCalculated) {
        return null;
    }

    const agent = await User.findById(order.agentId);
    if (!agent || agent.role !== 'AGENT') {
        return null; // Should not happen if data integrity is good
    }

    const commissionSlabService = await import('./commissionSlab.service.js');
    const slabRate = await commissionSlabService.getCommissionRate(order.subtotal);
    const amountEarned = order.subtotal * (slabRate / 100);

    const commission = await Commission.create({
        agentId: agent._id,
        orderId: order._id,
        orderAmount: order.subtotal,
        commissionRate: slabRate,
        amountEarned,
        status: 'PENDING'
    });

    // Update agent's total earnings
    agent.agentProfile.totalEarnings += amountEarned;

    // Award points to agent (1 point per ₹1 of commission rounded)
    agent.agentProfile.points = (agent.agentProfile.points || 0) + Math.round(amountEarned);

    // Mark order as calculated
    order.commissionCalculated = true;
    await order.save();

    console.log(`[commission] Created commission ${commission._id} for agent ${agent.email}: ₹${amountEarned}`);

    return commission;
};

export const listCommissions = async (userId, role, filters = {}) => {
    // Admin sees all, Agent sees own
    const query = {};
    if (role === 'AGENT') {
        query.agentId = userId;
    }

    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;

    const total = await Commission.countDocuments(query);
    const commissions = await Commission.find(query)
        .populate('orderId', 'orderNumber total')
        .populate('agentId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return { commissions, count: total, page, limit };
};

export const approveCommission = async (orderId) => {
    const commission = await Commission.findOne({ orderId });
    if (commission && commission.status === 'PENDING') {
        commission.status = 'APPROVED';
        await commission.save();
        console.log(`[commission] Commission ${commission._id} for order ${orderId} moved to APPROVED`);
    }
};
