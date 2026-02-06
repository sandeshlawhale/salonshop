import dotenv from 'dotenv';
dotenv.config();

// Debug: Verify env vars are loaded
console.log('=== ENV VARS CHECK ===');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? `✅ Present (${process.env.RAZORPAY_KEY_ID.substring(0, 15)}...)` : '❌ MISSING');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? `✅ Present (${process.env.RAZORPAY_KEY_SECRET.substring(0, 15)}...)` : '❌ MISSING');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Present' : '❌ MISSING');
console.log('=======================\n');

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import v1Routes from './v1/v1.routes.js';

const app = express();

// Middleware
app.use(express.json());

// CORS Configuration - Allow both local development and Vercel deployment
const allowedOrigins = [
    'http://localhost:5173',      // Local Vite dev
    'http://localhost:3000',      // Local alternative
    'https://salonshop.vercel.app' // Vercel production
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS not allowed'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Database Connection
connectDB();

// API Routes
app.use('/api/v1', v1Routes);

// Root Endpoint
app.get('/', (req, res) => {
    res.send('Salon E-Commerce API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
