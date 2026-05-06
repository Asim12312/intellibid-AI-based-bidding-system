"use client";

import { AdminSidebar } from "@/components/layouts/AdminSidebar";
import { LiquidCursor } from "@/components/shared/LiquidCursor";

export default function AdminLayout({ children }) {
  return (
    <div className="relative flex min-h-screen bg-[var(--background)] text-[var(--ink)]">
      <LiquidCursor />
      <AdminSidebar />
      <div className="flex-1 md:ml-20 min-w-0">
        {children}
      </div>
    </div>
  );
}
