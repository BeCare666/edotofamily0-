"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, CalendarHeart, Gift, MessageCircleHeart, ShoppingBag } from "lucide-react";
import { useChatAI } from "../../../context/ChatAIContext";
import portrait from "../../../public/images/campagnes_uac.png";

// Hero de la vitrine, version éditoriale (26/11/2026, deuxième version à la demande de l'utilisateur :
// « un truc de haut gamme »). Retirés : étiquettes flottantes, collage de deux photos, pastille.
// Composition : texte à gauche, une seule photo pleine hauteur collée au bord droit de l'écran,
// qui se dévoile de bas en haut puis se pose lentement. Mouvements coupés si l'appareil le demande.
// L'ancien hero « De la première question à la prise en charge » reste dans components/Hero.tsx.
// 27/11/2026 : photo de distribution de kits (jugée plus sérieuse), boutons de même hauteur, services en bloc 2 × 2.
const MDiv = motion.div as unknown as React.FC<any>;
const MSpan = motion.span as unknown as React.FC<any>;
const ease = [0.16, 1, 0.3, 1];

const LINES = ["Votre santé", "intime mérite", "un vrai parcours."];

// Quatre portes d'entrée réelles de la plateforme (27/11/2026 : bloc premium à la place de la simple liste)
type Service = { icon: React.ElementType; title: string; text: string; go: "assistant" | "booking" | "kits" | "shop" };
const SERVICES: Service[] = [
    { icon: MessageCircleHeart, title: "Assistant SSR", text: "Réponses anonymes, à toute heure", go: "assistant" },
    { icon: CalendarHeart, title: "Téléconsultation", text: "Un médecin en visio ou par appel", go: "booking" },
    { icon: Gift, title: "Kits gratuits", text: "Offerts par nos sponsors", go: "kits" },
    { icon: ShoppingBag, title: "Boutique discrète", text: "Retrait avec un code, près de chez vous", go: "shop" },
];

