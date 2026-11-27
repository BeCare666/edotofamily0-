"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight, CalendarHeart, Gift, MessageCircleHeart, ShoppingBag } from "lucide-react";
import { useChatAI } from "../../../context/ChatAIContext";

// Bande des quatre portes d'entrée sous le hero (27/11/2026) : mêmes services que le bloc 2 × 2 du hero
// précédent, chaque case ouvre la fonction réelle.
const MDiv = motion.div as unknown as React.FC<any>;
const ease = [0.22, 1, 0.36, 1];

type Go = "assistant" | "booking" | "kits" | "shop";
const SERVICES: { icon: React.ElementType; title: string; text: string; go: Go }[] = [
    { icon: MessageCircleHeart, title: "Assistant SSR", text: "Réponses anonymes, à toute heure", go: "assistant" },
    { icon: CalendarHeart, title: "Téléconsultation", text: "Un médecin en visio ou par appel", go: "booking" },
    { icon: Gift, title: "Kits gratuits", text: "Offerts par nos sponsors", go: "kits" },
    { icon: ShoppingBag, title: "Boutique discrète", text: "Retrait avec un code, près de chez vous", go: "shop" },
];

export default function ServicesBande() {
    const router = useRouter();
    const { openChoice, openBooking } = useChatAI() as { openChoice: () => void; openBooking: (ctx?: unknown) => void };
    const go = (g: Go) => {
        if (g === "assistant") openChoice();
        else if (g === "booking") openBooking();
        else if (g === "kits") router.push("/campaigns");
        else router.push("/category/categories_id=all");
    };

    return (
        <section className="bg-[#F7EEF1] pb-20 lg:pb-28" aria-label="Nos services">
            <MDiv initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease }}
                className="mx-auto grid max-w-7xl grid-cols-1 overflow-hidden rounded-[28px] border border-[#EADCE2] bg-white sm:grid-cols-2 lg:grid-cols-4 mx-5 sm:mx-8 xl:mx-auto">
                {SERVICES.map((sv, i) => (
                    <button key={sv.title} type="button" onClick={() => go(sv.go)}
                        className={`group flex items-center gap-4 border-[#F0E6EA] px-6 py-6 text-left transition-colors duration-300 hover:bg-[#FBF5F7]
                            ${i < 3 ? "border-b lg:border-b-0 lg:border-r" : ""} ${i === 2 ? "sm:border-b-0" : ""} ${i % 2 === 0 ? "sm:border-r" : ""} ${i === 1 ? "sm:border-b" : ""}`}>
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FBEEF3] text-[#B8336A] transition-colors duration-300 group-hover:bg-[#B8336A] group-hover:text-white">
                            <sv.icon size={20} strokeWidth={1.6} />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-[15.5px] font-medium text-[#14110F]">{sv.title}</span>
                            <span className="mt-0.5 block text-[13px] leading-snug text-[#8A8077]">{sv.text}</span>
                        </span>
                        <ArrowUpRight size={16} className="shrink-0 text-[#C9BDB1] transition-all duration-300 group-hover:rotate-45 group-hover:text-[#B8336A]" />
                    </button>
                ))}
            </MDiv>
        </section>
    );
}
