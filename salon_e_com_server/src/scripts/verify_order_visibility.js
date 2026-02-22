
import connectDB from '../config/db.js';
import mongoose from 'mongoose';
import * as orderService from '../v1/services/order.service.js';
import User from '../v1/models/User.js';
import Order from '../v1/models/Order.js';

const verifyOrderVisibility = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        // 1. Check Admin Visibility (should see all)
        console.log('\n--- Testing Admin Order Visibility ---');
        const adminResult = await orderService.getAllOrders();
        console.log(`Total orders found by Admin: ${adminResult.count}`);

        // 2. Check Agent Visibility (should only see assigned)
        console.log('\n--- Testing Agent Order Visibility ---');
        // Find an agent if one exists, or use the seeded one if we changed its role (but we shouldn't)
        // Let's create a temporary agent and an order assigned to them
        const tempAgent = await User.findOneAndUpdate(
            { email: 'agent_test@example.com' },
            {
                email: 'agent_test@example.com',
                passwordHash: 'dummy',
                firstName: 'Test',
                lastName: 'Agent',
                role: 'AGENT',
                status: 'ACTIVE'
            },
            { upsert: true, new: true }
        );

        const otherOrder = await Order.create({
            orderNumber: `ORD-TEST-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            customerId: new mongoose.Types.ObjectId(),
            items: [{ productId: new mongoose.Types.ObjectId(), name: 'Test Product', quantity: 1, priceAtPurchase: 100 }],
            subtotal: 100,
            total: 100,
            status: 'PENDING',
            paymentMethod: 'COD'
        });

        const assignedOrder = await Order.create({
            orderNumber: `ORD-TEST-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            customerId: new mongoose.Types.ObjectId(),
            agentId: tempAgent._id,
            items: [{ productId: new mongoose.Types.ObjectId(), name: 'Test Product', quantity: 1, priceAtPurchase: 200 }],
            subtotal: 200,
            total: 200,
            status: 'PENDING',
            paymentMethod: 'COD'
        });

        const agentResult = await orderService.getAssignedOrders(tempAgent._id);
        console.log(`Total orders found by Agent: ${agentResult.count}`);

        const isCorrect = agentResult.assignedOrders.every(o => o.agentId._id.toString() === tempAgent._id.toString());
        if (isCorrect && agentResult.count > 0) {
            console.log('✅ PASS: Agent only sees assigned orders.');
        } else {
            console.log('❌ FAIL: Agent visibility logic incorrect.');
        }

        // Cleanup
        await Order.findByIdAndDelete(otherOrder._id);
        await Order.findByIdAndDelete(assignedOrder._id);
        await User.findByIdAndDelete(tempAgent._id);

    } catch (error) {
        console.error('Visibility verification failed:', error);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        process.exit(0);
    }
};

verifyOrderVisibility();
