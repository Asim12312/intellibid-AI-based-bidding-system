"use client";

import { useAuthStore } from "@/store/authStore";
import BuyerSidebar from "@/components/shared/(sidebar)/BuyerSidebar";
import SellerSidebar from "@/components/shared/(sidebar)/SellerSidebar";
import AdminSidebar from "@/components/shared/(sidebar)/AdminSidebar";
import { LiquidCursor } from "@/components/shared/LiquidCursor";

export default function ChatLayout({ children }) {
    const { user } = useAuthStore();
    const isSeller = user?.role === 'seller';
    const isAdmin = user?.role === 'admin';

    return (
        <div className="relative flex min-h-screen bg-[var(--background)] text-[var(--ink)]">
            <LiquidCursor />
            {isAdmin ? <AdminSidebar /> : isSeller ? <SellerSidebar /> : <BuyerSidebar />}

            <div className="flex-1 md:ml-20 min-w-0">
                {children}
            </div>
        </div>
    );
}
