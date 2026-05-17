import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema(
  {
    lotId: { type: String, required: true, unique: true, uppercase: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    imageUrls: [{ type: String }],
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'live', 'ended', 'cancelled'],
      default: 'live',
    },
    currency: { type: String, enum: ['USD', 'ETH'], default: 'USD' },
    startingBid: { type: Number, required: true, min: 0 },
    currentBid: { type: Number, required: true, min: 0 },
    reservePrice: { type: Number, min: 0 },
    estimatedValue: { type: Number, min: 0 },
    topBidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlatformUser' },
    topBidderHandle: { type: String, default: '' },
    agentMode: { type: String, enum: ['ai_agent', 'manual_only'], default: 'manual_only' },
    isAiPick: { type: Boolean, default: false },
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String, default: '' },
    suspiciousActivity: { type: Boolean, default: false },
    startsAt: { type: Date, default: Date.now },
    endsAt: { type: Date, required: true },
    bidCount: { type: Number, default: 0 },
    themeColor: { type: String, default: 'bg-white' },
    auctionRef: { type: String, default: '' },
    companyName: { type: String, default: 'IntelliBid', trim: true },
    listedBy: { type: String, default: '', trim: true },
    createdByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

auctionSchema.index({ status: 1, endsAt: 1 });
auctionSchema.index({ isFlagged: 1 });
auctionSchema.index({ category: 1 });
auctionSchema.index({ currentBid: -1 });

export const Auction = mongoose.model('Auction', auctionSchema);
