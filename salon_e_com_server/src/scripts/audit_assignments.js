
import connectDB from '../config/db.js';
import mongoose from 'mongoose';
import User from '../v1/models/User.js';
import Order from '../v1/models/Order.js';

const auditAssignments = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        const agents = await User.find({ role: 'AGENT' });
        console.log('\n--- AGENTS IN SYSTEM ---');
        agents.forEach(a => {
            console.log(`Email: ${a.email}, ID: ${a._id}, Name: ${a.firstName} ${a.lastName}`);
        });

        const orders = await Order.find({}).populate('agentId', 'email');
        console.log('\n--- ALL ORDERS AND ASSIGNMENTS ---');
        orders.forEach(o => {
            console.log(`Order: ${o.orderNumber}, AgentId field: ${o.agentId?._id || o.agentId || 'NULL'}, Agent Email: ${o.agentId?.email || 'N/A'}`);
        });

    } catch (error) {
        console.error('Audit failed:', error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

auditAssignments();
