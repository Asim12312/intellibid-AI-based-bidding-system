"use client";

import { AdminAuthProvider } from "@/components/admin/context/AuthContext";
import AdminShell from "@/components/admin/AdminShell";
import { LiquidCursor } from "@/components/shared/LiquidCursor";

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <div className="relative min-h-screen bg-[var(--background)] text-[var(--ink)]">
        <LiquidCursor />
        <AdminShell>{children}</AdminShell>
      </div>
    </AdminAuthProvider>
  );
}
