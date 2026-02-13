import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/v1/models/Product.js';
import User from './src/v1/models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const sampleProducts = [
    {
        name: 'Professional Argan Oil 100ml',
        slug: 'product-1',
        description: 'Premium Argan Oil for professional salon use',
        price: 799,
        originalPrice: 999,
        costPerItem: 400,
        sku: 'ARGAN-001',
        inventoryCount: 50,
        category: 'Hair Care',
        tags: ['pro-grade', 'hair-care'],
        images: ['https://images.unsplash.com/photo-1585110396000-c9ffd4d4b35c?w=500&h=500&fit=crop'],
        status: 'ACTIVE'
    },
    {
        name: 'Ceramic Hair Straightener',
        slug: 'product-2',
        description: 'Professional ceramic straightener with temperature control',
        price: 2499,
        originalPrice: 3499,
        costPerItem: 1200,
        sku: 'STRAIGHT-001',
        inventoryCount: 30,
        category: 'Hair Care',
        tags: ['tools', 'professional'],
        images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop'],
        status: 'ACTIVE'
    },
    {
        name: 'Premium Hair Dryer',
        slug: 'product-3',
        description: 'High-speed professional hair dryer',
        price: 3999,
        originalPrice: 4999,
        costPerItem: 2000,
        sku: 'DRYER-001',
        inventoryCount: 25,
        category: 'Hair Care',
        tags: ['tools', 'professional'],
        images: ['https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&h=500&fit=crop'],
        status: 'ACTIVE'
    },
    {
        name: 'Hydrating Face Serum',
        slug: 'product-4',
        description: 'Professional grade hydrating serum for all skin types',
        price: 1499,
        originalPrice: 1999,
        costPerItem: 700,
        sku: 'SERUM-001',
        inventoryCount: 60,
        category: 'Skin Care',
        tags: ['skincare', 'serum'],
        images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop'],
        status: 'ACTIVE'
    },
    {
        name: 'Vitamin C Face Wash',
        slug: 'product-5',
        description: 'Brightening face wash with vitamin C',
        price: 549,
        originalPrice: 799,
        costPerItem: 250,
        sku: 'WASH-001',
        inventoryCount: 100,
        category: 'Skin Care',
        tags: ['skincare', 'cleanser'],
        images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop'],
        status: 'ACTIVE'
    },
    {
        name: 'Professional Nail Kit',
        slug: 'product-6',
        description: 'Complete nail care kit for professionals',
        price: 2299,
        originalPrice: 2999,
        costPerItem: 1100,
        sku: 'NAIL-001',
        inventoryCount: 40,
        category: 'Nails',
        tags: ['nails', 'tools'],
        images: ['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&h=500&fit=crop'],
        status: 'ACTIVE'
    },
    {
        name: 'LED Nail Lamp',
        slug: 'product-7',
        description: 'Professional LED lamp for gel nails',
        price: 1999,
        originalPrice: 2499,
        costPerItem: 900,
        sku: 'LAMP-001',
        inventoryCount: 35,
        category: 'Nails',
        tags: ['nails', 'tools'],
        images: ['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&h=500&fit=crop'],
        status: 'ACTIVE'
    },
    {
        name: 'Professional Makeup Brush Set',
        slug: 'product-8',
        description: 'Complete set of 24 professional makeup brushes',
        price: 3499,
        originalPrice: 4999,
        costPerItem: 1600,
        sku: 'BRUSH-001',
        inventoryCount: 20,
        category: 'Makeup',
        tags: ['makeup', 'brushes'],
        images: ['https://images.unsplash.com/photo-1596462502278-af242a95ae5a?w=500&h=500&fit=crop'],
        status: 'ACTIVE'
    },
    {
        name: 'Luxury Facial Spa Chair',
        slug: 'product-9',
        description: 'Premium facial chair with electric recliner',
        price: 24999,
        originalPrice: 29999,
        costPerItem: 12000,
        sku: 'CHAIR-001',
        inventoryCount: 5,
        category: 'Furniture',
        tags: ['furniture', 'salon'],
        images: ['https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&h=500&fit=crop'],
        status: 'ACTIVE'
    },
    {
        name: 'Professional Shampoo 500ml',
        slug: 'product-10',
        description: 'Sulfate-free professional grade shampoo',
        price: 849,
        originalPrice: 1199,
        costPerItem: 400,
        sku: 'SHAMP-001',
        inventoryCount: 80,
        category: 'Hair Care',
        tags: ['haircare', 'shampoo'],
        images: ['https://images.unsplash.com/photo-1585110396000-c9ffd4d4b35c?w=500&h=500&fit=crop'],
        status: 'ACTIVE'
    }
];

const seedDatabase = async () => {
    try {
        const mongoUri = 'mongodb+srv://divyansh:divyansh9850364491@cluster0.gh3c5nb.mongodb.net/?appName=Cluster0' || 'mongodb://localhost:27017';

        await mongoose.connect(mongoUri, {
            dbName: 'salon_e_com',
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB - salon_e_com database');

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Insert sample products
        const insertedProducts = await Product.insertMany(sampleProducts);
        console.log(`✅ Successfully seeded ${insertedProducts.length} products!`);

        // Display inserted product IDs
        insertedProducts.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name} (ID: ${product._id})`);
        });

        // Ensure categories exist for seeded products
        try {
            const Category = (await import('./src/v1/models/Category.js')).default;
            const uniqueCategories = [...new Set(sampleProducts.map(p => p.category).filter(Boolean))];
            for (const name of uniqueCategories) {
                const existing = await Category.findOne({ name });
                if (!existing) {
                    await Category.create({ name });
                    console.log(`Created category: ${name}`);
                }
            }
        } catch (catErr) {
            console.warn('Failed to seed categories:', catErr.message || catErr);
        }

        // Create admin user if not exists
        const adminEmail = 'bharbatdivyansh1@gmail.com';
        const adminPassword = '9850364491';
        const adminExists = await User.findOne({ email: adminEmail });
        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(adminPassword, salt);
            const admin = await User.create({
                email: adminEmail,
                passwordHash,
                firstName: 'Divyansh',
                lastName: 'Bharbat',
                role: 'ADMIN'
            });
            console.log(`✅ Admin user created: ${adminEmail}`);
        } else {
            console.log('Admin user already exists');
        }

        // Create sample agent for testing if not exists
        const agentEmail = 'agent1@salon.dev';
        const agentExists = await User.findOne({ email: agentEmail });
        if (!agentExists) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash('agentpassword', salt);
            const agent = await User.create({
                email: agentEmail,
                passwordHash,
                firstName: 'Rajesh',
                lastName: 'Kumar',
                role: 'AGENT',
                agentProfile: { commissionRate: 0.015, referralCode: 'AGT-1001', totalEarnings: 0 }
            });
            console.log(`✅ Sample agent created: ${agentEmail} (referral: AGT-1001)`);
        } else {
            console.log('Sample agent already exists');
        }

        await mongoose.disconnect();
        console.log('Database seeding completed!');
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
