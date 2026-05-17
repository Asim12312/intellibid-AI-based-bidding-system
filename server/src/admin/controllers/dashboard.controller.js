import * as analyticsService from '../services/analytics.service.js';
import * as auctionService from '../services/auction.service.js';
import * as activityService from '../services/activity.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const metrics = asyncHandler(async (_req, res) => {
  const data = await analyticsService.getDashboardMetrics();
  res.json({ success: true, data });
});

export const auctionsSnapshot = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit || '5', 10);
  const data = await auctionService.getAuctionSnapshot(limit);
  res.json({ success: true, data });
});

export const systemHealth = asyncHandler(async (_req, res) => {
  const data = await analyticsService.getSystemHealth();
  res.json({ success: true, data });
});

export const bidsByDay = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days || '7', 10);
  const data = await analyticsService.getBidsByDay(days);
  res.json({ success: true, data });
});

export const activity = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit || '10', 10);
  const data = await activityService.getRecentActivity(limit);
  res.json({ success: true, data });
});

export const registrations = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days || '9', 10);
  const data = await analyticsService.getRegistrationVelocity(days);
  res.json({ success: true, data });
});
