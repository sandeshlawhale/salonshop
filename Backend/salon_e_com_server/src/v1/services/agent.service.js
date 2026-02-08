import User from '../models/User.js';
import Order from '../models/Order.js';

export const getAgentStats = async (agentId) => {
    const agent = await User.findById(agentId);
    if (!agent) throw new Error('Agent not found');

    const salons = await User.find({ 'salonOwnerProfile.agentId': agentId, role: 'SALON_OWNER' });
    const salonIds = salons.map(s => s._id);

    const orders = await Order.find({ customerId: { $in: salonIds } }).sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const pendingCommission = agent.agentProfile.wallet.pending;
    const earnedCommission = agent.agentProfile.totalEarnings;

    // Reorder behavior insights: Group by customer and check average days between orders
    const salonInsights = salons.map(salon => {
        const salonOrders = orders.filter(o => o.customerId.toString() === salon._id.toString());
        const orderCount = salonOrders.length;

        return {
            salonId: salon._id,
            salonName: `${salon.firstName} ${salon.lastName}`,
            email: salon.email,
            orderCount,
            lastOrderDate: salonOrders[0]?.createdAt || null,
            totalSpent: salonOrders.reduce((sum, o) => sum + o.total, 0)
        };
    });

    return {
        stats: {
            totalSalons: salons.length,
            totalOrders,
            pendingCommission,
            earnedCommission,
            availableBalance: agent.agentProfile.wallet.available
        },
        salons: salonInsights,
        recentOrders: orders.slice(0, 10)
    };
};
