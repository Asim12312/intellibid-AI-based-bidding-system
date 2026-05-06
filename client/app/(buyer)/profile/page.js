"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CreditCard, Settings, LogOut, Star, Edit3, Camera, Check, X } from "lucide-react";

const recentActivity = [
  { name: "Air Jordan 1 'Chicago'", type: "Bid Placed", amount: "$12,400", date: "Today" },
  { name: "Fender Stratocaster '78", type: "Purchase", amount: "$3,210", date: "Apr 28" },
  { name: "Sony Walkman TPS-L2", type: "Sold", amount: "$980", date: "Apr 15" },
  { name: "Leica M3 Double Stroke", type: "Purchase", amount: "$4,800", date: "Apr 1" },
];

const badges = [
  { emoji: "🏆", label: "Power Bidder", unlocked: true },
  { emoji: "⭐", label: "5-Star Seller", unlocked: true },
  { emoji: "🔥", label: "Hot Streak x5", unlocked: true },
  { emoji: "🤖", label: "AI Master", unlocked: false },
  { emoji: "💎", label: "Diamond Tier", unlocked: false },
];

export default function ProfilePage() {
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("activity");
  const [bio, setBio] = useState("Collector of all things retro tech and 80s pop culture. Currently hunting for a mint condition Sony Walkman TPS-L2. I value fast shipping and honest descriptions.");

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">
      {/* Profile Hero */}
      <div className="brutal-lg mb-10 overflow-hidden bg-[var(--ink)] text-white">
        {/* Cover image */}
        <div className="relative h-40 w-full overflow-hidden border-b-[4px] border-[var(--acid)]" style={{ background: "linear-gradient(135deg, var(--electric), var(--hotpink))" }}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('/lot-sneaker.jpg')", backgroundSize: "cover", backgroundPosition: "center" }} />
        </div>

        <div className="flex flex-col items-start gap-6 p-8 md:flex-row md:items-end">
          <div className="relative -mt-20">
            <div className="h-28 w-28 overflow-hidden rounded-full border-[4px] border-[var(--acid)] shadow-[6px_6px_0_0_var(--acid)]">
              <img src="/avatar-2.jpg" alt="Maya R." className="h-full w-full object-cover" />
            </div>
            <button className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-[2px] border-[var(--acid)] bg-[var(--acid)] text-[var(--ink)]">
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-4xl font-black md:text-5xl">Maya R.</h1>
              <span className="rounded-full border-[2px] border-[var(--hotpink)] bg-[var(--hotpink)] px-3 py-1 font-display text-xs font-black uppercase">Hybrid</span>
              <span className="rounded-full border-[2px] border-[var(--acid)] bg-[var(--acid)] px-3 py-1 font-display text-xs font-black uppercase text-[var(--ink)]">⭐ Verified</span>
            </div>
            <p className="mt-2 text-base text-white/70">@mayacollects · Joined April 2026 · 📍 NYC</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setEditMode(!editMode)}
              className="flex items-center gap-2 rounded-xl border-[2px] border-[var(--acid)] bg-transparent px-5 py-3 font-display text-sm font-black uppercase text-[var(--acid)] transition-all hover:bg-[var(--acid)] hover:text-[var(--ink)]"
            >
              <Edit3 className="h-4 w-4" /> {editMode ? "Cancel" : "Edit"}
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="flex items-center gap-2 rounded-xl border-[2px] border-white/30 bg-white/10 px-5 py-3 font-display text-sm font-black uppercase text-white transition-all hover:bg-white/20"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Left: Stats + Badges */}
        <div className="space-y-8">
          {/* Trust score */}
          <div className="brutal-lg bg-[var(--acid)] p-7">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-black uppercase">Trust Score</h3>
              <Shield className="h-6 w-6" />
            </div>
            <div className="font-display text-6xl font-black">4.9</div>
            <div className="mt-1 text-sm font-bold text-[var(--ink)]/70">Based on 124 transactions</div>
            <div className="mt-4 flex gap-1">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`h-5 w-5 ${s <= 5 ? "fill-[var(--ink)] text-[var(--ink)]" : "text-[var(--ink)]/30"}`} />
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Items Bought", val: "84" },
              { label: "Items Sold", val: "42" },
              { label: "Watchlist", val: "12" },
              { label: "Win Rate", val: "74%" },
            ].map((s) => (
              <div key={s.label} className="brutal bg-white p-4">
                <div className="font-display text-2xl font-black">{s.val}</div>
                <div className="text-xs font-bold uppercase text-[var(--ink)]/60">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div className="brutal-lg bg-white p-7">
            <h3 className="mb-5 font-display text-xl font-black uppercase">Badges</h3>
            <div className="space-y-3">
              {badges.map((b) => (
                <div key={b.label} className={`flex items-center gap-3 rounded-xl border-[2px] border-[var(--ink)] p-3 ${b.unlocked ? "bg-[var(--background)]" : "bg-white opacity-40"}`}>
                  <span className="text-2xl">{b.emoji}</span>
                  <span className="font-display text-sm font-black">{b.label}</span>
                  {b.unlocked ? <Check className="ml-auto h-4 w-4 text-green-600" /> : <X className="ml-auto h-4 w-4 text-[var(--ink)]/30" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: About + Activity */}
        <div className="space-y-8 lg:col-span-2">
          {/* About / edit */}
          <div className="brutal-lg bg-white p-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-2xl font-black uppercase">About Me</h3>
              {editMode && (
                <button
                  onClick={() => setEditMode(false)}
                  className="rounded-xl border-[2px] border-[var(--ink)] bg-[var(--acid)] px-4 py-1.5 font-display text-xs font-black uppercase shadow-[2px_2px_0_0_var(--ink)] hover:-translate-y-0.5 transition-all"
                >
                  Save
                </button>
              )}
            </div>
            {editMode ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={5}
                className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--background)] p-4 font-medium focus:outline-none focus:ring-4 focus:ring-[var(--electric)]/30"
              />
            ) : (
              <p className="text-lg leading-relaxed text-[var(--ink)]/80">{bio}</p>
            )}

            {editMode && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[["Display Name", "Maya R."], ["Location", "NYC, USA"], ["Interests", "Retro Tech, Sneakers"], ["Language", "English"]].map(([label, val]) => (
                  <div key={label} className="space-y-1">
                    <label className="font-display text-xs font-black uppercase text-[var(--ink)]/60">{label}</label>
                    <input defaultValue={val} className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--background)] px-4 py-2 font-medium focus:bg-white focus:outline-none" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div>
            <div className="mb-5 flex gap-2 rounded-2xl border-[3px] border-[var(--ink)] bg-white p-1.5 shadow-[3px_3px_0_0_var(--ink)] w-fit">
              {[["activity", "📊 Activity"], ["payments", "💳 Payments"], ["security", "🔒 Security"]].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`rounded-xl px-5 py-2 font-display text-xs font-black uppercase transition-all ${
                    activeTab === key ? "bg-[var(--ink)] text-white shadow-[2px_2px_0_0_var(--electric)]" : "hover:bg-[var(--background)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "activity" && (
                <motion.div key="activity" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  {recentActivity.map((a, i) => (
                    <div key={i} className="brutal flex items-center justify-between bg-white p-5">
                      <div>
                        <div className="font-display text-base font-black">{a.name}</div>
                        <div className="mt-1 text-xs font-bold text-[var(--ink)]/60">{a.type} · {a.date}</div>
                      </div>
                      <div className="font-display text-xl font-black">{a.amount}</div>
                    </div>
                  ))}
                </motion.div>
              )}
              {activeTab === "payments" && (
                <motion.div key="payments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="brutal bg-[var(--electric)] p-8 text-white">
                    <CreditCard className="h-10 w-10 mb-4" />
                    <div className="font-display text-xl font-black">**** **** **** 4291</div>
                    <div className="mt-1 text-sm opacity-70">Visa · Expires 12/27</div>
                  </div>
                  <div className="brutal flex items-center justify-between bg-white p-6">
                    <span className="font-display text-lg font-black">Wallet Balance</span>
                    <span className="font-display text-2xl font-black text-[var(--electric)]">$4,250.00</span>
                  </div>
                  <button
                    onClick={() => alert("Add payment method — connect your Stripe integration!")}
                    className="w-full rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--acid)] py-4 font-display font-black uppercase shadow-[4px_4px_0_0_var(--ink)] transition-all hover:-translate-y-1 active:translate-y-0 active:shadow-none"
                  >
                    + Add Payment Method
                  </button>
                </motion.div>
              )}
              {activeTab === "security" && (
                <motion.div key="security" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  {[
                    { label: "Change Password", detail: "Last changed 30 days ago", btn: "Update" },
                    { label: "Two-Factor Auth", detail: "Currently enabled via Authenticator App", btn: "Manage" },
                    { label: "Active Sessions", detail: "2 devices logged in", btn: "Review" },
                    { label: "Delete Account", detail: "Permanently remove all your data", btn: "Delete", danger: true },
                  ].map((s) => (
                    <div key={s.label} className="brutal flex items-center justify-between bg-white p-5">
                      <div>
                        <div className={`font-display text-base font-black ${s.danger ? "text-[var(--hotpink)]" : ""}`}>{s.label}</div>
                        <div className="mt-1 text-xs font-bold text-[var(--ink)]/60">{s.detail}</div>
                      </div>
                      <button
                        className={`rounded-xl border-[3px] border-[var(--ink)] px-5 py-2 font-display text-sm font-black uppercase shadow-[3px_3px_0_0_var(--ink)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none ${
                          s.danger ? "bg-[var(--hotpink)] text-white" : "bg-white hover:bg-[var(--acid)]"
                        }`}
                      >
                        {s.btn}
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
