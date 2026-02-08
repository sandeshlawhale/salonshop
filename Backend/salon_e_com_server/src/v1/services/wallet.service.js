import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';

export const creditOrderRewards = async (order) => {
    // 1. Credit Agent Commission
    if (order.agentId && order.agentCommission && !order.agentCommission.isCredited) {
        const agent = await User.findById(order.agentId);
        if (agent) {
            // Update agent's pending wallet
            agent.agentProfile.wallet.pending += order.agentCommission.amount;
            await agent.save();

            // Create transaction record
            await WalletTransaction.create({
                userId: agent._id,
                orderId: order._id,
                type: 'COMMISSION_PENDING',
                amount: order.agentCommission.amount,
                status: 'COMPLETED',
                description: `Pending commission for order ${order.orderNumber}`
            });

            order.agentCommission.isCredited = true;
        }
    }

    // 2. Credit Salon Owner Reward Points
    if (order.customerId && order.salonRewardPoints && !order.salonRewardPoints.isCredited) {
        const salon = await User.findById(order.customerId);
        if (salon) {
            // Update salon's locked reward points
            salon.salonOwnerProfile.rewardPoints.locked += order.salonRewardPoints.amount;
            await salon.save();

            // Create transaction record
            await WalletTransaction.create({
                userId: salon._id,
                orderId: order._id,
                type: 'REWARD_LOCKED',
                amount: order.salonRewardPoints.amount,
                status: 'COMPLETED',
                description: `Locked reward points for order ${order.orderNumber}`
            });

            order.salonRewardPoints.isCredited = true;
        }
    }

    await order.save();
};

export const unlockOrderRewards = async (order) => {
    // 1. Unlock Agent Commission
    if (order.agentId && order.agentCommission && order.agentCommission.isCredited) {
        const agent = await User.findById(order.agentId);
        if (agent && agent.agentProfile.wallet.pending >= order.agentCommission.amount) {
            // Move from pending to available
            agent.agentProfile.wallet.pending -= order.agentCommission.amount;
            agent.agentProfile.wallet.available += order.agentCommission.amount;
            await agent.save();

            // Create transaction record
            await WalletTransaction.create({
                userId: agent._id,
                orderId: order._id,
                type: 'COMMISSION_AVAILABLE',
                amount: order.agentCommission.amount,
                status: 'COMPLETED',
                description: `Commission cleared for order ${order.orderNumber}`
            });
        }
    }

    // 2. Unlock Salon Owner Reward Points
    if (order.customerId && order.salonRewardPoints && order.salonRewardPoints.isCredited) {
        const salon = await User.findById(order.customerId);
        if (salon && salon.salonOwnerProfile.rewardPoints.locked >= order.salonRewardPoints.amount) {
            // Move from locked to available (Wait, we still use locked for 90 days?)
            // Actually, based on the new plan: 
            // - Order completed -> locked
            // - 90 days later -> available
            // So unlockOrderRewards should just ensure it stays in locked if it's already there?
            // Wait, currently unlockOrderRewards moves it to points (which I renamed to available).
            // But the user said "points will stay in owner's wallet after 90 days".
            // So:
            // 1. Order Paid -> creditOrderRewards (Set points as isCredited: true and add to locked)
            // 2. 90 days later -> reconcile logic moves from locked to available.
            // So unlockOrderRewards doesn't need to move points anymore?
            // Actually, unlockOrderRewards was for DELIVERED/COMPLETED status.
            // If order is completed, we just confirm it's credited.
            // The 90 days starts from creation/completion.
            // Let's refine this: creditOrderRewards adds to LOCKED.
            // unlockOrderRewards confirms the status but keeps it in LOCKED.
            // reconcile moves from LOCKED to AVAILABLE.

            // Actually, looking at salonOwnerProfile.rewardPoints: it has locked and available.
            // creditOrderRewards should add to locked.
            // The 90-day timer starts from the transaction date.
        }
    }
};

export const reconcileMaturedPoints = async (userId) => {
    const user = await User.findById(userId);
    if (!user || user.role !== 'SALON_OWNER') return;

    // 90 days ago
    const maturityDate = new Date();
    maturityDate.setDate(maturityDate.getDate() - 90);

    // Find all REWARD_LOCKED transactions that haven't been unlocked yet
    // To track this, we look for REWARD_LOCKED that don't have a corresponding REWARD_UNLOCKED for that order
    const lockedTransactions = await WalletTransaction.find({
        userId,
        type: 'REWARD_LOCKED',
        createdAt: { $lte: maturityDate }
    });

    let totalToMaturate = 0;
    for (const trx of lockedTransactions) {
        // Check if already matured
        const alreadyMatured = await WalletTransaction.findOne({
            userId,
            orderId: trx.orderId,
            type: 'REWARD_UNLOCKED'
        });

        if (!alreadyMatured) {
            totalToMaturate += trx.amount;

            // Mark as matured by creating REWARD_UNLOCKED
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
        // Move from locked to available
        // Ensure we don't go below 0 for locked (safety)
        const amountToMove = Math.min(user.salonOwnerProfile.rewardPoints.locked, totalToMaturate);
        user.salonOwnerProfile.rewardPoints.locked -= amountToMove;
        user.salonOwnerProfile.rewardPoints.available += totalToMaturate;
        await user.save();
        console.log(`[wallet] Recounciled ${totalToMaturate} points for user ${userId}`);
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

export const requestPayout = async (agentId, amount) => {
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'AGENT') throw new Error('Agent not found');

    if (agent.agentProfile.wallet.available < amount) {
        throw new Error('Insufficient available balance');
    }

    // Deduct from available immediately to prevent double spending
    agent.agentProfile.wallet.available -= amount;
    await agent.save();

    return await WalletTransaction.create({
        userId: agentId,
        type: 'PAYOUT_REQUEST',
        amount,
        status: 'PENDING',
        description: 'Monthly payout request'
    });
};

export const approvePayout = async (transactionId) => {
    const transaction = await WalletTransaction.findById(transactionId);
    if (!transaction || transaction.type !== 'PAYOUT_REQUEST') throw new Error('Invalid transaction');
    if (transaction.status !== 'PENDING') throw new Error('Transaction already processed');

    transaction.status = 'COMPLETED';
    await transaction.save();
    return transaction;
};

// Background task logic (conceptual for now, would be a cron job)
export const processUnlockedRewards = async () => {
    // Find locked rewards older than 3 months and move to unlocked
    // Find pending commissions and move to available (e.g. after return period)
    // For this implementation, we'll provide the logic but it needs a trigger.
};
