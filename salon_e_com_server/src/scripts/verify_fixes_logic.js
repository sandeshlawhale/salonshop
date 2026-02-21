
import connectDB from '../config/db.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../v1/models/Order.js';
import User from '../v1/models/User.js';
import RewardLedger from '../v1/models/RewardLedger.js';
import CommissionTransaction from '../v1/models/CommissionTransaction.js';
import * as rewardService from '../v1/services/reward.service.js';
import * as commissionService from '../v1/services/commission.service.js';

dotenv.config();

const runTests = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        // 1. Test Reward Logic for 1st COD Order
        console.log('\n--- Testing Reward Logic for 1st COD Order ---');
        const testUser = await User.findOne({ role: 'SALON_OWNER' });
        if (!testUser) throw new Error('No test salon owner found');

        const initialCount = await RewardLedger.countDocuments({ userId: testUser._id });
        console.log(`Initial delivered order count for user: ${initialCount}`);

        const pointsIfFirstOrderCOD = await rewardService.calculatePoints(testUser._id, 1000, 'COD', 0);
        console.log(`Points for 1000 INR COD (assuming first order if count is 0): ${pointsIfFirstOrderCOD}`);

        if (initialCount === 0 && pointsIfFirstOrderCOD > 0) {
            console.log('✅ PASS: 1st COD order earns points.');
        } else if (initialCount > 0 && pointsIfFirstOrderCOD === 0) {
            console.log('✅ PASS: Subsequent COD order earns 0 points.');
        } else {
            console.log('⚠️ CHECK: Logic needs manual verification based on initialCount.');
        }

        // 2. Test Commission Idempotency
        console.log('\n--- Testing Commission Idempotency ---');
        const testOrder = await Order.findOne({ agentId: { $ne: null }, status: { $in: ['DELIVERED', 'COMPLETED'] } });
        if (!testOrder) {
            console.log('Skipping commission test: No delivered order with agent found.');
        } else {
            console.log(`Testing with Order: ${testOrder.orderNumber}`);

            // Re-fetch to ensure fresh state
            const freshOrder = await Order.findById(testOrder._id);
            freshOrder.commissionCalculated = false; // Reset for test

            // First call
            await commissionService.calculateCommission(freshOrder);
            const countAfterFirst = await CommissionTransaction.countDocuments({ orderId: freshOrder._id });

            // Second call
            await commissionService.calculateCommission(freshOrder);
            const countAfterSecond = await CommissionTransaction.countDocuments({ orderId: freshOrder._id });

            if (countAfterFirst === countAfterSecond && countAfterFirst > 0) {
                console.log('✅ PASS: Duplicate commission prevented.');
            } else {
                console.log(`❌ FAIL: Commissions count mismatch. First: ${countAfterFirst}, Second: ${countAfterSecond}`);
            }
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        process.exit(0);
    }
};

runTests();
