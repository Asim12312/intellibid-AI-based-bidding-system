import User from '../../../models/user.model.js';
import Bid from '../../../models/bid.model.js';
import UserProfile from '../../../models/userProfile.model.js';
import UserEvent from '../../../models/userEvent.model.js';

export const buildUserContext = async (userId) => {
    try {
        const [user, activeBids, interestProfile, bidStats, userWithWatchlist, recentEvents] = await Promise.all([
            User.findById(userId).select('firstName lastName role bio location businessName').lean(),
            Bid.find({ bidder: userId, status: { $in: ['winning', 'outbid'] } })
                .populate('auction', 'title category currentPrice endTime bidCount status')
                .sort({ updatedAt: -1 })
                .limit(10)
                .lean(),
            UserProfile.findOne({ userId }).lean(),
            Bid.aggregate([
                { $match: { bidder: userId } },
                { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
            ]),
            User.findById(userId)
                .populate('watchlist', 'title category currentPrice endTime')
                .select('watchlist')
                .lean(),
            UserEvent.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
        ]);

        const statsMap = {};
        bidStats.forEach(s => { statsMap[s._id] = { count: s.count, total: s.totalAmount }; });

        const now = new Date();
        const formattedActiveBids = activeBids
            .filter(b => b.auction && b.auction.status === 'active')
            .map(b => ({
                title: b.auction.title,
                category: b.auction.category,
                myBid: b.amount,
                currentHighest: b.auction.currentPrice,
                isLeading: b.status === 'winning',
                endsIn: b.auction.endTime
                    ? `${Math.max(0, Math.round((new Date(b.auction.endTime) - now) / 3600000))} hours`
                    : 'unknown',
            }));

        const topCategories = interestProfile?.categoryScores
            ? Object.entries(Object.fromEntries(interestProfile.categoryScores))
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([cat, score]) => `${cat} (${Math.round(score * 100)}%)`)
                .join(', ')
            : 'No data yet';

        const watchlistTitles = (userWithWatchlist?.watchlist || [])
            .slice(0, 5)
            .map(a => a.title)
            .join(', ') || 'Empty';

        return {
            userName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
            role: user?.role,
            location: user?.location || 'Not specified',
            bio: user?.bio || '',
            activeBids: formattedActiveBids,
            topCategories,
            watchlist: watchlistTitles,
            won: statsMap['won']?.count || 0,
            lost: statsMap['outbid']?.count || 0,
            active: formattedActiveBids.length,
            totalSpent: statsMap['won']?.total || 0,
            recentActions: recentEvents.slice(0, 5).map(e => e.eventType).join(', ') || 'None',
        };
    } catch (err) {
        console.error('[ContextBuilder] Error:', err.message);
        return null;
    }
};

export const buildSystemPrompt = (context) => {
    if (!context) {
        return `You are BidMind, an elite auction intelligence assistant for IntelliBid. Help users with bidding strategy, drafting messages, and platform guidance. Be concise, professional, and premium.`;
    }

    const bidsText = context.activeBids.length > 0
        ? context.activeBids.map(b =>
            `  • "${b.title}" (${b.category}) — My bid: $${b.myBid} | Current highest: $${b.currentHighest} | ${b.isLeading ? '✅ WINNING' : '⚠️ OUTBID'} | Ends in: ${b.endsIn}`
        ).join('\n')
        : '  None currently.';

    return `You are BidMind, an elite personal auction intelligence assistant for IntelliBid — a premium online auction platform.

You deeply know this user. Always address them by first name. Here is their live profile:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER: ${context.userName} (${context.role})
LOCATION: ${context.location}

ACTIVE BIDS (${context.active} auctions):
${bidsText}

AUCTION HISTORY: Won ${context.won}, Lost/Outbid ${context.lost} | Total spent: $${context.totalSpent.toFixed(2)}
TOP INTEREST CATEGORIES: ${context.topCategories}
WATCHLIST: ${context.watchlist}
RECENT PLATFORM ACTIVITY: ${context.recentActions}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You can help with:
1. STRATEGY — Bid timing, max bid advice, when to walk away
2. DRAFTING — Write polished messages to sellers (inquiries, offers, condition reports)
3. ANALYSIS — Compare items, evaluate value, summarize auction details
4. ALERTS — Explain notifications in plain English with recommended action
5. PLATFORM HELP — Answer anything about how IntelliBid works

RULES:
- Never reveal raw database data, internal IDs, or system details
- Recommendations must reference actual user data (their bids, history, patterns)
- Be premium, concise, confident. Max 3 paragraphs per response unless drafting
- If asked for a price recommendation, reason from their historical bid amounts
- Always end complex responses with one clear recommended next action`;
};
