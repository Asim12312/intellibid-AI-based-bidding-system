"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Clock, TrendingUp, Gavel, History, CheckCircle2, XCircle, BarChart3, Eye, ArrowUpRight, Zap } from "lucide-react";

const myListings = [
  { id: "L-001", name: "Supreme Box Logo Hoodie — Black M", bids: 12, topBid: "$3,200", reserve: "$2,500", time: "04:22:00", status: "active", img: "/lot-sneaker.jpg" },
  { id: "L-002", name: "Canon AE-1 Camera — Mint Black", bids: 7, topBid: "$340", reserve: "$200", time: "00:15:00", status: "ending", img: "/lot-camera.jpg" },
  { id: "L-003", name: "Rolex Submariner 16610 Box + Papers", bids: 38, topBid: "$11,800", reserve: "$9,000", time: "Sold", status: "sold", img: "/lot-watch.jpg" },
];

const myBids = [
  { id: "B-4471", name: "Air Jordan 1 'Chicago' 1985", myBid: "$12,400", topBid: "$12,400", time: "02:14", status: "winning", img: "/lot-sneaker.jpg" },
  { id: "B-8912", name: "Polaroid SX-70 Land Camera", myBid: "$420", topBid: "$450", time: "01:02", status: "outbid", img: "/lot-camera.jpg" },
  { id: "B-2201", name: "Rolex Submariner 16610", myBid: "$8,750", topBid: "$8,750", time: "03:38", status: "winning", img: "/lot-watch.jpg" },
];

const history = [
  { name: "Fender Stratocaster '78 Sunburst", sold: "$3,210", date: "Apr 28", role: "Buyer" },
  { name: "Sony Walkman TPS-L2", sold: "$980", date: "Apr 15", role: "Seller" },
  { name: "Leica M3 Double Stroke", sold: "$4,800", date: "Apr 1", role: "Buyer" },
];

