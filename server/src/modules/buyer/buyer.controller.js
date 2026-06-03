import { asyncHandler } from '../../utils/asyncHandler.js';
import {
    getBuyerStatsService,
    getMyBidsService,
    placeBidService,
    getRecommendationsService,
    getRecentActivityService,
    toggleWatchlistService,
    getWatchlistService
} from './buyer.service.js';

export const getBuyerStats = asyncHandler(async (req, res) => {

    const stats = await getBuyerStatsService(req.user.id);
    res.status(200).json({ success: true, data: stats });
});

export const getMyBids = asyncHandler(async (req, res) => {
    const { tab, page, limit } = req.query;
    const result = await getMyBidsService(req.user.id, tab, page, limit);
    res.status(200).json({ success: true, ...result });
});

export const placeBid = asyncHandler(async (req, res) => {
    const { auctionId, bidAmount } = req.body;

    if (!auctionId || !bidAmount) {
        return res.status(400).json({ success: false, message: 'auctionId and bidAmount are required' });
    }

    const result = await placeBidService(req.user.id, auctionId, Number(bidAmount));
    res.status(201).json({ success: true, ...result });
});

export const getRecommendations = asyncHandler(async (req, res) => {
    const recommendations = await getRecommendationsService(req.user.id);
    res.status(200).json({ success: true, data: recommendations });
});

export const getRecentActivity = asyncHandler(async (req, res) => {
    const activity = await getRecentActivityService(req.user.id);
    res.status(200).json({ success: true, data: activity });
});

export const getAiPicks = asyncHandler(async (req, res) => {
    const { getAiPicksService } = await import('./aiPicks.service.js');
    const picks = await getAiPicksService(req.user.id);
    res.status(200).json({ success: true, data: picks });
});

export const toggleWatchlist = asyncHandler(async (req, res) => {
    const { auctionId } = req.body;
    if (!auctionId) return res.status(400).json({ success: false, message: 'auctionId is required' });
    
    const result = await toggleWatchlistService(req.user.id, auctionId);
    res.status(200).json({ success: true, ...result });
});

export const getWatchlist = asyncHandler(async (req, res) => {
    const watchlist = await getWatchlistService(req.user.id);
    res.status(200).json({ success: true, data: watchlist });
});

export const getMyOrders = asyncHandler(async (req, res) => {
    const { getMyOrdersService } = await import('./buyer.service.js');
    const orders = await getMyOrdersService(req.user.id);
    res.status(200).json({ success: true, data: orders });
});
