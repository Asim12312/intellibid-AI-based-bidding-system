"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import ProfileHeader from "@/components/profile/ProfileHeader";
import EditProfileForm from "@/components/profile/EditProfileForm";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import DangerZone from "@/components/profile/DangerZone";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
    const user = useAuthStore((s) => s.user);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await api("/api/profile/me");
                setProfileData(data);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading || !profileData) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-[var(--ink)]" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 pb-20">
            {/* Header with Stats */}
            <ProfileHeader user={profileData.user} stats={profileData.stats} />

            {/* Forms Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
                <div className="lg:col-span-2">
                    <EditProfileForm user={profileData.user} />
                </div>
                <div className="lg:col-span-1">
                    <ChangePasswordForm />
                </div>
            </div>

            {/* Account Settings */}
            <DangerZone />
        </div>
    );
}