export default function HeroVitrine() {
    const router = useRouter();
    const ref = useRef<HTMLElement>(null);
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const imgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "12%"]);
    const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);

    const { openChoice, openBooking } = useChatAI() as { openChoice: () => void; openBooking: (ctx?: unknown) => void };
    const openAccess = () => window.dispatchEvent(new Event("edoto:open-access"));
    const go = (g: Service["go"]) => {
        if (g === "assistant") openChoice();
        else if (g === "booking") openBooking();
        else if (g === "kits") router.push("/campaigns");
        else router.push("/category/categories_id=all");
    };

    return (
        <section ref={ref} className="relative overflow-hidden bg-[#F8F4EF]">
            <div className="lg:min-h-[calc(100vh-76px)]">
                {/* Photo : pleine largeur sur téléphone, moitié droite pleine hauteur sur ordinateur */}
                <MDiv
                    className="relative h-[62vh] min-h-[420px] w-full overflow-hidden lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[46%]"
                    initial={{ clipPath: reduce ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)" }}
                    animate={{ clipPath: "inset(0% 0 0 0)" }}
                    transition={{ duration: 1.6, ease, delay: 0.1 }}
                >
                    <MDiv className="absolute inset-x-0 -inset-y-[6%]" style={{ y: imgY }}
                        initial={{ scale: reduce ? 1 : 1.18 }} animate={{ scale: 1 }} transition={{ duration: 2.6, ease, delay: 0.1 }}>
                        <Image src={portrait} alt="" fill priority placeholder="blur" sizes="(min-width: 1024px) 46vw, 100vw" className="object-cover object-[28%_50%]" />
                    </MDiv>
                </MDiv>

                {/* Texte */}
                <MDiv style={{ y: textY }} className="relative mx-auto flex max-w-7xl flex-col justify-center px-5 pb-20 pt-14 sm:px-8 lg:min-h-[calc(100vh-76px)] lg:py-20">
                    <div className="lg:max-w-[52%] lg:pr-12">
                        <MDiv className="flex items-center gap-4 text-[13px] tracking-[0.02em] text-[#7A7067]"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.5 }}>
                            <MSpan aria-hidden className="block h-px w-12 shrink-0 origin-left bg-[#C2185B]"
                                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2, ease, delay: 0.6 }} />
                            Santé sexuelle et reproductive des jeunes, au Bénin
                        </MDiv>

                        <h1 className="mt-9 text-[46px] font-light leading-[0.98] tracking-[-0.055em] text-[#14110F] sm:text-[72px] lg:text-[76px] xl:text-[92px]">
                            {LINES.map((l, i) => (
                                <span key={l} className="block overflow-hidden pb-[0.1em]">
                                    <MSpan className="block" initial={{ y: reduce ? 0 : "110%" }} animate={{ y: 0 }}
                                        transition={{ duration: 1.3, delay: 0.35 + i * 0.13, ease }}>
                                        {i === 2 ? <>un vrai <span className="text-[#B8336A]">parcours.</span></> : l}
                                    </MSpan>
                                </span>
                            ))}
                        </h1>

                        <MDiv initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.95, ease }}>
                            <p className="mt-10 max-w-[30rem] text-[17px] leading-[1.85] text-[#5F574F]">
                                Information fiable, médecins, centres de santé partenaires, kits gratuits et points de retrait de quartier : E.doto family réunit tout un réseau autour de vous, en toute confidentialité.
                            </p>

                            {/* Deux boutons de même hauteur, alignés (27/11/2026) */}
                            <div className="mt-11 grid grid-cols-1 gap-3 sm:flex sm:items-center">
                                <button type="button" onClick={openAccess}
                                    className="group inline-flex h-14 items-center justify-between gap-4 whitespace-nowrap rounded-full bg-[#14110F] pl-7 pr-2 text-[15px] font-medium text-white transition-colors duration-500 hover:bg-[#B8336A] sm:justify-start">
                                    Commencer mon parcours
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#14110F] transition-transform duration-500 group-hover:translate-x-0.5">
                                        <ArrowRight size={17} />
                                    </span>
                                </button>
                                <button type="button" onClick={() => router.push("/campaigns")}
                                    className="group inline-flex h-14 items-center justify-center gap-2.5 whitespace-nowrap rounded-full border border-[#14110F]/15 bg-white px-7 text-[15px] font-medium text-[#14110F] transition-colors duration-500 hover:border-[#B8336A] hover:text-[#B8336A]">
                                    <Gift size={17} strokeWidth={1.6} className="text-[#B8336A]" />
                                    Kits gratuits près de moi
                                </button>
                            </div>
                        </MDiv>

                        {/* Portes d'entrée : bloc premium 2 × 2, chaque case ouvre la fonction réelle */}
                        <MDiv className="mt-14 grid grid-cols-1 overflow-hidden rounded-[24px] border border-[#E6DCD2] bg-white sm:grid-cols-2"
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 1.2, ease }}>
                            {SERVICES.map((sv, i) => (
                                <button key={sv.title} type="button" onClick={() => go(sv.go)}
                                    className={`group flex items-center gap-4 px-5 py-5 text-left transition-colors duration-300 hover:bg-[#FBF5F1]
                                        ${i % 2 === 0 ? "sm:border-r" : ""} ${i < 2 ? "border-b" : i === 2 ? "border-b sm:border-b-0" : ""} border-[#EEE5DC]`}>
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FBEEF3] text-[#B8336A] transition-colors duration-300 group-hover:bg-[#B8336A] group-hover:text-white">
                                        <sv.icon size={19} strokeWidth={1.6} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-[15px] font-medium text-[#14110F]">{sv.title}</span>
                                        <span className="mt-0.5 block text-[13px] leading-snug text-[#8A8077]">{sv.text}</span>
                                    </span>
                                    <ArrowUpRight size={16} className="shrink-0 text-[#C9BDB1] transition-all duration-300 group-hover:rotate-45 group-hover:text-[#B8336A]" />
                                </button>
                            ))}
                        </MDiv>
                    </div>
                </MDiv>
            </div>
        </section>
    );
}
