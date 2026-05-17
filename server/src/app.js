import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { limiter } from './middleware/rateLimiter.js';
import authRoutes from './modules/auth/auth.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import './admin/config/env.js';
import adminRouter from './admin/adminRouter.js';

const app = express();

app.set('trust proxy', 1);

const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
const extraOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      const allowed = new Set([clientUrl, ...extraOrigins]);
      try {
        const u = new URL(clientUrl);
        const port = u.port || '3000';
        allowed.add(`http://127.0.0.1:${port}`);
        allowed.add(`http://localhost:${port}`);
      } catch {
        /* ignore */
      }
      if (allowed.has(origin)) return cb(null, true);
      cb(null, false);
    },
    credentials: true,
  })
);
app.use(limiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api', (_req, res) => {
  res.json({
    success: true,
    message: 'IntelliBid API',
    routes: { auth: '/api/auth', admin: '/api/v1', health: '/health' },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/v1', adminRouter);

app.use(errorHandler);

export default app;
