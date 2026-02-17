import mongoose from 'mongoose';

const settlementSchema = new mongoose.Schema({
    setid: { type: String, unique: true, sparse: true },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    month: { type: String, required: true }, // YYYY-MM
    totalOrders: { type: Number, default: 0 },
    totalCommissions: { type: Number, default: 0 },
    settledAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure idempotency: one agent per month
settlementSchema.index({ agentId: 1, month: 1 }, { unique: true });

export default mongoose.model('Settlement', settlementSchema);
