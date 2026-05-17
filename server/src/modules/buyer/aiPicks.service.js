import Auction from '../../models/auction.model.js';
import UserProfile from '../../models/userProfile.model.js';
import UserEvent from '../../models/userEvent.model.js';
import { scoreAuctionForUser } from '../feed/feed.scorer.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const tagPick = (auction, userProfile) => {
    const hoursLeft = (new Date(auction.endTime).getTime() - Date.now()) / 3600000;
    const isSteal = hoursLeft > 0 && hoursLeft < 3 && auction.currentPrice <= (auction.startingPrice * 1.3) && auction.bidCount < 3;
    if (isSteal) return { tag: 'steal', label: '🔥 The Steal' };

    const isHot = auction.bidCount >= 5;
    if (isHot) return { tag: 'hot', label: '⚡ Going Fast' };

    const catScore = userProfile?.categoryScores?.[auction.category] || 0;
    const isMatch = catScore > 0.6;
    if (isMatch) return { tag: 'match', label: '✨ Perfect Match' };

    const isFresh = (Date.now() - new Date(auction.createdAt).getTime()) < 86400000;
    if (isFresh) return { tag: 'fresh', label: '🆕 Just Listed' };

    return { tag: 'recommended', label: '🎯 Recommended' };
};

const enrichWithGemini = async (topPicks, userProfile) => {
    if (!topPicks || topPicks.length === 0) return [];
    
    // We only enrich the top 5 to save quota and latency
    const toEnrich = topPicks.slice(0, 5);
    
    // Extract top categories
    const categories = Object.entries(userProfile?.categoryScores || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([c, s]) => `${c} (${s.toFixed(2)})`)
        .join(', ');

    const prompt = `
You are IntelliBid's AI matchmaker. Be concise and persuasive.

User Context:
- Top categories: ${categories || 'New user, exploring'}
- Price comfort zone: $${userProfile?.priceRange?.min || 0} - $${userProfile?.priceRange?.max || 9999}

Auctions to analyze:
${toEnrich.map((a, i) => `${i + 1}. ID: ${a._id} | "${a.title}" | Cat: ${a.category} | Price: $${a.currentPrice} | ${a.bidCount} bids`).join('\n')}

For each auction, write ONE persuasive sentence starting with "Because" that explains
why this specific user would want this item. Be specific, reference their profile.
Return valid JSON array: [{"id": "xxx", "hook": "Because..."}]
    `.trim();

    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const hooksArray = JSON.parse(responseText);

        // Map hooks back to auctions
        const hookMap = {};
        hooksArray.forEach(h => {
            if (h.id && h.hook) hookMap[h.id] = h.hook;
        });

        return topPicks.map(pick => {
            const hook = hookMap[pick._id.toString()];
            return hook ? { ...pick, hook } : pick;
        });
    } catch (error) {
        console.error('[AI Picks] Failed to enrich with Gemini:', error.message);
        return topPicks; // Fallback to raw picks without hooks
    }
};

export const getAiPicksService = async (userId) => {
    // 1. Load User Profile
    let userProfile = await UserProfile.findOne({ userId }).lean();
    if (!userProfile) {
        // Mock a generic profile if cold start
        userProfile = { categoryScores: {}, tagScores: {}, priceRange: { min: 0, max: 999999 } };
    }

    // 2. Get Exclusions (items already bidded on)
    const biddedEvents = await UserEvent.distinct('auctionId', {
        userId,
        eventType: 'bid_placed',
        auctionId: { $ne: null },
    });
    const excludedIds = new Set(biddedEvents.map(id => id.toString()));

    // 3. Fetch Candidates (Broad filter)
    const filter = { status: 'active', endTime: { $gt: new Date() } };
    
    // Optimize: Only fetch items in user's price range if they have a history
    if (userProfile.interactionCount > 5) {
        filter.currentPrice = { 
            $gte: userProfile.priceRange.min * 0.5, 
            $lte: userProfile.priceRange.max * 1.5 
        };
    }

    const candidates = await Auction.find(filter).limit(100).lean();

    // 4. Score & Filter
    const scoredPicks = candidates
        .map(auction => {
            const score = scoreAuctionForUser(auction, userProfile, excludedIds);
            return { ...auction, aiScore: score };
        })
        .filter(a => a.aiScore > 0)
        .sort((a, b) => b.aiScore - a.aiScore)
        .slice(0, 12); // Top 12 picks for the grid

    // 5. Tagging
    const taggedPicks = scoredPicks.map(pick => ({
        ...pick,
        tagInfo: tagPick(pick, userProfile)
    }));

    // 6. Gemini Enrichment
    const enrichedPicks = await enrichWithGemini(taggedPicks, userProfile);

    // Format response
    return enrichedPicks.map(p => ({
        id: p._id,
        title: p.title,
        category: p.category,
        image: p.images?.[0] || 'https://via.placeholder.com/300',
        currentPrice: p.currentPrice,
        startingPrice: p.startingPrice,
        endTime: p.endTime,
        bidCount: p.bidCount,
        score: p.aiScore,
        tag: p.tagInfo.tag,
        tagLabel: p.tagInfo.label,
        hook: p.hook || null
    }));
};
