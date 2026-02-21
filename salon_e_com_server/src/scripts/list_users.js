
import connectDB from '../config/db.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../v1/models/User.js';

dotenv.config();

const listUsers = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        const users = await User.find({}, 'email firstName lastName role createdAt');
        console.log('\n--- Registered Users ---');
        if (users.length === 0) {
            console.log('No users found in the database.');
        } else {
            console.table(users.map(u => ({
                Email: u.email,
                Name: `${u.firstName} ${u.lastName}`,
                Role: u.role,
                Joined: u.createdAt
            })));
        }

    } catch (error) {
        console.error('Failed to list users:', error);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        process.exit(0);
    }
};

listUsers();
