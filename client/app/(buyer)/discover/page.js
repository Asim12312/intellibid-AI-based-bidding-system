"use client";

import { useEffect, useState } from 'react';
import { useFeedStore } from '@/store/feedStore';
import { useAuthStore } from '@/store/authStore';
import FeedGrid from '@/components/discover/FeedGrid';
import FeedFilters from '@/components/discover/FeedFilters';
import ColdStartPicker from '@/components/discover/ColdStartPicker';
import { Compass, Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DiscoverPage() {
    const { fetchNextPage, items, page, loading, setQuery, query } = useFeedStore();
    const user = useAuthStore(s => s.user);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [localQuery, setLocalQuery] = useState(query || '');

    // Initial fetch
    useEffect(() => {
        if (items.length === 0 && page === 1 && !loading) {
            fetchNextPage();
        }
    }, [fetchNextPage, items.length, page, loading]);

    // Setup debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query !== localQuery) {
                setQuery(localQuery);
            }
        }, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [localQuery, query, setQuery]);

    // Check if we need to show onboarding (new users)
    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem(`onboarding_seen_${user?._id}`);
        const isColdStartFeed = useFeedStore.getState().feedType === 'trending';

        if (!hasSeenOnboarding && isColdStartFeed && !loading && items.length > 0) {
            setShowOnboarding(true);
        }
    }, [user, loading, items.length]);

    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
        if (user) {
            localStorage.setItem(`onboarding_seen_${user._id}`, 'true');
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto p-4 md:p-8 pb-24">
            {showOnboarding && (
                <ColdStartPicker onComplete={handleOnboardingComplete} />
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 mb-2"
                    >
                        <div className="p-3 bg-[var(--electric)] rounded-2xl border-[3px] border-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)]">
                            <Compass size={28} className="text-white" />
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter">
                            Discover
                        </h1>
                    </motion.div>
                    <p className="font-medium opacity-70 max-w-xl text-sm md:text-base">
                        Your personalized auction feed. The more you browse, bid, and watchlist, the smarter it gets.
                    </p>
                </div>
            </div>

            {/* AI Search Bar */}
            <div className="mb-8 relative max-w-3xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-[var(--ink)]/40" />
                </div>
                <input
                    type="text"
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                    placeholder="Describe what you want (e.g. 'vintage watch for boys')"
                    className="w-full bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-2xl py-4 pl-12 pr-6 font-display text-lg font-bold shadow-[4px_4px_0_0_var(--ink)] focus:outline-none focus:bg-white focus:shadow-[6px_6px_0_0_var(--ink)] transition-all placeholder:text-[var(--ink)]/40 text-[var(--ink)]"
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none hidden md:flex">
                    <div className="flex items-center gap-1.5 bg-[var(--acid)] px-3 py-1.5 rounded-xl border-[2px] border-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)]">
                        <Sparkles size={14} className="text-[var(--ink)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--ink)] leading-none pt-0.5">Powered by Gemini AI</span>
                    </div>
                </div>
            </div>

            <FeedFilters />
            <FeedGrid />
        </div>
    );
}
