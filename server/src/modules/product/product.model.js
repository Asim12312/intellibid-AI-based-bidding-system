import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startingPrice: { type: Number, required: true },
  currentBid: { type: Number, default: 0 },
  images: [{ type: String }],
  category: { type: String, required: true },
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  endTime: { type: Date, required: true },
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);
