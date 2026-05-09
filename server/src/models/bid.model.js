import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
    auction: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
        type: String,
        enum: ['winning', 'outbid', 'won'],
        default: 'winning'
    }
}, { timestamps: true });

// Ensure a user can place multiple bids, but we can quickly find their highest bid for an auction
bidSchema.index({ auction: 1, bidder: 1 });
bidSchema.index({ auction: 1, amount: -1 });

export default mongoose.model('Bid', bidSchema);
