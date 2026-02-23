
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Product from '../v1/models/Product.js';
import Cart from '../v1/models/Cart.js';
import * as cartService from '../v1/services/cart.service.js';

dotenv.config();

async function runTests() {
    await connectDB();
    console.log('--- Cart Stock Verification Started ---');

    try {
        const userId = new mongoose.Types.ObjectId();

        // 1. Create a product with limited stock
        console.log('\nStep 1: Creating product with stock = 2...');
        const product = await Product.create({
            name: 'Stock Test Product',
            slug: 'stock-test-' + Date.now(),
            price: 500,
            category: 'Testing',
            inventoryCount: 2,
            status: 'ACTIVE'
        });

        // 2. Add 2 to cart (Should succeed)
        console.log('Step 2: Adding 2 items to cart (Should succeed)...');
        await cartService.addToCart(userId, product._id.toString(), 2);
        const cart1 = await cartService.getCart(userId);
        console.log(`- Cart quantity: ${cart1.items[0].quantity} (Expected: 2)`);
        console.log(`- Available stock in response: ${cart1.items[0].availableStock} (Expected: 2)`);

        // 3. Add 1 more to cart (Should fail)
        console.log('\nStep 3: Adding 1 more item (Total 3, Should fail)...');
        try {
            await cartService.addToCart(userId, product._id.toString(), 1);
            console.error('❌ Error: Added more than stock but no error thrown!');
        } catch (err) {
            console.log(`✅ Success: Caught expected error: ${err.message}`);
        }

        // 4. Update cart to 3 (Should fail)
        console.log('\nStep 4: Updating cart quantity to 3 (Should fail)...');
        try {
            await cartService.updateCartItem(userId, product._id.toString(), 3);
            console.error('❌ Error: Updated more than stock but no error thrown!');
        } catch (err) {
            console.log(`✅ Success: Caught expected error: ${err.message}`);
        }

        // 5. Update cart to 1 (Should succeed)
        console.log('\nStep 5: Updating cart quantity to 1 (Should succeed)...');
        await cartService.updateCartItem(userId, product._id.toString(), 1);
        const cart2 = await cartService.getCart(userId);
        console.log(`- Cart quantity: ${cart2.items[0].quantity} (Expected: 1)`);

        // Cleanup
        console.log('\nCleaning up test data...');
        await Product.deleteOne({ _id: product._id });
        await Cart.deleteOne({ userId });

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n--- Cart Stock Verification Finished ---');
    }
}

runTests();
