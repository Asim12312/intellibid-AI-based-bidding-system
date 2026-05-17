import { body } from 'express-validator';

export const loginValidator = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const refreshValidator = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];
