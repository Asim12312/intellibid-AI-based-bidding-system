"use client";

import SellerSidebar from "@/components/shared/(sidebar)/SellerSidebar";
import { LiquidCursor } from "@/components/shared/LiquidCursor";

export default function SellerLayout({ children }) {
  return (
    <div className="relative flex min-h-screen bg-[var(--background)] text-[var(--ink)]">
      <LiquidCursor />
      <SellerSidebar />
      <div className="flex-1 md:ml-20 min-w-0">
        {children}
      </div>
    </div>
  );
}
