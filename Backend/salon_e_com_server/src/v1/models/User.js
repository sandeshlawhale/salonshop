import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['ADMIN', 'AGENT', 'SALON_OWNER'],
        default: 'SALON_OWNER'
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACTIVE', 'REJECTED', 'DEACTIVE'],
        default: 'PENDING'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    avatarUrl: { type: String },

    // Agent Specific Data
    agentProfile: {
        commissionRate: { type: Number, default: 0.10 },
        referralCode: { type: String, unique: true, sparse: true },
        totalEarnings: { type: Number, default: 0 },
        wallet: {
            pending: { type: Number, default: 0 },
            available: { type: Number, default: 0 }
        },
        points: { type: Number, default: 0 },
        bankDetails: {
            bankName: String,
            accountNumber: String,
            ifscCode: String,
            accountHolderName: String
        }
    },

    // Salon Owner Specific Data
    salonOwnerProfile: {
        agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rewardPoints: {
            locked: { type: Number, default: 0 },
            available: { type: Number, default: 0 }
        },
        rewardHistory: [{
            amount: { type: Number, required: true },
            type: { type: String, enum: ['EARNED', 'REDEEMED', 'EXPIRED', 'REFUNDED'], required: true },
            status: { type: String, enum: ['LOCKED', 'AVAILABLE', 'USED', 'EXPIRED'], default: 'LOCKED' },
            orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
            expiresAt: Date,
            createdAt: { type: Date, default: Date.now }
        }],
        shippingAddresses: [{
            street: String,
            city: String,
            state: String,
            zip: String,
            isDefault: { type: Boolean, default: false }
        }]
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            if (ret.role !== 'AGENT') delete ret.agentProfile;
            if (ret.role !== 'SALON_OWNER') delete ret.salonOwnerProfile;
            delete ret.passwordHash;
            delete ret.__v;
            delete ret.id; // Also remove virtual id for consistency
            return ret;
        }
    }
});

export default mongoose.model('User', userSchema);
