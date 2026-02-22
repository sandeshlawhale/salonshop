
import connectDB from '../config/db.js';
import mongoose from 'mongoose';
import User from '../v1/models/User.js';
import Order from '../v1/models/Order.js';

const checkAgentOrders = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        const email = 'test@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ User ${email} not found.`);
            return;
        }

        console.log(`User Found:`);
        console.log(`  ID: ${user._id}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Status: ${user.status}`);

        // Check assigned orders
        const assignedOrders = await Order.find({ agentId: user._id });
        console.log(`\nExplicitly assigned orders count: ${assignedOrders.length}`);
        if (assignedOrders.length > 0) {
            assignedOrders.forEach(o => {
                console.log(`  - Order: ${o.orderNumber} (ID: ${o._id}, Status: ${o.status})`);
            });
        }

        // Check if there are ANY orders with an agentId
        const anyAssigned = await Order.find({ agentId: { $ne: null } }).populate('agentId', 'email');
        console.log(`\nTotal orders in DB with ANY agentId: ${anyAssigned.length}`);
        if (anyAssigned.length > 0) {
            anyAssigned.forEach(o => {
                console.log(`  - Order: ${o.orderNumber}, Agent: ${o.agentId?.email || 'Unknown Agent'}`);
            });
        }

    } catch (error) {
        console.error('Check failed:', error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

checkAgentOrders();
