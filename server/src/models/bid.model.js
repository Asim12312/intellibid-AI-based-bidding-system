import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
        type: String,
        enum: ['winning', 'outbid', 'won'],
        default: 'winning'
    }
}, { timestamps: true });


bidSchema.index({ product: 1, bidder: 1 });
bidSchema.index({ product: 1, amount: -1 });

export default mongoose.model('Bid', bidSchema);
