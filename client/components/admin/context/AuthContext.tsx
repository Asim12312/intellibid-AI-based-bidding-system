'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api, clearTokens, getRefreshToken, ApiException } from '../lib/api';

export type AdminProfile = {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
};

type AuthState = {
  admin: AdminProfile | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const platformUser = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const clearUser = useAuthStore((s) => s.clearUser);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    try {
      const r = await api.me();
      setAdmin(r.data);
      setError(null);
    } catch {
      setAdmin(null);
      throw new ApiException('Not authenticated', 401);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;

    (async () => {
      setLoading(true);

      if (platformUser && platformUser.role !== 'admin') {
        if (!cancelled) setLoading(false);
        router.replace('/dashboard');
        return;
      }

      try {
        await refreshProfile();
      } catch {
        if (!cancelled) router.replace('/login');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, platformUser, refreshProfile, router]);

  const logout = useCallback(async () => {
    const rt = getRefreshToken();
    try {
      await api.logout(rt);
    } catch {
      /* ignore */
    }
    clearTokens();
    setAdmin(null);
    clearUser();
    try {
      const { getApiBase } = await import('@/lib/apiBase');
      await fetch(`${getApiBase()}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch {
      /* ignore */
    }
    router.push('/login');
  }, [clearUser, router]);

  const value = useMemo(
    () => ({ admin, loading, error, logout, refreshProfile }),
    [admin, loading, error, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAdminAuth requires AdminAuthProvider');
  return ctx;
}
