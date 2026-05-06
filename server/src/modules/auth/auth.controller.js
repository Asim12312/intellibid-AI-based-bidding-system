import { signupService, loginService, verifyEmailService } from './auth.service.js';
import { signupSchema, loginSchema } from './auth.validation.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendTokenCookie } from '../../utils/cookie.js';

export const signup = asyncHandler(async (req, res) => {
    // Validate input with Zod
    const data = signupSchema.parse(req.body);

    // Run signup business logic
    const { token, user } = await signupService(data);

    // Store JWT in HTTP-only cookie
    sendTokenCookie(res, token);

    // Send response
    res.status(201).json({
        success: true,
        message: 'Account created. Check your email to verify.',
        user,
    });
});

export const login = asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const { token, user } = await loginService(data);
    sendTokenCookie(res, token);

    res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        user,
    });
});

export const logout = asyncHandler(async (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logged out' });
});

export const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;
    const result = await verifyEmailService(token);
    res.status(200).json({ success: true, ...result });
});