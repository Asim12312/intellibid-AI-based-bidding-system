import { create } from 'zustand';
import { api } from '@/lib/api';

export const useFeedStore = create((set, get) => ({
    items: [],
    page: 1,
    loading: false,
    hasMore: true,
    feedType: 'personalized',
    filters: { category: '', minPrice: '', maxPrice: '' },

    fetchNextPage: async () => {
        const { page, loading, hasMore, filters, items } = get();
        if (loading || !hasMore) return;

        set({ loading: true });

        try {
            const params = new URLSearchParams({ page });
            if (filters.category) params.append('category', filters.category);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

            const data = await api(`/api/feed?${params.toString()}`);

            set({
                items: page === 1 ? data.items : [...items, ...data.items],
                page: page + 1,
                hasMore: data.hasMore,
                feedType: data.type,
            });
        } catch (error) {
            console.error('[FeedStore] Failed to fetch feed:', error);
        } finally {
            set({ loading: false });
        }
    },

    resetFeed: () => set({ items: [], page: 1, hasMore: true, loading: false }),

    setFilter: (key, value) => {
        set((state) => ({ filters: { ...state.filters, [key]: value } }));
        get().resetFeed();
    },
}));
