import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    categoryScores: {
        type: Map,
        of: Number,
        default: {},
    },
    tagScores: {
        type: Map,
        of: Number,
        default: {},
    },
    priceRange: {
        min:  { type: Number, default: 0 },
        max:  { type: Number, default: 999999 },
        avg:  { type: Number, default: 0 },
    },
    interactionCount: {
        type: Number,
        default: 0,
    },
    lastRebuildAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

export default mongoose.model('UserProfile', userProfileSchema);
