import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, ChevronDown, Search } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";

export default function EditProfileForm({ user }) {
    const setUser = useAuthStore((s) => s.setUser);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    let initialDialCode = "+1";
    let initialPhone = user.phone || "";

    const matchedCountry = COUNTRIES.find(c => initialPhone.startsWith(c.dial_code));
    if (matchedCountry) {
        initialDialCode = matchedCountry.dial_code;
        initialPhone = initialPhone.slice(matchedCountry.dial_code.length).trim();
    }

    const initialForm = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || "",
        dialCode: initialDialCode,
        phoneBody: initialPhone,
        location: user.location || "",
        website: user.website || "",
        businessName: user.businessName || "",
    };

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});

    const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

    const validate = () => {
        const newErrors = {};
        if (!form.firstName.trim()) newErrors.firstName = "First name is required";
        if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
        if (form.website && !/^https?:\/\/.+\..+/.test(form.website)) {
            newErrors.website = "Must be a valid URL (e.g. https://example.com)";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === "firstName" || name === "lastName") {
            value = value.replace(/[^a-zA-Z\s]/g, "");
        }
        if (name === "phoneBody") {
            value = value.replace(/\D/g, "");
        }

        // Bidirectional Binding: Country Dial Code -> Location Country
        if (name === "dialCode") {
            const countryMatch = COUNTRIES.find(c => c.dial_code === value);
            // Only update location to the country if location is currently empty or just a country name
            if (countryMatch) {
                setForm(prev => ({ ...prev, [name]: value, location: countryMatch.name }));
            } else {
                setForm(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }

        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    // Bidirectional Binding: Location -> Country Dial Code
    const handleLocationSelect = (locName, countryCodeIso) => {
        setForm(prev => {
            const newState = { ...prev, location: locName };
            if (countryCodeIso) {
                const match = COUNTRIES.find(c => c.code.toLowerCase() === countryCodeIso.toLowerCase());
                if (match) {
                    newState.dialCode = match.dial_code;
                }
            } else {
                // Fallback trying to match exact country name from location string
                const match = COUNTRIES.find(c => locName.includes(c.name));
                if (match) newState.dialCode = match.dial_code;
            }
            return newState;
        });
    };

    const handleWebsiteChange = (e) => {
        let val = e.target.value;
        if (val && !val.startsWith("http://") && !val.startsWith("https://")) {
            val = "https://" + val;
        }
        setForm(prev => ({ ...prev, website: val }));
        if (errors.website) setErrors(prev => ({ ...prev, website: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isDirty) return;
        if (!validate()) return;

        setLoading(true);
        setSuccess(false);

        const submitData = {
            ...form,
            phone: form.phoneBody ? `${form.dialCode} ${form.phoneBody}` : "",
        };

        delete submitData.dialCode;
        delete submitData.phoneBody;

        try {
            const data = await api("/api/profile/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submitData),
            });
            setUser(data.user);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            setErrors({ submit: error.message || "Failed to update profile" });
        } finally {
            setLoading(false);
        }
    };

    const activeCountry = COUNTRIES.find(c => c.dial_code === form.dialCode) || COUNTRIES[0];

    return (
        <div className="bg-white border-[3px] border-[var(--ink)] rounded-2xl p-6 md:p-8 shadow-[4px_4px_0_0_var(--ink)]">
            <h2 className="font-display text-xl font-black uppercase tracking-tight mb-6">Personal Details</h2>

            {errors.submit && (
                <div className="mb-6 p-4 bg-red-100 border-[3px] border-red-500 rounded-xl text-red-700 font-bold text-sm">
                    {errors.submit}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        label="First Name" name="firstName" value={form.firstName} onChange={handleChange}
                        maxLength={50} error={errors.firstName} placeholder="e.g. John"
                        extra={<CharCount val={form.firstName} max={50} />}
                    />
                    <InputField
                        label="Last Name" name="lastName" value={form.lastName} onChange={handleChange}
                        maxLength={50} error={errors.lastName} placeholder="e.g. Doe"
                        extra={<CharCount val={form.lastName} max={50} />}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1 flex justify-between">
                        Short Bio
                        <span className={form.bio.length >= 300 ? "text-red-500 font-bold" : ""}>
                            {form.bio.length}/300
                        </span>
                    </label>
                    <textarea
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        maxLength={300}
                        className="w-full bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-xl p-4 font-medium focus:shadow-[4px_4px_0_0_var(--ink)] transition-all outline-none min-h-[120px]"
                        placeholder="Tell the world about yourself and what you bid on..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Phone Number</label>
                        <div className="flex bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-xl focus-within:shadow-[4px_4px_0_0_var(--ink)] transition-all overflow-hidden relative">
                            <select
                                name="dialCode"
                                value={form.dialCode}
                                onChange={handleChange}
                                className="bg-[var(--background)] font-medium pl-3 pr-8 py-3 outline-none border-r-[3px] border-[var(--ink)] appearance-none cursor-pointer absolute inset-y-0 opacity-0 w-24 z-10"
                            >
                                {COUNTRIES.map(c => (
                                    <option key={c.code} value={c.dial_code}>{c.name} ({c.dial_code})</option>
                                ))}
                            </select>

                            <div className="flex items-center gap-2 pl-3 pr-3 border-r-[3px] border-[var(--ink)] bg-[var(--background)] w-24 shrink-0 font-medium">
                                <span>{activeCountry.flag}</span>
                                <span>{activeCountry.dial_code}</span>
                            </div>

                            <input
                                type="text"
                                name="phoneBody"
                                value={form.phoneBody}
                                onChange={handleChange}
                                maxLength={activeCountry.max}
                                placeholder="Enter your local number"
                                className="flex-1 bg-transparent px-4 py-3 font-medium outline-none text-base"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Detailed Location</label>
                        <LocationPicker
                            value={form.location}
                            onSelect={handleLocationSelect}
                        />
                    </div>
                </div>

                {user.role === 'seller' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Business Name" name="businessName" value={form.businessName} onChange={handleChange} maxLength={100} placeholder="e.g. IntelliBid Corp" extra={<CharCount val={form.businessName} max={100} />} />
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Website</label>
                            <input
                                type="text"
                                name="website"
                                value={form.website}
                                onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                                onBlur={handleWebsiteChange}
                                maxLength={200}
                                placeholder="e.g. example.com"
                                className={`w-full bg-[var(--background)] border-[3px] border-[var(--ink)] ${errors.website ? "!border-red-500 bg-red-50" : ""} rounded-xl px-4 py-3 font-medium focus:shadow-[4px_4px_0_0_var(--ink)] transition-all outline-none`}
                            />
                            {errors.website && <div className="text-red-500 font-bold text-xs px-2">{errors.website}</div>}
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={loading || !isDirty}
                        className="bg-[var(--ink)] text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm shadow-[4px_4px_0_0_var(--acid)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--acid)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:translate-y-0"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> :
                            !isDirty ? "No Changes" : "Save Changes"}
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

function InputField({ label, name, value, onChange, error, maxLength, placeholder, extra }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1 flex justify-between">
                {label} {extra}
            </label>
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                maxLength={maxLength}
                placeholder={placeholder}
                className={`w-full bg-[var(--background)] border-[3px] border-[var(--ink)] ${error ? "!border-red-500 bg-red-50" : ""} rounded-xl px-4 py-3 font-medium focus:shadow-[4px_4px_0_0_var(--ink)] transition-all outline-none`}
            />
            {error && <div className="text-red-500 font-bold text-xs px-2">{error}</div>}
        </div>
    );
}

function CharCount({ val = "", max }) {
    const len = val?.length || 0;
    return (
        <span className={`text-[9px] ${len >= max ? "text-red-500 font-bold" : "opacity-40"}`}>
            {len}/{max}
        </span>
    );
}

// OpenStreetMap Nominatim API integrated Searchable Dropdown
function LocationPicker({ value, onSelect }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const ref = useRef(null);
    const debounceRef = useRef(null);

    // Initial fallback logic incase API is unreachable or search is empty
    const filteredLocal = COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(c => ({
        display_name: c.name,
        address: { country_code: c.code.toLowerCase() }
    }));

    // Close on outside click
    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Perform API call when search changes
    useEffect(() => {
        if (!search.trim()) {
            setResults([]);
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        setLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                // Free, open API for places
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&addressdetails=1&limit=5`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                }
            } catch (err) {
                console.error("OSM Error:", err);
            } finally {
                setLoading(false);
            }
        }, 500); // 500ms debounce
    }, [search]);

    // Format display string nicely
    const formatDisplay = (addrStr) => {
        return addrStr.length > 50 ? addrStr.substring(0, 50) + "..." : addrStr;
    };

    const displayList = results.length > 0 ? results : filteredLocal;

    return (
        <div className="relative w-full" ref={ref}>
            <button
                type="button"
                onClick={() => { setOpen(!open); setSearch(""); }}
                className="w-full bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-xl px-4 py-3 font-medium focus:shadow-[4px_4px_0_0_var(--ink)] transition-all outline-none flex justify-between items-center text-left"
            >
                <span className={!value ? "opacity-50 inline-block overflow-hidden text-ellipsis whitespace-nowrap" : "inline-block overflow-hidden text-ellipsis whitespace-nowrap"}>
                    {value ? value : "e.g. Lahore, Pakistan"}
                </span>
                <ChevronDown size={18} className={`transition-transform opacity-50 shrink-0 ${open ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-20 w-full mt-2 bg-white border-[3px] border-[var(--ink)] rounded-xl shadow-[4px_4px_0_0_var(--ink)] overflow-hidden flex flex-col max-h-[350px]"
                    >
                        <div className="flex items-center gap-2 border-b-[3px] border-[var(--ink)] p-3 bg-[var(--background)] sticky top-0 shrink-0">
                            <Search size={16} className="opacity-50" />
                            <input
                                type="text"
                                placeholder="Search city, neighborhood, or country..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-transparent outline-none font-medium text-sm"
                                autoFocus
                            />
                            {loading && <Loader2 size={16} className="animate-spin text-[var(--hotpink)]" />}
                        </div>
                        <div className="overflow-y-auto">
                            {displayList.length === 0 && !loading && (
                                <div className="p-4 text-center opacity-50 text-sm font-medium">Type to search world map...</div>
                            )}
                            {displayList.map((item, idx) => {
                                // Extract info
                                const displayName = item.display_name;
                                const countryCodeIso = item.address?.country_code || item.address?.country;
                                // Fallback icon if no specific country flag
                                const matchCountry = COUNTRIES.find(c => c.code.toLowerCase() === (countryCodeIso || "").toLowerCase());
                                const flag = matchCountry ? matchCountry.flag : "📍";

                                return (
                                    <button
                                        type="button"
                                        key={item.place_id || idx}
                                        onClick={() => {
                                            // Split names to make it cleaner ("Johar Town, Lahore, Pakistan")
                                            const cleanName = displayName.split(", ").slice(0, 3).join(", ");
                                            onSelect(cleanName, countryCodeIso);
                                            setOpen(false);
                                        }}
                                        className={`w-full flex items-start gap-2 text-left px-4 py-3 hover:bg-[var(--acid)] transition-colors border-b-2 border-gray-100 last:border-0 ${value === displayName ? "bg-[var(--acid)]/30" : ""}`}
                                    >
                                        <span className="mt-0.5">{flag}</span>
                                        <span className="font-medium text-sm leading-tight text-[var(--ink)]/80">
                                            {formatDisplay(displayName)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
