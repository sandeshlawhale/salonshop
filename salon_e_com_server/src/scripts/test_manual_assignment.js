
import connectDB from '../config/db.js';
import mongoose from 'mongoose';
import User from '../v1/models/User.js';
import Order from '../v1/models/Order.js';

const testAssignment = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        const email = 'test@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ User ${email} not found.`);
            return;
        }

        // Find an unassigned order
        const order = await Order.findOne({ agentId: null });
        if (!order) {
            console.log('No unassigned orders found to test with.');
            return;
        }

        console.log(`Assigning Order ${order.orderNumber} to ${email} (ID: ${user._id})`);
        order.agentId = user._id;
        await order.save();
        console.log('✅ Successfully assigned.');

        // Verify retrieval
        const count = await Order.countDocuments({ agentId: user._id });
        console.log(`Verified count for ${email}: ${count}`);

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

testAssignment();
