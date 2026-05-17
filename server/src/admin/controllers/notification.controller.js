import * as notificationService from '../services/notification.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const result = await notificationService.listForAdmin(req.admin._id, req.query);
  res.json({ success: true, ...result });
});

export const markRead = asyncHandler(async (req, res) => {
  const data = await notificationService.markRead(req.params.id, req.admin._id);
  res.json({ success: true, data });
});
