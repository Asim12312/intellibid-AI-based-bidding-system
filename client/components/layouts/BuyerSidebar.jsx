"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const landingItems = [
  { emoji: "✨", label: "Get Started", color: "var(--hotpink)", textColor: "#fff", href: "/signup" },
  { emoji: "🔍", label: "Discover", color: "var(--acid)", textColor: "var(--ink)", href: "/login" },
  { emoji: "🔨", label: "Auctions", color: "var(--sunset)", textColor: "#fff", href: "/login" },
  { emoji: "🤖", label: "AI Picks", color: "var(--electric)", textColor: "#fff", href: "/login" },
  { emoji: "🔔", label: "Alerts", color: "var(--acid)", textColor: "var(--ink)", href: "/login" },
  { emoji: "💬", label: "Chatbot", color: "var(--hotpink)", textColor: "#fff", href: "/login" },
  { emoji: "👤", label: "Profile", color: "var(--ink)", textColor: "#fff", href: "/login" },
];

const dashItems = [
  { emoji: "🏠", label: "Dashboard", color: "var(--electric)", textColor: "#fff", href: "/dashboard" },
  { emoji: "🔍", label: "Discover", color: "var(--acid)", textColor: "var(--ink)", href: "/discover" },
  { emoji: "🔨", label: "Auctions", color: "var(--sunset)", textColor: "#fff", href: "/auctions" },
  { emoji: "🤖", label: "AI Picks", color: "var(--hotpink)", textColor: "#fff", href: "/ai-picks" },
  { emoji: "🔔", label: "Alerts", color: "var(--electric)", textColor: "#fff", href: "/alerts" },
  { emoji: "💬", label: "Chatbot", color: "var(--ink)", textColor: "#fff", href: "/chatbot" },
  { emoji: "👤", label: "Profile", color: "var(--acid)", textColor: "var(--ink)", href: "/profile" },
];

export function BuyerSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const items = isLanding ? landingItems : dashItems;

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={`fixed left-0 top-0 z-50 hidden h-full flex-col items-start md:flex transition-[width] duration-300 ease-out ${
          open ? "w-64" : "w-20"
        }`}
        style={{ background: "color-mix(in oklab, white 72%, transparent)", backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)", borderRight: "3px solid var(--ink)" }}
      >
        {/* Logo area */}
        <div className="flex h-20 w-full items-center gap-3 border-b-[3px] border-[var(--ink)] px-4">
          <Link href={isLanding ? "/" : "/dashboard"} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--acid)] font-display text-xl font-black shadow-[3px_3px_0_0_var(--ink)] transition-all hover:-rotate-6 hover:shadow-[5px_5px_0_0_var(--ink)]">
            IB
          </Link>
          <AnimatePresence>
            {open && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="whitespace-nowrap font-display text-lg font-black tracking-tight"
              >
                IntelliBid
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav items */}
        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto p-3 w-full">
          {items.map((it, i) => {
            const isActive = pathname === it.href;
            return (
              <Link key={it.label} href={it.href}>
                <motion.div
                  whileHover={{ x: 4, scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className={`group flex items-center gap-3 rounded-2xl px-2 py-2 transition-all ${
                    isActive ? "shadow-[4px_4px_0_0_var(--ink)]" : "hover:shadow-[3px_3px_0_0_var(--ink)]"
                  }`}
                  style={{ background: isActive ? it.color : "transparent", border: isActive ? "3px solid var(--ink)" : "3px solid transparent" }}
                >
                  {/* Icon bubble */}
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-[3px] border-[var(--ink)] text-2xl shadow-[2px_2px_0_0_var(--ink)] transition-all group-hover:shadow-[4px_4px_0_0_var(--ink)] group-hover:-translate-y-0.5"
                    style={{ background: it.color }}
                  >
                    {it.emoji}
                  </span>
                  <AnimatePresence>
                    {open && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        className="whitespace-nowrap font-display text-sm font-black uppercase tracking-wide"
                        style={{ color: isActive ? it.textColor : "var(--ink)" }}
                      >
                        {it.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom hint */}
        <div className="w-full border-t-[3px] border-[var(--ink)] p-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-[3px] border-[var(--ink)] text-2xl shadow-[2px_2px_0_0_var(--ink)]"
            style={{ background: "var(--hotpink)" }}
          >
            ⚡
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom dock ── */}
      <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 md:hidden">
        <div
          className="flex items-center gap-2 rounded-full p-2 shadow-[var(--shadow-brutal)]"
          style={{ background: "color-mix(in oklab, white 80%, transparent)", backdropFilter: "blur(20px)", border: "3px solid var(--ink)" }}
        >
          {items.slice(0, 5).map((it) => (
            <Link key={it.label} href={it.href}>
              <motion.span
                whileTap={{ scale: 0.85, rotate: -10 }}
                whileHover={{ y: -4 }}
                className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-[var(--ink)] text-xl shadow-[2px_2px_0_0_var(--ink)] transition-all"
                style={{ background: it.color }}
                title={it.label}
              >
                {it.emoji}
              </motion.span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
