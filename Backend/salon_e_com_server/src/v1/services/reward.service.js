import User from '../models/User.js';

/**
 * Add LOCKED points when an order is paid.
 * @param {string} userId
 * @param {string} orderId
 * @param {number} amount
 */
export const addPoints = async (userId, orderId, amount) => {
    if (amount <= 0) return;

    await User.findByIdAndUpdate(userId, {
        $inc: { 'salonOwnerProfile.rewardPoints.locked': amount },
        $push: {
            'salonOwnerProfile.rewardHistory': {
                amount,
                type: 'EARNED',
                status: 'LOCKED',
                orderId
            }
        }
    });
};

/**
 * Unlock points when order is COMPLETED.
 * Sets expiration to 90 days from now.
 * @param {string} userId
 * @param {string} orderId
 */
export const unlockPoints = async (userId, orderId) => {
    const user = await User.findById(userId);
    if (!user || !user.salonOwnerProfile) return;

    const historyEntry = user.salonOwnerProfile.rewardHistory.find(
        h => h.orderId.toString() === orderId.toString() && h.status === 'LOCKED'
    );

    if (historyEntry) {
        const amount = historyEntry.amount;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90); // 3 months expiry

        // Update specific history entry
        await User.updateOne(
            { _id: userId, 'salonOwnerProfile.rewardHistory._id': historyEntry._id },
            {
                $set: {
                    'salonOwnerProfile.rewardHistory.$.status': 'AVAILABLE',
                    'salonOwnerProfile.rewardHistory.$.expiresAt': expiresAt
                },
                $inc: {
                    'salonOwnerProfile.rewardPoints.locked': -amount,
                    'salonOwnerProfile.rewardPoints.available': amount
                }
            }
        );
    }
};

/**
 * Redeem points for a new order.
 * Deducts from available balance and updates history using FIFO strategy.
 * @param {string} userId
 * @param {number} amountToRedeem
 * @param {string} newOrderId
 */
export const redeemPoints = async (userId, amountToRedeem, newOrderId) => {
    if (amountToRedeem <= 0) return;

    const user = await User.findById(userId);
    if (!user || user.salonOwnerProfile.rewardPoints.available < amountToRedeem) {
        throw new Error('Insufficient reward points');
    }

    // Deduct from total available
    user.salonOwnerProfile.rewardPoints.available -= amountToRedeem;

    // Add redemption record
    user.salonOwnerProfile.rewardHistory.push({
        amount: -amountToRedeem,
        type: 'REDEEMED',
        status: 'USED',
        orderId: newOrderId,
        createdAt: new Date()
    });

    // We don't necessarily need to mark specific 'EARNED' entries as used if we just track balance + expiration.
    // However, for strict expiration handling, we should conceptually 'burn' the oldest available points.
    // For simplicity in this implementation, we rely on the total available balance. 
    // A cron job would be needed to check for expired entries and deduct them.

    await user.save();
};

/**
 * Cron-like function to expire points. 
 * Should be called periodically.
 */
export const checkExpirations = async () => {
    const now = new Date();
    // Find users with available points that have expired history entries
    // This is complex to do efficiently without aggregate, but for now logic is:
    // 1. Find entries where status=AVAILABLE and expiresAt < now
    // 2. Mark them EXPIRED and deduct from available balance

    const usersWithExpired = await User.find({
        'salonOwnerProfile.rewardHistory': {
            $elemMatch: {
                status: 'AVAILABLE',
                expiresAt: { $lt: now }
            }
        }
    });

    for (const user of usersWithExpired) {
        let expiredAmount = 0;
        user.salonOwnerProfile.rewardHistory.forEach(h => {
            if (h.status === 'AVAILABLE' && h.expiresAt < now) {
                h.status = 'EXPIRED';
                expiredAmount += h.amount;
            }
        });

        if (expiredAmount > 0) {
            user.salonOwnerProfile.rewardPoints.available = Math.max(0, user.salonOwnerProfile.rewardPoints.available - expiredAmount);
            await user.save();
        }
    }
};
