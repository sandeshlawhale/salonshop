import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    costPerItem: { type: Number },
    sku: { type: String },
    inventoryCount: { type: Number, default: 0 },
    category: { type: String, required: true },
    subcategory: { type: String },
    brand: { type: String },
    featured: { type: Boolean, default: false },
    returnable: { type: Boolean, default: true },
    tags: [String],
    images: [String],
    status: {
        type: String,
        enum: ['ACTIVE', 'DRAFT', 'ARCHIVED'],
        default: 'DRAFT'
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret.id;
            delete ret.__v;
            return ret;
        }
    },
    toObject: { virtuals: true }
});

export default mongoose.model('Product', productSchema);
