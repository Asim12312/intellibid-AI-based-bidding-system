import { create } from 'zustand';

const STORAGE_KEY = 'intellibid_user';

function readStoredUser() {
    if (typeof window === 'undefined') return null;
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export const useAuthStore = create((set) => ({
    user: null,
    hydrated: false,
    setUser: (user) => {
        if (typeof window !== 'undefined') {
            if (user) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
            else sessionStorage.removeItem(STORAGE_KEY);
        }
        set({ user });
    },
    clearUser: () => {
        if (typeof window !== 'undefined') sessionStorage.removeItem(STORAGE_KEY);
        set({ user: null });
    },
    hydrate: (user) => set({ user, hydrated: true }),
    initFromStorage: () => {
        const user = readStoredUser();
        set({ user, hydrated: true });
    },
}));
