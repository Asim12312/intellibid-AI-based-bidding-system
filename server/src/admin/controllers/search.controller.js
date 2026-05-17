import * as searchService from '../services/search.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const global = asyncHandler(async (req, res) => {
  const data = await searchService.globalSearch(req.query.q || '', parseInt(req.query.limit || '10', 10));
  res.json({ success: true, data });
});
