import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
  {
    auctionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlatformUser', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    isAiAgent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

bidSchema.index({ auctionId: 1, createdAt: -1 });

export const Bid = mongoose.model('Bid', bidSchema);
