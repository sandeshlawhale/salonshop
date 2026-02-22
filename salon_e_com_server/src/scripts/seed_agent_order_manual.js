
import connectDB from '../config/db.js';
import mongoose from 'mongoose';
import User from '../v1/models/User.js';
import Order from '../v1/models/Order.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const seedManualAgentTest = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        const agentEmail = 'testagent@example.com';
        const agentPassword = 'AgentPassword123!';

        // 1. Create Agent
        let agent = await User.findOne({ email: agentEmail });
        if (!agent) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(agentPassword, salt);
            agent = new User({
                email: agentEmail,
                passwordHash,
                firstName: 'Test',
                lastName: 'Agent',
                role: 'AGENT',
                status: 'ACTIVE',
                isActive: true
            });
            await agent.save();
            console.log('✅ Test Agent created');
        } else {
            console.log('Test Agent already exists');
        }

        // 2. Create Order for this Agent
        const orderNumber = `ORD-VERIFY-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        const order = new Order({
            orderNumber,
            customerId: new mongoose.Types.ObjectId(), // Synthetic customer
            agentId: agent._id,
            subtotal: 500,
            total: 500,
            status: 'PENDING',
            paymentMethod: 'COD',
            items: [{ productId: new mongoose.Types.ObjectId(), name: 'Verification Product', quantity: 1, priceAtPurchase: 500 }]
        });

        await order.save();
        console.log(`✅ Manual order ${orderNumber} created and assigned to ${agentEmail}`);

    } catch (error) {
        console.error('Failed to seed manual test data:', error);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        process.exit(0);
    }
};

seedManualAgentTest();
