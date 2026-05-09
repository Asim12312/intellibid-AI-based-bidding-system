import { asyncHandler } from '../../utils/asyncHandler.js';
import {
    getBuyerStatsService,
    getActiveBidsService,
    getRecommendationsService,
    getRecentActivityService
} from './buyer.service.js';

export const getBuyerStats = asyncHandler(async (req, res) => {
    // req.user.id will be available via auth middleware
    const stats = await getBuyerStatsService(req.user.id);
    res.status(200).json({ success: true, data: stats });
});

export const getActiveBids = asyncHandler(async (req, res) => {
    const bids = await getActiveBidsService(req.user.id);
    res.status(200).json({ success: true, data: bids });
});

export const getRecommendations = asyncHandler(async (req, res) => {
    const recommendations = await getRecommendationsService(req.user.id);
    res.status(200).json({ success: true, data: recommendations });
});

export const getRecentActivity = asyncHandler(async (req, res) => {
    const activity = await getRecentActivityService(req.user.id);
    res.status(200).json({ success: true, data: activity });
});
