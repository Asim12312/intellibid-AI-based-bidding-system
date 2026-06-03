import express from 'express';
import { auth } from '../../middleware/auth.middleware.js';
import { createCheckoutSession, handleStripeWebhook } from './payment.controller.js';

const router = express.Router();

// Protected route for buyers to initiate payment
router.post('/create-checkout', auth, createCheckoutSession);

// Webhook route (needs raw body, so don't apply standard JSON parser here if applied globally)
// In a real production setup, you would use express.raw({type: 'application/json'}) specifically for this route
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
