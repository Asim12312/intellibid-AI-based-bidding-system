import express from 'express';
import { signup, login, logout, verifyEmail } from './auth.controller.js';
import { auth } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', auth, logout);
router.get('/verify-email', verifyEmail);

export default router;