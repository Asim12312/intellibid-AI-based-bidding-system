"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Lock, KeyRound, ShieldAlert } from "lucide-react";

export default function ChangePasswordForm() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const requirements = [
        { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
        { label: "At least one uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
        { label: "At least one number", test: (pw) => /[0-9]/.test(pw) },
        { label: "At least one special character", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
    ];

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (form.newPassword !== form.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const failedReqs = requirements.filter(req => !req.test(form.newPassword));
        if (failedReqs.length > 0) {
            setError("Password does not meet all requirements");
            return;
        }

        setLoading(true);

        try {
            await api("/api/profile/change-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    oldPassword: form.oldPassword,
                    newPassword: form.newPassword
                }),
            });
            setSuccess(true);
            setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            setError(err.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[var(--electric)] text-white border-[3px] border-[var(--ink)] rounded-2xl shadow-[6px_6px_0_0_var(--ink)] overflow-hidden h-full flex flex-col">
            <div className="bg-[var(--ink)] px-6 py-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--hotpink)] border-[2px] border-white/20">
                    <ShieldAlert size={18} strokeWidth={3} className="text-white" />
                </div>
                <h2 className="font-display text-xl font-black uppercase tracking-tight">Security</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 flex-1 flex flex-col">
                <PasswordField icon={<KeyRound size={14} strokeWidth={3} />} label="Current Password" name="oldPassword" value={form.oldPassword} onChange={handleChange} />
                
                <div className="space-y-3">
                    <PasswordField icon={<Lock size={14} strokeWidth={3} />} label="New Password" name="newPassword" value={form.newPassword} onChange={handleChange} />
                    
                    {/* Password Requirements UI */}
                    <div className="bg-[var(--ink)]/10 rounded-xl p-3 space-y-2 border-[2px] border-white/10">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">Password Requirements:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                            {requirements.map((req, i) => {
                                const isMet = req.test(form.newPassword);
                                return (
                                    <div key={i} className={`flex items-center gap-2 transition-all ${isMet ? 'opacity-100' : 'opacity-40'}`}>
                                        <div className={`h-3.5 w-3.5 rounded-full border-[2px] border-white flex items-center justify-center transition-colors ${isMet ? 'bg-[var(--acid)] border-[var(--ink)]' : 'bg-transparent'}`}>
                                            {isMet && <Check size={10} strokeWidth={4} className="text-[var(--ink)]" />}
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-tight ${isMet ? 'text-[var(--acid)]' : 'text-white'}`}>
                                            {req.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <PasswordField icon={<Check size={14} strokeWidth={3} />} label="Confirm Password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />

                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-[var(--hotpink)] border-[2px] border-[var(--ink)] rounded-xl text-white text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0_0_var(--ink)]">
                        {error}
                    </motion.div>
                )}

                <div className="flex-1" />

                <div className="flex flex-col gap-3 pt-4 border-t-[3px] border-dashed border-white/20">
                    <button 
                        type="submit"
                        disabled={loading || !form.oldPassword || !form.newPassword}
                        className="w-full bg-[var(--acid)] text-[var(--ink)] py-3.5 rounded-xl font-black uppercase tracking-widest text-sm border-[3px] border-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-[4px_4px_0_0_var(--ink)]"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Update Password"}
                    </button>

                    <AnimatePresence>
                        {success && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center justify-center gap-2 text-[var(--acid)] font-black uppercase text-xs">
                                <Check size={16} strokeWidth={3} /> Success!
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </form>
        </div>
    );
}

function PasswordField({ label, name, value, onChange, icon }) {
    return (
        <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest opacity-80">
                {icon} {label}
            </label>
            <input 
                type="password"
                name={name}
                value={value}
                onChange={onChange}
                autoComplete="new-password"
                className="w-full bg-white text-[var(--ink)] border-[3px] border-[var(--ink)] rounded-xl px-4 py-3 font-medium outline-none focus:shadow-[4px_4px_0_0_var(--acid)] transition-all placeholder:text-[var(--ink)]/30"
                placeholder="••••••••"
            />
        </div>
    );
}
