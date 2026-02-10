import fs from 'fs';


const BASE_URL = 'http://localhost:5000/api/v1';
const RESULTS_FILE = 'test_results.md';

function log(msg) {
    console.log(msg);
    fs.appendFileSync(RESULTS_FILE, msg + '\n');
}

async function runTests() {
    fs.writeFileSync(RESULTS_FILE, '# Verification Results\n\n');
    log('--- Starting Auth Flow Verification ---\n');

    // 1. Test Public Route (getProducts)
    try {
        log('1. Testing Public Route (getProducts)...');
        const res = await fetch(`${BASE_URL}/products?limit=1`);
        if (res.ok) {
            log('✅ getProducts accessible without token');
        } else {
            log(`❌ getProducts failed: ${res.status} ${res.statusText}`);
        }
    } catch (e) {
        log(`❌ getProducts connection error: ${e.message}`);
    }

    // 2. Test Malformed Token
    try {
        log('\n2. Testing Malformed Token on Protected Route...');
        const res = await fetch(`${BASE_URL}/auth/me`, { // Assuming /auth/me exists based on auth.controller.js:getMe
            headers: { 'Authorization': 'Bearer bad_token_string' }
        });

        if (res.status === 401) {
            const body = await res.json();
            log(`✅ correctly rejected malformed token: ${JSON.stringify(body)}`);
            log('   (Check server logs to ensure no stack trace)');
        } else {
            log(`❌ Unexpected status for bad token: ${res.status}`);
        }
    } catch (e) {
        log(`❌ Malformed token test error: ${e.message}`);
    }

    // 3. Test Auth Errors
    log('\n3. Testing Auth Error Messages...');

    // 3a. Email not found
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'nonexistent@example.com', password: 'password123' })
        });
        const body = await res.json();
        if (res.status === 401 && body.message === 'Email not found') {
            log('✅ "Email not found" message correct');
        } else {
            log(`❌ Expected "Email not found", got: ${JSON.stringify(body)} (${res.status})`);
        }
    } catch (e) { log(`❌ Error in email check: ${e.message}`); }

    // 3b. Incorrect password
    try {
        const tempEmail = `test_${Date.now()}@example.com`;
        const tempPass = 'password123';

        // Register
        log(`   Registering temp user: ${tempEmail}...`);
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'Test',
                lastName: 'User',
                email: tempEmail,
                password: tempPass,
                phone: '1234567890'
            })
        });

        if (regRes.ok) {
            // Login with wrong password
            const loginRes = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: tempEmail, password: 'wrongpassword' })
            });
            const loginBody = await loginRes.json();
            if (loginRes.status === 401 && loginBody.message === 'Incorrect password') {
                log('✅ "Incorrect password" message correct');
            } else {
                log(`❌ Expected "Incorrect password", got: ${JSON.stringify(loginBody)} (${loginRes.status})`);
            }
        } else {
            const err = await regRes.text();
            log(`   ⚠️ Could not register temp user: ${regRes.status} ${err}`);
        }

    } catch (e) { log(`❌ Error in password check: ${e.message}`); }

    log('\n--- Test Complete ---');
}

runTests();
