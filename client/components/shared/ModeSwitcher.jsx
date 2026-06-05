"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, ArrowLeftRight, Rocket, X, Check, Store, ShoppingBag } from "lucide-react";

// ── Become a Seller Modal ──────────────────────────────────────────────────────
function BecomeSeller({ onClose }) {
    const { user, setUser } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState(null);

    const perks = [
        "List unlimited auction items",
        "AI-powered title & description writer",
        "Real-time bid notifications",
        "Smart pricing recommendations",
        "Stripe payouts within 24h",
        "Verified Seller badge",
    ];

    const handleUpgrade = async () => {
        setLoading(true);
        setError(null);
        try {
            const { api } = await import("@/lib/api");
            const res = await api("/api/auth/upgrade-to-seller", { method: "POST" });
            if (res.success) {
                setUser(res.user);
                setDone(true);
                setTimeout(() => {
                    onClose();
                    router.push("/seller/dashboard");
                }, 1800);
            } else {
                setError(res.message || "Upgrade failed");
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[var(--ink)]/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.95 }}
                className="relative w-full max-w-md border-[4px] border-[var(--ink)] bg-white shadow-[8px_8px_0_0_var(--ink)] rounded-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="bg-[var(--ink)] p-6 text-white">
                    <button onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border-[2px] border-white/30 text-white hover:bg-white/20 transition-colors">
                        <X className="h-4 w-4" strokeWidth={3} />
                    </button>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-[var(--acid)] bg-[var(--acid)] mb-4">
                        <Store className="h-7 w-7 text-[var(--ink)]" strokeWidth={2.5} />
                    </div>
                    <h2 className="font-display text-2xl font-black uppercase">Become a Seller</h2>
                    <p className="mt-1 text-sm text-white/70">Unlock the full power of IntelliBid's AI auction engine.</p>
                </div>

                {/* Perks */}
                <div className="p-6">
                    {done ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-6 text-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[var(--ink)] bg-[var(--acid)] shadow-[4px_4px_0_0_var(--ink)]">
                                <Check className="h-8 w-8" strokeWidth={3} />
                            </div>
                            <h3 className="font-display text-xl font-black uppercase">You're a Seller!</h3>
                            <p className="text-sm font-medium text-[var(--ink)]/60">Redirecting to your seller dashboard…</p>
                        </motion.div>
                    ) : (
                        <>
                            <ul className="space-y-2.5 mb-6">
                                {perks.map(p => (
                                    <li key={p} className="flex items-center gap-2.5 text-sm font-medium">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[2px] border-[var(--ink)] bg-[var(--acid)]">
                                            <Check className="h-3 w-3" strokeWidth={3} />
                                        </span>
                                        {p}
                                    </li>
                                ))}
                            </ul>

                            {error && (
                                <p className="mb-4 rounded-lg border-[2px] border-[var(--hotpink)] bg-[var(--hotpink)]/10 px-3 py-2 text-sm font-bold text-[var(--hotpink)]">{error}</p>
                            )}

                            <button
                                onClick={handleUpgrade}
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--hotpink)] py-3.5 font-display text-sm font-black uppercase text-white shadow-[4px_4px_0_0_var(--ink)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--ink)] disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" strokeWidth={3} />}
                                {loading ? "Upgrading…" : "Start Selling — It's Free"}
                            </button>
                            <p className="mt-3 text-center text-xs font-medium text-[var(--ink)]/40">5% commission per sale. No monthly fee.</p>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

// ── Mode Switch Component (exported, used in all sidebars) ────────────────────
export default function ModeSwitcher({ sidebarOpen }) {
    const { user } = useAuthStore();
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

    if (!user) return null;

    const isSeller = user.role === "seller";
    const isBuyer = user.role === "buyer";

    if (isSeller) {
        // Show dual-mode toggle: seller can view buyer side
        const isOnBuyerSide = typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard") || window.location.pathname.startsWith("/discover") || window.location.pathname.startsWith("/bids");
        return (
            <div className="w-full p-2 border-b-[3px] border-[var(--ink)]">
                <button
                    onClick={() => router.push(isOnBuyerSide ? "/seller/dashboard" : "/dashboard")}
                    className={`group flex w-full items-center gap-3 rounded-2xl px-2 py-2 border-[3px] border-[var(--ink)] transition-all shadow-[2px_2px_0_0_var(--ink)] hover:shadow-[4px_4px_0_0_var(--ink)] hover:-translate-y-0.5 active:scale-95
                        ${isOnBuyerSide ? 'bg-[var(--electric)]' : 'bg-[var(--acid)]'}`}
                >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[3px] border-[var(--ink)] bg-white text-xl shadow-[2px_2px_0_0_var(--ink)]">
                        {isOnBuyerSide ? <Store className="h-5 w-5" strokeWidth={2.5} /> : <ShoppingBag className="h-5 w-5" strokeWidth={2.5} />}
                    </span>
                    <AnimatePresence>
                        {sidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                                className="min-w-0"
                            >
                                <div className="font-display text-[10px] font-black uppercase tracking-widest text-[var(--ink)]/60">Switch to</div>
                                <div className="font-display text-sm font-black uppercase tracking-wide text-[var(--ink)]">
                                    {isOnBuyerSide ? "Seller Mode" : "Buyer Mode"}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        );
    }

    if (isBuyer) {
        return (
            <>
                <div className="w-full p-2 border-b-[3px] border-[var(--ink)]">
                    <button
                        onClick={() => setShowModal(true)}
                        className="group flex w-full items-center gap-3 rounded-2xl px-2 py-2 border-[3px] border-dashed border-[var(--ink)]/50 bg-[var(--acid)]/30 transition-all hover:border-[var(--ink)] hover:bg-[var(--acid)] hover:shadow-[3px_3px_0_0_var(--ink)] active:scale-95"
                    >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[3px] border-[var(--ink)] bg-[var(--acid)] text-xl shadow-[2px_2px_0_0_var(--ink)]">
                            🚀
                        </span>
                        <AnimatePresence>
                            {sidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                                    className="min-w-0 text-left"
                                >
                                    <div className="font-display text-[10px] font-black uppercase tracking-widest text-[var(--ink)]/60">Ready to earn?</div>
                                    <div className="font-display text-sm font-black uppercase tracking-wide text-[var(--ink)]">Start Selling</div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
                <AnimatePresence>
                    {showModal && <BecomeSeller onClose={() => setShowModal(false)} />}
                </AnimatePresence>
            </>
        );
    }

    return null;
}
