import bcrypt from 'bcryptjs';
import User from '../../models/user.model.js';
import { generateToken, generateVerificationToken } from '../../services/token.service.js';
import { sendVerificationEmail } from '../../services/email.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const signupService = async (data) => {
    // Check if user already exists
    const existing = await User.findOne({ email: data.email });
    if (existing) throw new ApiError(400, 'Email already registered');

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Generate email verification token
    const emailToken = generateVerificationToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user in DB
    const user = await User.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        emailVerificationToken: emailToken,
        emailVerificationExpires: expires,
    });

    // Send verification email
    try {
        await sendVerificationEmail(user.email, emailToken);
    } catch (error) {
        console.error("Failed to send verification email:", error.message);
    }

    // Generate JWT
    const token = generateToken(user);

    return { token, user: { id: user._id, email: user.email, role: user.role } };
};

export const loginService = async (data) => {
    // Find user
    const user = await User.findOne({ email: data.email });
    if (!user) {
        console.log(`Login failed: User not found for email ${data.email}`);
        throw new ApiError(401, 'Invalid email or password');
    }

    // Check verification
    if (!user.isVerified) {
        throw new ApiError(401, 'Please verify your email before logging in');
    }

    // Compare password
    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
        console.log(`Login failed: Password mismatch for user ${data.email}`);
        throw new ApiError(401, 'Invalid email or password');
    }

    // Generate JWT
    const token = generateToken(user);

    return { token, user: { id: user._id, email: user.email, role: user.role } };
};

export const verifyEmailService = async (token) => {
    const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() }, // not expired
    });

    if (!user) throw new ApiError(400, 'Invalid or expired verification link');

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return { message: 'Email verified successfully' };
};

export const googleLoginService = async (idToken) => {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { email, sub: googleId, given_name, family_name, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
        // Create new user if not found (Social Login)
        user = await User.create({
            firstName: given_name,
            lastName: family_name,
            email,
            password: Math.random().toString(36).slice(-10), // Random password for social accounts
            isVerified: true, // Google accounts are pre-verified
            role: 'buyer', // Default role for new social users
        });
    }

    const token = generateToken(user);
    return { token, user: { id: user._id, email: user.email, role: user.role } };
};