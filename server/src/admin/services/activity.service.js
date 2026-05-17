import { ActivityLog } from '../models/ActivityLog.js';

const iconMap = {
  user_role: 'Users',
  transaction_alert: 'Zap',
  system_patch: 'Activity',
  user_ban: 'Users',
  user_unban: 'Users',
  ticket_resolve: 'Activity',
  auction_created: 'Gavel',
  ai_proposal: 'Zap',
  other: 'Activity',
};

const colorMap = {
  user_role: 'border-l-[var(--electric)]',
  transaction_alert: 'border-l-[var(--hotpink)]',
  system_patch: 'border-l-[var(--acid)]',
  user_ban: 'border-l-[var(--destructive)]',
  user_unban: 'border-l-[var(--acid)]',
  ticket_resolve: 'border-l-[var(--sunset)]',
  auction_created: 'border-l-[var(--electric)]',
  ai_proposal: 'border-l-[var(--hotpink)]',
  other: 'border-l-[var(--muted-foreground)]',
};

function relativeTime(date) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1 hour ago';
  return `${hours} hours ago`;
}

export async function getRecentActivity(limit = 10) {
  const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(limit);
  return logs.map((log) => ({
    id: log._id,
    label: log.message,
    time: relativeTime(log.createdAt),
    icon: iconMap[log.type] || 'Activity',
    color: colorMap[log.type] || 'border-l-[var(--electric)]',
    type: log.type,
    createdAt: log.createdAt,
  }));
}
