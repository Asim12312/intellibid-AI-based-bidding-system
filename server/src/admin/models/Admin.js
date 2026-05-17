import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: '' },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

adminSchema.index({ role: 1, isActive: 1 });

adminSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

adminSchema.statics.hashPassword = async function hashPassword(password) {
  return bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12', 10));
};

export const Admin = mongoose.model('Admin', adminSchema);
