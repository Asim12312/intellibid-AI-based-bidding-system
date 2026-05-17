import Auction from '../../models/auction.model.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Create a new auction listing ─────────────────────────────────────────────
export const createListingService = async (sellerId, data, imageUrls) => {
    const {
        title, description, category, tags,
        startingPrice, reservePrice, durationDays, status
    } = data;

    const endTime = new Date();
    endTime.setDate(endTime.getDate() + Number(durationDays || 7));

    const auction = await Auction.create({
        title: title.trim(),
        description: description.trim(),
        category,
        tags: Array.isArray(tags) ? tags : (tags || '').split(',').map(t => t.trim()).filter(Boolean),
        images: imageUrls,
        startingPrice: Number(startingPrice),
        currentPrice: Number(startingPrice),
        reservePrice: reservePrice ? Number(reservePrice) : undefined,
        seller: sellerId,
        endTime,
        status: status === 'draft' ? 'draft' : 'active',
    });

    return auction;
};

// ── AI Enhance listing content ────────────────────────────────────────────────
export const getAiEnhancedContentService = async (rawTitle, category, imageUrls = []) => {
    const imageContext = imageUrls.length > 0 
        ? `The seller has uploaded ${imageUrls.length} image(s) of the item.` 
        : 'No images provided yet.';

    const prompt = `
You are an expert auction copywriter for IntelliBid, a premium AI-powered auction marketplace.

A seller is creating a listing with:
- Raw title (typed by seller): "${rawTitle}"
- Category: "${category}"
- ${imageContext}

Generate a high-converting auction listing. Return ONLY a valid JSON object with these exact keys:
{
  "enhancedTitle": "A compelling, searchable title under 70 characters. Include brand, model, or key attribute if identifiable. No ALL CAPS.",
  "description": "A 150-220 word professional auction description. Open with the most compelling fact about the item. Use short paragraphs. Mention condition, key features, and why a buyer should want this. End with a bid encouragement.",
  "tags": ["5 to 8 lowercase single or two-word tags relevant to this item and category"],
  "suggestedStartingPrice": 0
}

Rules:
- suggestedStartingPrice must be a reasonable USD number based on typical market value for this category and item
- tags must be an array of strings
- description must not include the title verbatim
- Return ONLY valid JSON. No markdown, no code blocks, no extra text.
`.trim();

    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: { responseMimeType: 'application/json' }
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = JSON.parse(text);

        // Validate required fields exist
        return {
            enhancedTitle: parsed.enhancedTitle || rawTitle,
            description: parsed.description || '',
            tags: Array.isArray(parsed.tags) ? parsed.tags : [],
            suggestedStartingPrice: Number(parsed.suggestedStartingPrice) || 0,
        };
    } catch (error) {
        console.error('[AI Listing] Gemini enhancement failed:', error.message);
        throw new Error('AI enhancement unavailable. Please fill in the details manually.');
    }
};

// ── Get seller's own listings (paginated) ─────────────────────────────────────
export const getMyListingsService = async (sellerId, { status, page = 1, limit = 12 } = {}) => {
    const filter = { seller: sellerId };
    if (status && status !== 'all') filter.status = status;

    const skip = (page - 1) * limit;
    const [listings, total] = await Promise.all([
        Auction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Auction.countDocuments(filter),
    ]);

    return {
        listings: listings.map(l => ({
            id: l._id,
            title: l.title,
            category: l.category,
            image: l.images?.[0] || null,
            currentPrice: l.currentPrice,
            startingPrice: l.startingPrice,
            bidCount: l.bidCount,
            viewCount: l.viewCount,
            endTime: l.endTime,
            status: l.status,
            createdAt: l.createdAt,
        })),
        total,
        page: Number(page),
        hasMore: skip + listings.length < total,
    };
};

// ── Update a listing (seller must own it) ─────────────────────────────────────
export const updateListingService = async (listingId, sellerId, data) => {
    const auction = await Auction.findOne({ _id: listingId, seller: sellerId });
    if (!auction) throw new Error('Listing not found or access denied');
    if (auction.status === 'ended') throw new Error('Cannot edit an ended auction');

    const allowedUpdates = ['title', 'description', 'tags', 'reservePrice', 'status'];
    allowedUpdates.forEach(field => {
        if (data[field] !== undefined) auction[field] = data[field];
    });

    await auction.save();
    return auction;
};

// ── Soft-delete (cancel) a listing ────────────────────────────────────────────
export const deleteListingService = async (listingId, sellerId) => {
    const auction = await Auction.findOne({ _id: listingId, seller: sellerId });
    if (!auction) throw new Error('Listing not found or access denied');
    if (auction.bidCount > 0) throw new Error('Cannot cancel an auction that already has bids');

    auction.status = 'cancelled';
    await auction.save();
    return { message: 'Listing cancelled successfully' };
};
