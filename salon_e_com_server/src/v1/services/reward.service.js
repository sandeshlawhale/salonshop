import User from '../models/User.js';
import * as notificationService from './notification.service.js';

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

export const unlockPoints = async (userId, orderId) => {
    const user = await User.findById(userId);
    if (!user || !user.salonOwnerProfile) return;

    const historyEntry = user.salonOwnerProfile.rewardHistory.find(
        h => h.orderId.toString() === orderId.toString() && h.status === 'LOCKED'
    );

    if (historyEntry) {
        const amount = historyEntry.amount;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90);

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

        // Trigger Notification
        await notificationService.createNotification({
            userId,
            title: 'Reward Points Unlocked',
            description: `${amount} points from order #${orderId.toString().slice(-6).toUpperCase()} are now available for use.`,
            type: 'REWARD',
            actionText: 'View History',
            actionLink: '/agent-rewards'
        });
    }
};

export const redeemPoints = async (userId, amountToRedeem, newOrderId) => {
    if (amountToRedeem <= 0) return;

    const user = await User.findById(userId);
    if (!user || user.salonOwnerProfile.rewardPoints.available < amountToRedeem) {
        throw new Error('Insufficient reward points');
    }

    user.salonOwnerProfile.rewardPoints.available -= amountToRedeem;

    user.salonOwnerProfile.rewardHistory.push({
        amount: -amountToRedeem,
        type: 'REDEEMED',
        status: 'USED',
        orderId: newOrderId,
        createdAt: new Date()
    });

    await user.save();
};

export const checkExpirations = async () => {
    const now = new Date();

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

            // Trigger Notification
            await notificationService.createNotification({
                userId: user._id,
                title: 'Reward Points Expired',
                description: `${expiredAmount} points have expired from your account.`,
                type: 'REWARD',
                priority: 'MEDIUM'
            });
        }
    }
};
