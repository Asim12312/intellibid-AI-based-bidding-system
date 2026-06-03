import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useBehaviorTracker } from '@/hooks/useBehaviorTracker';
import { Clock, Heart, ArrowRight } from 'lucide-react';

export default function AuctionCard({ auction }) {
    const { trackViewOnce, trackEvent } = useBehaviorTracker(auction._id);
    const cardRef = useRef(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        // Track view when 60% visible
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    trackViewOnce();
                }
            },
            { threshold: 0.6 }
        );

        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, [trackViewOnce]);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const diff = new Date(auction.endTime).getTime() - Date.now();
            if (diff <= 0) return 'Ended';

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            setIsUrgent(d === 0 && h < 24);

            const pad = (num) => num.toString().padStart(2, '0');

            if (d > 0) return `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`;
            if (h > 0) return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
            return `${pad(m)}m ${pad(s)}s`;
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, [auction.endTime]);

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative flex flex-col bg-white border-[3px] border-[var(--ink)] rounded-2xl overflow-hidden shadow-[4px_4px_0_0_var(--ink)] hover:translate-y-[-4px] hover:shadow-[6px_6px_0_0_var(--ink)] transition-all"
        >
            {/* Urgency Badge */}
            {isUrgent && timeLeft !== 'Ended' && (
                <div className="absolute top-3 left-3 z-10 bg-[var(--hotpink)] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-[2px] border-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)] flex items-center gap-1 animate-pulse">
                    <Clock size={12} /> Ending Soon
                </div>
            )}

            {/* Image */}
            <div className="relative aspect-square border-b-[3px] border-[var(--ink)] bg-gray-100 overflow-hidden">
                {auction.images && auction.images[0] ? (
                    <img
                        src={auction.images[0]}
                        alt={auction.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center font-display text-4xl opacity-10">
                        No Image
                    </div>
                )}

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        trackEvent('watchlist_add');
                        // TODO: Implement actual watchlist toggle logic in store/backend
                    }}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full border-[2px] border-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)] hover:bg-[var(--hotpink)] hover:text-white transition-colors"
                >
                    <Heart size={16} />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-display font-black text-lg leading-tight line-clamp-2">
                        {auction.title}
                    </h3>
                </div>

                <p className="text-xs font-bold uppercase tracking-widest text-[var(--ink)] opacity-60 mb-4 bg-gray-100 w-fit px-2 py-1 rounded-md border-[1px] border-[var(--ink)]">
                    {auction.category}
                </p>

                <div className="mt-auto flex items-end justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Current Bid</p>
                        <p className="font-display text-2xl font-black text-[var(--acid)] drop-shadow-[1px_1px_0_var(--ink)]">
                            ${auction.currentPrice.toLocaleString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center justify-end gap-1">
                            <Clock size={10} /> Time Left
                        </p>
                        <p className={`font-bold text-sm ${isUrgent ? 'text-[var(--hotpink)]' : ''}`}>
                            {timeLeft}
                        </p>
                    </div>
                </div>

                <Link
                    href={`/auction/${auction._id}`}
                    onClick={() => trackEvent('item_view', { source: 'feed_click' })}
                    className="mt-4 w-full bg-[var(--electric)] text-white py-3 rounded-xl border-[2px] border-[var(--ink)] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[var(--ink)] hover:text-[var(--acid)] transition-colors"
                >
                    View Details <ArrowRight size={14} />
                </Link>
            </div>
        </motion.div>
    );
}
