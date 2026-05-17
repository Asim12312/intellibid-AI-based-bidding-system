import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/metrics', dashboardController.metrics);
router.get('/auctions-snapshot', dashboardController.auctionsSnapshot);
router.get('/system/health', dashboardController.systemHealth);
router.get('/analytics/bids-by-day', dashboardController.bidsByDay);
router.get('/analytics/registrations', dashboardController.registrations);
router.get('/activity', dashboardController.activity);

export default router;
