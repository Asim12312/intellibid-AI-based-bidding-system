"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Mail, Lock, User } from "lucide-react";
import { LiquidCursor } from "@/components/shared/LiquidCursor";

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--background)] p-6 text-[var(--ink)] overflow-hidden grain">
      <LiquidCursor />
      
      {/* Decorative Background Elements */}
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-[5%] bottom-[10%] h-32 w-32 rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--sunset)] shadow-[var(--shadow-brutal)] md:h-48 md:w-48"
      />
      <motion.div
        animate={{ y: [0, -30, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute right-[5%] top-[10%] h-40 w-40 animate-blob border-[3px] border-[var(--ink)] bg-[var(--acid)] shadow-[var(--shadow-brutal-lg)] md:h-56 md:w-56"
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-lg my-12"
      >
        <div className="absolute -top-10 left-0 md:-top-16">
          <Link href="/" className="inline-flex items-center gap-2 font-display text-sm font-bold uppercase hover:text-[var(--acid)] transition-colors">
            <ArrowRight className="h-4 w-4 rotate-180" strokeWidth={3} /> Back to Home
          </Link>
        </div>

        <div className="mb-6 flex justify-center">
          <Link href="/" className="flex h-16 w-16 items-center justify-center rounded-2xl border-[4px] border-[var(--ink)] bg-[var(--electric)] font-display text-2xl font-black text-white shadow-[var(--shadow-brutal)] transition-transform hover:-translate-y-1 hover:rotate-6">
            IB
          </Link>
        </div>

        <div className="brutal-lg overflow-hidden bg-white p-8 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="font-display text-4xl font-black tracking-tighter">Join the hustle.</h1>
            <p className="mt-2 text-[var(--ink)]/70">Create an account and start winning.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); window.location.href = '/dashboard'; }} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="font-display text-sm font-bold uppercase tracking-wide">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <User className="h-5 w-5 text-[var(--ink)]/50" strokeWidth={2.5} />
                  </div>
                  <input
                    type="text"
                    placeholder="Jane"
                    className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--background)] px-12 py-3 font-medium transition-colors focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--electric)]/30"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-display text-sm font-bold uppercase tracking-wide">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <User className="h-5 w-5 text-[var(--ink)]/50" strokeWidth={2.5} />
                  </div>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--background)] px-12 py-3 font-medium transition-colors focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--electric)]/30"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-display text-sm font-bold uppercase tracking-wide">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Mail className="h-5 w-5 text-[var(--ink)]/50" strokeWidth={2.5} />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--background)] px-12 py-3 font-medium transition-colors focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--electric)]/30"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="font-display text-sm font-bold uppercase tracking-wide">Account Type</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "buyer", label: "Buyer", color: "var(--electric)" },
                  { id: "seller", label: "Seller", color: "var(--acid)" },
                  { id: "hybrid", label: "Hybrid", color: "var(--hotpink)" }
                ].map((type) => (
                  <label key={type.id} className="relative cursor-pointer">
                    <input type="radio" name="accountType" value={type.id} className="peer sr-only" defaultChecked={type.id === "buyer"} />
                    <div className="flex items-center justify-center rounded-xl border-[3px] border-[var(--ink)] bg-white px-2 py-3 font-display text-xs font-bold uppercase transition-all peer-checked:bg-[var(--bg-color)] peer-checked:shadow-[var(--shadow-brutal)] peer-checked:-translate-y-1 hover:-translate-y-0.5" style={{ '--bg-color': type.color }}>
                      {type.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-display text-sm font-bold uppercase tracking-wide">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Lock className="h-5 w-5 text-[var(--ink)]/50" strokeWidth={2.5} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--background)] px-12 py-3 font-medium transition-colors focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--electric)]/30"
                  required
                />
              </div>
              <p className="text-xs text-[var(--ink)]/60 font-medium">Must be at least 8 characters long.</p>
            </div>

            <button type="submit" className="group relative mt-8 flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--electric)] px-6 py-4 font-display text-lg font-black uppercase shadow-[var(--shadow-brutal)] transition-transform hover:-translate-y-1 active:translate-y-0 active:shadow-none">
              Create Account <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={3} />
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[var(--hotpink)] hover:underline decoration-2 underline-offset-4">
              Sign in here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
