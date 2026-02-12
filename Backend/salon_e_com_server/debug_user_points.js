
import mongoose from 'mongoose';
import User from './src/v1/models/User.js';
import Order from './src/v1/models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

const debugUser = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/salon_e_com');
        console.log('Connected to DB');

        const email = 'test3@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found:', email);
            const allUsers = await User.find({}, 'email firstName lastName');
            console.log('All Users:', allUsers.map(u => u.email));
            return;
        }

        console.log('User Found:', {
            id: user._id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            rewardPoints: user.salonOwnerProfile?.rewardPoints,
            rewardHistory: user.salonOwnerProfile?.rewardHistory
        });

        const orders = await Order.find({ customerId: user._id });
        console.log(`Found ${orders.length} orders for user.`);

        orders.forEach(o => {
            console.log('Order:', {
                id: o._id,
                orderNumber: o.orderNumber,
                status: o.status,
                total: o.total,
                salonRewardPoints: o.salonRewardPoints,
                createdAt: o.createdAt
            });
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

debugUser();
