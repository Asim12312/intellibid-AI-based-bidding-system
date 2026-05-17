import { Router } from 'express';
import * as ticketController from '../controllers/ticket.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { messageValidator, noteValidator, ticketIdParam } from '../validators/ticket.validator.js';

const router = Router();

router.use(authenticate);

router.get('/summary', ticketController.summary);
router.get('/', ticketController.list);
router.get('/:id', ticketIdParam, validate, ticketController.getById);
router.post('/:id/messages', messageValidator, validate, ticketController.addMessage);
router.post('/:id/resolve', authorize('admin'), noteValidator, validate, ticketController.resolve);
router.post('/:id/escalate', authorize('admin'), noteValidator, validate, ticketController.escalate);
router.post('/:id/reject', authorize('admin'), noteValidator, validate, ticketController.reject);
router.post('/:id/payment-override', authorize('admin'), ticketIdParam, validate, ticketController.paymentOverride);
router.post('/:id/analyze', ticketIdParam, validate, ticketController.analyze);

export default router;
