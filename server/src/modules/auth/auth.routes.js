import express from 'express';
import { signup, login, logout, verifyEmail, googleLogin, me } from './auth.controller.js';
import { auth } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', auth, me);
router.post('/logout', auth, logout);
router.get('/verify-email', verifyEmail);
router.post('/google', googleLogin);

export default router;