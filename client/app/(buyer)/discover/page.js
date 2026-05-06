"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ArrowUpRight, Clock, Users, TrendingUp, Zap, Star } from "lucide-react";

const lots = [
  { id: 1, img: "/lot-sneaker.jpg", tag: "Sneakers", title: "Air Jordan 1 'Chicago' 1985", bid: "$12,400", time: "02:14", bidders: 47, est: "$14k", hot: true },
  { id: 2, img: "/lot-art.jpg", tag: "Art", title: "Neo Pop Print 04/12 — Signed", bid: "$2,860", time: "00:47", bidders: 22, est: "$3.5k", hot: false },
  { id: 3, img: "/lot-walkman.jpg", tag: "Tech", title: "Mint Sony Walkman TPS-L2", bid: "$980", time: "05:11", bidders: 18, est: "$1.2k", hot: true },
  { id: 4, img: "/lot-camera.jpg", tag: "Cameras", title: "Polaroid SX-70 Land Camera", bid: "$420", time: "01:02", bidders: 31, est: "$550", hot: false },
  { id: 5, img: "/lot-watch.jpg", tag: "Watches", title: "Rolex Submariner 16610 — 2001", bid: "$8,750", time: "03:38", bidders: 64, est: "$10k", hot: true },
  { id: 6, img: "/lot-guitar.jpg", tag: "Music", title: "Fender Stratocaster '78 Sunburst", bid: "$3,210", time: "00:22", bidders: 27, est: "$4.2k", hot: false },
  { id: 7, img: "/lot-sneaker.jpg", tag: "Sneakers", title: "Nike Air Max 1 'Amsterdam' 2022", bid: "$890", time: "06:00", bidders: 14, est: "$1.1k", hot: false },
  { id: 8, img: "/lot-art.jpg", tag: "Art", title: "Basquiat-inspired Canvas — Large", bid: "$5,600", time: "00:55", bidders: 39, est: "$7k", hot: true },
  { id: 9, img: "/lot-camera.jpg", tag: "Cameras", title: "Leica M3 Double Stroke — 1954", bid: "$3,800", time: "02:50", bidders: 51, est: "$5k", hot: true },
];

const hubs = [
  { emoji: "📱", name: "Vintage Tech", count: "1.2k lots", color: "var(--acid)", trend: "+32%" },
  { emoji: "👟", name: "Hype Sneakers", count: "840 lots", color: "var(--electric)", trend: "+18%" },
  { emoji: "🎨", name: "Neo-Pop Art", count: "312 lots", color: "var(--hotpink)", trend: "+41%" },
  { emoji: "⌚", name: "Luxury Watches", count: "120 lots", color: "var(--sunset)", trend: "+9%" },
  { emoji: "🎸", name: "Vintage Music", count: "278 lots", color: "var(--electric)", trend: "+22%" },
  { emoji: "📷", name: "Film Cameras", count: "195 lots", color: "var(--acid)", trend: "+15%" },
];

const TAGS = ["All", "Sneakers", "Art", "Tech", "Cameras", "Watches", "Music"];

