import express from 'express';
import { auth } from '../../middleware/auth.middleware.js';
import {
    getSellerStats,
    getActiveListings,
    getSellerActivity,
    getSellerInsights
} from './seller.controller.js';

const router = express.Router();

// Protect all seller routes with auth middleware
router.use(auth);

// Seller Dashboard endpoints
router.get('/dashboard/stats', getSellerStats);
router.get('/listings/active', getActiveListings);
router.get('/activity/recent', getSellerActivity);
router.get('/insights/ai', getSellerInsights);

export default router;
