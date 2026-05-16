import { useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DangerZone() {
    const logout = useAuthStore((s) => s.logout);
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await api("/api/profile/delete-account", { method: "DELETE" });
            logout();
            router.push("/");
        } catch (error) {
            alert("Failed to delete account. Please contact support.");
            setLoading(false);
            setShowModal(false);
        }
    };

    return (
        <div className="bg-white border-[3px] border-[var(--hotpink)] rounded-2xl p-6 md:p-8 shadow-[4px_4px_0_0_var(--hotpink)] mt-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <AlertTriangle size={80} />
            </div>
            
            <h2 className="font-display text-xl font-black uppercase tracking-tight mb-2 text-[var(--hotpink)]">Danger Zone</h2>
            <p className="text-sm font-medium opacity-70 mb-6 max-w-lg">
                Once you delete your account, there is no going back. All your active bids and listings will be cancelled. Please be certain.
            </p>
            
            <button 
                onClick={() => setShowModal(true)}
                className="bg-white text-[var(--hotpink)] border-[3px] border-[var(--hotpink)] px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm shadow-[4px_4px_0_0_var(--hotpink)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--hotpink)] transition-all"
            >
                Delete Account
            </button>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white border-[4px] border-[var(--ink)] p-8 rounded-2xl shadow-[12px_12px_0_0_var(--ink)] max-w-md w-full"
                        >
                            <h3 className="font-display text-2xl font-black uppercase tracking-tighter mb-4 flex items-center gap-2">
                                <Trash2 className="text-[var(--hotpink)]" /> Final Warning
                            </h3>
                            <p className="font-bold text-sm mb-8 leading-relaxed">
                                Are you absolutely sure you want to delete your IntelliBid account? This action will mark your account for deletion and you will be logged out immediately.
                            </p>
                            
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-100 border-[3px] border-[var(--ink)] py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                                >
                                    <X size={16} /> Cancel
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="flex-1 bg-[var(--hotpink)] text-white border-[3px] border-[var(--ink)] py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-[4px_4px_0_0_var(--ink)] hover:translate-y-[-2px] transition-all disabled:opacity-50"
                                >
                                    {loading ? "Deleting..." : "Confirm Delete"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
