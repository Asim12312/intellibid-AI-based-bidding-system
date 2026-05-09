"use client";

import BuyerSidebar from "@/components/shared/(sidebar)/BuyerSidebar";
import { LiquidCursor } from "@/components/shared/LiquidCursor";

export default function BuyerLayout({ children }) {
  return (
    <div className="relative flex min-h-screen bg-[var(--background)] text-[var(--ink)]">
      <LiquidCursor />
      <BuyerSidebar />

      <div className="flex-1 md:ml-20 min-w-0">
        {children}
      </div>
    </div>
  );
}
