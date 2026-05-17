import { Auction } from '../models/Auction.js';
import { Admin } from '../models/Admin.js';
import { Bid } from '../models/Bid.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, buildPaginationMeta } from '../utils/pagination.js';
import {
  formatCurrency,
  formatTimeRemaining,
  agentActivityLabel,
} from '../utils/formatters.js';

function formatAuctionSnapshot(auction) {
  const isUrgent = new Date(auction.endsAt).getTime() - Date.now() < 3 * 60 * 60 * 1000;
  return {
    id: auction._id,
    lotId: auction.lotId,
    img: auction.imageUrl,
    name: auction.title,
    bid: formatCurrency(auction.currentBid, auction.currency),
    currentBid: auction.currentBid,
    status: agentActivityLabel(auction.agentMode),
    time: formatTimeRemaining(auction.endsAt),
    isUrgent,
    endsAt: auction.endsAt,
  };
}

const AUCTION_THEME_CLASSES = [
  'bg-[var(--acid)]',
  'bg-[var(--electric)]',
  'bg-[var(--hotpink)]',
  'bg-[var(--sunset)]',
];

const LEGACY_THEME_MAP = {
  'bg-on-background': 'bg-[var(--electric)]',
  'bg-tertiary-container': 'bg-[var(--acid)]',
  'bg-primary-fixed-dim': 'bg-[var(--sunset)]',
  'bg-error': 'bg-[var(--hotpink)]',
  'bg-secondary': 'bg-[var(--muted)]',
  'bg-on-surface-variant': 'bg-[var(--muted)]',
};

function resolveThemeColor(themeColor, index = 0) {
  if (!themeColor) return AUCTION_THEME_CLASSES[index % AUCTION_THEME_CLASSES.length];
  if (LEGACY_THEME_MAP[themeColor]) return LEGACY_THEME_MAP[themeColor];
  if (themeColor.startsWith('bg-[var(--') || themeColor.startsWith('bg-[#')) return themeColor;
  return AUCTION_THEME_CLASSES[index % AUCTION_THEME_CLASSES.length];
}

function formatAuctionCard(auction, index = 0) {
  const suggestedNext =
    auction.currency === 'ETH'
      ? `${(auction.currentBid + 0.1).toFixed(1)} ETH`
      : formatCurrency(auction.currentBid + Math.max(100, auction.currentBid * 0.02), auction.currency);

  return {
    id: auction._id,
    lotId: auction.lotId.startsWith('#') ? auction.lotId : `#${auction.lotId}`,
    title: auction.title,
    category: auction.category,
    bid: formatCurrency(auction.currentBid, auction.currency),
    currentBid: auction.currentBid,
    user: auction.topBidderHandle ? `@${auction.topBidderHandle.replace('@', '')}` : null,
    next: auction.isFlagged ? 'Moderate' : `Bid ${suggestedNext}`,
    time: formatTimeRemaining(auction.endsAt),
    img: auction.imageUrl,
    isLive: auction.status === 'live',
    isFlagged: auction.isFlagged,
    isAiPick: auction.isAiPick,
    color: resolveThemeColor(auction.themeColor, index),
    value: auction.estimatedValue
      ? auction.currency === 'ETH'
        ? `${auction.estimatedValue} ETH`
        : formatCurrency(auction.estimatedValue, auction.currency)
      : null,
    flagReason: auction.flagReason,
    suspiciousActivity: auction.suspiciousActivity,
    endsAt: auction.endsAt,
    currency: auction.currency,
    companyName: auction.companyName || 'IntelliBid',
    listedBy: auction.listedBy || '',
    status: auction.status,
    startingBid: auction.startingBid,
    description: auction.description,
    imageUrl: auction.imageUrl,
  };
}

function buildAuctionFilter(query) {
  const filter = {};
  const filterType = query.filter?.toLowerCase();

  if (query.status) filter.status = query.status;
  else if (query.snapshot === 'true') filter.status = 'live';
  else if (!query.includeEnded) filter.status = query.status || 'live';

  if (filterType === 'highvalue') filter.currentBid = { $gte: 10000 };
  if (filterType === 'closingsoon') {
    filter.endsAt = { $lte: new Date(Date.now() + 2 * 60 * 60 * 1000), $gt: new Date() };
    filter.status = 'live';
  }
  if (filterType === 'aiflagged') filter.isFlagged = true;
  if (query.aiFlagged === 'true') filter.isFlagged = true;
  if (query.category) filter.category = query.category;
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { lotId: { $regex: query.search, $options: 'i' } },
    ];
  }

  return filter;
}

