import express from 'express';
import { auth } from '../../middleware/auth.middleware.js';
import { 
    getBuyerStats, 
    getActiveBids, 
    getRecommendations, 
    getRecentActivity 
} from './buyer.controller.js';

const router = express.Router();

// All buyer routes should be protected by auth middleware
router.use(auth);

// Dashboard routes
router.get('/dashboard/stats', getBuyerStats);
router.get('/bids/active', getActiveBids);
router.get('/recommendations', getRecommendations);
router.get('/activity', getRecentActivity);

export default router;
