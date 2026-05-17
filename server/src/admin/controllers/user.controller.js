import * as userService from '../services/user.service.js';
import * as analyticsService from '../services/analytics.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  res.json({ success: true, ...result });
});

export const summary = asyncHandler(async (_req, res) => {
  const [usersSummary, riskSummary] = await Promise.all([
    analyticsService.getUsersSummary(),
    analyticsService.getUserRiskSummary(),
  ]);
  res.json({ success: true, data: { ...usersSummary, risk: riskSummary } });
});

export const getById = asyncHandler(async (req, res) => {
  const data = await userService.getUserById(req.params.id);
  res.json({ success: true, data });
});

export const create = asyncHandler(async (req, res) => {
  const data = await userService.createUser(req.body, req.admin._id);
  res.status(201).json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const data = await userService.updateUser(req.params.id, req.body, req.admin._id);
  res.json({ success: true, data });
});

export const ban = asyncHandler(async (req, res) => {
  const data = await userService.banUser(req.params.id, req.body.reason, req.admin._id);
  res.json({ success: true, data });
});

export const unban = asyncHandler(async (req, res) => {
  const data = await userService.unbanUser(req.params.id, req.admin._id);
  res.json({ success: true, data });
});

export const flag = asyncHandler(async (req, res) => {
  const data = await userService.flagUser(req.params.id, req.body.reason, req.admin._id);
  res.json({ success: true, data });
});
