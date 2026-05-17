import { body, param } from 'express-validator';

export const auctionIdParam = [param('id').isMongoId().withMessage('Invalid auction id')];

export const createAuctionValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('imageUrl').isURL().withMessage('Valid image URL is required'),
  body('startingBid').isFloat({ min: 0 }).withMessage('Starting bid must be a positive number'),
  body('currency').optional().isIn(['USD', 'ETH']),
  body('endsAt').optional().isISO8601(),
];

export const updateAuctionValidator = [
  ...auctionIdParam,
  body('title').optional().trim().notEmpty(),
  body('currentBid').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['draft', 'scheduled', 'live', 'ended', 'cancelled']),
];
