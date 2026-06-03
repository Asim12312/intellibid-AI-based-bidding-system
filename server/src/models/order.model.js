import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    auction: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled', 'shipped', 'completed'],
        default: 'pending'
    },
    stripeSessionId: { type: String },
    expiresAt: { type: Date, required: true },
    paymentDate: { type: Date },
}, { timestamps: true });

// Indexes for quick lookups and job processing
orderSchema.index({ status: 1, expiresAt: 1 });
orderSchema.index({ buyer: 1 });
orderSchema.index({ seller: 1 });

export default mongoose.model('Order', orderSchema);
