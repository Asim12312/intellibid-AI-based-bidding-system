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
    const { page, limit } = req.query;
    const tab = req.params.tab || req.query.tab || 'active';
    const result = await getMyBidsService(req.user.id, tab, page, limit);
    res.status(200).json({ success: true, ...result });
});

export const placeBid = asyncHandler(async (req, res) => {
    const { auctionId, bidAmount } = req.body;
    if (!auctionId || !bidAmount) return res.status(400).json({ success: false, message: 'auctionId and bidAmount are required' });
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

export const depositFunds = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    if (!amount || amount < 5) return res.status(400).json({ success: false, message: 'Minimum deposit is $5' });

    import('stripe').then(async ({ default: Stripe }) => {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: 'IntelliBid Wallet Deposit', description: `Deposit funds into your wallet.` },
                    unit_amount: Math.round(amount * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?deposit=success`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?deposit=cancelled`,
            client_reference_id: `deposit:${req.user.id}`,
        });
        res.status(200).json({ success: true, url: session.url });
    });
});

export const getMyOrders = asyncHandler(async (req, res) => {
    const { getMyOrdersService } = await import('./buyer.service.js');
    const orders = await getMyOrdersService(req.user.id);
    res.status(200).json({ success: true, data: orders });
});
