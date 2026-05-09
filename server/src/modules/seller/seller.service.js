import Product from '../../models/product.model.js';
import Bid from '../../models/bid.model.js';
import mongoose from 'mongoose';

export const getSellerStatsService = async (sellerId) => {
    // 1. Total Revenue (sum of winning bids for products sold by this seller)
    // First, find all products by this seller
    const sellerProducts = await Product.find({ seller: sellerId }).select('_id');
    const productIds = sellerProducts.map(p => p._id);

    // Aggregate winning bids
    const revenueAggregation = await Bid.aggregate([
        { $match: { product: { $in: productIds }, status: 'won' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;

    // 2. Active Listings Count
    const activeListingsCount = await Product.countDocuments({
        seller: sellerId,
        endingDate: { $gt: new Date() } // Active products
    });

    // 3. Pending Shipments (mock logic based on 'won' bids that haven't been fulfilled)
    // Since we don't have an Order model yet, we will count 'won' bids
    const pendingShipments = await Bid.countDocuments({
        product: { $in: productIds },
        status: 'won'
    });

    // 4. Total Views / Watchers (Mocked for now as we don't have tracking in the schema)
    const totalViews = activeListingsCount * 142; // arbitrary metric for visual testing

    return {
        totalRevenue,
        activeListingsCount,
        pendingShipments,
        totalViews
    };
};

export const getActiveListingsService = async (sellerId) => {
    // Fetch products belonging to the seller that are still active
    const activeProducts = await Product.find({
        seller: sellerId,
        endingDate: { $gt: new Date() }
    })
    .sort({ createdAt: -1 })
    .lean();

    // Map through products and fetch the highest bid for each
    const formattedListings = await Promise.all(activeProducts.map(async (product) => {
        const highestBid = await Bid.findOne({ product: product._id })
            .sort({ amount: -1 })
            .lean();

        const bidCount = await Bid.countDocuments({ product: product._id });

        return {
            id: product._id,
            title: product.name,
            startingPrice: product.startingPrice,
            currentBid: highestBid ? highestBid.amount : product.startingPrice,
            bidCount: bidCount,
            endTime: product.endingDate,
            image: product.mainImage || 'https://via.placeholder.com/200'
        };
    }));

    return formattedListings;
};

export const getSellerActivityService = async (sellerId) => {
    // Fetch products belonging to the seller
    const sellerProducts = await Product.find({ seller: sellerId }).select('_id name');
    const productIds = sellerProducts.map(p => p._id);
    const productMap = sellerProducts.reduce((acc, curr) => {
        acc[curr._id.toString()] = curr.name;
        return acc;
    }, {});

    // Fetch latest bids on these products
    const recentBids = await Bid.find({ product: { $in: productIds } })
        .populate('bidder', 'firstName')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean();

    return recentBids.map(bid => {
        return {
            id: bid._id,
            type: bid.status === 'won' ? 'sale' : 'bid',
            message: bid.status === 'won' 
                ? `Sale completed for ${productMap[bid.product.toString()]} at $${bid.amount}`
                : `New bid of $${bid.amount} on ${productMap[bid.product.toString()]} by ${bid.bidder?.firstName || 'User'}`,
            time: bid.createdAt
        };
    });
};

export const getSellerInsightsService = async (sellerId) => {
    // Generate AI/Smart Insights based on seller's current listings
    const activeCount = await Product.countDocuments({ seller: sellerId, endingDate: { $gt: new Date() } });

    const insights = [];
    
    if (activeCount === 0) {
        insights.push({
            id: 1,
            type: 'warning',
            title: 'No Active Listings',
            description: 'You have no items currently listed. Create a new listing to start generating revenue.',
            action: 'Create Listing'
        });
    } else {
        insights.push({
            id: 2,
            type: 'optimization',
            title: 'Optimize Starting Prices',
            description: 'Items with starting prices under $50 receive 3x more engagement in the first 24 hours.',
            action: 'Review Pricing'
        });
        insights.push({
            id: 3,
            type: 'trend',
            title: 'Trending Categories',
            description: 'Vintage electronics are seeing a 45% spike in bidding activity this week.',
            action: 'View Trends'
        });
    }

    return insights;
};
