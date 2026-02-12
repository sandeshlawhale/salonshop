import mongoose from 'mongoose';

let isConnected = false; // Track connection status

const connectDB = async () => {
    mongoose.set('strictQuery', true);

    if (isConnected) {
        console.log('MongoDB is already connected');
        return;
    }

    try {
        const mongoUri = 'mongodb://localhost:27017/salon_e_com';
        console.log(`📡 Attempting to connect to: ${mongoUri.substring(0, 50)}...`);
        
        const conn = await mongoose.connect('mongodb+srv://divyansh:divyansh9850364491@cluster0.gh3c5nb.mongodb.net/?appName=Cluster0', {
            dbName: "salon_e_com",
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        isConnected = true;
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('❌ Database connection error:', err.message);
        console.log('⚠️ Retrying with local MongoDB fallback...');
        
        // Fallback to localhost
        try {
            const conn = await mongoose.connect('mongodb://localhost:27017/salon_e_com', {
                dbName: "salon_e_com",
            });
            isConnected = true;
            console.log(`✅ MongoDB Connected (Fallback): ${conn.connection.host}`);
        } catch (fallbackErr) {
            console.error('❌ Fallback connection also failed:', fallbackErr.message);
        }
    }
};

export default connectDB;
