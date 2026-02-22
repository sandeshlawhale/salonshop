
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Product from '../v1/models/Product.js';
import Notification from '../v1/models/Notification.js';
import * as productService from '../v1/services/product.service.js';

dotenv.config();

async function runTests() {
    await connectDB();
    console.log('--- Product Expiry Verification Started ---');

    try {
        const now = new Date();
        const pastDate = new Date();
        pastDate.setDate(now.getDate() - 5); // 5 days ago

        const futureDate = new Date();
        futureDate.setDate(now.getDate() + 10); // 10 days from now

        // 1. Create an expired product
        console.log('\nStep 1: Creating an expired product...');
        const expiredProduct = await Product.create({
            name: 'Expired Test Product',
            slug: 'expired-test-' + Date.now(),
            price: 100,
            category: 'Testing',
            expiryDate: pastDate,
            status: 'ACTIVE'
        });

        // 2. Create a valid product
        console.log('Step 2: Creating a valid product...');
        const validProduct = await Product.create({
            name: 'Valid Test Product',
            slug: 'valid-test-' + Date.now(),
            price: 200,
            category: 'Testing',
            expiryDate: futureDate,
            status: 'ACTIVE'
        });

        // 3. Verify listProducts filters correctly
        console.log('\nStep 3: Verifying listProducts filtering...');
        const { products } = await productService.listProducts({ category: 'Testing' });

        const hasExpired = products.some(p => p._id.equals(expiredProduct._id));
        const hasValid = products.some(p => p._id.equals(validProduct._id));

        console.log(`- Expired product in list: ${hasExpired} (Expected: false)`);
        console.log(`- Valid product in list: ${hasValid} (Expected: true)`);

        // 4. Verify admin notification
        console.log('\nStep 4: Verifying admin notifications...');
        const initialNotifications = await Notification.countDocuments({ title: 'Product Expired' });

        const notifiedCount = await productService.checkAndNotifyExpiredProducts();
        console.log(`- Notified count: ${notifiedCount} (Expected: at least 1)`);

        const finalNotifications = await Notification.countDocuments({ title: 'Product Expired' });
        console.log(`- Notification created: ${finalNotifications > initialNotifications} (Expected: true)`);

        const updatedExpired = await Product.findById(expiredProduct._id);
        console.log(`- isExpiryNotified flag: ${updatedExpired.isExpiryNotified} (Expected: true)`);

        // Cleanup
        console.log('\nCleaning up test data...');
        await Product.deleteOne({ _id: expiredProduct._id });
        await Product.deleteOne({ _id: validProduct._id });
        await Notification.deleteMany({ 'metadata.productId': expiredProduct._id });

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n--- Product Expiry Verification Finished ---');
    }
}

runTests();
