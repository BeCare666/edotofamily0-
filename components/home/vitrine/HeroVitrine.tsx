"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CalendarHeart, Gift, KeyRound, MessageCircleHeart } from "lucide-react";
import portrait from "../../../public/images/site/contraception-detail.jpg";
import amies from "../../../public/images/site/contraception-dashboard.jpg";

// Hero de la vitrine (26/11/2026). L'ancien hero « De la première question à la prise en charge » est conservé
// tel quel dans components/Hero.tsx pour un usage ultérieur.
// Photos : uniquement celles-ci sur la page d'accueil (aucune photo répétée).
// Lignes du titre qui montent une à une, photos à vitesses différentes au défilement, deux étiquettes
// qui décrivent des fonctions réelles de la plateforme. Mouvements coupés si l'appareil demande moins d'animations.
const MDiv = motion.div as unknown as React.FC<any>;
const MSpan = motion.span as unknown as React.FC<any>;
const ease = [0.22, 1, 0.36, 1];

const LINES = ["Votre santé intime", "mérite un vrai", "parcours."];

const FACTS = [
    { icon: MessageCircleHeart, text: "Questions anonymes, à toute heure" },
    { icon: CalendarHeart, text: "Médecins en visio ou par appel" },
    { icon: KeyRound, text: "Retrait près de chez vous, avec un code" },
];

export default function HeroVitrine() {
    const router = useRouter();
    const ref = useRef<HTMLElement>(null);
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const yBig = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
    const ySmall = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -150]);
    const yChip = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -220]);

    const openAccess = () => window.dispatchEvent(new Event("edoto:open-access"));

    return (
        <section ref={ref} className="relative overflow-hidden bg-[#FCFAF8]">
            <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-14 px-5 pb-24 pt-8 sm:px-8 lg:min-h-[calc(100vh-76px)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10 lg:pb-20 lg:pt-6">
                {/* Texte */}
                <div className="relative z-10">
                    <MDiv initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}
                        className="inline-flex items-center gap-2.5 rounded-full border border-[#EADFD7] bg-white px-4 py-2 text-[13px] text-[#6B645D]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#C2185B]" />
                        Santé sexuelle et reproductive des jeunes, au Bénin
                    </MDiv>

                    <h1 className="mt-7 [text-wrap:balance] text-[38px] font-normal leading-[1.02] tracking-[-0.045em] text-[#161412] sm:text-[64px] lg:text-[58px] xl:text-[74px]">
                        {LINES.map((l, i) => (
                            <span key={l} className="block overflow-hidden pb-[0.08em]">
                                <MSpan className={`block ${i === 2 ? "text-[#B8336A]" : ""}`}
                                    initial={{ y: reduce ? 0 : "105%" }} animate={{ y: 0 }}
                                    transition={{ duration: 1.1, delay: 0.15 + i * 0.12, ease }}>
                                    {l}
                                </MSpan>
                            </span>
                        ))}
                    </h1>

                    <MDiv initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.55, ease }}>
                        <p className="mt-8 max-w-xl text-[17px] leading-[1.8] text-[#6B645D]">
                            Information fiable, médecins, centres de santé partenaires, kits gratuits et points de retrait de quartier : E.doto family réunit tout un réseau autour de vous, en toute confidentialité.
                        </p>

                        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                            <button type="button" onClick={openAccess}
                                className="group inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-[#1A1814] px-7 py-4 xl:px-8 text-[15px] font-medium text-white transition-colors duration-300 hover:bg-[#C2185B]">
                                Commencer mon parcours
                                <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
                            </button>
                            <button type="button" onClick={() => router.push("/campaigns")}
                                className="inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full border border-[#E2D8CF] bg-white px-7 py-4 xl:px-8 text-[15px] font-medium text-[#161412] transition-colors duration-300 hover:border-[#C2185B] hover:text-[#C2185B]">
                                <Gift size={17} strokeWidth={1.7} />
                                Kits gratuits près de moi
                            </button>
                        </div>

                        <ul className="mt-12 grid gap-3 border-t border-[#ECE6E0] pt-7 sm:grid-cols-3 sm:gap-5">
                            {FACTS.map((f) => (
                                <li key={f.text} className="flex items-start gap-3 text-[13.5px] leading-snug text-[#57524B]">
                                    <f.icon size={18} strokeWidth={1.6} className="mt-px shrink-0 text-[#C2185B]" />
                                    {f.text}
                                </li>
                            ))}
                        </ul>
                    </MDiv>
                </div>

                {/* Composition photo */}
                <div className="relative mx-auto h-[520px] w-full max-w-[520px] sm:h-[600px] lg:h-[640px]">
                    <MDiv style={{ y: yBig }} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.4, delay: 0.2, ease }}
                        className="absolute right-0 top-0 h-[82%] w-[76%] overflow-hidden rounded-[32px] bg-[#F1ECE6]">
                        <Image src={portrait} alt="" fill priority placeholder="blur" sizes="(min-width: 1024px) 34vw, 76vw" className="object-cover object-[50%_20%]" />
                    </MDiv>

                    <MDiv style={{ y: ySmall }} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 0.45, ease }}
                        className="absolute bottom-0 left-0 h-[40%] w-[58%] overflow-hidden rounded-[26px] border-[6px] border-[#FCFAF8] bg-[#F1ECE6]">
                        <Image src={amies} alt="" fill placeholder="blur" sizes="(min-width: 1024px) 26vw, 58vw" className="object-cover object-[45%_35%]" />
                    </MDiv>

                    {/* Étiquettes : fonctions réelles de la plateforme */}
                    <MDiv style={{ y: yChip }} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.9, delay: 0.9, ease }}
                        className="absolute left-0 top-[4%] hidden w-[230px] sm:block rounded-2xl border border-[#EFE7E0] bg-white p-4 shadow-[0_24px_50px_-30px_rgba(26,24,20,0.45)]">
                        <p className="flex items-center gap-2 text-[12px] font-medium text-[#C2185B]"><MessageCircleHeart size={15} /> Assistant SSR</p>
                        <p className="mt-1.5 text-[14px] leading-snug text-[#161412]">Une réponse anonyme et confidentielle, à toute heure.</p>
                    </MDiv>

                    <MDiv initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 1.05, ease }}
                        className="absolute bottom-[3%] right-0 w-[200px] sm:bottom-[30%] sm:right-[-4%] sm:w-[210px] rounded-2xl border border-[#EFE7E0] bg-white p-4 shadow-[0_24px_50px_-30px_rgba(26,24,20,0.45)] ">
                        <p className="flex items-center gap-2 text-[12px] font-medium text-[#C2185B]"><KeyRound size={15} /> Point de retrait</p>
                        <p className="mt-1.5 text-[14px] leading-snug text-[#161412]">Votre kit vous attend, il suffit de votre code.</p>
                    </MDiv>
                </div>
            </div>
        </section>
    );
}
