"use client";

import React, { useEffect, useState, useRef } from "react";
import { ShoppingBag, Gift, Sparkles, X, MessageCircleHeart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChatAI } from "../context/ChatAIContext";
const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes en ms

const SSRAccessDrawer = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // « Parler à un conseiller SSR » ouvre le chat IA ; le drawer ne se réaffiche pas par-dessus le chat.
  const { isOpen: chatOpen, openChat } = useChatAI();
  const chatOpenRef = useRef(chatOpen);
  chatOpenRef.current = chatOpen;
  useEffect(() => {
    // Fonction qui ouvre le drawer
    const showDrawer = () => {
      setOpen(true);
    };

    // Affiche au premier chargement.
    showDrawer();

    // Lance un intervalle toutes les 5 minutes
    timerRef.current = setInterval(() => {
      if (!chatOpenRef.current) setOpen(true); // réaffiche
    }, FIVE_MINUTES);

    // Cleanup
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ease-out ${open ? "translate-y-0" : "translate-y-full"
          }`}
      >
        <div className="relative bg-white rounded-t-3xl shadow-2xl border border-slate-100 px-6 pt-6 pb-8">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-300" />

          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 text-slate-500 hover:text-slate-800"
          >
            <X />
          </button>

          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 border border-pink-100 text-pink-600 text-sm font-medium whitespace-nowrap">
              <Sparkles size={16} />
              Accès SSR sécurisé
            </div>
          </div>

          <h2 className="text-center text-xl sm:text-2xl font-bold text-slate-900 mb-6">
            Accès simple, confidentiel et immédiat aux produits SSR
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setOpen(false);
                router.push("/category/categories_id=3");
              }}
              className="group flex items-center gap-4 p-5 rounded-2xl border border-slate-200  hover:border-pink-300 hover:shadow-lg transition-all"
            >
              <div className="p-3 rounded-xl bg-pink-100 text-pink-600">
                <ShoppingBag />
              </div>

              <div className="text-left">
                <p className="font-semibold text-slate-800  ">
                  Visiter nos produits
                </p>
                <p className="text-sm text-slate-500 ">
                  Commandez en toute discrétion
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                setOpen(false);
                router.push("/campaigns");
              }}
              className="group flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-[0_6px_20px_rgba(236,72,153,0.35)] hover:scale-[1.02] transition-all"
            >
              <div className="p-3 rounded-xl bg-white/20">
                <Gift />
              </div>

              <div className="text-left">
                <p className="font-semibold">
                  Bénéficier de kits gratuits
                </p>
                <p className="text-sm text-white/90">
                  Campagnes disponibles près de vous
                </p>
              </div>
            </button>
            <button
              onClick={() => {
                setOpen(false);
                openChat();
              }}
              className="group flex items-center gap-4 p-5 rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all"
            >
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                <MessageCircleHeart size={22} />
              </div>

              <div className="text-left">
                <p className="font-semibold text-slate-800">
                  Poser une question à l'Assistant SSR
                </p>
                <p className="text-sm text-slate-500">
                  Réponses automatiques, anonymes et confidentielles
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SSRAccessDrawer;