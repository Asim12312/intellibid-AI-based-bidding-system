"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { LiquidCursor } from "@/components/shared/LiquidCursor";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--background)] p-6 text-[var(--ink)] overflow-hidden grain">
      <LiquidCursor />
      
      {/* Decorative Background Elements */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-[10%] top-[20%] h-40 w-40 rounded-full border-[3px] border-[var(--ink)] bg-[var(--acid)] shadow-[var(--shadow-brutal)] md:h-64 md:w-64"
      />
      <motion.div
        animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute right-[10%] bottom-[15%] h-32 w-32 animate-blob border-[3px] border-[var(--ink)] bg-[var(--electric)] shadow-[var(--shadow-brutal-lg)] md:h-48 md:w-48"
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="absolute -top-16 left-0">
          <Link href="/" className="inline-flex items-center gap-2 font-display text-sm font-bold uppercase hover:text-[var(--acid)] transition-colors">
            <ArrowRight className="h-4 w-4 rotate-180" strokeWidth={3} /> Back to Home
          </Link>
        </div>

        <div className="mb-6 flex justify-center">
          <Link href="/" className="flex h-16 w-16 items-center justify-center rounded-2xl border-[4px] border-[var(--ink)] bg-[var(--acid)] font-display text-2xl font-black shadow-[var(--shadow-brutal)] transition-transform hover:-translate-y-1 hover:-rotate-6">
            IB
          </Link>
        </div>

        <div className="brutal-lg overflow-hidden bg-white p-8 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="font-display text-4xl font-black tracking-tighter">Welcome back.</h1>
            <p className="mt-2 text-[var(--ink)]/70">Bid smarter. Win louder.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); window.location.href = '/dashboard'; }} className="space-y-6">
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-display text-sm font-bold uppercase tracking-wide">Password</label>
                <a href="#" className="text-xs font-bold text-[var(--ink)]/60 hover:text-[var(--electric)] hover:underline">Forgot?</a>
              </div>
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
            </div>

            <button type="submit" className="group relative mt-8 flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--hotpink)] px-6 py-4 font-display text-lg font-black uppercase text-white shadow-[var(--shadow-brutal)] transition-transform hover:-translate-y-1 active:translate-y-0 active:shadow-none">
              Sign In <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={3} />
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium">
            New to IntelliBid?{" "}
            <Link href="/register" className="font-bold text-[var(--electric)] hover:underline decoration-2 underline-offset-4">
              Create an account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
