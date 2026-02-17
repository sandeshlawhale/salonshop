import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settlement from '../v1/models/Settlement.js';
import CommissionTransaction from '../v1/models/CommissionTransaction.js';

dotenv.config();

const fixDates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'salon_e_com' });
        console.log('Connected to DB');

        const allSettlements = await Settlement.find({});
        console.log(`Debug: Total settlements in DB: ${allSettlements.length}`);
        allSettlements.forEach(s => console.log(` - ID: ${s.setid}, Month: ${s.month}, SettledAt: ${s.settledAt}`));

        const incorrectSettlements = await Settlement.find({
            month: '2025-12'
        });

        console.log(`Found ${incorrectSettlements.length} incorrect settlements`);

        for (const sett of incorrectSettlements) {
            console.log(`Fixing settlement ${sett.setid}: 2025-12 -> 2026-01`);
            sett.month = '2026-01';
            await sett.save();
        }

        // Also check CommissionTransactions
        const incorrectTransactions = await CommissionTransaction.find({
            month: '2025-12'
        });

        console.log(`Found ${incorrectTransactions.length} incorrect transactions`);
        for (const trx of incorrectTransactions) {
            console.log(`Fixing transaction ${trx._id}: 2025-12 -> 2026-01`);
            trx.month = '2026-01';
            await trx.save();
        }

        console.log('Fix completed');
        process.exit(0);
    } catch (error) {
        console.error('Fix failed:', error);
        process.exit(1);
    }
};

fixDates();
