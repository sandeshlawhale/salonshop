
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../v1/models/User.js';
import Order from '../v1/models/Order.js';
import * as rewardService from '../v1/services/reward.service.js';
import * as commissionService from '../v1/services/commission.service.js';

dotenv.config();

async function runTests() {
    await connectDB();
    console.log('--- Verification Started ---');

    try {
        const userId = new mongoose.Types.ObjectId();
        const agentId = new mongoose.Types.ObjectId();

        console.log('\n--- REWARD TESTS ---');

        // Test Scenario 1: First Order @ 500 + ONLINE
        // We mock getDeliveredOrderCount by ensuring no RewardLedger exists for this userId
        console.log('Scenario 1: First Order @ 500 + ONLINE');
        const points1 = await rewardService.calculatePoints(userId, 500, 'ONLINE', 0);
        console.log(`Rewards: ${points1} (Expected: 50)`);

        // Test Scenario 2: Subsequent Order @ 500 + ONLINE
        // We need to simulate a delivered order. calculatePoints calls getDeliveredOrderCount which checks RewardLedger.
        console.log('Scenario 2: Subsequent Order (Mocked) @ 500 + ONLINE');
        // Let's create a fake RewardLedger entry for this user
        const RewardLedger = (await import('../v1/models/RewardLedger.js')).default;
        await RewardLedger.create({
            userId,
            orderId: new mongoose.Types.ObjectId(),
            pointsEarned: 100,
            pointsRemaining: 100,
            status: 'ACTIVE',
            expiresAt: new Date()
        });

        const points2 = await rewardService.calculatePoints(userId, 500, 'ONLINE', 0);
        console.log(`Rewards: ${points2} (Expected: 0)`);

        // Test Scenario 3: Subsequent Order @ 1500 + ONLINE
        console.log('Scenario 3: Subsequent Order (Mocked) @ 1500 + ONLINE');
        const points3 = await rewardService.calculatePoints(userId, 1500, 'ONLINE', 0);
        console.log(`Rewards: ${points3} (Expected: 150)`);

        console.log('\n--- COMMISSION TESTS ---');

        // Test Scenario 4: Any Order @ 500 + ONLINE
        console.log('Scenario 4: Any Order @ 500 + ONLINE');
        const order4 = { agentId, total: 500, paymentMethod: 'ONLINE', status: 'COMPLETED' };
        const comm4 = await commissionService.calculateCommission(order4);
        console.log(`Commission Transaction Created: ${!!comm4} (Expected: false)`);

        // Test Scenario 5: Any Order @ 1500 + ONLINE
        console.log('Scenario 5: Any Order @ 1500 + ONLINE');
        // Need real agent
        const agent = await User.create({
            firstName: 'Test',
            lastName: 'Agent',
            email: 'testagent' + Date.now() + '@example.com',
            passwordHash: 'hash',
            role: 'AGENT',
            agentProfile: { totalEarnings: 0, currentMonthEarnings: 0 }
        });

        const order5 = await Order.create({
            orderNumber: 'TEST-' + Date.now(),
            customerId: userId,
            agentId: agent._id,
            subtotal: 1500,
            total: 1500,
            paymentMethod: 'ONLINE',
            status: 'COMPLETED'
        });

        const comm5 = await commissionService.calculateCommission(order5);
        console.log(`Commission Transaction Created: ${!!comm5} (Expected: true)`);

        // Cleanup
        await User.deleteOne({ _id: agent._id });
        await Order.deleteOne({ _id: order5._id });
        await RewardLedger.deleteMany({ userId });
        if (comm5) {
            const CommissionTransaction = (await import('../v1/models/CommissionTransaction.js')).default;
            await CommissionTransaction.deleteOne({ _id: comm5._id });
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n--- Verification Finished ---');
    }
}

runTests();
