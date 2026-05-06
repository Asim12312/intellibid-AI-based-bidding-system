import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  bidder: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['winning', 'outbid', 'won', 'lost'], 
    default: 'winning' 
  },
}, { timestamps: true });

export const Bid = mongoose.model('Bid', bidSchema);
