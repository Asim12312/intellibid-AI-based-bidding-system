import { Router } from 'express';
import * as searchController from '../controllers/search.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.get('/', searchController.global);

export default router;
