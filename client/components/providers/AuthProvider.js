'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

export default function AuthProvider({ children }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const initFromStorage = useAuthStore((s) => s.initFromStorage);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    initFromStorage();

    (async () => {
      try {
        const data = await api('/api/auth/me');
        if (data?.user) hydrate(data.user);
        else hydrate(useAuthStore.getState().user);
      } catch {
        hydrate(useAuthStore.getState().user);
      }
    })();
  }, [hydrate, initFromStorage]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--ink)]">
        Loading…
      </div>
    );
  }

  return children;
}
