import * as aiService from '../services/ai.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const insights = asyncHandler(async (_req, res) => {
  const data = await aiService.getInsights();
  res.json({ success: true, data });
});

export const executeProposal = asyncHandler(async (req, res) => {
  const data = await aiService.executeProposal(req.params.id, req.admin._id);
  res.json({ success: true, data });
});

export const auditUsers = asyncHandler(async (_req, res) => {
  const data = await aiService.auditUsers();
  res.json({ success: true, data });
});
