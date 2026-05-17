import mongoose from 'mongoose';

const platformUserSchema = new mongoose.Schema(
  {
    authUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    platformId: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, trim: true },
    avatarUrl: { type: String, default: '' },
    status: { type: String, enum: ['active', 'banned', 'suspended'], default: 'active' },
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String, default: '' },
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    trustScore: { type: Number, default: 5, min: 0, max: 10 },
    verificationTier: {
      type: String,
      enum: ['none', 'bronze', 'silver', 'gold', 'diamond'],
      default: 'none',
    },
    banReason: { type: String, default: '' },
    bannedAt: { type: Date },
    bannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    lastActivityAt: { type: Date, default: Date.now },
    lastActivitySummary: { type: String, default: '' },
    stripeCustomerId: { type: String, default: '' },
  },
  { timestamps: true }
);

platformUserSchema.index({ status: 1 });
platformUserSchema.index({ isFlagged: 1 });
platformUserSchema.index({ name: 'text', email: 'text', platformId: 'text' });

export const PlatformUser = mongoose.model('PlatformUser', platformUserSchema, 'platform_users');
