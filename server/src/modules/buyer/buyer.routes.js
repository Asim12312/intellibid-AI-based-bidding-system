import express from 'express';
import { auth } from '../../middleware/auth.middleware.js';
import {
    getBuyerStats,
    getMyBids,
    placeBid,
    getRecommendations,
    getRecentActivity,
    getAiPicks
} from './buyer.controller.js';

const router = express.Router();

// All buyer routes protected by auth middleware
router.use(auth);

// Dashboard routes
router.get('/dashboard/stats', getBuyerStats);
router.get('/bids/:tab?', getMyBids);
router.post('/bids/place', placeBid);
router.get('/recommendations', getRecommendations);
router.get('/activity', getRecentActivity);
router.get('/ai-picks', getAiPicks);

export default router;
