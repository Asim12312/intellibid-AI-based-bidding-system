"use client";

import { useEffect, useState } from 'react';
import { useFeedStore } from '@/store/feedStore';
import { useAuthStore } from '@/store/authStore';
import FeedGrid from '@/components/discover/FeedGrid';
import FeedFilters from '@/components/discover/FeedFilters';
import ColdStartPicker from '@/components/discover/ColdStartPicker';
import { Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DiscoverPage() {
    const { fetchNextPage, items, page, loading } = useFeedStore();
    const user = useAuthStore(s => s.user);
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Initial fetch
    useEffect(() => {
        if (items.length === 0 && page === 1 && !loading) {
            fetchNextPage();
        }
    }, [fetchNextPage, items.length, page, loading]);

    // Check if we need to show onboarding (new users)
    useEffect(() => {
        // We use a simple local storage flag so we don't annoy them if they skipped it
        const hasSeenOnboarding = localStorage.getItem(`onboarding_seen_${user?._id}`);
        
        // If we fetched the feed and it's 'trending' (cold start), and they haven't seen the picker
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

            <FeedFilters />
            <FeedGrid />
        </div>
    );
}
