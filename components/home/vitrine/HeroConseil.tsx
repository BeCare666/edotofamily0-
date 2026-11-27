"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarHeart, MessageCircleHeart, Video } from "lucide-react";
import { useChatAI } from "../../../context/ChatAIContext";
import conseillere from "../../../public/icons/conseiller.jpg";
import jeunes from "../../../public/images/campagnes_uac.png";

// Hero « Des questions sur la contraception ? » (27/11/2026), composition reprise de l'affiche fournie par
// l'utilisateur (rapports/Lydia-Conseil.jpg) et adaptée à E.doto family : bandeau de couleur avec la question,
// grand portrait d'une professionnelle de santé à droite (= la téléconsultation SSR, comme la ligne d'écoute de l'affiche), jeunes à gauche, icônes des méthodes contraceptives
// dans des cercles blancs, pastille ronde. Ni photo ni texte de l'affiche d'origine : photos du site,
// couleurs (magenta, ivoire) et police de E.doto family, services réels (Assistant SSR, téléconsultation).
const MDiv = motion.div as unknown as React.FC<any>;
const ease = [0.16, 1, 0.3, 1];

// Icônes au trait des méthodes présentées sur le site (fiches contraception)
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const ICONS: { label: string; svg: React.ReactNode }[] = [
    { label: "Pilule", svg: (<svg viewBox="0 0 32 32" {...stroke}><rect x="5" y="9" width="22" height="14" rx="3" /><circle cx="11" cy="14" r="1.6" /><circle cx="16" cy="14" r="1.6" /><circle cx="21" cy="14" r="1.6" /><circle cx="11" cy="19" r="1.6" /><circle cx="16" cy="19" r="1.6" /><circle cx="21" cy="19" r="1.6" /></svg>) },
    { label: "Injectable", svg: (<svg viewBox="0 0 32 32" {...stroke}><path d="M16 3v4M12 7h8M13 7v14a3 3 0 0 0 6 0V7M16 24v5M13 12h3M13 16h3" /></svg>) },
    { label: "Préservatif", svg: (<svg viewBox="0 0 32 32" {...stroke}><path d="M11 27h10M12 27V12a4 4 0 0 1 8 0v15" /><path d="M14.5 9.5a1.5 1.5 0 0 1 3 0" /></svg>) },
    { label: "DIU", svg: (<svg viewBox="0 0 32 32" {...stroke}><path d="M16 9v15M16 24c0 2 -1 3 -2 4" /><path d="M7 11c3 -2 6 -2 9 -2s6 0 9 2" /><circle cx="7" cy="11.5" r="1" /><circle cx="25" cy="11.5" r="1" /></svg>) },
    { label: "Implant", svg: (<svg viewBox="0 0 32 32" {...stroke}><path d="M6 21c6 -2 14 -8 20 -12" /><rect x="11" y="13" width="11" height="3.4" rx="1.7" transform="rotate(-28 16.5 14.7)" /></svg>) },
];

// Positions des cercles en arc au-dessus de la photo des jeunes (ordinateur)
const SPOTS = [
    { left: "3%", top: "104px" },
    { left: "19%", top: "40px" },
    { left: "40%", top: "8px" },
    { left: "61%", top: "40px" },
    { left: "77%", top: "104px" },
];

