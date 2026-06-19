import { create } from 'zustand';
import { api } from '@/lib/api';

export const useAiPicksStore = create((set, get) => ({
    picks: [],
    loading: false,
    error: null,
    activeFilter: 'all', // 'all', 'steal', 'hot', 'match', 'fresh'

    fetchPicks: async () => {
        set({ loading: true, error: null });
        try {
            const res = await api('/api/buyer/ai-picks');
            if (res.success) {
                set({ picks: res.data, loading: false });
            } else {
                set({ error: res.message || 'Failed to load picks', loading: false });
            }
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    setFilter: (filter) => {
        set({ activeFilter: filter });
    },

    getFilteredPicks: () => {
        const { picks, activeFilter } = get();
        if (activeFilter === 'all') return picks;
        return picks.filter(p => p.tag === activeFilter);
    }
}));
