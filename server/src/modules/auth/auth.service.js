import bcrypt from 'bcryptjs';
import User from '../../models/user.model.js';
import { generateToken, generateVerificationToken } from '../../services/token.service.js';
import { sendVerificationEmail } from '../../services/email.service.js';
import { ApiError } from '../../utils/ApiError.js';

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
        email: data.email,
        password: hashedPassword,
        role: data.role,
        emailVerificationToken: emailToken,
        emailVerificationExpires: expires,
    });

    // Send verification email
    await sendVerificationEmail(user.email, emailToken);

    // Generate JWT
    const token = generateToken(user);

    return { token, user: { id: user._id, email: user.email, role: user.role } };
};

export const loginService = async (data) => {
    // Find user
    const user = await User.findOne({ email: data.email });
    if (!user) throw new ApiError(401, 'Invalid email or password');

    // Compare password
    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) throw new ApiError(401, 'Invalid email or password');

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