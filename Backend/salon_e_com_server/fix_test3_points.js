
import mongoose from 'mongoose';
import User from './src/v1/models/User.js';
import Order from './src/v1/models/Order.js';
import * as rewardService from './src/v1/services/reward.service.js';

const fixPoints = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/salon_e_com');
        console.log('Connected to DB');

        const email = 'test3@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log(`Processing points for ${user.email} (${user._id})...`);

        const orders = await Order.find({
            customerId: user._id,
            status: { $in: ['PAID', 'COMPLETED', 'DELIVERED'] }
        });

        for (const order of orders) {
            console.log(`Checking Order ${order.orderNumber} (Status: ${order.status}, Total: ${order.total})...`);

            // Force Update if user has 0 available points and 0 locked points (checking sync issue)
            if (user.salonOwnerProfile.rewardPoints.available === 0 && user.salonOwnerProfile.rewardPoints.locked === 0) {
                console.log(`  - User has 0 points but Order has ${order.salonRewardPoints.earned}. FORCING SYNC...`);

                // 2. Add Points to User (Locked)
                await rewardService.addPoints(user._id, order._id, order.salonRewardPoints.earned);
                console.log(`  - Points added to user (LOCKED).`);

                // 3. Unlock if Completed
                if (order.status === 'COMPLETED' || order.status === 'DELIVERED') {
                    await rewardService.unlockPoints(user._id, order._id);
                    console.log(`  - Points UNLOCKED.`);
                }
                continue;
            }

            if (order.salonRewardPoints && order.salonRewardPoints.earned > 0) {
                console.log(`  - Points already earned: ${order.salonRewardPoints.earned}. Skipping.`);

                // Ensure they are unlocked if completed
                if (order.status === 'COMPLETED') {
                    // We could check if they are actually unlocked (AVAILABLE) in user history, but let's trust the flow for now.
                    // Or better, force unlock if needed? 
                    // Let's just focus on crediting 0-point orders first.
                }
                continue;
            }

            // Calculate points
            const pointsToEarn = Math.floor(order.total);
            console.log(`  - Missing ${pointsToEarn} points. Fixing...`);

            if (pointsToEarn > 0) {
                // 1. Update Order
                order.salonRewardPoints = {
                    ...order.salonRewardPoints,
                    earned: pointsToEarn
                };
                await order.save();
                console.log(`  - Order updated.`);

                // 2. Add Points to User (Locked)
                await rewardService.addPoints(user._id, order._id, pointsToEarn);
                console.log(`  - Points added to user (LOCKED).`);

                // 3. Unlock if Completed
                if (order.status === 'COMPLETED' || order.status === 'DELIVERED') {
                    await rewardService.unlockPoints(user._id, order._id);
                    console.log(`  - Points UNLOCKED.`);
                }
            }
        }

        console.log('Done!');

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

fixPoints();
