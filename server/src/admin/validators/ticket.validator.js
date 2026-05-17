import { body, param } from 'express-validator';

export const ticketIdParam = [param('id').isMongoId().withMessage('Invalid ticket id')];

export const messageValidator = [
  ...ticketIdParam,
  body('message').trim().notEmpty().isLength({ max: 5000 }).withMessage('Message is required'),
];

export const noteValidator = [
  ...ticketIdParam,
  body('note').optional().trim().isLength({ max: 2000 }),
];
