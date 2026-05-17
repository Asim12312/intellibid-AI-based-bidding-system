import mongoose from 'mongoose';

const ticketMessageSchema = new mongoose.Schema(
  {
    senderType: { type: String, enum: ['user', 'admin', 'ai', 'system'], required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId },
    body: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ticketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true, uppercase: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['payment', 'bid_glitch', 'shipping', 'other'],
      default: 'other',
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlatformUser', required: true },
    auctionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction' },
    priority: { type: String, enum: ['urgent', 'medium', 'low'], default: 'medium' },
    status: {
      type: String,
      enum: ['open', 'under_ai_review', 'escalated', 'resolved', 'rejected'],
      default: 'open',
    },
    aiGenuinenessScore: { type: Number, min: 0, max: 100 },
    assigneeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }],
    paymentOverrideRequested: { type: Boolean, default: false },
    paymentOverrideApproved: { type: Boolean, default: false },
    resolvedAt: { type: Date },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    resolutionNote: { type: String, default: '' },
    messages: [ticketMessageSchema],
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ticketSchema.index({ status: 1, priority: 1 });
ticketSchema.index({ userId: 1 });

export const Ticket = mongoose.model('Ticket', ticketSchema);
