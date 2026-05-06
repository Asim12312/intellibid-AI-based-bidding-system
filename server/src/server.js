import dotenv from 'dotenv';
import app from './app.js';
// import connectDB from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to Database
    // await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

startServer();
