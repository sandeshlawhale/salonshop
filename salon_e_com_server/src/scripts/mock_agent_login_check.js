
import connectDB from '../config/db.js';
import mongoose from 'mongoose';
import * as orderService from '../v1/services/order.service.js';
import User from '../v1/models/User.js';

const mockAgentLogin = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        const email = 'test@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ User ${email} not found.`);
            return;
        }

        console.log(`Mocking Login for ${email} (ID: ${user._id})`);

        // This is what the controller calls
        const result = await orderService.getAssignedOrders(user._id);

        console.log(`\nResponse from orderService.getAssignedOrders:`);
        console.log(`Count: ${result.count}`);
        console.log(`Orders Length: ${result.assignedOrders.length}`);

        if (result.assignedOrders.length > 0) {
            result.assignedOrders.forEach(o => {
                console.log(`  - Order: ${o.orderNumber}, Status: ${o.status}`);
            });
        } else {
            console.log('No orders returned for this agent.');
        }

    } catch (error) {
        console.error('Mock login failed:', error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

mockAgentLogin();
