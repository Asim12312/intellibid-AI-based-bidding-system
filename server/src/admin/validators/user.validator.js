import { body, param } from 'express-validator';

export const userIdParam = [param('id').isMongoId().withMessage('Invalid user id')];

export const createUserValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('username').optional().trim(),
  body('avatarUrl').optional().isURL(),
  body('status').optional().isIn(['active', 'banned', 'suspended']),
];

export const updateUserValidator = [
  ...userIdParam,
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('trustScore').optional().isFloat({ min: 0, max: 10 }),
  body('riskScore').optional().isFloat({ min: 0, max: 100 }),
];

export const banUserValidator = [
  ...userIdParam,
  body('reason').optional().trim().isLength({ max: 500 }),
];
