import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';

export async function listForAdmin(adminId, query = {}) {
  const filter = { $or: [{ adminId }, { adminId: null }] };
  if (query.unread === 'true') filter.read = false;

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(parseInt(query.limit || '50', 10));

  const unreadCount = await Notification.countDocuments({ ...filter, read: false });

  return { data: notifications, unreadCount };
}

export async function markRead(id, adminId) {
  const notification = await Notification.findOneAndUpdate(
    { _id: id, $or: [{ adminId }, { adminId: null }] },
    { read: true },
    { new: true }
  );
  if (!notification) throw ApiError.notFound('Notification not found');
  return notification;
}

export async function createNotification({ adminId, type, title, body, link }) {
  return Notification.create({ adminId, type, title, body, link });
}
