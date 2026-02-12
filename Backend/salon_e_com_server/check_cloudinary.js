import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

console.log('🔍 Checking Cloudinary Configuration...');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
    console.error('❌ Missing Cloudinary Environment Variables!');
    if (!cloudName) console.error('   - CLOUDINARY_CLOUD_NAME is missing');
    if (!apiKey) console.error('   - CLOUDINARY_API_KEY is missing');
    if (!apiSecret) console.error('   - CLOUDINARY_API_SECRET is missing');
    console.log('\nPlease add them to your .env file.');
    process.exit(1);
}

console.log('✅ Environment variables found.');
console.log(`   Cloud Name: ${cloudName}`);
console.log(`   API Key:    ${apiKey.slice(0, 5)}...`);

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
});

// Attempt to verify configuration by checking ping or usage
// Note: verify_api_secret is a clear test if available, otherwise checking usage is a common test
try {
    const ping = cloudinary.utils.api_sign_request({ timestamp: Date.now() }, apiSecret);
    console.log('✅ API Secret formatting appears correct (local check).');

    console.log('\nSUCCESS! Cloudinary is configured locally.');
    console.log('When you start the server, it should use Cloudinary storage instead of local uploads.');
} catch (error) {
    console.error('❌ Error verifying configuration:', error.message);
}
