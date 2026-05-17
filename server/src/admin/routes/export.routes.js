import { Router } from 'express';
import * as exportController from '../controllers/export.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/users', exportController.users);
router.get('/auctions', exportController.auctions);
router.get('/tickets', exportController.tickets);

export default router;