export default function HeroConseil() {
    const reduce = useReducedMotion();
    const { openChoice, openBooking } = useChatAI() as { openChoice: () => void; openBooking: (ctx?: unknown) => void };

    return (
        <section className="relative overflow-hidden bg-[#F7EEF1]" aria-labelledby="hero-title">
            {/* Bandeau de la question */}
            <div className="relative bg-[#B8336A] text-white">
                <div className="mx-auto max-w-7xl px-5 pb-28 pt-12 text-center sm:px-8 sm:pb-32 lg:pb-40 lg:pt-14">
                    <MDiv initial={{ opacity: 0, y: reduce ? 0 : 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease }}>
                        <h1 id="hero-title" className="mx-auto max-w-4xl text-[38px] font-light leading-[1.04] tracking-[-0.045em] [text-wrap:balance] sm:text-[58px] lg:text-[72px]">
                            Des questions sur la contraception ?
                        </h1>
                        <p className="mt-4 text-[17px] font-medium text-white/90 sm:text-[21px]">
                            Posez-les à E.doto family, en toute discrétion.
                        </p>
                    </MDiv>
                    <MDiv className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
                        initial={{ opacity: 0, y: reduce ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.25, ease }}>
                        <button type="button" onClick={openChoice}
                            className="inline-flex h-14 w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-white px-8 text-[15px] font-medium text-[#14110F] transition-colors duration-300 hover:bg-[#FBEEF3] sm:w-auto">
                            <MessageCircleHeart size={18} strokeWidth={1.7} className="text-[#B8336A]" />
                            Poser ma question
                        </button>
                        <button type="button" onClick={() => openBooking()}
                            className="inline-flex h-14 w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-full border border-white/60 px-8 text-[15px] font-medium text-white transition-colors duration-300 hover:bg-white/10 sm:w-auto">
                            <CalendarHeart size={18} strokeWidth={1.7} />
                            Parler à un médecin
                        </button>
                    </MDiv>
                </div>
            </div>

            {/* Scène : jeunes et méthodes à gauche, professionnelle de santé à droite */}
            <div className="relative mx-auto -mt-20 max-w-7xl px-5 pb-16 sm:-mt-24 sm:px-8 lg:-mt-28 lg:pb-20">
                <div className="grid grid-cols-[minmax(0,1fr)] items-end gap-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-10">
                    {/* Portrait (premier sur téléphone) */}
                    <MDiv className="relative order-1 mx-auto w-full max-w-[460px] lg:order-2 lg:max-w-none"
                        initial={{ opacity: 0, y: reduce ? 0 : 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.3, delay: 0.2, ease }}>
                        <div className="relative aspect-[4/5] overflow-hidden rounded-t-[220px] rounded-b-[32px] border-[6px] border-white bg-[#EDE3DA] shadow-[0_40px_80px_-50px_rgba(20,17,15,0.55)]">
                            <Image src={conseillere} alt="Médecin de la téléconsultation E.doto family" fill priority placeholder="blur" sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover object-[50%_18%]" />
                            {/* La conseillère = la téléconsultation SSR (comme la ligne d'écoute de l'affiche) */}
                            <button type="button" onClick={() => openBooking()}
                                className="group absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-[20px] bg-white/95 p-3 pr-4 text-left backdrop-blur-sm transition-colors hover:bg-white sm:inset-x-5 sm:bottom-5">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#B8336A] text-white"><Video size={19} strokeWidth={1.7} /></span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-[14.5px] font-medium leading-snug text-[#14110F]">Un médecin vous répond</span>
                                    <span className="block text-[12.5px] leading-snug text-[#7A7067]">En visio ou par appel, sur rendez-vous</span>
                                </span>
                                <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-[#14110F] px-3.5 py-2 text-[12.5px] font-medium text-white transition-colors group-hover:bg-[#B8336A] sm:inline-flex">
                                    Prendre rendez-vous <ArrowRight size={14} />
                                </span>
                            </button>
                        </div>
                        <MDiv className="absolute right-2 top-[18%] flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#B8336A] text-center text-white shadow-[0_20px_40px_-20px_rgba(184,51,106,0.8)] sm:-right-4 sm:h-32 sm:w-32"
                            initial={{ scale: reduce ? 1 : 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, delay: 1.1, ease }}>
                            <span className="text-[13px] font-semibold leading-tight sm:text-[14px]">Téléconsultation</span>
                            <span className="mt-0.5 text-[20px] font-light leading-none sm:text-[22px]">SSR</span>
                        </MDiv>
                    </MDiv>

                    {/* Jeunes + icônes des méthodes */}
                    <div className="relative order-2 lg:order-1 lg:min-h-[520px]">
                        {/* Icônes : en arc sur ordinateur, en rangée sur téléphone */}
                        <div className="mb-6 flex justify-center gap-3 lg:mb-0 lg:block">
                            {ICONS.map((ic, i) => (
                                <MDiv key={ic.label} title={ic.label} aria-label={ic.label}
                                    className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#B8336A] shadow-[0_14px_30px_-18px_rgba(20,17,15,0.5)] sm:h-16 sm:w-16 lg:absolute lg:left-[var(--l)] lg:top-[var(--t)] lg:h-[74px] lg:w-[74px]"
                                    style={{ ["--l" as any]: SPOTS[i].left, ["--t" as any]: SPOTS[i].top }}
                                    initial={{ opacity: 0, scale: reduce ? 1 : 0.5 }}
                                    animate={reduce ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, -7, 0] }}
                                    transition={reduce ? { duration: 0.4 } : { opacity: { duration: 0.6, delay: 0.6 + i * 0.1 }, scale: { duration: 0.6, delay: 0.6 + i * 0.1 }, y: { duration: 4 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: 1.4 + i * 0.2 } }}>
                                    <span className="block h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9">{ic.svg}</span>
                                </MDiv>
                            ))}
                        </div>

                        <MDiv className="relative mx-auto w-full max-w-[560px] lg:absolute lg:bottom-0 lg:left-0 lg:right-6 lg:max-w-none"
                            initial={{ opacity: 0, y: reduce ? 0 : 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.45, ease }}>
                            <div className="relative aspect-[16/10] overflow-hidden rounded-[30px] border-[6px] border-white bg-[#EDE3DA] shadow-[0_40px_80px_-55px_rgba(20,17,15,0.55)]">
                                <Image src={jeunes} alt="Jeunes recevant un kit de santé sexuelle et reproductive" fill placeholder="blur" sizes="(min-width: 1024px) 50vw, 90vw" className="object-cover object-[35%_45%]" />
                            </div>
                        </MDiv>
                    </div>
                </div>
            </div>
        </section>
    );
}
