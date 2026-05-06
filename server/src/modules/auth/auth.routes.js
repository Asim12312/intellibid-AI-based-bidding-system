import express from 'express';
import { signup, login, logout, verifyEmail, googleLogin, forgotPassword, resetPassword } from './auth.controller.js';
import { auth } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', auth, logout);
router.get('/verify-email', verifyEmail);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;