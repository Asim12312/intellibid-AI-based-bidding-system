import 'dotenv/config';
import '../config/env.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { assertAdminEnv } from '../config/env.js';
import { Admin } from '../models/Admin.js';
import { PlatformUser } from '../models/PlatformUser.js';
import { Auction } from '../models/Auction.js';
import { Bid } from '../models/Bid.js';
import { Ticket } from '../models/Ticket.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { Notification } from '../models/Notification.js';
import { AiProposal } from '../models/AiProposal.js';
import { logger } from '../utils/logger.js';

async function seed() {
  assertAdminEnv();
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);

  await Promise.all([
    Admin.deleteMany({}),
    PlatformUser.deleteMany({}),
    Auction.deleteMany({}),
    Bid.deleteMany({}),
    Ticket.deleteMany({}),
    ActivityLog.deleteMany({}),
    Notification.deleteMany({}),
    AiProposal.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'Admin@12345', 12);
  const admin = await Admin.create({
    email: (process.env.SEED_ADMIN_EMAIL || 'admin@intellibid.com').toLowerCase(),
    passwordHash,
    name: process.env.SEED_ADMIN_NAME || 'Admin User',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
    role: 'admin',
  });

  const users = await PlatformUser.insertMany([
    {
      platformId: 'IB-9021',
      name: 'Alex Sterling',
      email: 'alex.sterling@example.com',
      username: 'alex_dev',
      avatarUrl:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
      status: 'active',
      lastActivityAt: new Date(Date.now() - 2 * 60 * 1000),
      lastActivitySummary: 'Bidding on Lot #4471',
      trustScore: 8.5,
      verificationTier: 'gold',
    },
    {
      platformId: 'IB-4420',
      name: 'Morgan Vane',
      email: 'mvane88@proton.me',
      username: 'mvane88',
      avatarUrl:
        'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100',
      status: 'banned',
      banReason: 'Policy Violation',
      bannedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      bannedBy: admin._id,
      lastActivityAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      lastActivitySummary: 'Locked: Policy Violation',
    },
    {
      platformId: 'IB-8812',
      name: 'Casey Wright',
      email: 'casey.w@intelli.bid',
      username: 'casey_w',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
      status: 'active',
      lastActivityAt: new Date(Date.now() - 15 * 60 * 1000),
      lastActivitySummary: 'Browsing Luxury Watches',
      trustScore: 7.2,
    },
    {
      platformId: 'IB-1109',
      name: 'Jaden Smith',
      email: 'jsmith.official@gmail.com',
      username: 'sneakerhead_88',
      avatarUrl:
        'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=100',
      status: 'active',
      isFlagged: true,
      flagReason: 'Suspect Bid',
      riskScore: 68,
      lastActivityAt: new Date(),
      lastActivitySummary: 'Bidding on Real Estate',
      trustScore: 6.1,
    },
    {
      platformId: 'IB-3301',
      name: 'Vintage Collector',
      email: 'vintage_collector@example.com',
      username: 'vintage_collector',
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
      status: 'active',
      trustScore: 9.8,
      verificationTier: 'diamond',
      lastActivityAt: new Date(),
      lastActivitySummary: 'Payment dispute open',
    },
  ]);

  const endsSoon = new Date(Date.now() + 2 * 60 * 60 * 1000 + 14 * 60 * 1000);
  const endsLater = new Date(Date.now() + 14 * 60 * 60 * 1000);
  const endsDays = new Date(Date.now() + 44 * 60 * 60 * 1000);

  const auctions = await Auction.insertMany([
    {
      lotId: '4471',
      title: "Air Jordan 1 '85",
      category: 'Sneakers',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCXiXPa0I09OIewzhEDxDMVZfUVatkNuJkZF6hTZ6ywEPapgJ-a-LidNeHtBAK1qCe-9pmtv0YoERsr_iJ-iVieyl6NyxIbm0yvOJKOxBs9cJxDqiNULw3TcW4Irt7AfzhsBcFVMyZtVKHRCGVbCD-2Ze_-_Sl6VDUFFi4Sn17GDVQu1TJhjdWlTS5x6usTMHlsF7j4ltse6VFwlhGn_dQJvYQOQmX3GvbXbj_OyzlCjAZh4w6J4nwiK6lCRVFIodGaEj-xRnCTrDo',
      status: 'live',
      currency: 'USD',
      startingBid: 8000,
      currentBid: 12400,
      agentMode: 'ai_agent',
      endsAt: endsSoon,
      topBidderId: users[3]._id,
      topBidderHandle: 'sneakerhead_88',
      bidCount: 42,
      auctionRef: 'JORDAN-1-CHICAGO-1985',
    },
    {
      lotId: '8829',
      title: 'Vintage Rolex Datejust',
      category: 'Watches',
      imageUrl:
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=100',
      status: 'live',
      currency: 'USD',
      startingBid: 7000,
      currentBid: 8950,
      agentMode: 'manual_only',
      endsAt: endsLater,
      bidCount: 18,
    },
    {
      lotId: '1021',
      title: 'NFT: Chromatic #44',
      category: 'Fine Art',
      imageUrl:
        'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=100',
      status: 'live',
      currency: 'ETH',
      startingBid: 1.5,
      currentBid: 2.4,
      estimatedValue: 12,
      agentMode: 'ai_agent',
      endsAt: endsDays,
      isAiPick: true,
      themeColor: 'bg-on-background',
      bidCount: 31,
    },
    {
      lotId: '4471-CHI',
      title: "Air Jordan 1 'Chicago' 1985",
      category: 'Sneakers',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBtUeRIjw8Kddz-Z4UbL8U-cDkJeGP73WHnZFKyrrmmzUOFG4xN4hhcZ9Nab8i9eQEOdczM64x5PCxRT6p1gVC13t30c0iEj2OrW2PFj7iDAIrheK_KMs57jQbbJKmw3s0FPjMsgS3zZhZXe1WeYJsnB3YtXDyEZLlEI-SDMVMGDv18E9c_H1jcCLt0yz8CGe3upR2WsW2oepgAiQhHX6VXIicwIqbzdxKWVnVvk2Pl8ZMAZA9vwIO7NjcUL6feSCfczvfh0wK9e2Y',
      status: 'live',
      currency: 'USD',
      startingBid: 9000,
      currentBid: 12400,
      agentMode: 'ai_agent',
      isLive: true,
      endsAt: endsSoon,
      topBidderHandle: 'sneakerhead_88',
      topBidderId: users[3]._id,
      themeColor: 'bg-tertiary-container',
      bidCount: 55,
      auctionRef: 'JORDAN-1-CHICAGO-1985',
    },
    {
      lotId: '8829-DD',
      title: 'Rolex Day-Date 18k Gold',
      category: 'Watches',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBITIIPsaVQ45YzWFrDxy-6FVKM48OLYYjXGxEcmStX0T8Nfr7QC5R-WzB3NoWdXBTQbXNF9xcp6STuqnkQ2SOTWPD_RpvgLkOBS1KzXDDsVfJwNymTqOPGt6oiluv-NgiGZhUrAd_mRc6MUkVPL2RkKYMNBRQFvklmeYSVIvjFdTXilPp_VMj1zYLx3AfQ14TYH8Xz1wjtS2qSunb9RF0P-hpVt9pAdIwqJRk6pcsnmRlhqg_erbQJruukq2SS1em-LYdrYEEzSZo',
      status: 'live',
      currency: 'USD',
      startingBid: 28000,
      currentBid: 34500,
      isFlagged: true,
      flagReason: 'BOT PATTERN',
      suspiciousActivity: true,
      endsAt: new Date(Date.now() + 45 * 60 * 1000),
      themeColor: 'bg-[#ffd7f3]',
      bidCount: 22,
    },
    {
      lotId: '1021-M6',
      title: "Leica M6 'Black Chrome'",
      category: 'Photography',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBu1oGg4Rs8v9jaHHwLD0yXWnzqFtYuxu7S7ugi5ZaeDd3mxRMXmBJWaNnzLduof2uKk4CWEKqSfZ4wT1u_VxconNBzdvXqibq7hksZT6oBBe3yO0plXjDZRNn_-O50E61jHkEOA-BaQs_E0u-SL_OpWJmdxDMB39edzNpvfUGwVI7FcA-JiPG6UTi99zTuJ_-sU6Gi693rNIw68sHigS9p0ULrUeg-vd89vvjA0cANHfehDTJRJxjFYAjwJrXZfeFvDOJf_0wSwtE',
      status: 'live',
      currency: 'USD',
      startingBid: 3500,
      currentBid: 4200,
      topBidderHandle: 'leica_lover',
      endsAt: endsLater,
      themeColor: 'bg-primary-fixed-dim',
      bidCount: 12,
    },
    {
      lotId: '0042',
      title: "'Digital Chaos' NFT/Canvas",
      category: 'Fine Art',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDmN8jfc8rExk2INo2lpHogB_NRuPL25bC2voWD1qpAhZKkTmKzyL1JkHzj3VGzJApp81MalREH9mC94OP62EEMPYOhNnNwT6iKcrIE59EfWOLF5gyLoVRnzYZ1A-iu5EsAs59wny7UbmegROobJMPNnOU2eW9Xouij5Sb42fLbOWmD_zc9upYazg4Dtm0hP-HDJdJF4PUk0hMQg6WPz8E6LzjpH7bLVX5SVdLcG5bvAM3_a3NlHvDzRY7MuosYl2ZUp1CkY5tKpoM',
      status: 'live',
      currency: 'ETH',
      startingBid: 6,
      currentBid: 8.4,
      estimatedValue: 12,
      isAiPick: true,
      endsAt: new Date(Date.now() + 5 * 60 * 60 * 1000),
      themeColor: 'bg-on-background',
      bidCount: 8,
    },
  ]);

  await Bid.insertMany([
    { auctionId: auctions[0]._id, userId: users[3]._id, amount: 12400, currency: 'USD' },
    { auctionId: auctions[3]._id, userId: users[3]._id, amount: 12400, currency: 'USD' },
    { auctionId: auctions[4]._id, userId: users[0]._id, amount: 34500, currency: 'USD', isAiAgent: true },
  ]);

  const ticketOpened = new Date('2023-10-24T14:02:00.000Z');

  await Ticket.insertMany([
    {
      ticketId: '4471-DISP',
      title: 'Double Bid Glitch',
      type: 'bid_glitch',
      userId: users[3]._id,
      auctionId: auctions[0]._id,
      priority: 'urgent',
      status: 'open',
      lastMessageAt: new Date(Date.now() - 2 * 60 * 1000),
      messages: [
        {
          senderType: 'user',
          senderId: users[3]._id,
          body: 'My bid was placed twice for the same lot. Please reverse the duplicate charge.',
          createdAt: new Date(Date.now() - 2 * 60 * 1000),
        },
      ],
    },
    {
      ticketId: '5012-AUCT',
      title: 'Payment Escalation',
      type: 'payment',
      userId: users[4]._id,
      auctionId: auctions[3]._id,
      priority: 'medium',
      status: 'under_ai_review',
      aiGenuinenessScore: 92,
      lastMessageAt: new Date(),
      messages: [
        {
          senderType: 'system',
          body: 'Ticket opened: Oct 24, 2023 - 14:02 GMT',
          createdAt: ticketOpened,
        },
        {
          senderType: 'user',
          senderId: users[4]._id,
          body: "I won the auction for the Jordan 1s (Lot #4471) but the payment gateway keeps declining my card. I've tried three different banks. I don't want to lose my bid because of a technicality!",
          createdAt: new Date('2023-10-24T14:05:00.000Z'),
        },
        {
          senderType: 'ai',
          body: 'Analyzing payment logs... Error code 402 noted across three attempts. Risk profile for vintage_collector is LOW. Suggesting manual payment override for Admin.',
          createdAt: new Date('2023-10-24T14:06:00.000Z'),
        },
        {
          senderType: 'system',
          body: 'ADMIN DECISION NEEDED: Manual override will bypass Stripe automated security checks.',
          createdAt: new Date('2023-10-24T14:07:00.000Z'),
        },
      ],
    },
    {
      ticketId: '9920-SHP',
      title: 'Shipping Delay query',
      type: 'shipping',
      userId: users[2]._id,
      priority: 'low',
      status: 'open',
      lastMessageAt: new Date(Date.now() - 60 * 60 * 1000),
      messages: [
        {
          senderType: 'user',
          senderId: users[2]._id,
          body: 'Item has not shipped after 5 business days. Please advise.',
          createdAt: new Date(Date.now() - 60 * 60 * 1000),
        },
      ],
    },
  ]);

  await ActivityLog.insertMany([
    {
      type: 'user_role',
      message: 'New admin role assigned to alex_dev',
      actorId: admin._id,
      createdAt: new Date(Date.now() - 2 * 60 * 1000),
    },
    {
      type: 'transaction_alert',
      message: 'High-value transaction alert in Sneakers',
      createdAt: new Date(Date.now() - 14 * 60 * 1000),
    },
    {
      type: 'system_patch',
      message: 'System kernel successfully patched to v4.2.1',
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
    },
  ]);

  await Notification.insertMany([
    {
      adminId: admin._id,
      type: 'alert',
      title: 'Urgent dispute',
      body: 'Payment escalation requires admin decision',
      link: '/complaints',
      read: false,
    },
    {
      adminId: null,
      type: 'info',
      title: 'Platform healthy',
      body: 'All systems operational',
      read: true,
    },
  ]);

  await AiProposal.create({
    title: 'Liquidity Reserve Adjustment',
    insight:
      "Current bid velocity in 'Luxury Goods' category is 14% higher than projected. Recommend increasing liquidity reserve by $500k to maintain instant payout stability.",
    category: 'liquidity',
    status: 'pending',
  });

  const bulkUsers = [];
  for (let i = 0; i < 240; i++) {
    bulkUsers.push({
      platformId: `IB-${10000 + i}`,
      name: `User ${i}`,
      email: `user${i}@intellibid.example.com`,
      username: `user_${i}`,
      status: 'active',
      lastActivityAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      lastActivitySummary: 'Browsing auctions',
      trustScore: 5 + Math.random() * 5,
      riskScore: Math.floor(Math.random() * 30),
    });
  }
  await PlatformUser.insertMany(bulkUsers);

  logger.info('Seed completed successfully');
  logger.info(`Admin login: ${admin.email} / ${process.env.SEED_ADMIN_PASSWORD || 'Admin@12345'}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  logger.error('Seed failed', { message: err.message, stack: err.stack });
  process.exit(1);
});
