"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarCheck2, MessageCircleHeart, ShieldCheck, X } from "lucide-react";
import { useChatAI } from "../../context/ChatAIContext";

// Choix ouvert par le bouton « Assistant SSR » (19/10/2026) :
// assistant virtuel (chat existant) ou rendez-vous avec un professionnel (téléconsultation).
const spring = { type: "spring", stiffness: 280, damping: 30 };

function Option({ icon: Icon, kicker, title, text, points, onClick, delay }) {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay }}
            className="group relative flex w-full flex-col rounded-[22px] border border-[#E9E5DF] bg-white p-5 text-left transition hover:border-[#1A1814] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C2185B]/40 sm:p-6"
        >
            <span className="flex items-start justify-between gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[#E9E5DF] bg-[#F9F8F6] text-[#1A1814] transition group-hover:border-[#1A1814] group-hover:bg-[#1A1814] group-hover:text-white">
                    <Icon size={22} strokeWidth={1.6} />
                </span>
                <span className="grid h-9 w-9 place-items-center rounded-full border border-[#E9E5DF] text-[#57524B] transition group-hover:translate-x-0.5 group-hover:border-[#C2185B] group-hover:text-[#C2185B]">
                    <ArrowRight size={16} />
                </span>
            </span>
            <span className="mt-5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#C2185B]">{kicker}</span>
            <span className="mt-1 font-serif text-[22px] leading-tight text-[#1A1814]">{title}</span>
            <span className="mt-2 text-sm leading-relaxed text-[#57524B]">{text}</span>
            <span className="mt-4 flex flex-wrap gap-1.5">
                {points.map((p) => (
                    <span key={p} className="rounded-full border border-[#E9E5DF] px-2.5 py-1 text-[11px] text-[#57524B]">{p}</span>
                ))}
            </span>
        </motion.button>
    );
}

export default function SSRChoice() {
    const { choiceOpen, closeChoice, openChat, openBooking } = useChatAI();

    useEffect(() => {
        if (!choiceOpen) return;
        const onKey = (e) => e.key === "Escape" && closeChoice();
        window.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [choiceOpen, closeChoice]);

    return (
        <AnimatePresence>
            {choiceOpen && (
                <>
                    <motion.div
                        key="ssr-choice-backdrop"
                        className="fixed inset-0 z-[92] bg-[#1A1814]/35 backdrop-blur-[2px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeChoice}
                    />
                    <div key="ssr-choice-wrap" className="pointer-events-none fixed inset-0 z-[93] flex items-end justify-center md:items-center md:p-6">
                    <motion.div
                        key="ssr-choice"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Assistant SSR"
                        className="pointer-events-auto max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-[#F9F8F6] md:w-[860px] md:max-w-full md:rounded-[28px]"
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 40, opacity: 0 }}
                        transition={spring}
                    >
                        <div className="grid md:grid-cols-[300px_1fr]">
                            {/* Photo et promesse */}
                            <div className="relative hidden overflow-hidden md:block">
                                <img src="/images/woman-soft-bg.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1814]/75 via-[#1A1814]/10 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/75">E.doto family</p>
                                    <p className="mt-2 font-serif text-2xl leading-snug">Votre santé sexuelle, sans gêne et sans jugement.</p>
                                </div>
                            </div>

                            <div className="p-5 sm:p-7">
                                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#D9D3CA] md:hidden" />
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#8A837A]">Assistant SSR</p>
                                        <h2 className="mt-1 font-serif text-[28px] leading-tight text-[#1A1814]">Comment pouvons-nous vous aider ?</h2>
                                    </div>
                                    <button onClick={closeChoice} aria-label="Fermer" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#E9E5DF] bg-white text-[#57524B] transition hover:border-[#1A1814] hover:text-[#1A1814]">
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                    <Option
                                        icon={MessageCircleHeart}
                                        kicker="Réponse immédiate"
                                        title="Assistant virtuel"
                                        text="Posez vos questions sur la santé sexuelle et reproductive, à toute heure, en toute discrétion."
                                        points={["24 h sur 24", "Anonyme", "Gratuit"]}
                                        onClick={openChat}
                                        delay={0.05}
                                    />
                                    <Option
                                        icon={CalendarCheck2}
                                        kicker="Avec un professionnel"
                                        title="Prendre rendez-vous"
                                        text="Échangez avec un médecin en visio ou par appel, à l’heure que vous choisissez."
                                        points={["Visio ou appel", "Confidentiel", "Orientation vers un centre"]}
                                        onClick={openBooking}
                                        delay={0.12}
                                    />
                                </div>

                                <p className="mt-5 flex items-center gap-2 text-xs text-[#8A837A]">
                                    <ShieldCheck size={14} className="shrink-0" />
                                    Vos échanges sont confidentiels.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
