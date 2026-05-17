import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'user_role',
        'transaction_alert',
        'system_patch',
        'user_ban',
        'user_unban',
        'ticket_resolve',
        'auction_created',
        'ai_proposal',
        'other',
      ],
      default: 'other',
    },
    message: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
