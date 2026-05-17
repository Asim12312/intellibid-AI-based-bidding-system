import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { requestLogger } from './middleware/requestLogger.middleware.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';
import apiRoutes from './routes/index.js';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
});

const router = Router();

router.use(mongoSanitize());
router.use(requestLogger);
router.use('/', apiLimiter, apiRoutes);
router.use(notFoundHandler);
router.use(errorHandler);

export default router;
