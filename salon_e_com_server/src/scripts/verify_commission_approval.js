
import connectDB from '../config/db.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../v1/models/Order.js';
import CommissionTransaction from '../v1/models/CommissionTransaction.js';
import * as commissionService from '../v1/services/commission.service.js';

dotenv.config();

const runTest = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        // Create a dummy order for testing
        const dummyOrder = await Order.findOne({ agentId: { $ne: null } });
        if (!dummyOrder) {
            console.log('No order with agentId found for testing.');
            process.exit(0);
        }

        console.log(`Testing approveCommission for Order: ${dummyOrder.orderNumber}`);

        // Ensure a pending commission transaction exists
        let transaction = await CommissionTransaction.findOne({ orderId: dummyOrder._id });
        if (!transaction) {
            console.log('Creating a PENDING mock transaction for test...');
            transaction = await CommissionTransaction.create({
                agentId: dummyOrder.agentId,
                orderId: dummyOrder._id,
                amount: 100,
                month: '2026-02',
                status: 'PENDING'
            });
        } else {
            transaction.status = 'PENDING';
            await transaction.save();
        }

        // Call the fixed service
        await commissionService.approveCommission(dummyOrder._id);

        // Verify result
        const updatedTransaction = await CommissionTransaction.findById(transaction._id);
        console.log(`Resulting status: ${updatedTransaction.status}`);

        if (updatedTransaction.status === 'SETTLED') {
            console.log('✅ PASS: Commission approved and status set to SETTLED.');
        } else {
            console.log(`❌ FAIL: Expected status SETTLED, got ${updatedTransaction.status}`);
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

runTest();
