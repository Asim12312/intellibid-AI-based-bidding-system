import { PlatformUser } from '../admin/models/PlatformUser.js';

function buildPlatformId(userId) {
  return `IB${String(userId).slice(-8).toUpperCase()}`;
}

export async function syncPlatformUserFromAuthUser(user) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email.split('@')[0];
  const platformId = buildPlatformId(user._id);

  const existing = await PlatformUser.findOne({
    $or: [{ authUserId: user._id }, { email: user.email.toLowerCase() }],
  });

  if (existing) {
    existing.authUserId = user._id;
    existing.name = name;
    existing.email = user.email.toLowerCase();
    existing.lastActivityAt = new Date();
    existing.lastActivitySummary = 'Signed in';
    await existing.save();
    return existing;
  }

  return PlatformUser.create({
    authUserId: user._id,
    platformId,
    name,
    email: user.email.toLowerCase(),
    username: user.email.split('@')[0],
    lastActivitySummary: 'Account created',
  });
}
