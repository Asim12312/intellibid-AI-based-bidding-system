import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createUserValidator,
  updateUserValidator,
  banUserValidator,
  userIdParam,
} from '../validators/user.validator.js';

const router = Router();

router.use(authenticate);

router.get('/summary', userController.summary);
router.get('/', userController.list);
router.get('/:id', userIdParam, validate, userController.getById);
router.post('/', authorize('admin'), createUserValidator, validate, userController.create);
router.patch('/:id', authorize('admin'), updateUserValidator, validate, userController.update);
router.post('/:id/ban', authorize('admin'), banUserValidator, validate, userController.ban);
router.post('/:id/unban', authorize('admin'), userIdParam, validate, userController.unban);
router.post('/:id/flag', authorize('admin'), userIdParam, validate, userController.flag);

export default router;
