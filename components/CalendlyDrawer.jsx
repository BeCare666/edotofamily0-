"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, LocateFixed } from "lucide-react";
import SuperCentreSelectorModal from "./SuperCentreSelectorModal";
import { useEffect, useState } from "react"
import { useAuthContext } from "../context/AuthContext";
import { useRouter } from "next/navigation"
export default function CalendlyDrawerRight({ isOpen, onClose }) {
const router = useRouter()
const [showSelector, setShowSelector] = useState(false);
const [prefill, setPrefill] = useState(null);
const { user, logout } = useAuthContext();
useEffect(() => {
    console.log(isOpen)
    if (isOpen) {
         setShowSelector(true);
        const token = localStorage.getItem("token");
        if (!token) {
             router.push('/login')
            //setShowSelector(true);
        }
    }
}, [isOpen]);
const handleSelectCentre = (centre) => {
    setPrefill({
        name: centre.name,
        email: centre.email
    });

    setShowSelector(false);
};

    return (
        <>
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                    />

                    {/* Drawer */}
                    <motion.aside
                        className="fixed top-0 right-0 h-full w-full sm:w-[480px] md:w-[520px] bg-white/90 backdrop-blur-xl shadow-2xl z-50 md:rounded-l-3xl lg:rounded-l-3xl flex flex-col overflow-hidden"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{
                            type: "spring",
                            damping: 22,
                            stiffness: 220,
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/40 bg-gradient-to-r from-white/60 to-white/30 backdrop-blur-md">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Prendre un rendez-vous
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Planifie ton moment avec nous en toute simplicité
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF6EA9]/30"
                                aria-label="Fermer"
                            >
                                <X size={18} className="text-gray-700" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-1">
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.4 }}
                                className="w-full h-[550px]  overflow-hidden shadow-inner border border-white/30"
                            >
                               <iframe
                                    src={
                                        prefill
                                            ? `https://calendly.com/edotofamily?name=${encodeURIComponent(
                                                user.name
                                            )}&email=${encodeURIComponent(user.email)}`
                                            : "https://calendly.com/edotofamily"
                                    }
                                    className="w-full h-full border-0"
                                />

                            </motion.div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-white/40 flex items-center justify-between bg-gradient-to-r from-white/70 to-white/50 backdrop-blur-md">
                            <p className="text-xs text-gray-500">
                                Besoin d’aide ? Contacte notre équipe.
                            </p>
                            <button
                                onClick={onClose}
                                className="hidden px-4 py-2 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-[#FF6EA9] to-[#60A5FA] shadow-md hover:shadow-lg transition-all"
                            >
                                Fermer
                            </button>
                                            <motion.button
                onClick={() => setShowSelector(true)}
                className="fixed bottom-2 right-8 z-50 w-10 h-10 rounded-full bg-[#FF6EA9]/20 backdrop-blur-md border border-white/30 
                          flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 transition-all"
                whileHover={{ rotate: -5 }}
                whileTap={{ scale: 0.9 }}
              >
                <LocateFixed className="text-[#FF6EA9]" size={26} />
              </motion.button>
                        </div> 
                    </motion.aside>
                   
                </>
            )}
        </AnimatePresence>
          <SuperCentreSelectorModal
                            isOpen={showSelector}
                            onClose={() => setShowSelector(false)}
                            onSelect={handleSelectCentre}
                    />
        </>
    );
}
