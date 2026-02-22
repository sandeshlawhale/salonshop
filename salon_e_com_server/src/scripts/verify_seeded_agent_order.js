
import connectDB from '../config/db.js';
import mongoose from 'mongoose';
import * as orderService from '../v1/services/order.service.js';
import User from '../v1/models/User.js';

const verifySeededOrder = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        const agentEmail = 'testagent@example.com';
        const agent = await User.findOne({ email: agentEmail });

        if (!agent) {
            console.error('❌ Test agent not found');
            process.exit(1);
        }

        console.log(`Verifying orders for agent: ${agent._id} (${agentEmail})`);
        const result = await orderService.getAssignedOrders(agent._id);

        console.log(`Total orders found: ${result.count}`);

        const seededOrder = result.assignedOrders.find(o => o.orderNumber.startsWith('ORD-VERIFY-'));

        if (seededOrder) {
            console.log(`✅ SUCCESS: Found seeded order ${seededOrder.orderNumber}`);
            console.log(`Order Details: Total=${seededOrder.total}, Status=${seededOrder.status}`);
        } else {
            console.log('❌ FAILURE: Seeded order not found in agent\'s list');
            console.log('Available orders:', result.assignedOrders.map(o => o.orderNumber));
        }

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        process.exit(0);
    }
};

verifySeededOrder();
