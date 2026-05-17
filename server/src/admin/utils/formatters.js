export function formatCurrency(amount, currency = 'USD') {
  if (currency === 'ETH') return `${amount} ETH`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactNumber(num) {
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

export function formatTimeRemaining(endsAt) {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return '00:00:00';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':');
}

export function relativeTime(date) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'JUST NOW';
  if (minutes < 60) return `${minutes} MIN AGO`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} HOUR${hours > 1 ? 'S' : ''} AGO`;
  const days = Math.floor(hours / 24);
  return `${days} DAY${days > 1 ? 'S' : ''} AGO`;
}

export function mapUserStatus(status, isFlagged) {
  if (status === 'banned') return 'Banned';
  if (isFlagged) return 'Active';
  return 'Active';
}

export function agentActivityLabel(agentMode) {
  return agentMode === 'ai_agent' ? 'AI AGENT ACTIVE' : 'MANUAL ONLY';
}
