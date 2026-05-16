import Product from '../../models/product.model.js';
import Bid from '../../models/bid.model.js';
import User from '../../models/user.model.js';
import Auction from '../../models/auction.model.js';
import { trackEventService } from '../events/events.service.js';
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

export const getMyBidsService = async (userId, tab = 'active', page = 1, limit = 12) => {
    let query = { bidder: userId };

    if (tab === 'active') {
        query.status = { $in: ['winning', 'outbid'] };
    } else if (tab === 'won') {
        query.status = 'won';
    } else if (tab === 'lost') {
        query.status = 'outbid';
        // Needs a join/populate to check if auction is ended, but for now we filter post-query or assume outbid is lost if auction ended.
        // A better approach is to query auctions that are ended where user bid and didn't win.
    }

    const skip = (page - 1) * limit;

    const bids = await Bid.find(query)
        .populate('auction', 'title images endTime currentPrice status bidCount')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    // If tab === 'lost', filter out active auctions
    let filteredBids = bids;
    if (tab === 'lost') {
        filteredBids = bids.filter(b => b.auction && b.auction.status !== 'active');
    } else if (tab === 'active') {
        filteredBids = bids.filter(b => b.auction && b.auction.status === 'active');
    }

    const total = await Bid.countDocuments(query); // Rough count, inaccurate for lost due to post-filter

    return {
        bids: filteredBids,
        total,
        page: Number(page),
        hasMore: skip + bids.length < total
    };
};

export const placeBidService = async (userId, auctionId, bidAmount) => {
    const auction = await Auction.findById(auctionId);
    
    if (!auction) throw new Error('Auction not found');
    if (auction.status !== 'active') throw new Error('Auction is not active');
    if (new Date(auction.endTime) < new Date()) throw new Error('Auction has ended');
    if (auction.seller.toString() === userId.toString()) throw new Error('You cannot bid on your own auction');
    if (bidAmount <= auction.currentPrice) throw new Error(`Bid must be greater than current price of $${auction.currentPrice}`);

    // Check if user is already highest bidder
    const highestBid = await Bid.findOne({ auction: auctionId, status: 'winning' });
    if (highestBid && highestBid.bidder.toString() === userId.toString()) {
        throw new Error('You are already the highest bidder');
    }

    // Atomic-ish update: Mark old winning bids as outbid
    await Bid.updateMany(
        { auction: auctionId, status: 'winning' },
        { $set: { status: 'outbid' } }
    );

    // Create new bid
    const newBid = await Bid.create({
        auction: auctionId,
        bidder: userId,
        amount: bidAmount,
        status: 'winning'
    });

    // Update auction price and bid count
    auction.currentPrice = bidAmount;
    auction.bidCount += 1;
    await auction.save();

    // Fire tracking event (fire and forget)
    trackEventService(userId, { 
        auctionId, 
        eventType: 'bid_placed', 
        metadata: { bidAmount } 
    }).catch(err => console.error('Failed to track bid event', err));

    return { bid: newBid, newCurrentPrice: bidAmount };
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
