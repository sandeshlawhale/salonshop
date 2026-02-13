import Commission from '../models/Commission.js';
import User from '../models/User.js';

export const calculateCommission = async (order) => {
    if (!order.agentId || order.commissionCalculated) {
        return null;
    }

    const agent = await User.findById(order.agentId);
    if (!agent || agent.role !== 'AGENT') {
        return null;
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

    agent.agentProfile.totalEarnings += amountEarned;

    agent.agentProfile.points = (agent.agentProfile.points || 0) + Math.round(amountEarned);

    order.commissionCalculated = true;
    await order.save();

    return commission;
};

export const listCommissions = async (userId, role, filters = {}) => {
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
    }
};
