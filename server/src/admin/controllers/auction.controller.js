import * as auctionService from '../services/auction.service.js';
import * as analyticsService from '../services/analytics.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const result = await auctionService.listAuctions(req.query);
  res.json({ success: true, ...result });
});

export const getById = asyncHandler(async (req, res) => {
  const data = await auctionService.getAuctionById(req.params.id);
  res.json({ success: true, data });
});

export const create = asyncHandler(async (req, res) => {
  const data = await auctionService.createAuction(req.body, req.admin._id);
  res.status(201).json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const data = await auctionService.updateAuction(req.params.id, req.body, req.admin._id);
  res.json({ success: true, data });
});

export const end = asyncHandler(async (req, res) => {
  const data = await auctionService.endAuction(req.params.id, req.admin._id);
  res.json({ success: true, data });
});

export const clearFlag = asyncHandler(async (req, res) => {
  const data = await auctionService.clearAuctionFlag(req.params.id, req.admin._id);
  res.json({ success: true, data });
});

export const monitoringLive = asyncHandler(async (_req, res) => {
  const data = await analyticsService.getMonitoringStats();
  res.json({ success: true, data });
});
