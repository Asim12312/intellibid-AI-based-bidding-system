import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/generateTokens.js';
import { Admin } from '../models/Admin.js';

async function loadAdminFromBearer(token) {
  const decoded = verifyAccessToken(token);
  const admin = await Admin.findById(decoded.sub).select('-passwordHash');
  if (!admin || !admin.isActive) {
    throw ApiError.unauthorized('Invalid or inactive admin account');
  }
  if (admin.role !== 'admin') {
    throw ApiError.forbidden('Admin access required');
  }
  return admin;
}

async function loadAdminFromPlatformCookie(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== 'admin') {
    throw ApiError.forbidden('Admin access required');
  }
  return {
    _id: decoded.id,
    email: decoded.email,
    name: decoded.email?.split('@')[0] || 'Admin',
    role: 'admin',
    avatarUrl: '',
    isActive: true,
    isPlatformAdmin: true,
  };
}

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      req.admin = await loadAdminFromBearer(header.slice(7));
      return next();
    }

    const cookieToken = req.cookies?.token;
    if (cookieToken) {
      req.admin = await loadAdminFromPlatformCookie(cookieToken);
      return next();
    }

    throw ApiError.unauthorized('Access token required');
  } catch (err) {
    next(err.isOperational ? err : ApiError.unauthorized('Invalid access token'));
  }
}

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.admin) return next(ApiError.unauthorized());
    const allowed = roles.length ? roles : ['admin'];
    if (!allowed.includes(req.admin.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }
    next();
  };
}

export function requireAdmin(_req, _res, next) {
  return authorize('admin');
}
