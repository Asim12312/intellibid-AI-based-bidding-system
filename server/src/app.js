import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { rateLimiter } from './middleware/rateLimiter.js'
import authRoutes from './modules/auth/auth.routes.js';

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

export default app;

