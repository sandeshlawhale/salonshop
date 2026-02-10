
import mongoose from 'mongoose';
import User from './src/v1/models/User.js';

const checkStatus = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/salon_e_com');
        console.log('Connected to DB');

        const email = 'test3@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log('User Profile Points:', JSON.stringify(user.salonOwnerProfile.rewardPoints, null, 2));
        console.log('User Reward History:', JSON.stringify(user.salonOwnerProfile.rewardHistory, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

checkStatus();
