const STORAGE_ACCESS = 'ib_access_token';
const STORAGE_REFRESH = 'ib_refresh_token';

import { getApiBase } from '@/lib/apiBase';

const base = () => getApiBase();

export function getAccessToken() {
  return localStorage.getItem(STORAGE_ACCESS);
}

export function getRefreshToken() {
  return localStorage.getItem(STORAGE_REFRESH);
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(STORAGE_ACCESS, access);
  localStorage.setItem(STORAGE_REFRESH, refresh);
}

export function clearTokens() {
  localStorage.removeItem(STORAGE_ACCESS);
  localStorage.removeItem(STORAGE_REFRESH);
}

type ApiErrorBody = { success: false; error?: { message?: string; code?: string } };

export class ApiException extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const rt = getRefreshToken();
  if (!rt) return null;
  const url = `${base()}/api/v1/auth/refresh`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ refreshToken: rt }),
  });
  const json = await res.json();
  if (!res.ok || !json?.data?.accessToken) return null;
  localStorage.setItem(STORAGE_ACCESS, json.data.accessToken);
  return json.data.accessToken as string;
}

async function request<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const url = `${base()}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(options.headers);
  if (!options.skipAuth && !headers.has('Authorization')) {
    const token = getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let res = await fetch(url, { credentials: 'include', ...options, headers });

  if (res.status === 401 && !options.skipAuth && path !== '/api/v1/auth/refresh') {
    if (!refreshPromise) refreshPromise = refreshAccessToken();
    const newAccess = await refreshPromise;
    refreshPromise = null;
    if (newAccess) {
      headers.set('Authorization', `Bearer ${newAccess}`);
      res = await fetch(url, { credentials: 'include', ...options, headers });
    }
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = json as ApiErrorBody;
    throw new ApiException(
      err.error?.message || res.statusText || 'Request failed',
      res.status,
      err.error?.code
    );
  }
  return json as T;
}

export const api = {
  async login(email: string, password: string) {
    return request<{
      success: true;
      data: {
        accessToken: string;
        refreshToken: string;
        admin: { id: string; email: string; name: string; role: string; avatarUrl?: string };
      };
    }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
  },

  async logout(refreshToken: string | null) {
    if (!refreshToken) return;
    try {
      await request('/api/v1/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      /* ignore */
    }
  },

  async me() {
    return request<{ success: true; data: { id: string; email: string; name: string; role: string; avatarUrl?: string } }>(
      '/api/v1/auth/me'
    );
  },

  dashboardMetrics() {
    return request<{ success: true; data: Record<string, unknown> }>('/api/v1/dashboard/metrics');
  },

  dashboardSnapshot(limit = 8) {
    return request<{ success: true; data: SnapshotRow[] }>(
      `/api/v1/dashboard/auctions-snapshot?limit=${limit}`
    );
  },

  systemHealth() {
    return request<{ success: true; data: { serverLoad: number; apiLatency: number; aiInference: number; status: string } }>(
      '/api/v1/dashboard/system/health'
    );
  },

  bidsByDay(days = 7) {
    return request<{ success: true; data: { name: string; value: number; color: string }[] }>(
      `/api/v1/dashboard/analytics/bids-by-day?days=${days}`
    );
  },

  activity(limit = 12) {
    return request<{
      success: true;
      data: { id: string; label: string; time: string; icon: string; color: string; type: string }[];
    }>(`/api/v1/dashboard/activity?limit=${limit}`);
  },

  aiInsights() {
    return request<{ success: true; data: { id: string; insight: string; title?: string } }>('/api/v1/ai/insights');
  },

  aiExecuteProposal(id: string) {
    return request(`/api/v1/ai/proposals/${id}/execute`, { method: 'POST' });
  },

  aiAuditUsers() {
    return request<{ success: true; data: Record<string, unknown> }>('/api/v1/ai/audit/users', { method: 'POST' });
  },

  usersSummary() {
    return request<{
      success: true;
      data: {
        totalUsers: number;
        totalUsersFormatted: string;
        activeNow: number;
        risk: { flaggedProfiles: number; recentBans: number; avgRiskScore: number };
      };
    }>('/api/v1/users/summary');
  },

  usersList(params: Record<string, string | number>) {
    const q = new URLSearchParams(params as Record<string, string>);
    return request<{
      success: true;
      data: UserRow[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/v1/users?${q}`);
  },

  userGet(id: string) {
    return request<{ success: true; data: UserRow }>(`/api/v1/users/${id}`);
  },

  userCreate(body: { name: string; email: string; username?: string; avatarUrl?: string }) {
    return request<{ success: true; data: UserRow }>('/api/v1/users', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  userUpdate(id: string, body: Record<string, unknown>) {
    return request<{ success: true; data: UserRow }>(`/api/v1/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  userBan(id: string, reason?: string) {
    return request(`/api/v1/users/${id}/ban`, { method: 'POST', body: JSON.stringify({ reason }) });
  },

  userUnban(id: string) {
    return request(`/api/v1/users/${id}/unban`, { method: 'POST' });
  },

  registrations() {
    return request<{ success: true; data: { day: number; heightPercent: number; count?: number }[] }>(
      '/api/v1/dashboard/analytics/registrations?days=9'
    );
  },

  auctionsList(params: Record<string, string | number>) {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
    );
    return request<{ success: true; data: AuctionCard[]; pagination: { total: number; totalPages: number } }>(
      `/api/v1/auctions?${q}`
    );
  },

  monitoringLive() {
    return request<{
      success: true;
      data: {
        activeLots: number;
        totalVolumeFormatted: string;
        totalVolumeTrend: string;
        activeLotsTrend: string;
        aiFlagsCount: number;
        biddersOnline: number;
      };
    }>('/api/v1/auctions/monitoring/live');
  },

  auctionClearFlag(id: string) {
    return request(`/api/v1/auctions/${id}/clear-flag`, { method: 'POST' });
  },

  auctionCreate(body: Record<string, unknown>) {
    return request('/api/v1/auctions', { method: 'POST', body: JSON.stringify(body) });
  },

  auctionGet(id: string) {
    return request<{ success: true; data: AuctionCard & Record<string, unknown> }>(`/api/v1/auctions/${id}`);
  },

  auctionUpdate(id: string, body: Record<string, unknown>) {
    return request<{ success: true; data: AuctionCard }>(`/api/v1/auctions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  auctionEnd(id: string) {
    return request(`/api/v1/auctions/${id}/end`, { method: 'POST' });
  },

  ticketsSummary() {
    return request<{ success: true; data: { activeCases: number; urgentCount: number } }>(
      '/api/v1/tickets/summary'
    );
  },

  ticketsList() {
    return request<{ success: true; data: TicketListItem[] }>('/api/v1/tickets');
  },

  ticketGet(id: string) {
    return request<{ success: true; data: TicketDetail }>(`/api/v1/tickets/${id}`);
  },

  ticketResolve(id: string, note?: string) {
    return request(`/api/v1/tickets/${id}/resolve`, { method: 'POST', body: JSON.stringify({ note }) });
  },

  ticketEscalate(id: string, note?: string) {
    return request(`/api/v1/tickets/${id}/escalate`, { method: 'POST', body: JSON.stringify({ note }) });
  },

  ticketReject(id: string, note?: string) {
    return request(`/api/v1/tickets/${id}/reject`, { method: 'POST', body: JSON.stringify({ note }) });
  },

  ticketPaymentOverride(id: string) {
    return request(`/api/v1/tickets/${id}/payment-override`, { method: 'POST' });
  },

  search(q: string) {
    return request<{
      success: true;
      data: {
        users: { _id: string; platformId: string; name: string; email: string; status: string }[];
        auctions: { _id: string; lotId: string; title: string; category: string; status: string }[];
        tickets: { _id: string; ticketId: string; title: string; status: string; priority: string }[];
      };
    }>(`/api/v1/search?q=${encodeURIComponent(q)}&limit=8`);
  },

  notificationsList() {
    return request<{
      success: true;
      data: { _id: string; title: string; body: string; read: boolean; createdAt: string; link?: string }[];
      unreadCount: number;
    }>('/api/v1/notifications');
  },

  notificationMarkRead(id: string) {
    return request(`/api/v1/notifications/${id}/read`, { method: 'PATCH' });
  },

  async downloadExport(kind: 'users' | 'auctions' | 'tickets') {
    const token = getAccessToken();
    const url = `${base()}/api/v1/exports/${kind}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token || ''}` } });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${kind}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  },
};

