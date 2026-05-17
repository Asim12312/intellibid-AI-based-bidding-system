import { Router } from 'express';
import * as aiController from '../controllers/ai.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { param } from 'express-validator';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/insights', aiController.insights);
router.post('/audit/users', authorize('admin'), aiController.auditUsers);
router.post(
  '/proposals/:id/execute',
  authorize('admin'),
  param('id').isMongoId(),
  validate,
  aiController.executeProposal
);

export default router;
