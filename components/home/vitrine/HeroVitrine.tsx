"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import portrait from "../../../public/images/site/contraception-detail.jpg";

// Hero de la vitrine, version éditoriale (26/11/2026, deuxième version à la demande de l'utilisateur :
// « un truc de haut gamme »). Retirés : étiquettes flottantes, collage de deux photos, pastille.
// Composition : texte à gauche, une seule photo pleine hauteur collée au bord droit de l'écran,
// qui se dévoile de bas en haut puis se pose lentement. Mouvements coupés si l'appareil le demande.
// L'ancien hero « De la première question à la prise en charge » reste dans components/Hero.tsx.
const MDiv = motion.div as unknown as React.FC<any>;
const MSpan = motion.span as unknown as React.FC<any>;
const ease = [0.16, 1, 0.3, 1];

const LINES = ["Votre santé", "intime mérite", "un vrai parcours."];

const SERVICES = ["Assistant SSR", "Téléconsultation", "Centres partenaires", "Kits gratuits", "Points de retrait"];

export default function HeroVitrine() {
    const router = useRouter();
    const ref = useRef<HTMLElement>(null);
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const imgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "12%"]);
    const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);

    const openAccess = () => window.dispatchEvent(new Event("edoto:open-access"));

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
                        <Image src={portrait} alt="" fill priority placeholder="blur" sizes="(min-width: 1024px) 46vw, 100vw" className="object-cover object-[50%_22%]" />
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

                            <div className="mt-11 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-9">
                                <button type="button" onClick={openAccess}
                                    className="group inline-flex items-center gap-3 whitespace-nowrap rounded-full bg-[#14110F] py-[18px] pl-8 pr-6 text-[15px] font-medium text-white transition-colors duration-500 hover:bg-[#B8336A]">
                                    Commencer mon parcours
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-transform duration-500 group-hover:translate-x-1">
                                        <ArrowRight size={16} />
                                    </span>
                                </button>
                                <button type="button" onClick={() => router.push("/campaigns")}
                                    className="group relative whitespace-nowrap text-[15px] font-medium text-[#14110F]">
                                    Kits gratuits près de moi
                                    <span aria-hidden className="absolute -bottom-1.5 left-0 h-px w-full origin-left bg-[#14110F] transition-transform duration-500 group-hover:scale-x-0" />
                                </button>
                            </div>
                        </MDiv>

                        <MDiv className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#E4DBD2] pt-6 text-[12.5px] tracking-[0.02em] text-[#8A8077]"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 1.3 }}>
                            {SERVICES.map((s, i) => (
                                <span key={s} className="flex items-center gap-6">
                                    {s}
                                    {i < SERVICES.length - 1 && <span aria-hidden className="h-1 w-1 rounded-full bg-[#C9BDB1]" />}
                                </span>
                            ))}
                        </MDiv>
                    </div>
                </MDiv>
            </div>
        </section>
    );
}
