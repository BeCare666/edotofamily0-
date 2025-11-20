"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";

export default function SuperCentreSelectorModal({
    isOpen,
    onClose,
    onSelect
}) {
    const [centres, setCentres] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");

    // Fetch super centres
    const fetchCentres = async () => {
        console.log("voir les centres")
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/users?role=super_centre&limit=200`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const data = await res.json();

            const list = Array.isArray(data.data) ? data.data : [];
            setCentres(list);
            setFiltered(list);
        } catch (e) {
            console.error("Erreur:", e);
        }
    };

    useEffect(() => {
        fetchCentres();
        if (isOpen) {
            //fetchCentres();
        }
    }, [isOpen]);

    // Search filter
    useEffect(() => {
        const q = search.toLowerCase();
        const f = centres.filter(
            (c) =>
                c.name?.toLowerCase().includes(q) ||
                c.email?.toLowerCase().includes(q)
        );
        setFiltered(f);
    }, [search, centres]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        className="fixed inset-0 bg-white backdrop-blur-sm z-[90]"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* MODAL WRAPPER CENTRÉ */}
                    <motion.div
                        className="fixed inset-0 z-[100] flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* MODAL */}
                        <motion.div
                            className="w-[95%] max-w-lg 
                         bg-white backdrop-blur-xl
                        border border-white/30 p-6"
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={{
                                type: "spring",
                                damping: 20,
                                stiffness: 200
                            }}
                        >
                            {/* HEADER */}
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Sélectionner un Centre
                                </h2>

                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-gray-100"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* SEARCH */}
                            <div className="relative mb-4">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Rechercher un centre..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl 
                                bg-white/60 border border-black/40 
                                focus:ring-2 focus:ring-[#FF6EA9]/30 
                                outline-none backdrop-blur"
                                />
                            </div>

                            {/* LIST */}
                            <div className="space-y-2 max-h-[350px] overflow-auto pr-1">
                                {filtered.length === 0 && (
                                    <p className="text-gray-500 text-sm text-center py-6">
                                        Aucun centre trouvé
                                    </p>
                                )}

                                {filtered.map((c) => (
                                    <motion.button
                                        key={c.id}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onSelect(c)}
                                        className="flex items-center w-full gap-3 p-3
                                    bg-white/60 backdrop-blur border border-white/40
                                    hover:bg-white/80 transition rounded-2xl shadow-sm"
                                    >
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6EA9] to-[#60A5FA] flex items-center justify-center text-white font-semibold">
                                            {c.name?.charAt(0)?.toUpperCase()}
                                        </div>

                                        <div className="flex flex-col text-left">
                                            <span className="font-medium text-gray-800">
                                                {c.name}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {c.email}
                                            </span>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

}
