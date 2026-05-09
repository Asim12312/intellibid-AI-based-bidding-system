import Product from '../../models/product.model.js';
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
    // Fetch user's active bids and populate product details
    const bids = await Bid.find({ 
        bidder: userId,
        status: { $in: ['winning', 'outbid'] }
    })
    .populate('product', 'name startingPrice mainImage endingDate')
    .sort({ updatedAt: -1 })
    .lean();

    // Map to a cleaner format for the frontend
    return bids.map(bid => ({
        id: bid._id,
        title: bid.product?.name,
        currentBid: bid.product?.startingPrice, // In a real app we'd fetch the highest bid or currentPrice if added to product model
        userBid: bid.amount,
        status: bid.status,
        endTime: bid.product?.endingDate,
        image: bid.product?.mainImage || 'https://via.placeholder.com/200'
    }));
};

export const getRecommendationsService = async (userId) => {
    // Get product IDs the user has already bid on
    const userBids = await Bid.find({ bidder: userId }).select('product');
    const biddedProductIds = userBids.map(b => b.product);

    const recommendations = await Product.find({
        _id: { $nin: biddedProductIds },
        endingDate: { $gt: new Date() } // Active condition
    })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

    return recommendations.map(product => ({
        id: product._id,
        title: product.name,
        startingPrice: product.startingPrice,
        currentPrice: product.startingPrice, // Placeholder since we removed currentPrice from product
        image: product.mainImage || 'https://via.placeholder.com/300'
    }));
};

export const getRecentActivityService = async (userId) => {
    const recentBids = await Bid.find({ bidder: userId })
        .populate('product', 'name')
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean();

    return recentBids.map(bid => {
        let message = '';
        if (bid.status === 'winning') message = `You placed a winning bid on ${bid.product?.name}`;
        else if (bid.status === 'outbid') message = `You were outbid on ${bid.product?.name}`;
        else if (bid.status === 'won') message = `You won ${bid.product?.name}`;

        return {
            id: bid._id,
            type: bid.status,
            message,
            time: bid.updatedAt
        };
    });
};
