import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { limiter } from './middleware/rateLimiter.js'
import authRoutes from './modules/auth/auth.routes.js';
import buyerRoutes from './modules/buyer/buyer.routes.js';
import sellerRoutes from './modules/seller/seller.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(limiter);

// body parsing
app.use(express.json());
app.use(cookieParser());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/seller', sellerRoutes);

// Error Handler
app.use(errorHandler);

export default app;

