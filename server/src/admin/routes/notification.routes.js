import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { param } from 'express-validator';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', notificationController.list);
router.patch('/:id/read', param('id').isMongoId(), validate, notificationController.markRead);

export default router;
