import { useState } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Check, Loader2, Lock, Eye, EyeOff, X } from "lucide-react";

export default function ChangePasswordForm() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const [form, setForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (submitError) setSubmitError("");
    };

    // Validation Rules
    const reqs = {
        length: form.newPassword.length >= 8,
        upper: /[A-Z]/.test(form.newPassword),
        number: /[0-9]/.test(form.newPassword),
        special: /[^A-Za-z0-9]/.test(form.newPassword)
    };

    const isValid = Object.values(reqs).every(Boolean) && form.newPassword === form.confirmPassword;
    const isDirty = form.oldPassword && form.newPassword && form.confirmPassword;

    // Strength
    const strengthScore = Object.values(reqs).filter(Boolean).length;
    let strengthLabel = "Weak";
    let strengthColor = "bg-red-500";
    if (strengthScore === 4) { strengthLabel = "Strong"; strengthColor = "bg-green-500"; }
    else if (strengthScore >= 2) { strengthLabel = "Fair"; strengthColor = "bg-yellow-500"; }
    if (form.newPassword.length === 0) strengthLabel = "";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");

        if (!isValid) return;

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
            setSubmitError(err.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border-[3px] border-[var(--ink)] rounded-2xl p-6 md:p-8 shadow-[4px_4px_0_0_var(--ink)] h-full">
            <h2 className="font-display text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                <Lock size={20} /> Security
            </h2>

            {submitError && (
                <div className="mb-6 p-4 bg-red-100 border-[3px] border-red-500 rounded-xl text-red-700 font-bold text-sm">
                    {submitError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <PasswordField label="Current Password" name="oldPassword" value={form.oldPassword} onChange={handleChange} maxLength={100} />

                <div className="space-y-3">
                    <PasswordField label="New Password" name="newPassword" value={form.newPassword} onChange={handleChange} maxLength={100} />

                    {/* Live Strength & Requirements */}
                    {form.newPassword.length > 0 && (
                        <div className="p-4 bg-[var(--background)] border-[2px] border-[var(--ink)] rounded-xl space-y-3">
                            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                                <span>Strength:</span>
                                <span className={strengthColor.replace("bg-", "text-")}>{strengthLabel}</span>
                            </div>
                            <div className="flex gap-1 h-2 w-full bg-white border border-[var(--ink)] rounded overflow-hidden">
                                <div className={`h-full transition-all duration-300 ${strengthScore >= 1 ? strengthColor : "bg-transparent"}`} style={{ width: '25%' }} />
                                <div className={`h-full transition-all duration-300 ${strengthScore >= 2 ? strengthColor : "bg-transparent"}`} style={{ width: '25%' }} />
                                <div className={`h-full transition-all duration-300 ${strengthScore >= 3 ? strengthColor : "bg-transparent"}`} style={{ width: '25%' }} />
                                <div className={`h-full transition-all duration-300 ${strengthScore === 4 ? strengthColor : "bg-transparent"}`} style={{ width: '25%' }} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-wider opacity-70">
                                <ReqItem met={reqs.length} text="8+ Characters" />
                                <ReqItem met={reqs.upper} text="1 Uppercase" />
                                <ReqItem met={reqs.number} text="1 Number" />
                                <ReqItem met={reqs.special} text="1 Symbol (!@#)" />
                            </div>
                        </div>
                    )}
                </div>

                <PasswordField
                    label="Confirm New Password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    maxLength={100}
                    error={form.confirmPassword && form.newPassword !== form.confirmPassword ? "Passwords do not match" : null}
                />

                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={loading || !isValid || !isDirty}
                        className="bg-[var(--ink)] text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm shadow-[4px_4px_0_0_var(--hotpink)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--hotpink)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:translate-y-0"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> :
                            !isDirty ? "Enter Details" :
                                !isValid ? "Fix Errors" : "Update Password"}
                    </button>

                    {success && (
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 text-green-500 font-black uppercase text-xs">
                            <Check className="p-1 bg-green-500 text-white rounded-full" size={20} />
                            Saved!
                        </motion.div>
                    )}
                </div>
            </form>
        </div>
    );
}

function ReqItem({ met, text }) {
    return (
        <div className={`flex items-center gap-1.5 transition-colors ${met ? "text-green-600" : ""}`}>
            {met ? <Check size={12} strokeWidth={4} /> : <X size={12} strokeWidth={4} />}
            <span>{text}</span>
        </div>
    );
}

function PasswordField({ label, name, value, onChange, error, maxLength }) {
    const [show, setShow] = useState(false);

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">{label}</label>
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={onChange}
                    maxLength={maxLength}
                    autoComplete="new-password"
                    className={`w-full bg-[var(--background)] border-[3px] border-[var(--ink)] ${error ? "!border-red-500 bg-red-50" : ""} rounded-xl pl-4 pr-12 py-3 font-medium focus:shadow-[4px_4px_0_0_var(--ink)] transition-all outline-none`}
                    placeholder="••••••••"
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-50 hover:opacity-100 transition-opacity"
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            {error && <div className="text-red-500 font-bold text-xs px-2">{error}</div>}
        </div>
    );
}
