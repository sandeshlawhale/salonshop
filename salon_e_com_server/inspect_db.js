import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/v1/models/Order.js';
import CommissionTransaction from './src/v1/models/CommissionTransaction.js';
import User from './src/v1/models/User.js';

dotenv.config();

async function inspect() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const fs = await import('fs');
    let output = '';
    const log = (msg) => { output += msg + '\n'; console.log(msg); };

    const targetReferralCode = '1FBB4EBC';
    const targetAgent = await User.findOne({ 'agentProfile.referralCode': targetReferralCode });

    if (targetAgent) {
        log(`\nTarget Agent Found: ${targetAgent.firstName} ${targetAgent.lastName} (${targetAgent._id})`);
        log(`  Referral Code: ${targetAgent.agentProfile?.referralCode}`);
        log(`  Total Earnings (Profile): ${targetAgent.agentProfile?.totalEarnings}`);
    } else {
        log(`\nTarget Agent with Referral Code ${targetReferralCode} NOT FOUND`);
    }

    const orderNumbers = ['ORD-1771785503705-808', 'ORD-1771784951100-849', 'ORD-1771784315228-871'];
    const orders = await Order.find({ orderNumber: { $in: orderNumbers } });
    log(`\nRelevant Orders Found: ${orders.length}`);

    for (const order of orders) {
        log(`Order: ${order.orderNumber}`);
        log(`  Status: ${order.status}`);
        log(`  Total: ${order.total}`);
        log(`  Agent ID: ${order.agentId}`);
        log(`  Payment Method: ${order.paymentMethod}`);
        log(`  Match Target Agent: ${targetAgent && order.agentId && order.agentId.toString() === targetAgent._id.toString()}`);
        log(`  Commission Calculated: ${order.commissionCalculated}`);
    }

    const commissions = await CommissionTransaction.find({ agentId: targetAgent ? targetAgent._id : null });
    log(`\nCommissions in DB for Target Agent: ${commissions.length}`);
    for (const comm of commissions) {
        log(`  Comm: ${comm._id}, Amount: ${comm.amount}, Order: ${comm.orderId}`);
    }

    fs.writeFileSync('inspect_output_final.txt', output);
    log('\nOutput written to inspect_output_final.txt');

    await mongoose.disconnect();
}

inspect().catch(err => {
    console.error(err);
    process.exit(1);
});
