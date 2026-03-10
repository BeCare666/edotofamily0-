"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function CalendlyFullScreen({ isOpen, onClose }) {
    const router = useRouter();
    const { user } = useAuthContext();

    // Redirection si non connecté
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (!token) router.push("/login");
    }

    // Construire l'URL Calendly avec préremplissage
    const calendlyUrl = `https://calendly.com/edotofamily?embed_type=Inline${user?.name && user?.email
        ? `&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`
        : ""
        }`;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay sombre */}
                    <motion.div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={onClose}
                    />

                    {/* Drawer Fullscreen */}
                    <motion.div
                        className="fixed inset-0 z-50 flex flex-col bg-gray-900 text-gray-100"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    >
                        {/* Header transparent */}
                        <motion.div
                            className="flex items-center justify-between px-6 py-4 backdrop-blur-md bg-gray-900/50 border-b border-gray-700"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                        >
                            <h2 className="text-lg font-semibold text-pink-400 flex items-center gap-2">
                                📅 Prendre un rendez-vous
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-800 transition"
                                aria-label="Fermer"
                            >
                                <X size={20} className="text-pink-400" />
                            </button>
                        </motion.div>

                        {/* Calendly Iframe */}
                        <motion.div
                            className="flex-1 overflow-hidden"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                        >
                            <iframe src={calendlyUrl} className="w-full h-full border-0" />
                        </motion.div>

                        {/* Footer fixe */}
                        <motion.div
                            className="px-6 py-3 flex items-center justify-end backdrop-blur-md bg-gray-900/60 border-t border-gray-700"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                        >
                            <p className="text-sm text-gray-300">
                                Besoin d’aide ? Contacte notre équipe.
                            </p>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}