"use client";

import HybridSidebar from "@/components/shared/(sidebar)/HybridSidebar"
import { LiquidCursor } from "@/components/shared/LiquidCursor";

export default function HybridLayout({ children }) {
    return (
        <div className="relative flex min-h-screen bg-[var(--background)] text-[var(--ink)]">
            <LiquidCursor />
            <HybridSidebar />

            <div className="flex-1 md:ml-20 min-w-0">
                {children}
            </div>
        </div>
    );
}
