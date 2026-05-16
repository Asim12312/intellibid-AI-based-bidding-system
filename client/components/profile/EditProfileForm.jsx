import { useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

export default function EditProfileForm({ user }) {
    const setUser = useAuthStore((s) => s.setUser);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || "",
        phone: user.phone || "",
        location: user.location || "",
        website: user.website || "",
        businessName: user.businessName || "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            const data = await api("/api/profile/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            setUser(data.user);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            alert(error.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border-[3px] border-[var(--ink)] rounded-2xl p-6 md:p-8 shadow-[4px_4px_0_0_var(--ink)]">
            <h2 className="font-display text-xl font-black uppercase tracking-tight mb-6">Personal Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="First Name" name="firstName" value={form.firstName} onChange={handleChange} />
                    <InputField label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Short Bio</label>
                    <textarea 
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        className="w-full bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-xl p-4 font-medium focus:shadow-[4px_4px_0_0_var(--ink)] transition-all outline-none min-h-[120px]"
                        placeholder="Tell us about yourself..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Phone Number" name="phone" value={form.phone} onChange={handleChange} />
                    <InputField label="Location" name="location" value={form.location} onChange={handleChange} />
                </div>

                {user.role === 'seller' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Business Name" name="businessName" value={form.businessName} onChange={handleChange} />
                        <InputField label="Website" name="website" value={form.website} onChange={handleChange} />
                    </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                    <button 
                        type="submit"
                        disabled={loading}
                        className="bg-[var(--ink)] text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm shadow-[4px_4px_0_0_var(--acid)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--acid)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:translate-y-0"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Save Changes"}
                    </button>

                    {success && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-[var(--acid)] font-black uppercase text-xs">
                            <Check className="p-1 bg-[var(--acid)] text-[var(--ink)] rounded-full" size={20} />
                            Updated!
                        </motion.div>
                    )}
                </div>
            </form>
        </div>
    );
}

function InputField({ label, name, value, onChange }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">{label}</label>
            <input 
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-xl px-4 py-3 font-medium focus:shadow-[4px_4px_0_0_var(--ink)] transition-all outline-none"
            />
        </div>
    );
}
