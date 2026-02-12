import fs from 'fs';
import { ObjectId } from 'mongodb';

const BASE_URL = 'http://localhost:5000/api/v1';
const RESULTS_FILE = 'rewards_test_results.md';

function log(msg) {
    console.log(msg);
    fs.appendFileSync(RESULTS_FILE, msg + '\n');
}

// Helper to create a dummy product if needed, but we'll try to fetch existing ones first
async function getProduct() {
    try {
        const res = await fetch(`${BASE_URL}/products?limit=1`);
        const data = await res.json();
        if (data.products && data.products.length > 0) return data.products[0];
        if (data.docs && data.docs.length > 0) return data.docs[0]; // pagination structure check
    } catch (e) {
        log(`❌ Error fetching product: ${e.message}`);
    }
    return null;
}

async function runTests() {
    fs.writeFileSync(RESULTS_FILE, '# Rewards System Verification Results\n\n');
    log('--- Starting Rewards Verification ---\n');

    let token;
    let userId;
    let productId;
    let orderId;

    // 1. Setup: Register/Login and Get Product
    try {
        log('1. Setup...');
        const email = `reward_test_${Date.now()}@example.com`;
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'Reward', lastName: 'Tester', email, password: 'password123', phone: '9999999999'
            })
        });
        const regData = await regRes.json();

        if (regRes.ok) {
            token = regData.token;
            userId = regData._id;
            log(`✅ Registered user: ${email}`);
        } else {
            // Login if exists?
            throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
        }

        const product = await getProduct();
        if (!product) throw new Error('No products found to order');
        productId = product._id;
        log(`✅ Found product: ${product.name} (${product.price})`);

    } catch (e) {
        log(`❌ Setup failed: ${e.message}`);
        return;
    }

    // 2. Create Order (Expect NO points yet)
    try {
        log('\n2. Create Order (Unpaid)...');
        // Order 3 items to be safe for future tests, cost approx 100 each
        const orderRes = await fetch(`${BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                items: [{ productId, quantity: 3 }],
                shippingAddress: { street: 'Main St', city: 'Pune', state: 'MH', zip: '411001', country: 'India' }
            })
        });
        const orderData = await orderRes.json();

        if (orderRes.ok) {
            orderId = orderData._id;
            log(`✅ Order Created: ${orderData.orderNumber}. Total: ${orderData.total}`);

            // Check User Points
            const userRes = await fetch(`${BASE_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const userData = await userRes.json();
            const locked = userData.salonOwnerProfile?.rewardPoints?.locked || 0;
            const available = userData.salonOwnerProfile?.rewardPoints?.available || 0;

            if (locked === 0 && available === 0) {
                log('✅ Points correctly 0 (Unpaid)');
            } else {
                log(`❌ Unexpected points! Locked: ${locked}, Available: ${available}`);
            }
        } else {
            throw new Error(`Order creation failed: ${JSON.stringify(orderData)}`);
        }
    } catch (e) { log(`❌ Order test failed: ${e.message}`); return; }

    // 3. Mark PAID (Expect LOCKED points)
    try {
        log('\n3. Mark Order PAID...');
        // Need to be Admin to update status usually, but let's see if we can trigger it 
        // Or if there is a dev route. Assuming we can login as admin or just bypass for test?
        // Wait, the user script doesn't have admin token. 
        // I'll try to use the same user if they can update? No.
        // I will assume I need an Admin token or I'll stub the status update if possible.
        // Actually, I can just use the provided Admin login if I knew it, or create one.
        // Let's create an ADMIN user (using secret bypass if available or just try standard reg if not protected - wait, reg protected).
        // I will try to use the `updateStatus` endpoint with the user's token, likely will fail if not admin.
        // FOR TESTING: I will rely on the code review for this step if I can't easily be admin.
        // BUT, I can check if /payments/verify webhook style works (public?) or similar.
        // Let's try to simulate a simple status update loop using the `orderAPI` if accessible.
        // If I can't change status, I can't verify points earning.
        // I will try to construct a request to /payments/verify (if public) or just log that manual verification is needed for this step.
        // Wait! The user provided a test script before that failed on `secretOrPrivateKey`, implying they ran it locally.
        // I can just try to run as admin if I can hack a token? No.
        // I will skip automatic status update if I can't auth as admin, but I'll write the test to Try it.

        // Try to update status as the user (will likely fail 403)
        const updateRes = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status: 'PAID' })
        });

        if (updateRes.status === 403 || updateRes.status === 401) {
            log('⚠️ Cannot update status (Need Admin). Skipping automatic point verification.');
            log('   Please manually set Order status to PAID in Admin Panel and check if user gets Locked points.');
        } else {
            const updateData = await updateRes.json();
            log(`ℹ️ Status Update Response: ${updateRes.status}`);
            if (updateRes.ok) {
                // Check Points again
                const userRes = await fetch(`${BASE_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
                const userData = await userRes.json();
                log(`   Locked Points: ${userData.salonOwnerProfile?.rewardPoints?.locked}`);
            }
        }
    } catch (e) { log(`❌ Status test error: ${e.message}`); }

    log('\n--- Test Script Complete (Manual Steps Required for Admin Actions) ---');
}

runTests();
