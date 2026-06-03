import { useState } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Check, Loader2, Lock } from "lucide-react";

export default function ChangePasswordForm() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

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

        if (form.newPassword.length < 6) {
            setError("New password must be at least 6 characters");
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
        <div className="bg-white border-[3px] border-[var(--ink)] rounded-2xl p-6 md:p-8 shadow-[4px_4px_0_0_var(--ink)] h-full">
            <h2 className="font-display text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                <Lock size={20} /> Security
            </h2>
<<<<<<< HEAD

            {submitError && (
                <div className="mb-6 p-4 bg-red-100 border-[3px] border-red-500 rounded-xl text-red-700 font-bold text-sm">
                    {submitError}
                </div>
            )}

=======
            
>>>>>>> parent of 0c1db7f (optimize profile page by ensuring user usability)
            <form onSubmit={handleSubmit} className="space-y-6">
                <PasswordField label="Current Password" name="oldPassword" value={form.oldPassword} onChange={handleChange} />
                <PasswordField label="New Password" name="newPassword" value={form.newPassword} onChange={handleChange} />
                <PasswordField label="Confirm New Password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />

                {error && (
                    <p className="text-red-500 text-xs font-black uppercase tracking-tight">{error}</p>
                )}

                <div className="flex items-center gap-4 pt-2">
                    <button 
                        type="submit"
                        disabled={loading}
                        className="bg-[var(--ink)] text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm shadow-[4px_4px_0_0_var(--hotpink)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--hotpink)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:translate-y-0"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Update Password"}
                    </button>

                    {success && (
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 text-green-500 font-black uppercase text-xs">
                            <Check className="p-1 bg-green-500 text-white rounded-full" size={20} />
                            Success!
                        </motion.div>
                    )}
                </div>
            </form>
        </div>
    );
}

function PasswordField({ label, name, value, onChange }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">{label}</label>
            <input 
                type="password"
                name={name}
                value={value}
                onChange={onChange}
                autoComplete="new-password"
                className="w-full bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-xl px-4 py-3 font-medium focus:shadow-[4px_4px_0_0_var(--ink)] transition-all outline-none"
                placeholder="••••••••"
            />
        </div>
    );
}
