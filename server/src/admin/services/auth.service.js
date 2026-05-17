import crypto from 'crypto';
import { Admin } from '../models/Admin.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { ApiError } from '../utils/ApiError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/generateTokens.js';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function login(email, password) {
  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!admin || !admin.isActive) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  const valid = await admin.comparePassword(password);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  admin.lastLoginAt = new Date();
  await admin.save();

  const payload = { sub: admin._id.toString(), role: admin.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({
    adminId: admin._id,
    tokenHash: hashToken(refreshToken),
    expiresAt,
  });

  return {
    accessToken,
    refreshToken,
    admin: {
      id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      avatarUrl: admin.avatarUrl,
    },
  };
}

export async function refresh(refreshToken) {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const stored = await RefreshToken.findOne({
    tokenHash: hashToken(refreshToken),
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
  if (!stored) throw ApiError.unauthorized('Refresh token revoked or expired');

  const admin = await Admin.findById(decoded.sub);
  if (!admin || !admin.isActive) throw ApiError.unauthorized('Admin account inactive');

  const payload = { sub: admin._id.toString(), role: admin.role };
  return { accessToken: signAccessToken(payload) };
}

export async function logout(refreshToken) {
  if (!refreshToken) return;
  await RefreshToken.updateOne(
    { tokenHash: hashToken(refreshToken) },
    { revokedAt: new Date() }
  );
}

export async function getMe(adminId) {
  const admin = await Admin.findById(adminId);
  if (!admin) throw ApiError.notFound('Admin not found');
  return admin;
}
