import { Router } from 'express';
import authRoutes from './auth.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import userRoutes from './user.routes.js';
import auctionRoutes from './auction.routes.js';
import ticketRoutes from './ticket.routes.js';
import aiRoutes from './ai.routes.js';
import notificationRoutes from './notification.routes.js';
import uploadRoutes from './upload.routes.js';
import searchRoutes from './search.routes.js';
import exportRoutes from './export.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);
router.use('/auctions', auctionRoutes);
router.use('/tickets', ticketRoutes);
router.use('/ai', aiRoutes);
router.use('/notifications', notificationRoutes);
router.use('/uploads', uploadRoutes);
router.use('/search', searchRoutes);
router.use('/exports', exportRoutes);

export default router;
