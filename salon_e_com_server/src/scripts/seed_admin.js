
import connectDB from '../config/db.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../v1/models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        const email = 'admin@salonpro.com';
        const password = 'AdminPassword123!';

        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            console.log('Admin user already exists.');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const admin = new User({
            email,
            passwordHash,
            firstName: 'System',
            lastName: 'Admin',
            role: 'ADMIN',
            status: 'ACTIVE',
            isActive: true
        });

        await admin.save();
        console.log('✅ Admin user seeded successfully');
        console.log('Email:', email);
        console.log('Password:', password);

    } catch (error) {
        console.error('Failed to seed admin:', error);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        process.exit(0);
    }
};

seedAdmin();
