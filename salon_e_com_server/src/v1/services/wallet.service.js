import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import * as notificationService from './notification.service.js';

export const creditOrderRewards = async (order) => {
    if (order.agentId && order.agentCommission && !order.agentCommission.isCredited) {
        const agent = await User.findById(order.agentId);
        if (agent) {
            if (!agent.agentProfile) {
                agent.agentProfile = {
                    commissionRate: 0.10,
                    totalEarnings: 0,
                    wallet: { pending: 0, available: 0 },
                    points: 0
                };
            }
            if (!agent.agentProfile.wallet) agent.agentProfile.wallet = { pending: 0, available: 0 };

            agent.agentProfile.wallet.pending += order.agentCommission.amount;
            await agent.save();

            await WalletTransaction.create({
                userId: agent._id,
                orderId: order._id,
                type: 'COMMISSION_PENDING',
                amount: order.agentCommission.amount,
                status: 'COMPLETED',
                description: `Commission tracked for order ${order.orderNumber}`
            });

            order.agentCommission.isCredited = true;

            // Trigger Notification for Agent
            await notificationService.createNotification({
                userId: agent._id,
                title: 'New Commission Tracked',
                description: `₹${order.agentCommission.amount} commission is pending for order #${order.orderNumber?.split('-')[2] || order._id.slice(-6).toUpperCase()}.`,
                type: 'COMMISSION',
                metadata: { orderId: order._id }
            });
        }
    }

    if (order.customerId && order.salonRewardPoints && !order.salonRewardPoints.isCredited) {
        const salon = await User.findById(order.customerId);
        if (salon) {
            if (!salon.salonOwnerProfile) {
                salon.salonOwnerProfile = {
                    rewardPoints: { locked: 0, available: 0 },
                    rewardHistory: [],
                    shippingAddresses: []
                };
            }
            if (!salon.salonOwnerProfile.rewardPoints) salon.salonOwnerProfile.rewardPoints = { locked: 0, available: 0 };

            salon.salonOwnerProfile.rewardPoints.locked += order.salonRewardPoints.earned;
            await salon.save();

            await WalletTransaction.create({
                userId: salon._id,
                orderId: order._id,
                type: 'REWARD_LOCKED',
                amount: order.salonRewardPoints.earned,
                status: 'COMPLETED',
                description: `Locked reward points for order ${order.orderNumber}`
            });

            order.salonRewardPoints.isCredited = true;

            // Trigger Notification for Salon Owner
            await notificationService.createNotification({
                userId: salon._id,
                title: 'Reward Points Earned',
                description: `You earned ${order.salonRewardPoints.earned} locked points from your recent purchase.`,
                type: 'REWARD',
                metadata: { orderId: order._id }
            });
        }
    }

    await order.save();
};

export const unlockOrderRewards = async (order) => {
    if (order.agentId && order.agentCommission && order.agentCommission.isCredited) {
        const agent = await User.findById(order.agentId);
        if (agent) {
            if (!agent.agentProfile) {
                agent.agentProfile = {
                    commissionRate: 0.10,
                    totalEarnings: 0,
                    wallet: { pending: 0, available: 0 },
                    points: 0
                };
            }
            if (!agent.agentProfile.wallet) agent.agentProfile.wallet = { pending: 0, available: 0 };

            if (agent.agentProfile.wallet.pending >= order.agentCommission.amount) {
                agent.agentProfile.wallet.pending -= order.agentCommission.amount;
                agent.agentProfile.wallet.available += order.agentCommission.amount;
                await agent.save();

                await WalletTransaction.create({
                    userId: agent._id,
                    orderId: order._id,
                    type: 'COMMISSION_AVAILABLE',
                    amount: order.agentCommission.amount,
                    status: 'COMPLETED',
                    description: `Commission settled for order ${order.orderNumber}`
                });

                // Trigger Notification
                await notificationService.createNotification({
                    userId: agent._id,
                    title: 'Commission Credited',
                    description: `₹${order.agentCommission.amount} has been moved to your available balance.`,
                    type: 'COMMISSION',
                    priority: 'HIGH'
                });
            }
        }

        if (order.customerId && order.salonRewardPoints && order.salonRewardPoints.isCredited) {
            const salon = await User.findById(order.customerId);
            if (salon && salon.salonOwnerProfile.rewardPoints.locked >= order.salonRewardPoints.earned) {
            }
        }
    }
}

export const reconcileMaturedPoints = async (userId) => {
    const user = await User.findById(userId);
    if (!user || user.role !== 'SALON_OWNER') return;

    const maturityDate = new Date();
    maturityDate.setDate(maturityDate.getDate() - 90);

    const lockedTransactions = await WalletTransaction.find({
        userId,
        type: 'REWARD_LOCKED',
        createdAt: { $lte: maturityDate }
    });

    let totalToMaturate = 0;
    for (const trx of lockedTransactions) {
        const alreadyMatured = await WalletTransaction.findOne({
            userId,
            orderId: trx.orderId,
            type: 'REWARD_UNLOCKED'
        });

        if (!alreadyMatured) {
            totalToMaturate += trx.amount;

            await WalletTransaction.create({
                userId,
                orderId: trx.orderId,
                type: 'REWARD_UNLOCKED',
                amount: trx.amount,
                status: 'COMPLETED',
                description: `Reward matured from order ${trx.orderId}`
            });
        }
    }

    if (totalToMaturate > 0) {
        const amountToMove = Math.min(user.salonOwnerProfile.rewardPoints.locked, totalToMaturate);
        user.salonOwnerProfile.rewardPoints.locked -= amountToMove;
        user.salonOwnerProfile.rewardPoints.available += totalToMaturate;
        await user.save();
    }
};

export const redeemPoints = async (userId, amount, orderId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.salonOwnerProfile.rewardPoints.available < amount) {
        throw new Error('Insufficient available points');
    }

    user.salonOwnerProfile.rewardPoints.available -= amount;
    await user.save();

    await WalletTransaction.create({
        userId,
        orderId,
        type: 'REWARD_REDEEMED',
        amount,
        status: 'COMPLETED',
        description: `Points redeemed for order discount`
    });
};

// REMOVED: requestPayout (Legacy)
// REMOVED: approvePayout (Legacy)
// REMOVED: processMonthlyDisbursements (Legacy)
