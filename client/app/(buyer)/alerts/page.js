"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BellRing, Settings, CheckCheck, Trash2, Filter } from "lucide-react";

const allAlerts = [
  { id: 1, type: "outbid", title: "🔴 Outbid Alert", body: "You were outbid on 'Polaroid SX-70' by @techy_tom. New top bid: $450.", time: "2 min ago", read: false, color: "var(--hotpink)", action: "Raise Bid" },
  { id: 2, type: "winning", title: "🟢 You're Winning!", body: "Your bid of $12,400 is currently the top bid on 'Air Jordan 1 Chicago'. Keep it up.", time: "18 min ago", read: false, color: "var(--acid)", action: "View Lot" },
  { id: 3, type: "watchlist", title: "👀 Watchlist Item Live", body: "A 'Fender Stratocaster 1978' was just listed. Matches your saved search.", time: "1 hr ago", read: false, color: "var(--electric)", action: "View Lot" },
  { id: 4, type: "ending", title: "⏱ Ending Soon", body: "Your bid on 'Rolex Submariner' closes in 3 hours. Consider raising your max.", time: "2 hr ago", read: true, color: "var(--sunset)", action: "Check Bid" },
  { id: 5, type: "shipped", title: "📦 Item Shipped", body: "Your Fender Stratocaster '78 has been dispatched. Tracking: UPS-8812-XX.", time: "Yesterday", read: true, color: "var(--electric)", action: "Track" },
  { id: 6, type: "payment", title: "💳 Payment Received", body: "Payment of $3,210 confirmed for 'Fender Stratocaster '78'. Funds releasing in 48h.", time: "Apr 28", read: true, color: "var(--acid)", action: null },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(allAlerts);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "unread" ? alerts.filter((a) => !a.read) : alerts;

  const markAllRead = () => setAlerts((a) => a.map((x) => ({ ...x, read: true })));
  const dismiss = (id) => setAlerts((a) => a.filter((x) => x.id !== id));

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 md:px-10">
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-5xl font-black tracking-tighter md:text-7xl">
              Alerts <span className="text-stroke">Hub.</span>
            </h1>
            <p className="mt-3 text-lg text-[var(--ink)]/70">
              {unreadCount > 0 ? `${unreadCount} unread notifications.` : "You're all caught up! 🎉"}
            </p>
          </div>
          <button
            onClick={() => alert("Notification settings — connect your backend here!")}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-white shadow-[3px_3px_0_0_var(--ink)] transition-all hover:-translate-y-1 hover:bg-[var(--acid)] active:translate-y-0 active:shadow-none"
          >
            <Settings className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Actions row */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 rounded-2xl border-[3px] border-[var(--ink)] bg-white p-1 shadow-[3px_3px_0_0_var(--ink)]">
          {[["all", "All"], ["unread", `Unread (${unreadCount})`]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-xl px-5 py-2 font-display text-sm font-black uppercase transition-all ${
                filter === key ? "bg-[var(--ink)] text-white" : "hover:bg-[var(--background)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-white px-5 py-2.5 font-display text-sm font-black uppercase shadow-[3px_3px_0_0_var(--ink)] transition-all hover:-translate-y-0.5 hover:bg-[var(--acid)]"
          >
            <CheckCheck className="h-4 w-4" /> Mark All Read
          </button>
        )}
      </div>

      {/* Alert list */}
      <div className="space-y-4">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <div className="brutal flex flex-col items-center justify-center gap-4 bg-white py-20 text-center">
              <div className="text-6xl">🔔</div>
              <h3 className="font-display text-2xl font-black">No notifications here</h3>
              <p className="text-[var(--ink)]/70">We'll ping you the moment something happens.</p>
            </div>
          ) : (
            filtered.map((a, i) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`brutal flex items-start gap-5 bg-white p-6 transition-all ${!a.read ? "border-l-8" : ""}`}
                style={{ borderLeftColor: !a.read ? a.color : undefined }}
              >
                <div
                  className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] text-xl shadow-[2px_2px_0_0_var(--ink)]"
                  style={{ background: a.color }}
                >
                  <BellRing className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-black">{a.title}</h3>
                    <span className="shrink-0 text-xs font-bold text-[var(--ink)]/50">{a.time}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-[var(--ink)]/80">{a.body}</p>
                  <div className="mt-4 flex items-center gap-3">
                    {a.action && (
                      <button
                        onClick={() => {
                          setAlerts((prev) => prev.map((x) => x.id === a.id ? { ...x, read: true } : x));
                          if (a.type === "outbid") window.location.href = "/dashboard/auctions";
                          else if (a.type === "watchlist") window.location.href = "/dashboard/discover";
                        }}
                        className="rounded-xl border-[3px] border-[var(--ink)] px-5 py-2 font-display text-sm font-black uppercase shadow-[3px_3px_0_0_var(--ink)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
                        style={{ background: a.color }}
                      >
                        {a.action}
                      </button>
                    )}
                    {!a.read && (
                      <button
                        onClick={() => setAlerts((prev) => prev.map((x) => x.id === a.id ? { ...x, read: true } : x))}
                        className="rounded-xl border-[2px] border-[var(--ink)] bg-white px-4 py-2 font-display text-xs font-black uppercase hover:bg-[var(--background)] transition-all"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => dismiss(a.id)}
                      className="ml-auto rounded-xl border-[2px] border-[var(--ink)] bg-white p-2 text-[var(--ink)]/60 hover:bg-[var(--hotpink)] hover:text-white transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Notification settings CTA */}
      <div className="brutal-lg mt-12 flex flex-col items-start justify-between gap-6 bg-[var(--electric)] p-8 text-white md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-2xl font-black">Customize Your Alerts</h2>
          <p className="mt-2 text-white/80">Choose exactly when and how IntelliBid notifies you.</p>
        </div>
        <button
          onClick={() => alert("Notification settings — connect your backend here!")}
          className="shrink-0 rounded-xl border-[3px] border-white bg-white px-8 py-4 font-display font-black uppercase text-[var(--electric)] shadow-[4px_4px_0_0_white/40] transition-all hover:-translate-y-1"
        >
          Open Settings
        </button>
      </div>
    </main>
  );
}
