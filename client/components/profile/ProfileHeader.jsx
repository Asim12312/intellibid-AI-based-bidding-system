import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, ShieldCheck, ShoppingBag, Gavel, DollarSign, Tag, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function ProfileHeader({ user, stats }) {
    const setUser = useAuthStore((s) => s.setUser);
    const [uploading, setUploading] = useState(false);

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("avatar", file);

        try {
            const data = await api("/api/profile/avatar", {
                method: "POST",
                body: formData,
            });
            setUser(data.user);
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="relative mb-12">
            {/* Banner Decor */}
            <div className="h-32 w-full bg-[var(--ink)] rounded-2xl border-[3px] border-[var(--ink)] shadow-[4px_4px_0_0_var(--acid)] mb-16 overflow-hidden">
                <div className="w-full h-full opacity-20 flex flex-wrap gap-4 p-4">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div key={i} className="h-8 w-8 border-[1px] border-white/50 rounded-lg shrink-0" />
                    ))}
                </div>
            </div>

            {/* Profile Info Overlay */}
            <div className="absolute top-16 left-6 md:left-12 flex flex-col md:flex-row items-end gap-6 w-full pr-12">
                {/* Avatar */}
                <div className="relative group">
                    <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-[4px] border-[var(--ink)] bg-white shadow-[6px_6px_0_0_var(--ink)] overflow-hidden relative">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-display text-4xl font-black bg-[var(--background)]">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                            </div>
                        )}
                        {uploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-black text-xs uppercase animate-pulse">
                                Uploading...
                            </div>
                        )}
                    </div>
                    <label className="absolute bottom-2 right-2 p-2 bg-[var(--acid)] border-[2px] border-[var(--ink)] rounded-full cursor-pointer shadow-[2px_2px_0_0_var(--ink)] hover:translate-y-[-2px] transition-all group-hover:scale-110">
                        <Camera size={18} />
                        <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                    </label>
                </div>

                {/* Name & Role */}
                <div className="flex-1 pb-2">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h1 className="font-display text-3xl md:text-5xl font-black uppercase tracking-tighter">
                            {user.firstName} {user.lastName}
                        </h1>
                        <span className={`px-3 py-1 rounded-full border-[2px] border-[var(--ink)] text-[10px] font-black uppercase shadow-[2px_2px_0_0_var(--ink)] ${
                            user.role === 'admin' ? 'bg-[var(--hotpink)] text-white' : 
                            user.role === 'seller' ? 'bg-[var(--acid)] text-[var(--ink)]' : 'bg-[var(--electric)] text-white'
                        }`}>
                            {user.role}
                        </span>
                        {user.isVerified && (
                            <ShieldCheck size={24} className="text-[var(--acid)] fill-[var(--ink)]" />
                        )}
                    </div>
                    <p className="text-sm md:text-base font-medium opacity-70 max-w-xl">
                        {user.bio || "No bio yet. Tell the world who you are!"}
                    </p>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-24 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
                {user.role === 'buyer' ? (
                    <>
                        <StatItem icon={<ShoppingBag />} label="Auctions Won" value={stats.itemsWon || 0} color="var(--electric)" />
                        <StatItem icon={<Gavel />} label="Active Bids" value={stats.totalBids || 0} color="var(--acid)" />
                        <StatItem icon={<DollarSign />} label="Total Spent" value={`$${(stats.totalSpent || 0).toLocaleString()}`} color="var(--hotpink)" />
                        <StatItem icon={<TrendingUp />} label="Activity Score" value="72" color="var(--ink)" textColor="white" />
                    </>
                ) : (
                    <>
                        <StatItem icon={<Tag />} label="Total Listings" value={stats.totalListings || 0} color="var(--acid)" />
                        <StatItem icon={<DollarSign />} label="Total Revenue" value={`$${(stats.totalRevenue || 0).toLocaleString()}`} color="var(--hotpink)" />
                        <StatItem icon={<ShoppingBag />} label="Items Sold" value={stats.itemsSold || 0} color="var(--electric)" />
                        <StatItem icon={<TrendingUp />} label="Avg. Rating" value={`${user.rating || 0}/5`} color="var(--ink)" textColor="white" />
                    </>
                )}
            </div>
        </div>
    );
}

function StatItem({ icon, label, value, color, textColor = "inherit" }) {
    return (
        <div 
            className="border-[3px] border-[var(--ink)] rounded-xl p-4 shadow-[4px_4px_0_0_var(--ink)] flex flex-col gap-1"
            style={{ backgroundColor: color, color: textColor }}
        >
            <div className="opacity-70">{icon}</div>
            <div className="text-2xl font-black font-display uppercase tracking-tight">{value}</div>
            <div className="text-[10px] font-black uppercase opacity-60 tracking-widest">{label}</div>
        </div>
    );
}