export type SnapshotRow = {
  id: string;
  img: string;
  name: string;
  bid: string;
  status: string;
  time: string;
  isUrgent?: boolean;
};

export type UserRow = {
  id: string;
  platformId: string;
  name: string;
  email: string;
  status: string;
  isBanned: boolean;
  isFlagged: boolean;
  activity: string;
  detail: string;
  avatarUrl: string;
  rawStatus?: string;
};

export type AuctionCard = {
  id: string;
  lotId: string;
  title: string;
  category: string;
  bid: string;
  user: string | null;
  next: string;
  time: string;
  img: string;
  isLive: boolean;
  isFlagged: boolean;
  isAiPick: boolean;
  color: string;
  value?: string | null;
  suspiciousActivity?: boolean;
  flagReason?: string;
  companyName?: string;
  listedBy?: string;
  status?: string;
  startingBid?: number;
  currentBid?: number;
  description?: string;
  imageUrl?: string;
  endsAt?: string;
};

export type TicketListItem = {
  id: string;
  ticketId: string;
  title: string;
  user: string;
  level: string;
  color: string;
  msg: string;
  active: boolean;
  priority: string;
  status: string;
};

export type TicketDetail = {
  id: string;
  ticketId: string;
  title: string;
  type?: string;
  status: string;
  statusLabel: string;
  aiGenuinenessScore?: number | null;
  aiScoreLabel?: string | null;
  auctionRef?: string;
  messages: { id: string; senderType: string; body: string; time: string; createdAt?: string }[];
  user: {
    id: string;
    name: string;
    username?: string;
    trustScore: number;
    verificationTier?: string;
    avatarUrl?: string;
  } | null;
  auction: {
    id: string;
    title: string;
    imageUrl: string;
    currentBid: string;
    status: string;
  } | null;
  openedAt: string;
  priority?: string;
  paymentOverrideRequested?: boolean;
  paymentOverrideApproved?: boolean;
};
