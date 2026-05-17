import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { uploadImage } from '../middleware/upload.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.post(
  '/image',
  authorize('admin'),
  (req, res, next) => {
    uploadImage(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  },
  asyncHandler(uploadController.uploadImage)
);

export default router;
