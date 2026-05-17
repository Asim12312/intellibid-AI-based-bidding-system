import { PlatformUser } from '../models/PlatformUser.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, buildPaginationMeta } from '../utils/pagination.js';
import { relativeTime, mapUserStatus } from '../utils/formatters.js';

function formatUser(user) {
  return {
    id: user._id,
    platformId: `#${user.platformId}`,
    name: user.name,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
    status: mapUserStatus(user.status, user.isFlagged),
    rawStatus: user.status,
    isBanned: user.status === 'banned',
    isFlagged: user.isFlagged,
    flagReason: user.flagReason,
    activity: relativeTime(user.lastActivityAt),
    detail: user.lastActivitySummary,
    riskScore: user.riskScore,
    trustScore: user.trustScore,
    verificationTier: user.verificationTier,
    lastActivityAt: user.lastActivityAt,
    createdAt: user.createdAt,
  };
}

async function generatePlatformId() {
  const count = await PlatformUser.countDocuments();
  return `IB-${9020 + count + 1}`;
}

export async function listUsers(query) {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.search) {
    const search = query.search.trim();
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { platformId: { $regex: search.replace('#', ''), $options: 'i' } },
    ];
  }

  const statusFilter = query.status?.toLowerCase();
  if (statusFilter === 'active') filter.status = 'active';
  if (statusFilter === 'banned') filter.status = 'banned';
  if (statusFilter === 'flagged') filter.isFlagged = true;

  const [users, total] = await Promise.all([
    PlatformUser.find(filter).sort({ lastActivityAt: -1 }).skip(skip).limit(limit),
    PlatformUser.countDocuments(filter),
  ]);

  return {
    data: users.map(formatUser),
    pagination: buildPaginationMeta(total, page, limit),
  };
}

export async function getUserById(id) {
  const user = await PlatformUser.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  return formatUser(user);
}

export async function createUser(body, adminId) {
  const platformId = body.platformId?.replace('#', '') || (await generatePlatformId());
  const existing = await PlatformUser.findOne({
    $or: [{ email: body.email.toLowerCase() }, { platformId: platformId.toUpperCase() }],
  });
  if (existing) throw ApiError.conflict('User with email or platform ID already exists');

  const user = await PlatformUser.create({
    platformId: platformId.toUpperCase(),
    name: body.name,
    email: body.email.toLowerCase(),
    username: body.username || '',
    avatarUrl: body.avatarUrl || '',
    status: body.status || 'active',
    lastActivitySummary: body.lastActivitySummary || 'Account created by admin',
    verificationTier: body.verificationTier || 'bronze',
  });

  await ActivityLog.create({
    type: 'other',
    message: `New user ${user.name} (${user.platformId}) created by admin`,
    actorId: adminId,
    metadata: { userId: user._id },
  });

  return formatUser(user);
}

export async function updateUser(id, body, adminId) {
  const user = await PlatformUser.findById(id);
  if (!user) throw ApiError.notFound('User not found');

  const allowed = [
    'name',
    'email',
    'username',
    'avatarUrl',
    'lastActivitySummary',
    'verificationTier',
    'trustScore',
    'riskScore',
  ];
  for (const key of allowed) {
    if (body[key] !== undefined) user[key] = body[key];
  }
  if (body.email) user.email = body.email.toLowerCase();
  await user.save();

  await ActivityLog.create({
    type: 'other',
    message: `User ${user.name} profile updated`,
    actorId: adminId,
    metadata: { userId: user._id },
  });

  return formatUser(user);
}

export async function banUser(id, reason, adminId) {
  const user = await PlatformUser.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  if (user.status === 'banned') throw ApiError.conflict('User is already banned');

  user.status = 'banned';
  user.banReason = reason || 'Policy Violation';
  user.bannedAt = new Date();
  user.bannedBy = adminId;
  user.lastActivitySummary = `Locked: ${user.banReason}`;
  await user.save();

  await ActivityLog.create({
    type: 'user_ban',
    message: `User ${user.name} banned: ${user.banReason}`,
    actorId: adminId,
    metadata: { userId: user._id },
  });

  return formatUser(user);
}

export async function unbanUser(id, adminId) {
  const user = await PlatformUser.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  if (user.status !== 'banned') throw ApiError.conflict('User is not banned');

  user.status = 'active';
  user.banReason = '';
  user.bannedAt = undefined;
  user.bannedBy = undefined;
  user.lastActivitySummary = 'Account reinstated';
  user.lastActivityAt = new Date();
  await user.save();

  await ActivityLog.create({
    type: 'user_unban',
    message: `User ${user.name} unbanned`,
    actorId: adminId,
    metadata: { userId: user._id },
  });

  return formatUser(user);
}

export async function flagUser(id, reason, adminId) {
  const user = await PlatformUser.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  user.isFlagged = true;
  user.flagReason = reason || 'Suspect Bid';
  user.riskScore = Math.min(100, user.riskScore + 20);
  await user.save();

  await ActivityLog.create({
    type: 'other',
    message: `User ${user.name} flagged: ${user.flagReason}`,
    actorId: adminId,
    metadata: { userId: user._id },
  });

  return formatUser(user);
}
