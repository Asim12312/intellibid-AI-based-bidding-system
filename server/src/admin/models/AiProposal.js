import mongoose from 'mongoose';

const aiProposalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    insight: { type: String, required: true },
    category: { type: String, default: 'general' },
    status: { type: String, enum: ['pending', 'executed', 'dismissed'], default: 'pending' },
    executedAt: { type: Date },
    executedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

export const AiProposal = mongoose.model('AiProposal', aiProposalSchema);
