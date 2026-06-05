import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useBidsStore } from '@/store/bidsStore';
import { Clock, ArrowRight, Gavel } from 'lucide-react';

export default function BidCard({ bid }) {
    const { openBidModal } = useBidsStore();
    const auction = bid.auction || {};
    
    // Status Logic
    const isWinning = bid.status === 'winning';
    const isWon = bid.status === 'won';
    const isLost = bid.status === 'outbid' && auction.status !== 'active';
    const isOutbid = bid.status === 'outbid' && auction.status === 'active';

    let statusConfig = { label: 'Unknown', color: 'bg-gray-200 text-gray-800' };
    if (isWinning) statusConfig = { label: 'Winning', color: 'bg-[var(--acid)] text-[var(--ink)] border-[var(--ink)]' };
    else if (isWon) statusConfig = { label: 'Won', color: 'bg-[var(--sunset)] text-white border-[var(--ink)]' };
    else if (isLost) statusConfig = { label: 'Lost', color: 'bg-red-500 text-white border-red-900' };
    else if (isOutbid) statusConfig = { label: 'Outbid', color: 'bg-[var(--hotpink)] text-white border-[var(--ink)] animate-pulse' };

    // Timer logic
    const [timeLeft, setTimeLeft] = useState('');
    useEffect(() => {
        if (!auction.endTime || auction.status !== 'active') return;
        
        const calculateTimeLeft = () => {
            const diff = new Date(auction.endTime).getTime() - Date.now();
            if (diff <= 0) return 'Ended';
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            if (hours > 24) return `${Math.floor(hours / 24)}d left`;
            if (hours > 0) return `${hours}h ${minutes}m`;
            return `${minutes}m left`;
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);
        return () => clearInterval(timer);
    }, [auction.endTime, auction.status]);

    if (!auction._id) return null; // Defensive check if populated auction is missing

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative z-0 flex flex-col md:flex-row bg-white border-[3px] border-[var(--ink)] rounded-2xl overflow-hidden shadow-[4px_4px_0_0_var(--ink)] transition-all ${isWon ? 'ring-4 ring-[var(--sunset)] ring-opacity-50' : ''}`}
        >
            {/* Status Badge */}
            <div className={`absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-[2px] shadow-[2px_2px_0_0_var(--ink)] flex items-center gap-1 ${statusConfig.color}`}>
                {statusConfig.label}
            </div>

            {/* Image */}
            <div className="relative w-full md:w-64 h-64 border-b-[3px] md:border-b-0 md:border-r-[3px] border-[var(--ink)] bg-gray-100 shrink-0">
                {auction.images?.[0] ? (
                    <img 
                        src={auction.images[0]} 
                        alt={auction.title}
                        className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center font-display opacity-10">No Image</div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 md:p-6 flex flex-col flex-1">
                <h3 className="font-display font-black text-xl leading-tight line-clamp-1 mb-4">
                    {auction.title}
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 rounded-xl border-[2px] border-black/10">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Your Bid</p>
                        <p className={`font-display text-2xl font-black mt-1 ${isWinning || isWon ? 'text-[var(--ink)]' : 'text-gray-400 line-through'}`}>
                            ${bid.amount?.toLocaleString()}
                        </p>
                    </div>
                    <div className="p-3 bg-[var(--background)] rounded-xl border-[2px] border-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)]">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Highest Bid</p>
                        <p className="font-display text-2xl font-black text-[var(--electric)] mt-1 drop-shadow-[1px_1px_0_var(--ink)]">
                            ${auction.currentPrice?.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="mt-auto flex flex-col sm:flex-row items-center gap-3">
                    {auction.status === 'active' ? (
                        <div className="flex-1 flex items-center gap-2 text-sm font-bold bg-white px-3 py-2 border-[2px] border-[var(--ink)] rounded-lg">
                            <Clock size={16} className={timeLeft.includes('m left') ? 'text-[var(--hotpink)]' : ''} />
                            <span className={timeLeft.includes('m left') ? 'text-[var(--hotpink)]' : ''}>{timeLeft}</span>
                            <span className="opacity-50 text-xs ml-auto">({auction.bidCount} bids)</span>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center gap-2 text-sm font-bold bg-gray-100 text-gray-500 px-3 py-2 border-[2px] border-gray-300 rounded-lg">
                            Auction Ended
                        </div>
                    )}

                    <div className="flex w-full sm:w-auto gap-2">
                        <Link 
                            href={`/auction/${auction._id}`}
                            className="flex-1 sm:flex-none flex items-center justify-center p-3 border-[3px] border-[var(--ink)] rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <ArrowRight size={20} />
                        </Link>
                        
                        {isOutbid && (
                            <button 
                                onClick={() => openBidModal(auction)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[var(--hotpink)] text-white px-6 py-3 rounded-xl border-[3px] border-[var(--ink)] font-black uppercase tracking-widest text-xs shadow-[4px_4px_0_0_var(--ink)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--ink)] transition-all"
                            >
                                <Gavel size={16} /> Raise Bid
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
