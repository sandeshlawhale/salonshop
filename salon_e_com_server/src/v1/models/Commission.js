import mongoose from 'mongoose';

const commissionSchema = new mongoose.Schema({
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },

    orderAmount: { type: Number, required: true },
    commissionRate: { type: Number, required: true },
    amountEarned: { type: Number, required: true },

    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'PAID', 'CLAWBACK'],
        default: 'PENDING'
    },
    paidAt: { type: Date }

}, { timestamps: true });

export default mongoose.model('Commission', commissionSchema);
