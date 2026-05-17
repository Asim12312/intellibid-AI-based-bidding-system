import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { loginValidator, refreshValidator } from '../validators/auth.validator.js';

const router = Router();

router.post('/login', loginValidator, validate, authController.login);
router.post('/refresh', refreshValidator, validate, authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
