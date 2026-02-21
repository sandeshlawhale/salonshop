
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

        const adminEmail = 'admin@salon.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin already exists.');
        } else {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash('admin123', salt);

            await User.create({
                email: adminEmail,
                passwordHash,
                firstName: 'System',
                lastName: 'Admin',
                role: 'ADMIN',
                status: 'ACTIVE'
            });
            console.log('Admin account created successfully!');
            console.log('Email: admin@salon.com');
            console.log('Password: admin123');
        }

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
