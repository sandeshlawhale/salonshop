import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    originalPrice: { type: Number }, // MSRP
    costPerItem: { type: Number },
    sku: { type: String },
    inventoryCount: { type: Number, default: 0 }, // -1 for infinite services
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
            delete ret.id; // Remove the virtual id, keep _id
            delete ret.__v; // Remove version key
            return ret;
        }
    },
    toObject: { virtuals: true }
});

export default mongoose.model('Product', productSchema);
