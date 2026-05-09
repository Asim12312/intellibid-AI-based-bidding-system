import { asyncHandler } from '../../utils/asyncHandler.js';
import {
    getSellerStatsService,
    getActiveListingsService,
    getSellerActivityService,
    getSellerInsightsService
} from './seller.service.js';

export const getSellerStats = asyncHandler(async (req, res) => {
    const stats = await getSellerStatsService(req.user.id);
    res.status(200).json({ success: true, data: stats });
});

export const getActiveListings = asyncHandler(async (req, res) => {
    const listings = await getActiveListingsService(req.user.id);
    res.status(200).json({ success: true, data: listings });
});

export const getSellerActivity = asyncHandler(async (req, res) => {
    const activity = await getSellerActivityService(req.user.id);
    res.status(200).json({ success: true, data: activity });
});

export const getSellerInsights = asyncHandler(async (req, res) => {
    const insights = await getSellerInsightsService(req.user.id);
    res.status(200).json({ success: true, data: insights });
});
