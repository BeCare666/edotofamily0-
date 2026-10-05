"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useChatAI } from "../context/ChatAIContext";

// Bouton flottant : ouvre le chat « Assistant SSR » (remplace l'ancien accès direct à Calendly).
export default function SSRAdvisorButton() {
    const { isOpen, openChat } = useChatAI();

    return (
        <AnimatePresence>
            {!isOpen && (
                <motion.div
                    // Sur mobile, au-dessus de la barre de navigation du bas (MobileBottomNav)
                    className="fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] right-4 z-30 flex flex-col items-center gap-2 md:bottom-5 md:right-5"
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                    <motion.button
                        onClick={openChat}
                        aria-label="Ouvrir l'Assistant SSR"
                        className="group relative h-16 w-16 rounded-full"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                    >
                        {/* Halo pulsé */}
                        <motion.span
                            className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF6EA9] to-[#4AB3F4]"
                            animate={{ scale: [1, 1.35], opacity: [0.45, 0] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                        />
                        {/* Anneau dégradé en rotation */}
                        <motion.span
                            className="absolute inset-0 rounded-full shadow-[0_12px_30px_-8px_rgba(236,72,153,0.65)]"
                            style={{ background: "conic-gradient(from 0deg, #FF6EA9, #c084fc, #4AB3F4, #FF6EA9)" }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        />
                        <span className="absolute inset-[3px] flex items-center justify-center rounded-full bg-gradient-to-br from-white to-pink-50">
                            <Sparkles className="h-7 w-7 text-pink-500 transition-transform duration-500 group-hover:rotate-12" strokeWidth={1.8} />
                        </span>
                    </motion.button>

                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm ring-1 ring-pink-100 backdrop-blur">
                        Assistant SSR
                    </span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
