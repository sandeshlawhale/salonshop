import mongoose from 'mongoose';
import * as cartService from '../v1/services/cart.service.js';
import * as orderService from '../v1/services/order.service.js';
import Product from '../v1/models/Product.js';
import User from '../v1/models/User.js';
import Cart from '../v1/models/Cart.js';
import Order from '../v1/models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

async function runTest() {
    try {
        console.log('--- Database Connection ---');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Setup Test Data
        const testUser = await User.findOne({ role: 'SALON_OWNER' }) || await User.create({
            firstName: 'Test',
            lastName: 'User',
            email: `test_${Date.now()}@example.com`,
            password: 'password123',
            role: 'SALON_OWNER'
        });

        const testProduct = await Product.create({
            name: `Stock Test Product ${Date.now()}`,
            slug: `stock-test-${Date.now()}`,
            price: 100,
            inventoryCount: 15, // Starting Stock
            status: 'ACTIVE',
            category: 'Testing'
        });

        const userId = testUser._id;
        const productId = testProduct._id;

        console.log(`Starting Stock: ${testProduct.inventoryCount}`);

        // 1. Add 5 items to cart
        console.log('\n1. Adding 5 items to cart...');
        await cartService.addToCart(userId, productId.toString(), 5);
        let updatedProduct = await Product.findById(productId);
        console.log(`Stock after add: ${updatedProduct.inventoryCount} (Expected: 10)`);
        if (updatedProduct.inventoryCount !== 10) throw new Error('Add to cart stock deduction failed');

        // 2. Update quantity to 2
        console.log('\n2. Updating quantity to 2...');
        await cartService.updateCartItem(userId, productId.toString(), 2);
        updatedProduct = await Product.findById(productId);
        console.log(`Stock after update (5 -> 2): ${updatedProduct.inventoryCount} (Expected: 13)`);
        if (updatedProduct.inventoryCount !== 13) throw new Error('Update cart stock restoration failed');

        // 3. Add 3 more (Total 5)
        console.log('\n3. Adding 3 more items...');
        await cartService.addToCart(userId, productId.toString(), 3);
        updatedProduct = await Product.findById(productId);
        console.log(`Stock after adding 3: ${updatedProduct.inventoryCount} (Expected: 10)`);

        // 4. Create Order (Stock should NOT be deducted again)
        console.log('\n4. Creating order...');
        const orderData = {
            items: [{ productId: productId.toString(), quantity: 5 }],
            shippingAddress: { street: 'Test St', city: 'Test City', zip: '12345' },
            paymentMethod: 'ONLINE'
        };
        const order = await orderService.createOrder(userId, orderData);
        updatedProduct = await Product.findById(productId);
        console.log(`Stock after order creation: ${updatedProduct.inventoryCount} (Expected: 10)`);
        if (updatedProduct.inventoryCount !== 10) throw new Error('Order creation double-deducted stock');

        // 5. Cancel Order (Stock should be restored)
        console.log('\n5. Cancelling order...');
        await orderService.updateOrderStatus(order._id, 'CANCELLED');
        updatedProduct = await Product.findById(productId);
        console.log(`Stock after cancellation: ${updatedProduct.inventoryCount} (Expected: 15)`);
        if (updatedProduct.inventoryCount !== 15) throw new Error('Order cancellation stock restoration failed');

        // 6. Test Clear Cart
        console.log('\n6. Testing Clear Cart stock restoration...');
        await Cart.deleteOne({ userId }); // Clean start for cart
        await cartService.addToCart(userId, productId.toString(), 10);
        updatedProduct = await Product.findById(productId);
        console.log(`Stock after add 10: ${updatedProduct.inventoryCount} (Expected: 5)`);

        await cartService.clearCart(userId);
        updatedProduct = await Product.findById(productId);
        console.log(`Stock after clear cart: ${updatedProduct.inventoryCount} (Expected: 15)`);
        if (updatedProduct.inventoryCount !== 15) throw new Error('Clear cart stock restoration failed');

        console.log('\n✅ ALL STOCK RESERVATION TESTS PASSED!');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

runTest();
