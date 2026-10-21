"use client";

import React, { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion, MotionProps } from "framer-motion";
import { ArrowUpRight, Gift, HeartHandshake, LockKeyhole, MessageCircleHeart, ShoppingBag, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChatAI } from "../context/ChatAIContext";
const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes en ms

// Drawer d'accueil (refonte 19/10/2026) : trois accès en cartes photo, rendu premium.
// « Poser une question à l'Assistant SSR » ouvre le choix « Assistant virtuel » ou « Prendre rendez-vous ».
const spring = { type: "spring" as const, stiffness: 260, damping: 32, mass: 0.9 };
// Transtypage : types de React 19 et framer-motion 10 incompatibles sans lui (même méthode que home/Reveal.tsx)
const MotionDiv = motion.div as unknown as React.FC<React.HTMLAttributes<HTMLDivElement> & MotionProps & { key?: React.Key }>;
const MotionButton = motion.button as unknown as React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & MotionProps>;

type Access = {
  key: string;
  photo: string;
  icon: React.ElementType;
  title: string;
  text: string;
  featured?: boolean;
  onClick: () => void;
};

function AccessCard({ a, index }: { a: Access; index: number }) {
  const Icon = a.icon;
  return (
    <MotionButton
      onClick={a.onClick}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.08 + index * 0.07 }}
      className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-[22px] border bg-white p-2.5 text-left transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(26,24,20,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C2185B]/40 sm:flex-col sm:items-stretch sm:gap-0 sm:p-0 ${
        a.featured ? "border-[#C2185B]/40" : "border-[#E9E5DF] hover:border-[#1A1814]"
      }`}
    >
      {/* Photo : vignette à gauche sur mobile, bandeau en haut sur ordinateur */}
      <span className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-2xl sm:h-40 sm:w-full sm:rounded-none lg:h-44">
        <img src={a.photo} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]" />
        <span className="absolute inset-0 hidden bg-gradient-to-t from-[#1A1814]/35 to-transparent sm:block" />
        <span className="absolute left-3 top-3 hidden h-10 w-10 place-items-center rounded-full bg-white/95 text-[#1A1814] backdrop-blur sm:grid">
          <Icon size={18} strokeWidth={1.7} />
        </span>
        {a.featured && (
          <span className="absolute right-3 top-3 hidden rounded-full bg-[#C2185B] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white sm:block">
            Gratuit
          </span>
        )}
      </span>

      <span className="flex min-w-0 flex-1 items-center justify-between gap-3 sm:p-5">
        <span className="min-w-0">
          <span className="block text-[15px] font-semibold leading-snug text-[#1A1814] sm:text-base">{a.title}</span>
          <span className="mt-1 block text-[13px] leading-relaxed text-[#6B655D]">{a.text}</span>
        </span>
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-300 group-hover:rotate-45 ${
            a.featured
              ? "border-[#C2185B] bg-[#C2185B] text-white"
              : "border-[#E9E5DF] text-[#57524B] group-hover:border-[#1A1814] group-hover:bg-[#1A1814] group-hover:text-white"
          }`}
        >
          <ArrowUpRight size={16} />
        </span>
      </span>
    </MotionButton>
  );
}

const SSRAccessDrawer = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Le drawer ne se réaffiche pas par-dessus le chat, le choix ou la prise de rendez-vous.
  const { isOpen: chatOpen, choiceOpen, bookingOpen, openChoice } = useChatAI();
  const busyRef = useRef(false);
  busyRef.current = chatOpen || choiceOpen || bookingOpen;
  useEffect(() => {
    // Affiche au premier chargement.
    setOpen(true);

    // Lance un intervalle toutes les 5 minutes
    timerRef.current = setInterval(() => {
      if (!busyRef.current) setOpen(true); // réaffiche
    }, FIVE_MINUTES);

    // Cleanup
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Échap pour fermer
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  const items: Access[] = [
    {
      key: "products",
      photo: "/images/woman-soft-bg.jpg",
      icon: ShoppingBag,
      title: "Visiter nos produits",
      text: "Commandez en toute discrétion",
      onClick: go(() => router.push("/category/categories_id=3")),
    },
    {
      key: "kits",
      photo: "/images/site/drawer-kits.jpg",
      icon: Gift,
      title: "Bénéficier de kits gratuits",
      text: "Campagnes disponibles près de vous",
      featured: true,
      onClick: go(() => router.push("/campaigns")),
    },
    {
      // Contraception (21/10/2026) : catalogue des méthodes et adoption en 7 étapes
      key: "contraception",
      photo: "/images/site/drawer-contraception.jpg",
      icon: HeartHandshake,
      title: "Choisir ma contraception",
      text: "Méthodes modernes, accompagnement en 7 étapes",
      onClick: go(() => router.push("/contraception")),
    },
    {
      key: "assistant",
      photo: "/images/site/drawer-assistant.jpg",
      icon: MessageCircleHeart,
      title: "Poser une question à l'Assistant SSR",
      text: "Réponses automatiques, anonymes et confidentielles",
      onClick: go(openChoice),
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <MotionDiv
            key="ssr-access-backdrop"
            className="fixed inset-0 z-40 bg-[#1A1814]/30 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <MotionDiv
            key="ssr-access-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Accès SSR sécurisé"
            className="fixed inset-x-0 bottom-0 z-50 flex justify-center"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={spring}
          >
            <div className="relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-t-[30px] border border-b-0 border-[#E9E5DF] bg-[#F9F8F6] px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-24px_60px_-30px_rgba(26,24,20,0.35)] sm:px-8 sm:pb-8">
              <div className="mx-auto mb-5 h-1.5 w-11 rounded-full bg-[#D9D3CA]" />

              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-[#E9E5DF] bg-white text-[#57524B] transition hover:border-[#1A1814] hover:text-[#1A1814] sm:right-6 sm:top-5"
              >
                <X size={18} />
              </button>

              <MotionDiv
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.04 }}
                className="mx-auto max-w-2xl px-8 text-center"
              >
                <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-[#E9E5DF] bg-white px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#C2185B]">
                  <LockKeyhole size={13} />
                  Accès SSR sécurisé
                </span>
                <h2 className="mt-4 font-serif text-[24px] leading-[1.15] text-[#1A1814] sm:text-[32px]">
                  Accès simple, confidentiel et immédiat aux produits SSR
                </h2>
              </MotionDiv>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                {items.map((a, i) => (
                  <AccessCard key={a.key} a={a} index={i} />
                ))}
              </div>
            </div>
          </MotionDiv>
        </>
      )}
    </AnimatePresence>
  );
};

export default SSRAccessDrawer;
