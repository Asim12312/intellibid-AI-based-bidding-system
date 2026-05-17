import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGODB_URI or MONGO_URI is required');
    }
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB error: ', err);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  console.log('MongoDB disconnected');
};
