import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Package,
    Loader2,
    Hash,
    User,
    CheckCircle,
    X,
    Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function PickupDashboardarchive({ mode = "orders", campaignId }) {
    const router = useRouter();
    const API = process.env.NEXT_PUBLIC_REST_API_ENDPOINT || "";
    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : "";

    const [items, setItems] = useState([]);
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });

    const [page, setPage] = useState(1);
    const limit = 25;
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(true);
    const [fetching, setFetching] = useState(false);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [selected, setSelected] = useState(null);
    const [otp, setOtp] = useState("");
    const [validating, setValidating] = useState(false);

    // debounce
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
        return () => clearTimeout(t);
    }, [search]);

    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    const buildUrl = (path, params = {}) => {
        const u = new URL(`${API}${path}`, window.location.origin);
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== "") {
                u.searchParams.append(k, String(v));
            }
        });
        return u.toString();
    };

    // =========================
    // LOAD LIST
    // =========================
    const loadItems = useCallback(
        async (p = page) => {
            try {
                setFetching(true);

                let url;

                if (mode === "campaigns") {
                    if (!campaignId) return;
                    url = buildUrl(`/admin/campaigns/${campaignId}/registrations`, {
                        page: p,
                        search: debouncedSearch,
                    });
                } else {
                    url = buildUrl("/orders", {
                        page: p,
                        limit,
                        search: debouncedSearch,
                    });
                }

                const res = await fetch(url, { headers });
                if (!res.ok) throw new Error("fetch error");

                const json = await res.json();

                setItems(json.data || []);

                const pages =
                    json.last_page ??
                    (Math.ceil((json.total || json.count || 0) / limit) || 1);

                setTotalPages(pages);

                // stats locales
                if (mode === "campaigns") {
                    const total = json.data?.length || 0;
                    const completed = json.data?.filter((i) => i.picked_up === 1).length;
                    setStats({
                        total,
                        completed,
                        pending: total - completed,
                    });
                }
            } catch (e) {
                toast.error("Erreur de chargement");
            } finally {
                setFetching(false);
            }
        },
        [mode, campaignId, debouncedSearch, page]
    );

    // =========================
    // OTP VALIDATION
    // =========================
    const validateOTP = async () => {
        if (!otp) return toast.error("Code OTP requis");

        try {
            setValidating(true);

            const url =
                mode === "campaigns"
                    ? `${API}/campaigns/verify-otp`
                    : `${API}/orders/verify-otp`;

            const payload =
                mode === "campaigns"
                    ? { registration_id: selected.id, otp }
                    : { order_id: selected.id, otp };

            const res = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data?.message || "OTP invalide");

            toast.success("Validation réussie");

            setSelected(null);
            setOtp("");
            loadItems();
        } catch (e) {
            toast.error(e.message);
        } finally {
            setValidating(false);
        }
    };

    // =========================
    // EFFECTS
    // =========================
    useEffect(() => {
        loadItems();
    }, [debouncedSearch, page]);

    if (loading && items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin w-10 h-10" />
            </div>
        );
    }

    // =========================
    // RENDER
    // =========================
    return (
        <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-white/60 to-white/30">
            <div className="max-w-6xl mx-auto">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-pink-50">
                            <Package className="w-6 h-6 text-pink-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {mode === "campaigns" ? "Inscriptions à la campagne" : "Commandes"}
                            </h1>
                            {mode === "campaigns" && (
                                <p className="text-sm text-gray-500">
                                    Campagne #{campaignId}
                                </p>
                            )}
                        </div>
                    </div>

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher..."
                        className="px-4 py-2 border rounded-xl"
                    />
                </div>

                {/* STATS */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <Stat label="Total" value={stats.total} icon={Package} />
                    <Stat label="Validés" value={stats.completed} icon={CheckCircle} />
                    <Stat label="En attente" value={stats.pending} icon={Clock} />
                </div>

                {/* LIST */}
                <div className="space-y-3">
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/80 rounded-2xl p-4 border flex justify-between"
                        >
                            <div
                                className="flex gap-3 cursor-pointer"
                                onClick={() => setSelected(item)}
                            >
                                <div className="p-2 bg-pink-50 rounded">
                                    <Hash className="w-5 h-5 text-pink-600" />
                                </div>

                                <div>
                                    <div className="font-semibold">
                                        {mode === "campaigns"
                                            ? item.full_name
                                            : item.tracking_number}
                                    </div>

                                    <div className="text-sm text-gray-500">
                                        {mode === "campaigns"
                                            ? item.email
                                            : item.customer_name}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelected(item)}
                                className="px-3 py-2 border rounded-lg"
                            >
                                Détails
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* PAGINATION */}
                <div className="flex justify-center gap-3 mt-6">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        ← Précédent
                    </button>

                    <div className="text-sm text-gray-600">
                        Page {page} / {totalPages}
                    </div>

                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(page + 1)}
                        className="px-3 py-1 border rounded"
                    >
                        Suivant →
                    </button>
                </div>
            </div>

            {/* MODAL OTP */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div
                            className="absolute inset-0 bg-black/30"
                            onClick={() => !validating && setSelected(null)}
                        />

                        <motion.div
                            className="bg-white rounded-2xl p-6 w-full max-w-lg relative"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            <button
                                onClick={() => setSelected(null)}
                                className="absolute right-4 top-4"
                            >
                                <X />
                            </button>

                            <h3 className="text-xl font-semibold mb-4">
                                Validation OTP
                            </h3>

                            <input
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                                placeholder="Code OTP"
                                className="w-full p-3 border rounded-xl"
                            />

                            <button
                                onClick={validateOTP}
                                disabled={validating}
                                className="mt-4 w-full py-3 rounded-xl bg-black text-white"
                            >
                                {validating ? "Validation..." : "Valider"}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Stat({ label, value, icon: Icon }) {
    return (
        <div className="p-4 rounded-2xl bg-white/70 border shadow-sm flex justify-between">
            <div>
                <div className="text-sm text-gray-500">{label}</div>
                <div className="text-2xl font-bold">{value}</div>
            </div>
            <div className="p-3 rounded-lg bg-black text-white">
                <Icon className="w-5 h-5" />
            </div>
        </div>
    );
}
