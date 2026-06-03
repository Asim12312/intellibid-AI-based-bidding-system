import Product from '../../models/product.model.js';
import Bid from '../../models/bid.model.js';
import User from '../../models/user.model.js';
import Auction from '../../models/auction.model.js';
import { trackEventService } from '../events/events.service.js';
import { broadcastBid } from '../../config/socket.js';
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
    // Basic checks first to avoid unnecessary DB hits
    const auctionCheck = await Auction.findById(auctionId);
    if (!auctionCheck) throw new Error('Auction not found');
    if (auctionCheck.status !== 'active') throw new Error('Auction is not active');
    if (new Date(auctionCheck.endTime) < new Date()) throw new Error('Auction has ended');
    if (auctionCheck.seller.toString() === userId.toString()) throw new Error('You cannot bid on your own auction');
    if (bidAmount <= auctionCheck.currentPrice) throw new Error(`Bid must be greater than current price of $${auctionCheck.currentPrice.toLocaleString()}`);

    // Check if user is already highest bidder
    const highestBid = await Bid.findOne({ auction: auctionId, status: 'winning' });
    if (highestBid && highestBid.bidder.toString() === userId.toString()) {
        throw new Error('You are already the highest bidder');
    }

    const outbidUserId = highestBid ? highestBid.bidder.toString() : null;

    // Concurrency-safe atomic update
    // Only succeeds if currentPrice is STILL less than the incoming bidAmount
    const updatedAuction = await Auction.findOneAndUpdate(
        { _id: auctionId, currentPrice: { $lt: bidAmount }, status: 'active' },
        { $set: { currentPrice: bidAmount }, $inc: { bidCount: 1 } },
        { new: true }
    );

    if (!updatedAuction) {
        throw new Error('Your bid was just beaten by someone else! Please refresh and try a higher amount.');
    }

    // Mark old winning bids as outbid
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

    const user = await User.findById(userId).select('firstName lastName');
    const bidderName = `${user.firstName} ${user.lastName}`;

    // Broadcast the new bid using Socket.IO to update all viewers instantly
    broadcastBid({
        auctionId,
        newPrice: bidAmount,
        bidCount: updatedAuction.bidCount,
        bidderId: userId,
        bidderName,
        outbidUserId
    });

    // Fire tracking event (fire and forget)
    trackEventService(userId, { 
        auctionId, 
        eventType: 'bid_placed', 
        metadata: { bidAmount } 
    }).catch(err => console.error('Failed to track bid event', err));

    return { bid: newBid, newCurrentPrice: bidAmount };
};

export const getRecommendationsService = async (userId) => {
    // Get auction IDs the user has already bid on
    const userBids = await Bid.find({ bidder: userId }).select('auction');
    const biddedAuctionIds = userBids.map(b => b.auction);

    const recommendations = await Auction.find({
        _id: { $nin: biddedAuctionIds },
        status: 'active',
        endTime: { $gt: new Date() } // Active condition
    })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

    return recommendations.map(auction => ({
        id: auction._id,
        title: auction.title,
        startingPrice: auction.startingPrice,
        currentPrice: auction.currentPrice,
        image: auction.images && auction.images.length > 0 ? auction.images[0] : 'https://via.placeholder.com/300'
    }));
};

export const getRecentActivityService = async (userId) => {
    const recentBids = await Bid.find({ bidder: userId })
        .populate('auction', 'title images')
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

export const toggleWatchlistService = async (userId, auctionId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const index = user.watchlist.indexOf(auctionId);
    let added = false;
    
    if (index === -1) {
        user.watchlist.push(auctionId);
        added = true;
        // Fire tracking event
        trackEventService(userId, { 
            auctionId, 
            eventType: 'watchlist_add'
        }).catch(() => {});
    } else {
        user.watchlist.splice(index, 1);
        // Fire tracking event
        trackEventService(userId, { 
            auctionId, 
            eventType: 'watchlist_remove'
        }).catch(() => {});
    }

    await user.save();
    return { added };
};

export const getWatchlistService = async (userId) => {
    const user = await User.findById(userId).populate({
        path: 'watchlist',
        select: 'title images currentPrice startingPrice status endTime bidCount',
        match: { status: 'active' } // optionally only show active
    });
    
    if (!user) throw new Error('User not found');
    
    // Filter out nulls in case an auction was deleted
    return user.watchlist.filter(item => item !== null);
};

import Order from '../../models/order.model.js';

export const getMyOrdersService = async (userId) => {
    const orders = await Order.find({ buyer: userId })
        .populate('auction', 'title images')
        .populate('seller', 'firstName lastName')
        .sort({ createdAt: -1 })
        .lean();

    return orders;
};
