import * as authService from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body.email, req.body.password);
  res.json({ success: true, data: result });
});

export const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.body.refreshToken);
  res.json({ success: true, data: result });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.json({ success: true, message: 'Logged out successfully' });
});

export const me = asyncHandler(async (req, res) => {
  if (req.admin.isPlatformAdmin) {
    return res.json({
      success: true,
      data: {
        id: req.admin._id,
        email: req.admin.email,
        name: req.admin.name,
        role: req.admin.role,
        avatarUrl: req.admin.avatarUrl || '',
      },
    });
  }

  const admin = await authService.getMe(req.admin._id);
  res.json({
    success: true,
    data: {
      id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      avatarUrl: admin.avatarUrl,
    },
  });
});