export async function listAuctions(query) {
  const { page, limit, skip } = getPagination(query);
  const filter = buildAuctionFilter(query);
  const sort =
    query.sort === 'endingSoon'
      ? { endsAt: 1 }
      : query.sort === 'highBid'
        ? { currentBid: -1 }
        : { createdAt: -1 };

  const [auctions, total] = await Promise.all([
    Auction.find(filter).sort(sort).skip(skip).limit(limit),
    Auction.countDocuments(filter),
  ]);

  const formatter = query.snapshot === 'true' ? formatAuctionSnapshot : formatAuctionCard;
  return {
    data: auctions.map((auction, index) =>
      query.snapshot === 'true' ? formatAuctionSnapshot(auction) : formatAuctionCard(auction, index)
    ),
    pagination: buildPaginationMeta(total, page, limit),
  };
}

export async function getAuctionById(id) {
  const auction = await Auction.findById(id).populate('topBidderId', 'name username email trustScore');
  if (!auction) throw ApiError.notFound('Auction not found');

  const bids = await Bid.find({ auctionId: id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('userId', 'name username platformId');

  return {
    ...formatAuctionCard(auction),
    description: auction.description,
    imageUrl: auction.imageUrl,
    startingBid: auction.startingBid,
    reservePrice: auction.reservePrice,
    estimatedValue: auction.estimatedValue,
    companyName: auction.companyName,
    listedBy: auction.listedBy,
    bidHistory: bids.map((b) => ({
      id: b._id,
      amount: b.amount,
      currency: b.currency,
      user: b.userId,
      isAiAgent: b.isAiAgent,
      createdAt: b.createdAt,
    })),
    topBidder: auction.topBidderId,
  };
}

async function generateLotId() {
  const count = await Auction.countDocuments();
  return `${4470 + count + 1}`;
}

export async function createAuction(body, adminId) {
  const lotId = (body.lotId || `#${await generateLotId()}`).replace('#', '');
  const endsAt = body.endsAt ? new Date(body.endsAt) : new Date(Date.now() + 24 * 60 * 60 * 1000);
  const admin = adminId ? await Admin.findById(adminId) : null;
  const companyName = process.env.COMPANY_NAME || 'IntelliBid';

  const auction = await Auction.create({
    lotId: lotId.toUpperCase(),
    title: body.title,
    description: body.description || '',
    category: body.category,
    imageUrl: body.imageUrl,
    imageUrls: body.imageUrls || [],
    status: body.status || 'live',
    currency: body.currency || 'USD',
    startingBid: body.startingBid,
    currentBid: body.currentBid ?? body.startingBid,
    estimatedValue: body.estimatedValue,
    reservePrice: body.reservePrice,
    agentMode: body.agentMode || 'manual_only',
    isAiPick: body.isAiPick || false,
    themeColor: body.themeColor || 'bg-white',
    endsAt,
    auctionRef: body.auctionRef || '',
    topBidderHandle: body.topBidderHandle || '',
    companyName: body.companyName || companyName,
    listedBy: admin?.name || companyName,
    createdByAdminId: adminId,
  });

  await ActivityLog.create({
    type: 'auction_created',
    message: `Auction ${auction.title} (${auction.lotId}) created`,
    actorId: adminId,
    metadata: { auctionId: auction._id },
  });

  return formatAuctionCard(auction);
}

export async function updateAuction(id, body, adminId) {
  const auction = await Auction.findById(id);
  if (!auction) throw ApiError.notFound('Auction not found');

  const allowed = [
    'title',
    'description',
    'category',
    'imageUrl',
    'status',
    'startingBid',
    'currentBid',
    'reservePrice',
    'estimatedValue',
    'agentMode',
    'isFlagged',
    'flagReason',
    'isAiPick',
    'endsAt',
    'themeColor',
    'suspiciousActivity',
    'companyName',
    'listedBy',
  ];
  for (const key of allowed) {
    if (body[key] !== undefined) auction[key] = body[key];
  }
  await auction.save();

  await ActivityLog.create({
    type: 'other',
    message: `Auction ${auction.title} updated`,
    actorId: adminId,
    metadata: { auctionId: auction._id },
  });

  return formatAuctionCard(auction);
}

export async function endAuction(id, adminId) {
  const auction = await Auction.findById(id);
  if (!auction) throw ApiError.notFound('Auction not found');
  auction.status = 'ended';
  await auction.save();

  await ActivityLog.create({
    type: 'other',
    message: `Auction ${auction.title} ended by admin`,
    actorId: adminId,
    metadata: { auctionId: auction._id },
  });

  return formatAuctionCard(auction);
}

export async function clearAuctionFlag(id, adminId) {
  const auction = await Auction.findById(id);
  if (!auction) throw ApiError.notFound('Auction not found');
  auction.isFlagged = false;
  auction.flagReason = '';
  auction.suspiciousActivity = false;
  await auction.save();

  await ActivityLog.create({
    type: 'other',
    message: `AI flag cleared on auction ${auction.title}`,
    actorId: adminId,
    metadata: { auctionId: auction._id },
  });

  return formatAuctionCard(auction);
}

export async function getAuctionSnapshot(limit = 5) {
  const auctions = await Auction.find({ status: 'live' })
    .sort({ endsAt: 1 })
    .limit(limit);
  return auctions.map(formatAuctionSnapshot);
}
