import { Router } from 'express';
import * as auctionController from '../controllers/auction.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createAuctionValidator,
  updateAuctionValidator,
  auctionIdParam,
} from '../validators/auction.validator.js';

const router = Router();

router.use(authenticate);

router.get('/monitoring/live', auctionController.monitoringLive);
router.get('/', auctionController.list);
router.get('/:id', auctionIdParam, validate, auctionController.getById);
router.post('/', authorize('admin'), createAuctionValidator, validate, auctionController.create);
router.patch('/:id', authorize('admin'), updateAuctionValidator, validate, auctionController.update);
router.post('/:id/end', authorize('admin'), auctionIdParam, validate, auctionController.end);
router.post('/:id/clear-flag', authorize('admin'), auctionIdParam, validate, auctionController.clearFlag);

export default router;
