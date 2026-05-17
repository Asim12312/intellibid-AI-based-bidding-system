import bcrypt from 'bcryptjs';
import User from '../../models/user.model.js';
import { generateToken, generateVerificationToken } from '../../services/token.service.js';
import { sendVerificationEmail } from '../../services/email.service.js';
import { syncPlatformUserFromAuthUser } from '../../services/platformUser.service.js';
import { login as adminStaffLogin } from '../../admin/services/auth.service.js';
import { Admin } from '../../admin/models/Admin.js';
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

    await syncPlatformUserFromAuthUser(user);

    const token = generateToken(user);

    return { token, user: { id: user._id, email: user.email, role: user.role } };
};

async function loginAsStaffAdmin(email, password) {
    const adminSession = await adminStaffLogin(email, password);
    const token = generateToken({
        _id: adminSession.admin.id,
        email: adminSession.admin.email,
        role: 'admin',
    });

    return {
        token,
        user: {
            id: adminSession.admin.id,
            email: adminSession.admin.email,
            role: 'admin',
            name: adminSession.admin.name,
        },
        adminTokens: {
            accessToken: adminSession.accessToken,
            refreshToken: adminSession.refreshToken,
        },
    };
}

export const loginService = async (data) => {
    const email = data.email.trim().toLowerCase();
    const { password } = data;

    const staffAdmin = await Admin.findOne({ email, isActive: true }).select('+passwordHash');
    if (staffAdmin) {
        const staffPasswordValid = await staffAdmin.comparePassword(password);
        if (staffPasswordValid) {
            return loginAsStaffAdmin(email, password);
        }
    }

    const user = await User.findOne({ email });

    if (user) {
        if (!user.isVerified) {
            throw new ApiError(401, 'Please verify your email before logging in');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new ApiError(401, 'Invalid email or password');
        }

        await syncPlatformUserFromAuthUser(user);
        const token = generateToken(user);

        return {
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: [user.firstName, user.lastName].filter(Boolean).join(' ').trim(),
            },
        };
    }

    if (staffAdmin) {
        throw new ApiError(401, 'Invalid email or password');
    }

    try {
        return await loginAsStaffAdmin(email, password);
    } catch {
        throw new ApiError(401, 'Invalid email or password');
    }
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

export const getStaffAdminMe = async (adminId) => {
    const admin = await Admin.findById(adminId);
    if (!admin || !admin.isActive) return null;
    return {
        id: admin._id,
        email: admin.email,
        role: 'admin',
        name: admin.name,
        isVerified: true,
    };
};

export const getMeService = async (userId) => {
    const user = await User.findById(userId).select('-password -emailVerificationToken -emailVerificationExpires');
    if (!user) throw new ApiError(401, 'User not found');
    return {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
    };
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

    await syncPlatformUserFromAuthUser(user);
    const token = generateToken(user);
    return { token, user: { id: user._id, email: user.email, role: user.role } };
};