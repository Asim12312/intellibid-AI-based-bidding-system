"use client";

import { useEffect, useRef } from 'react';
import { useBidsStore } from '@/store/bidsStore';
import BidsHeader from '@/components/bids/BidsHeader';
import BidsTabs from '@/components/bids/BidsTabs';
import BidCard from '@/components/bids/BidCard';
import BidsEmpty from '@/components/bids/BidsEmpty';
import PlaceBidModal from '@/components/bids/PlaceBidModal';
import { motion } from 'framer-motion';
import { Loader2, TrendingUp } from 'lucide-react';

export default function MyBidsPage() {
    const {
        bids,
        loading,
        hasMore,
        activeTab,
        fetchBids,
        fetchStats
    } = useBidsStore();

    const sentinelRef = useRef(null);

    // Initial fetch
    useEffect(() => {
        fetchStats();

        if (bids.length === 0 && !loading) {
            useBidsStore.getState().resetBids();
        }
    }, []);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !loading && hasMore) {
                    fetchBids();
                }
            },
            { threshold: 0.1, rootMargin: '400px' }
        );

        if (sentinelRef.current) observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [loading, hasMore, fetchBids]);

    return (
        <div className="max-w-[1200px] mx-auto p-4 md:p-8 pb-24">
            <PlaceBidModal />

            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-8"
            >
                <div className="p-3 bg-[var(--acid)] rounded-2xl border-[3px] border-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)]">
                    <TrendingUp size={28} className="text-[var(--ink)]" />
                </div>
                <div>
                    <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter">
                        My Bids
                    </h1>
                    <p className="font-medium opacity-70 mt-1">
                        Track your auction activity, monitor outbids, and review past wins.
                    </p>
                </div>
            </motion.div>

            <BidsHeader />
            <BidsTabs />

            {/* Bid Grid */}
            {bids.length === 0 && !loading ? (
                <BidsEmpty tab={activeTab} />
            ) : (
                <div className="flex flex-col gap-4">
                    {bids.map((bid) => (
                        <BidCard key={bid._id} bid={bid} />
                    ))}
                </div>
            )}

            {/* Infinite Scroll Sentinel */}
            <div
                ref={sentinelRef}
                className="w-full h-32 flex items-center justify-center mt-8"
            >
                {loading && (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-[var(--ink)]" size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                            Loading bids...
                        </span>
                    </div>
                )}
                {!hasMore && bids.length > 0 && (
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                            End of history
                        </p>
                        <div className="w-16 h-1 bg-[var(--ink)] mx-auto mt-2 rounded-full opacity-20" />
                    </div>
                )}
            </div>
        </div>
    );
}
