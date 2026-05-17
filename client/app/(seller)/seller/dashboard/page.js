"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import SellerStats from "@/components/seller/SellerStats";
import ActiveListingsTable from "@/components/seller/ActiveListingsTable";
import RecentBidsFeed from "@/components/seller/RecentBidsFeed";
import SellerInsights from "@/components/seller/SellerInsights";
import { useAuthStore } from "@/store/authStore";
import { Activity } from "lucide-react";

export default function SellerDashboard() {
  const user = useAuthStore((state) => state.user);
  
  const [stats, setStats] = useState(null);
  const [activeListings, setActiveListings] = useState([]);
  const [activity, setActivity] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, listingsRes, actRes, insightsRes] = await Promise.all([
          api('/api/seller/dashboard/stats'),
          api('/api/seller/listings/active'),
          api('/api/seller/activity/recent'),
          api('/api/seller/insights/ai')
        ]);

        if (statsRes?.success) setStats(statsRes.data);
        if (listingsRes?.success) setActiveListings(listingsRes.data);
        if (actRes?.success) setActivity(actRes.data);
        if (insightsRes?.success) setInsights(insightsRes.data);
      } catch (error) {
        console.error("Failed to load seller dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--acid)] text-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)] animate-pulse">
          <Activity className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tighter mb-2">
            Seller Hub
          </h1>
          <p className="font-medium opacity-70">
            Welcome back, {(user?.lastName && user.lastName.length <= 12) ? user.lastName : 'Seller'}. Here's your business at a glance.
          </p>
        </div>
      </motion.div>

      {/* KPI Stats */}
      <SellerStats stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Active Listings & Insights */}
        <div className="lg:col-span-2 space-y-8">
          <ActiveListingsTable listings={activeListings} />
          <SellerInsights insights={insights} />
        </div>

        {/* Right Column: Live Feed */}
        <div className="lg:col-span-1">
          <RecentBidsFeed activity={activity} />
        </div>

      </div>
    </div>
  );
}
