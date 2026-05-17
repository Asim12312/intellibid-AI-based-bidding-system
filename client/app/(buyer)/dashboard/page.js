"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowUpRight, Bot, Gavel, TrendingUp, BellRing, 
  Clock, CheckCircle2, Activity, Sparkles, Plus, Search,
  ChevronRight, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

export default function BuyerDashboardPage() {
  const [depositOpen, setDepositOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  
  const [stats, setStats] = useState({ activeBids: 0, itemsWon: 0, totalSpent: 0, savedItems: 0 });
  const [activeBids, setActiveBids] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, bidsRes, recsRes, actRes] = await Promise.all([
          api('/api/buyer/dashboard/stats'),
          api('/api/buyer/bids/active'),
          api('/api/buyer/ai-picks'),
          api('/api/buyer/activity')
        ]);

        if (statsRes?.success) setStats(statsRes.data);
        if (bidsRes?.success) setActiveBids(bidsRes.data);
        if (recsRes?.success) setRecommendations(recsRes.data);
        if (actRes?.success) setActivity(actRes.data);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--electric)] text-white shadow-[4px_4px_0_0_var(--ink)] animate-pulse">
          <Activity className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Dashboard TopBar */}
      <div className="sticky top-0 z-40 border-b-[3px] border-[var(--ink)] bg-white/90 backdrop-blur-md">
        <div className="flex w-full items-center justify-between gap-4 px-6 py-4 md:px-10">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-2xl font-black md:text-3xl tracking-tight">Dashboard</h1>
            <span className="hidden items-center gap-2 rounded-full border-[3px] border-[var(--ink)] bg-[var(--acid)] px-3 py-1 font-display text-xs font-bold uppercase shadow-[2px_2px_0_0_var(--ink)] md:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--ink)]" />
              Agent Active
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden text-right md:block">
              <div className="text-xs font-bold uppercase tracking-wide text-[var(--ink)]/60">Total Spent</div>
              <div className="font-display text-xl font-black">${stats?.totalSpent?.toLocaleString() || 0}</div>
            </div>
            <Link href="/profile" className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--electric)] overflow-hidden shadow-[2px_2px_0_0_var(--ink)] transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--ink)]">
              <div className="font-display font-black text-white text-xl">{user?.firstName?.[0] || 'U'}</div>
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        
        {/* Welcome & Stats Row */}
        <div className="grid gap-6 md:grid-cols-4 lg:gap-8">
          <div className="brutal-lg col-span-1 flex flex-col justify-between bg-[var(--ink)] p-8 text-white md:col-span-2 shadow-[8px_8px_0_0_var(--acid)]">
            <div>
              <h2 className="font-display text-4xl font-black md:text-5xl">Welcome back, <span className="text-[var(--acid)]">{(user?.lastName && user.lastName.length <= 12) ? user.lastName : 'Buyer'}.</span></h2>
              <p className="mt-3 text-lg text-white/80 font-medium">You have {stats?.activeBids || 0} active bids closing soon. The market is hot.</p>
            </div>
            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => setDepositOpen(!depositOpen)}
                className="flex items-center gap-2 rounded-xl border-[3px] border-[var(--electric)] bg-[var(--electric)] px-6 py-3 font-display text-base font-black uppercase text-[var(--ink)] shadow-[4px_4px_0_0_var(--electric)] transition-transform hover:-translate-y-1 active:translate-y-0"
              >
                Deposit Funds <ArrowUpRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="brutal-lg flex flex-col justify-center bg-[var(--sunset)] p-6 shadow-[6px_6px_0_0_var(--ink)] transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-white shadow-[2px_2px_0_0_var(--ink)]">
                <Gavel className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <ArrowUpRight className="h-6 w-6 opacity-50" />
            </div>
            <div>
              <div className="font-display text-5xl font-black">{stats?.itemsWon || 0}</div>
              <div className="mt-1 text-sm font-bold uppercase text-[var(--ink)]/80 tracking-wide">Total Auctions Won</div>
            </div>
          </div>

          <div className="brutal-lg flex flex-col justify-center bg-[var(--acid)] p-6 shadow-[6px_6px_0_0_var(--ink)] transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-white shadow-[2px_2px_0_0_var(--ink)]">
                <Activity className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <TrendingUp className="h-6 w-6 opacity-50" />
            </div>
            <div>
              <div className="font-display text-5xl font-black">{stats?.activeBids || 0}</div>
              <div className="mt-1 text-sm font-bold uppercase text-[var(--ink)]/80 tracking-wide">Active Bids</div>
            </div>
          </div>
        </div>

        {/* Deposit Modal */}
        <AnimatePresence>
          {depositOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 overflow-hidden"
            >
              <div className="brutal bg-white p-6 md:p-8">
                <h3 className="font-display text-2xl font-black mb-4">Add Funds to Wallet</h3>
                <div className="flex flex-col md:flex-row gap-4">
                  <input type="number" placeholder="Amount (USD)" className="flex-1 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--background)] px-6 py-4 font-display text-xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--electric)]/30" />
                  <button className="rounded-xl border-[3px] border-[var(--ink)] bg-[var(--ink)] px-8 py-4 font-display text-lg font-black uppercase text-white shadow-[4px_4px_0_0_var(--hotpink)] transition-transform hover:-translate-y-1">
                    Proceed to Payment
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Grid */}
        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          
          {/* Left Column: Active Bids & Activity */}
          <div className="space-y-10 lg:col-span-8">
            
            <section>
              <div className="mb-6 flex items-center justify-between border-b-[4px] border-[var(--ink)] pb-4">
                <h3 className="font-display text-3xl font-black flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border-[3px] border-[var(--ink)] bg-[var(--electric)] text-white shadow-[2px_2px_0_0_var(--ink)]">
                    <Clock className="h-5 w-5" />
                  </span>
                  Your Active Bids
                </h3>
                <Link href="/buyer/bids" className="flex items-center gap-1 font-display text-sm font-black uppercase text-[var(--ink)] hover:text-[var(--electric)] hover:underline decoration-2 underline-offset-4 transition-colors">
                  View All <ChevronRight className="h-4 w-4" strokeWidth={3} />
                </Link>
              </div>
              
              <div className="space-y-5">
                {activeBids?.length === 0 ? (
                  <div className="brutal bg-white p-8 text-center text-[var(--ink)]/60 font-bold uppercase tracking-widest">
                    No active bids found.
                  </div>
                ) : (
                  activeBids?.map((bid, i) => (
                    <motion.div 
                      key={bid.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="brutal group relative flex flex-col justify-between overflow-hidden bg-white p-5 md:flex-row md:items-center hover:-translate-y-1 transition-transform"
                    >
                      <div className="absolute left-0 top-0 h-full w-3" style={{ background: bid.status === 'winning' ? 'var(--acid)' : 'var(--hotpink)' }} />
                      <div className="ml-4 flex items-center gap-5">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--background)] font-display text-sm font-black shadow-[2px_2px_0_0_var(--ink)] overflow-hidden">
                          <img src={bid.image} alt="Item" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-display text-xl font-black leading-tight group-hover:underline decoration-[3px] underline-offset-4">{bid.title}</div>
                          <div className="mt-1 text-sm font-bold text-[var(--ink)]/60 flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> Closes in {new Date(bid.endTime) > new Date() ? 'Soon' : 'Ended'}
                          </div>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t-[3px] border-[var(--ink)] pt-4 md:mt-0 md:border-none md:pt-0 md:justify-end md:gap-8">
                        <div className="text-left md:text-right">
                          <div className="text-xs font-bold uppercase tracking-widest text-[var(--ink)]/60">Your Bid</div>
                          <div className="font-display text-2xl font-black">${bid.userBid?.toLocaleString() || 0}</div>
                        </div>
                        <div className={`flex items-center gap-2 rounded-full border-[3px] border-[var(--ink)] px-4 py-2 font-display text-sm font-black uppercase shadow-[2px_2px_0_0_var(--ink)] ${bid.status === 'winning' ? 'bg-[var(--acid)]' : 'bg-[var(--hotpink)] text-white'}`}>
                          {bid.status === 'winning' ? <CheckCircle2 className="h-4 w-4" /> : <BellRing className="h-4 w-4 animate-bounce" />}
                          {bid.status}
                        </div>
                        {bid.status === 'outbid' && (
                          <button className="rounded-xl border-[3px] border-[var(--ink)] bg-[var(--ink)] px-5 py-2 font-display text-sm font-black uppercase text-white shadow-[2px_2px_0_0_var(--electric)] transition-transform hover:-translate-y-0.5">
                            Raise
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>

            <section className="brutal-lg overflow-hidden bg-[var(--electric)] shadow-[6px_6px_0_0_var(--ink)]">
              <div className="flex items-center justify-between border-b-[4px] border-[var(--ink)] bg-[var(--ink)] px-6 py-5 text-white">
                <h3 className="font-display text-2xl font-black flex items-center gap-3">
                  <Activity className="h-6 w-6 text-[var(--acid)]" /> Recent Activity
                </h3>
              </div>
              <div className="space-y-4 p-6 bg-[var(--background)]">
                {activity?.length === 0 ? (
                  <div className="text-center font-bold text-[var(--ink)]/60 py-4 uppercase">No recent activity</div>
                ) : (
                  activity?.map((item, i) => (
                    <div key={item.id} className="rounded-2xl border-[3px] border-[var(--ink)] bg-white p-5 shadow-[3px_3px_0_0_var(--ink)] relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-1 h-full ${item.type === 'won' ? 'bg-[var(--acid)]' : item.type === 'outbid' ? 'bg-[var(--hotpink)]' : 'bg-[var(--electric)]'}`} />
                      <div className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]/60 mb-2">{new Date(item.time).toLocaleString()}</div>
                      <p className="font-medium text-lg">{item.message}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

          </div>

          {/* Right Column: AI Recommendations */}
          <div className="lg:col-span-4">
            <div className="sticky top-28">
              <div className="mb-6 flex items-center justify-between border-b-[4px] border-[var(--ink)] pb-4">
                <h3 className="font-display text-3xl font-black flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border-[3px] border-[var(--ink)] bg-[var(--hotpink)] text-white shadow-[2px_2px_0_0_var(--ink)]">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  For You
                </h3>
              </div>
              
              <div className="space-y-6">
                {recommendations?.length === 0 ? (
                  <div className="brutal bg-white p-6 text-center font-bold text-[var(--ink)]/60">
                    No recommendations yet.
                  </div>
                ) : (
                  recommendations?.map((pick, i) => (
                    <Link href={`/auction/${pick.id}`} key={i} className="block brutal overflow-hidden bg-white hover:-translate-y-1 transition-transform group shadow-[4px_4px_0_0_var(--ink)]">
                      <div className="relative h-48 overflow-hidden border-b-[3px] border-[var(--ink)]">
                        <img src={pick.image} alt={pick.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute right-3 top-3 flex items-center justify-center h-8 w-8 rounded-full border-[3px] border-[var(--ink)] bg-[var(--acid)] shadow-[2px_2px_0_0_var(--ink)]">
                          <ArrowUpRight className="h-4 w-4" strokeWidth={3} />
                        </div>
                      </div>
                      <div className="p-5">
                        <h4 className="font-display text-xl font-black leading-tight mb-4 group-hover:underline decoration-[3px] underline-offset-4">{pick.title}</h4>
                        <div className="flex justify-between items-end border-t-[2px] border-dashed border-[var(--ink)]/30 pt-4">
                          <div>
                            <div className="text-xs uppercase font-bold tracking-widest text-[var(--ink)]/60">Starting Bid</div>
                            <div className="font-display text-2xl font-black text-[var(--hotpink)]">${pick.startingPrice?.toLocaleString() || 0}</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}

                <Link href="/buyer/ai-picks" className="flex items-center justify-center gap-2 w-full rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--background)] py-4 font-display text-sm font-black uppercase text-[var(--ink)] border-dashed hover:bg-white hover:border-solid hover:shadow-[4px_4px_0_0_var(--ink)] transition-all">
                  View More Picks <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
