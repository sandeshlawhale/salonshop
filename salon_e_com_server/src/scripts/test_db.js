
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/salon_e_com';
console.log('Testing connection to:', uri);

mongoose.connect(uri)
    .then(() => {
        console.log('✅ Connected successfully to local MongoDB');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    });
