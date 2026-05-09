import Auction from '../../models/auction.model.js';
import Bid from '../../models/bid.model.js';
import User from '../../models/user.model.js';

export const getBuyerStatsService = async (userId) => {
    // 1. Active Bids Count
    const activeBidsCount = await Bid.countDocuments({
        bidder: userId,
        status: { $in: ['winning', 'outbid'] }
    });

    // 2. Items Won Count
    const itemsWonCount = await Bid.countDocuments({
        bidder: userId,
        status: 'won'
    });

    // 3. Total Spent
    // Aggregate the sum of amounts for 'won' bids
    const spentAggregation = await Bid.aggregate([
        { $match: { bidder: userId, status: 'won' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalSpent = spentAggregation.length > 0 ? spentAggregation[0].total : 0;

    // 4. Saved Items Count
    const user = await User.findById(userId).select('watchlist');
    const savedItemsCount = user?.watchlist?.length || 0;

    return {
        activeBids: activeBidsCount,
        itemsWon: itemsWonCount,
        totalSpent: totalSpent,
        savedItems: savedItemsCount
    };
};

export const getActiveBidsService = async (userId) => {
    // Fetch user's active bids and populate auction details
    const bids = await Bid.find({ 
        bidder: userId,
        status: { $in: ['winning', 'outbid'] }
    })
    .populate('auction', 'title currentPrice images endTime status')
    .sort({ updatedAt: -1 })
    .lean();

    // Map to a cleaner format for the frontend
    return bids.map(bid => ({
        id: bid._id,
        title: bid.auction?.title,
        currentBid: bid.auction?.currentPrice,
        userBid: bid.amount,
        status: bid.status,
        endTime: bid.auction?.endTime,
        image: bid.auction?.images?.[0] || 'https://via.placeholder.com/200'
    }));
};

export const getRecommendationsService = async (userId) => {
    // Simple recommendation for now: recent active auctions not bid on by the user
    // A professional AI-based approach would call a ML model or complex aggregation.
    
    // Get auction IDs the user has already bid on
    const userBids = await Bid.find({ bidder: userId }).select('auction');
    const biddedAuctionIds = userBids.map(b => b.auction);

    const recommendations = await Auction.find({
        _id: { $nin: biddedAuctionIds },
        status: 'active'
    })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

    return recommendations.map(auction => ({
        id: auction._id,
        title: auction.title,
        startingPrice: auction.startingPrice,
        currentPrice: auction.currentPrice,
        image: auction.images?.[0] || 'https://via.placeholder.com/300'
    }));
};

export const getRecentActivityService = async (userId) => {
    // For a real app, you would have a Notification or Activity model.
    // Here we derive it from the user's bids for demonstration.
    const recentBids = await Bid.find({ bidder: userId })
        .populate('auction', 'title')
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean();

    return recentBids.map(bid => {
        let message = '';
        if (bid.status === 'winning') message = `You placed a winning bid on ${bid.auction?.title}`;
        else if (bid.status === 'outbid') message = `You were outbid on ${bid.auction?.title}`;
        else if (bid.status === 'won') message = `You won ${bid.auction?.title}`;

        return {
            id: bid._id,
            type: bid.status,
            message,
            time: bid.updatedAt
        };
    });
};