export default function DiscoverPage() {
  const [activeTag, setActiveTag] = useState("All");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("hot");

  const filtered = lots.filter((l) => {
    const matchTag = activeTag === "All" || l.tag === activeTag;
    const matchQuery = l.title.toLowerCase().includes(query.toLowerCase()) || l.tag.toLowerCase().includes(query.toLowerCase());
    return matchTag && matchQuery;
  }).sort((a, b) => {
    if (sortBy === "hot") return b.bidders - a.bidders;
    if (sortBy === "ending") return a.time.localeCompare(b.time);
    if (sortBy === "price-hi") return parseFloat(b.bid.replace(/[$,k]/g, "")) - parseFloat(a.bid.replace(/[$,k]/g, ""));
    return 0;
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">
      {/* Header */}
      <header className="mb-10">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border-[3px] border-[var(--ink)] bg-[var(--acid)] px-4 py-1 font-display text-xs font-black uppercase shadow-[3px_3px_0_0_var(--ink)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--ink)]" /> 4,219 Live Auctions
            </div>
            <h1 className="font-display text-5xl font-black tracking-tighter md:text-7xl">
              Discover <span className="text-stroke">the rare.</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border-[3px] border-[var(--ink)] bg-white px-4 py-3 font-display text-sm font-bold uppercase shadow-[3px_3px_0_0_var(--ink)] focus:outline-none"
            >
              <option value="hot">🔥 Hot</option>
              <option value="ending">⏱ Ending Soon</option>
              <option value="price-hi">💰 Price: High</option>
            </select>
          </div>
        </div>
      </header>

      {/* Search bar */}
      <div className="brutal-lg mb-8 flex flex-col items-stretch gap-4 bg-white p-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--ink)]/40" strokeWidth={2.5} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search 'vintage cameras', 'Jordan 1', 'Rolex'…"
            className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--background)] py-4 pl-12 pr-4 font-display font-bold focus:bg-white focus:outline-none"
          />
        </div>
        <button className="flex shrink-0 items-center justify-center gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--electric)] px-8 py-4 font-display font-black uppercase text-white shadow-[4px_4px_0_0_var(--ink)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--ink)] active:translate-y-0 active:shadow-none">
          <Filter className="h-5 w-5" /> Filter
        </button>
      </div>

      {/* Category filter pills */}
      <div className="mb-10 flex flex-wrap gap-3">
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`rounded-full border-[3px] border-[var(--ink)] px-5 py-2 font-display text-sm font-black uppercase transition-all hover:-translate-y-0.5 ${
              activeTag === tag
                ? "bg-[var(--ink)] text-white shadow-[4px_4px_0_0_var(--electric)]"
                : "bg-white shadow-[3px_3px_0_0_var(--ink)] hover:bg-[var(--acid)]"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Trending Hubs */}
      <section className="mb-14">
        <h2 className="mb-6 font-display text-3xl font-black">🔥 Trending Hubs</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {hubs.map((h, i) => (
            <motion.div
              key={h.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -8, rotate: i % 2 === 0 ? -2 : 2 }}
              className="brutal group cursor-pointer p-5 transition-shadow"
              style={{ background: h.color }}
            >
              <div className="mb-3 text-3xl">{h.emoji}</div>
              <h3 className="font-display text-base font-black leading-tight">{h.name}</h3>
              <p className="mt-1 text-xs font-bold uppercase text-[var(--ink)]/70">{h.count}</p>
              <div className="mt-3 flex items-center gap-1 rounded-full border-[2px] border-[var(--ink)] bg-white/60 px-2 py-0.5 text-xs font-black">
                <TrendingUp className="h-3 w-3" /> {h.trend}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Lot grid */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-3xl font-black">
            Live Right Now <span className="ml-2 text-base text-[var(--ink)]/60">({filtered.length} lots)</span>
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="brutal flex flex-col items-center justify-center gap-4 bg-white py-20 text-center">
            <div className="text-6xl">🔍</div>
            <h3 className="font-display text-2xl font-black">No lots found</h3>
            <p className="text-[var(--ink)]/70">Try a different search or clear the filter.</p>
            <button onClick={() => { setQuery(""); setActiveTag("All"); }} className="brutal bg-[var(--acid)] px-6 py-3 font-display font-black uppercase shadow-[4px_4px_0_0_var(--ink)]">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((lot, i) => (
              <motion.div
                key={lot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -8 }}
                className="brutal-lg group cursor-pointer overflow-hidden bg-white"
              >
                <div className="relative h-56 overflow-hidden border-b-[3px] border-[var(--ink)]">
                  <img src={lot.img} alt={lot.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute left-3 top-3 flex gap-2">
                    <span className="rounded-full border-[2px] border-[var(--ink)] bg-white px-3 py-1 font-display text-xs font-black uppercase">{lot.tag}</span>
                    {lot.hot && (
                      <span className="rounded-full border-[2px] border-[var(--ink)] bg-[var(--hotpink)] px-3 py-1 font-display text-xs font-black uppercase text-white">🔥 Hot</span>
                    )}
                  </div>
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border-[2px] border-[var(--ink)] bg-[var(--ink)] px-3 py-1 font-display text-xs font-black text-white">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--acid)]" /> LIVE
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full border-[2px] border-[var(--ink)] bg-[var(--acid)] px-3 py-1 font-display text-xs font-black">
                    <Clock className="h-3 w-3" /> {lot.time}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-black leading-tight group-hover:underline">{lot.title}</h3>
                  <div className="mt-1 flex items-center gap-3 text-xs font-bold text-[var(--ink)]/60">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {lot.bidders} bidders</span>
                    <span>Est. {lot.est}</span>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase text-[var(--ink)]/60">Top Bid</div>
                      <div className="font-display text-2xl font-black">{lot.bid}</div>
                    </div>
                    <button className="flex items-center gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--electric)] px-5 py-3 font-display text-sm font-black uppercase text-white shadow-[4px_4px_0_0_var(--ink)] transition-all hover:-translate-y-0.5 hover:bg-[var(--hotpink)] active:translate-y-0 active:shadow-none">
                      Bid <ArrowUpRight className="h-4 w-4" strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Agent Banner */}
      <section className="mt-20">
        <div className="brutal-lg flex flex-col items-start justify-between gap-8 bg-[var(--ink)] p-10 text-white md:flex-row md:items-center md:p-16">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border-[2px] border-[var(--acid)] bg-[var(--acid)] px-4 py-1 font-display text-xs font-black uppercase text-[var(--ink)]">
              🤖 Agent Mode
            </div>
            <h2 className="font-display text-4xl font-black md:text-6xl">
              Too much to browse? <span className="text-[var(--acid)]">Tell the AI.</span>
            </h2>
            <p className="mt-4 max-w-md text-lg text-white/70">
              Just type what you want — "vintage camera under $1,000 ending today" — and the agent builds your custom feed.
            </p>
          </div>
          <button
            onClick={() => window.location.href = "/dashboard/chatbot"}
            className="shrink-0 rounded-2xl border-[3px] border-[var(--acid)] bg-[var(--acid)] px-10 py-5 font-display text-xl font-black uppercase text-[var(--ink)] shadow-[6px_6px_0_0_var(--electric)] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0_0_var(--electric)] active:translate-y-0 active:shadow-none"
          >
            Open Agent →
          </button>
        </div>
      </section>
    </main>
  );
}
