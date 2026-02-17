import User from '../models/User.js';
import CommissionTransaction from '../models/CommissionTransaction.js';
import Settlement from '../models/Settlement.js';

export const processMonthlySettlement = async () => {
    console.log('Starting monthly auto-settlement process...');

    // Previous month in YYYY-MM format
    const now = new Date();
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = prevMonthDate.getFullYear();
    const month = String(prevMonthDate.getMonth() + 1).padStart(2, '0');
    const prevMonth = `${year}-${month}`;

    const agents = await User.find({
        role: 'AGENT',
        'agentProfile.currentMonthEarnings': { $gt: 0 }
    });

    const results = {
        success: 0,
        failed: 0,
        totalAmount: 0
    };

    for (const agent of agents) {
        try {
            // Idempotency check: Don't process if already settled for this month
            const existingSettlement = await Settlement.findOne({
                agentId: agent._id,
                month: prevMonth
            });
            if (existingSettlement) {
                console.log(`Skipping: Settlement already exists for agent ${agent._id} and month ${prevMonth}`);
                continue;
            }

            const amount = agent.agentProfile.currentMonthEarnings;
            const setId = `SET-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

            // Calculate support stats for the modal
            const pendingTransactions = await CommissionTransaction.find({
                agentId: agent._id,
                status: 'PENDING'
            });

            const uniqueOrderIds = [...new Set(pendingTransactions.map(t => t.orderId.toString()))];

            // 1. Create Settlement record
            await Settlement.create({
                setid: setId,
                agentId: agent._id,
                amount: amount,
                month: prevMonth,
                totalOrders: uniqueOrderIds.length,
                totalCommissions: pendingTransactions.length,
                settledAt: new Date()
            });

            // 2. Update all PENDING transactions to SETTLED for this agent
            await CommissionTransaction.updateMany(
                {
                    agentId: agent._id,
                    status: 'PENDING'
                },
                { status: 'SETTLED' }
            );

            // 3. Reset agent.currentMonthEarnings
            agent.agentProfile.currentMonthEarnings = 0;
            agent.agentProfile.lastSettlementDate = new Date();
            await agent.save();

            results.success++;
            results.totalAmount += amount;
        } catch (error) {
            console.error(`Failed to settle for agent ${agent._id}:`, error);
            results.failed++;
        }
    }

    console.log('Monthly settlement process completed:', results);
    return results;
};
