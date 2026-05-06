"use client";

import { BuyerSidebar } from "@/components/layouts/BuyerSidebar";
import { LiquidCursor } from "@/components/shared/LiquidCursor";

/**
 * Buyer layout — wraps all buyer-facing pages with sidebar navigation.
 */
export default function BuyerLayout({ children }) {
  return (
    <div className="relative flex min-h-screen bg-[var(--background)] text-[var(--ink)]">
      <LiquidCursor />
      {/* sidebar is fixed-position, so it doesn't participate in flex flow */}
      <BuyerSidebar />
      {/* offset content by sidebar width on md+ */}
      <div className="flex-1 md:ml-20 min-w-0">
        {children}
      </div>
    </div>
  );
}
