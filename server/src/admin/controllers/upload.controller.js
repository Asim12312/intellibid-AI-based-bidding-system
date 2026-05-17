import * as uploadService from '../services/upload.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Image file is required');
  const result = await uploadService.uploadImageBuffer(req.file.buffer, req.body.folder || 'intellibid');
  res.status(201).json({ success: true, data: result });
});
