"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Zap, Star, ArrowUpRight, Clock, Users, TrendingUp, Sparkles } from "lucide-react";

const picks = [
  { img: "/lot-walkman.jpg", tag: "Tech", title: "Mint Sony Walkman TPS-L2", bid: "$980", est: "$1,200", timeLeft: "05:11", bidders: 18, score: 94, reason: "Matches your 'Retro Tech' interest · Ends soon · 18% below est. value" },
  { img: "/lot-guitar.jpg", tag: "Music", title: "Fender Stratocaster '78 Sunburst", bid: "$3,210", est: "$4,200", timeLeft: "00:22", bidders: 27, score: 89, reason: "Popular with collectors you follow · 23% below est. value" },
  { img: "/lot-camera.jpg", tag: "Cameras", title: "Leica M3 Double Stroke — 1954", bid: "$3,800", est: "$5,000", timeLeft: "02:50", bidders: 51, score: 98, reason: "Rare find · 24% below est. value · Your top match this week" },
  { img: "/lot-art.jpg", tag: "Art", title: "Basquiat-Inspired Canvas — Large", bid: "$5,600", est: "$7,000", timeLeft: "00:55", bidders: 39, score: 82, reason: "Similar to your 'Neo-Pop Print' purchase" },
];

const insights = [
  { emoji: "📈", label: "Market up", detail: "Vintage tech lots up 32% this week" },
  { emoji: "⏱", label: "Best time to bid", detail: "Wed & Thu 9–11 PM have lowest competition" },
  { emoji: "🎯", label: "Your win rate", detail: "74% — above platform average of 61%" },
  { emoji: "💡", label: "Tip", detail: "Items tagged 'Mint' sell for avg. 22% over est." },
];

export default function AIPicksPage() {
  const [bidding, setBidding] = useState(null);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">
      {/* Header */}
      <header className="mb-12">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border-[3px] border-[var(--ink)] bg-[var(--acid)] px-4 py-1 font-display text-xs font-black uppercase shadow-[3px_3px_0_0_var(--ink)]">
          <Bot className="h-4 w-4" /> Powered by IntelliBid AI
        </div>
        <h1 className="font-display text-5xl font-black tracking-tighter md:text-7xl">
          AI <span className="text-stroke">Picks.</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-[var(--ink)]/70">
          Personalized recommendations based on your bidding history, wishlist, and real-time market trends.
        </p>
      </header>

      {/* AI Insights strip */}
      <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {insights.map((ins, i) => (
          <motion.div
            key={ins.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="brutal flex items-start gap-4 bg-white p-5"
          >
            <span className="text-3xl">{ins.emoji}</span>
            <div>
              <div className="font-display text-sm font-black uppercase">{ins.label}</div>
              <div className="mt-1 text-xs font-bold text-[var(--ink)]/70">{ins.detail}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Today's picks */}
      <section>
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl font-black">Today's Top Picks — <span className="text-[var(--hotpink)]">Just For You</span></h2>
          <button
            onClick={() => window.location.href = "/dashboard/chatbot"}
            className="hidden items-center gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--ink)] px-5 py-2.5 font-display text-sm font-black uppercase text-white shadow-[3px_3px_0_0_var(--electric)] transition-all hover:-translate-y-0.5 md:flex"
          >
            Customize with AI <Bot className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {picks.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="brutal-lg overflow-hidden bg-white"
            >
              <div className="relative h-52 overflow-hidden border-b-[4px] border-[var(--ink)]">
                <img src={p.img} alt={p.title} className="h-full w-full object-cover" />
                <div className="absolute left-3 top-3 flex gap-2">
                  <span className="rounded-full border-[2px] border-[var(--ink)] bg-white px-3 py-1 font-display text-xs font-black uppercase">{p.tag}</span>
                </div>
                <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1 rounded-full border-[2px] border-[var(--ink)] bg-[var(--hotpink)] px-3 py-1 font-display text-xs font-black text-white">
                    <Sparkles className="h-3 w-3" /> {p.score}% Match
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full border-[2px] border-[var(--ink)] bg-[var(--acid)] px-3 py-1 font-display text-xs font-black">
                  <Clock className="h-3 w-3" /> {p.timeLeft}
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-display text-xl font-black leading-tight">{p.title}</h3>
                <p className="mt-2 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--background)] px-4 py-2 text-xs font-bold text-[var(--ink)]/80">
                  💡 {p.reason}
                </p>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase text-[var(--ink)]/60">Current Bid · {p.bidders} bidders</div>
                    <div className="font-display text-3xl font-black">{p.bid}</div>
                    <div className="text-xs font-bold text-[var(--ink)]/60">Est. value: {p.est}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setBidding(bidding === i ? null : i)}
                      className={`rounded-xl border-[3px] border-[var(--ink)] px-6 py-3 font-display text-sm font-black uppercase shadow-[4px_4px_0_0_var(--ink)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none ${
                        bidding === i ? "bg-[var(--hotpink)] text-white" : "bg-[var(--electric)] text-white"
                      }`}
                    >
                      {bidding === i ? "Cancel" : "Bid Now"}
                    </button>
                    <button className="rounded-xl border-[3px] border-[var(--ink)] bg-white px-6 py-2 font-display text-xs font-black uppercase shadow-[2px_2px_0_0_var(--ink)] hover:bg-[var(--acid)] transition-all">
                      Watchlist ☆
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {bidding === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 overflow-hidden"
                    >
                      <div className="flex gap-3 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--background)] p-4">
                        <input
                          type="number"
                          placeholder="Enter your max bid..."
                          className="flex-1 bg-transparent font-display font-bold focus:outline-none text-lg"
                        />
                        <button className="rounded-lg border-[2px] border-[var(--ink)] bg-[var(--acid)] px-5 py-2 font-display text-sm font-black uppercase shadow-[2px_2px_0_0_var(--ink)] hover:-translate-y-0.5 transition-all">
                          Place →
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Predictive insight banner */}
      <section className="mt-16">
        <div className="brutal-lg grid gap-8 bg-[var(--hotpink)] p-10 text-white md:grid-cols-3 md:p-14">
          <div className="md:col-span-2">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border-[2px] border-white bg-white/20 px-4 py-1 font-display text-xs font-black uppercase">
              <TrendingUp className="h-4 w-4" /> Predictive Intelligence
            </div>
            <h2 className="font-display text-3xl font-black md:text-5xl">
              The AI predicts the Walkman will sell 18% below market value.
            </h2>
            <p className="mt-4 text-lg text-white/80">Based on 620 similar past auctions and current demand signals.</p>
          </div>
          <div className="flex flex-col justify-center gap-4">
            <div className="rounded-2xl border-[3px] border-white bg-white/20 p-6 text-center">
              <div className="font-display text-5xl font-black">62%</div>
              <div className="mt-1 text-sm font-bold uppercase text-white/80">AI Confidence Score</div>
            </div>
            <button
              onClick={() => window.location.href = "/dashboard/chatbot"}
              className="w-full rounded-xl border-[3px] border-white bg-white px-6 py-4 font-display font-black uppercase text-[var(--hotpink)] shadow-[4px_4px_0_0_white/40] transition-all hover:-translate-y-0.5"
            >
              Ask the Agent
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