export default function AuctionsPage() {
  const [tab, setTab] = useState("bids");

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">
      {/* Header */}
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-5xl font-black tracking-tighter md:text-7xl">
            Your <span className="text-stroke">Auctions.</span>
          </h1>
          <p className="mt-3 text-lg text-[var(--ink)]/70">Manage listings, track bids, and review your history.</p>
        </div>
        <button
          onClick={() => alert("Create Lot modal — connect your backend here!")}
          className="flex items-center gap-3 rounded-2xl border-[4px] border-[var(--ink)] bg-[var(--electric)] px-8 py-4 font-display text-xl font-black uppercase text-white shadow-[var(--shadow-brutal)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-brutal-lg)] active:translate-y-0 active:shadow-none"
        >
          <Plus className="h-6 w-6" strokeWidth={3} /> Create Lot
        </button>
      </div>

      {/* Stats row */}
      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Active Bids", value: "3", icon: "🔥", color: "var(--acid)" },
          { label: "Lots Listed", value: "2", icon: "🏷️", color: "var(--electric)" },
          { label: "Items Won", value: "12", icon: "🏆", color: "var(--hotpink)" },
          { label: "Total Spent", value: "$28.4k", icon: "💸", color: "var(--sunset)" },
        ].map((s) => (
          <div key={s.label} className="brutal flex flex-col justify-between bg-white p-6">
            <div className="text-3xl">{s.icon}</div>
            <div>
              <div className="mt-4 font-display text-3xl font-black md:text-4xl">{s.value}</div>
              <div className="text-xs font-bold uppercase text-[var(--ink)]/60">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-8 flex items-center gap-2 rounded-2xl border-[3px] border-[var(--ink)] bg-white p-2 shadow-[var(--shadow-brutal)] w-fit">
        {[["bids", "🎯 My Bids"], ["listings", "🏷️ My Listings"], ["history", "📜 History"]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-xl px-5 py-2.5 font-display text-sm font-black uppercase transition-all ${
              tab === key
                ? "bg-[var(--ink)] text-white shadow-[2px_2px_0_0_var(--electric)]"
                : "text-[var(--ink)]/70 hover:bg-[var(--background)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "bids" && (
          <motion.div key="bids" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {myBids.map((b, i) => (
              <div key={b.id} className="brutal flex flex-col justify-between overflow-hidden bg-white p-0 md:flex-row">
                <div className="flex items-center gap-5 p-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-[3px] border-[var(--ink)]">
                    <img src={b.img} alt={b.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-black">{b.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs font-bold text-[var(--ink)]/60">
                      <Clock className="h-3.5 w-3.5" /> Closes in {b.time}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 border-t-[3px] border-[var(--ink)] bg-[var(--background)] p-5 md:border-l-[3px] md:border-t-0">
                  <div>
                    <div className="text-xs font-bold uppercase text-[var(--ink)]/60">Your Bid</div>
                    <div className="font-display text-2xl font-black">{b.myBid}</div>
                  </div>
                  <div className={`flex items-center gap-2 rounded-full border-[3px] border-[var(--ink)] px-4 py-2 font-display text-sm font-black uppercase ${
                    b.status === "winning" ? "bg-[var(--acid)]" : "bg-[var(--hotpink)] text-white"
                  }`}>
                    {b.status === "winning" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {b.status === "winning" ? "Winning" : "Outbid!"}
                  </div>
                  {b.status === "outbid" && (
                    <button className="rounded-xl border-[3px] border-[var(--ink)] bg-[var(--electric)] px-6 py-2 font-display text-sm font-black uppercase text-white shadow-[3px_3px_0_0_var(--ink)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none">
                      Raise Bid
                    </button>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {tab === "listings" && (
          <motion.div key="listings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {myListings.map((l) => (
              <div key={l.id} className="brutal flex flex-col justify-between overflow-hidden bg-white md:flex-row">
                <div className="flex items-center gap-5 p-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-[3px] border-[var(--ink)]">
                    <img src={l.img} alt={l.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-black">{l.name}</h3>
                    <div className="mt-1 flex items-center gap-4 text-xs font-bold text-[var(--ink)]/60">
                      <span><Gavel className="inline h-3 w-3 mr-1" />{l.bids} bids</span>
                      <span><Eye className="inline h-3 w-3 mr-1" />Reserve: {l.reserve}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 border-t-[3px] border-[var(--ink)] bg-[var(--background)] p-5 md:border-l-[3px] md:border-t-0">
                  <div>
                    <div className="text-xs font-bold uppercase text-[var(--ink)]/60">Top Bid</div>
                    <div className="font-display text-2xl font-black">{l.topBid}</div>
                  </div>
                  <span className={`rounded-full border-[2px] border-[var(--ink)] px-3 py-1 font-display text-xs font-black uppercase ${
                    l.status === "sold" ? "bg-[var(--ink)] text-white" : l.status === "ending" ? "bg-[var(--hotpink)] text-white" : "bg-[var(--acid)]"
                  }`}>
                    {l.status === "sold" ? "✅ Sold" : l.status === "ending" ? "🚨 Ending" : "🟢 Active"}
                  </span>
                  <button className="rounded-xl border-[3px] border-[var(--ink)] bg-[var(--ink)] px-5 py-2 font-display text-sm font-black uppercase text-white shadow-[3px_3px_0_0_var(--electric)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none">
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {tab === "history" && (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {history.map((h, i) => (
              <div key={i} className="brutal flex items-center justify-between bg-white p-6">
                <div>
                  <div className="font-display text-lg font-black">{h.name}</div>
                  <div className="mt-1 text-xs font-bold uppercase text-[var(--ink)]/60">{h.date} · {h.role}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold uppercase text-[var(--ink)]/60">Final Price</div>
                  <div className="font-display text-2xl font-black">{h.sold}</div>
                </div>
              </div>
            ))}

            <div className="brutal-lg mt-8 grid gap-6 bg-[var(--ink)] p-8 text-white md:grid-cols-3">
              {[["$28,400", "Total Purchased"], ["$15,200", "Total Sold"], ["42%", "Avg. Profit Margin"]].map(([v, l]) => (
                <div key={l}>
                  <div className="font-display text-4xl font-black text-[var(--acid)]">{v}</div>
                  <div className="mt-1 text-sm font-bold uppercase text-white/70">{l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
