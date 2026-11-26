"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ClipboardList, HandCoins, KeyRound, LineChart, MapPin } from "lucide-react";

// « Comment un kit gratuit arrive jusqu'à vous » (26/11/2026) : le circuit réel d'une campagne
// (espace sponsor, création par l'équipe, demande du jeune, retrait par code, suivi en temps réel).
// La ligne se trace au défilement. Aucun chiffre.
const MDiv = motion.div as unknown as React.FC<any>;
const MLi = motion.li as unknown as React.FC<any>;
const ease = [0.22, 1, 0.36, 1];

const NODES = [
    { icon: HandCoins, title: "Un sponsor finance", text: "Une entreprise ou une organisation décrit sa campagne : villes, dates, nombre de kits." },
    { icon: ClipboardList, title: "La campagne est créée", text: "L’équipe E.doto family étudie la demande, puis ouvre la campagne sur la plateforme." },
    { icon: MapPin, title: "Vous demandez votre kit", text: "Vous choisissez le point de retrait le plus proche. Une seule demande par personne et par campagne." },
    { icon: KeyRound, title: "Vous le retirez", text: "Le point de retrait vous remet votre kit contre votre code, en toute discrétion." },
    { icon: LineChart, title: "Le sponsor voit l’impact", text: "Chaque retrait apparaît en temps réel dans son espace, jusqu’à l’export final des données." },
];

export default function CircuitKit() {
    const ref = useRef<HTMLDivElement>(null);
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
    const line = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0, 1]);

    return (
        <section className="bg-[#F7EFEA]" aria-labelledby="circuit-title">
            <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-36">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
                    <MDiv initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease }}>
                        <p className="text-[14px] text-[#8A827A]">Kits gratuits</p>
                        <h2 id="circuit-title" className="mt-3 text-[44px] font-normal leading-[1.02] tracking-[-0.04em] text-[#161412] sm:text-[60px]">
                            Comment un kit gratuit arrive jusqu’à vous
                        </h2>
                    </MDiv>
                    <MDiv initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.1, ease }}>
                        <p className="text-[16px] leading-[1.8] text-[#6B645D]">
                            Chaque kit suit un circuit traçable, du financement jusqu’à vos mains. Le sponsor sait ce qui a réellement été remis.
                        </p>
                    </MDiv>
                </div>

                <div ref={ref} className="relative mt-20">
                    {/* Ligne : horizontale sur ordinateur, verticale sur téléphone */}
                    <div aria-hidden className="absolute left-0 right-0 top-[27px] hidden h-px bg-[#E2D6CC] lg:block">
                        <MDiv className="h-full origin-left bg-[#C2185B]" style={{ scaleX: line }} />
                    </div>
                    <div aria-hidden className="absolute bottom-0 left-[27px] top-0 w-px bg-[#E2D6CC] lg:hidden">
                        <MDiv className="w-full origin-top bg-[#C2185B]" style={{ scaleY: line, height: "100%" }} />
                    </div>

                    <ol className="relative grid gap-12 lg:grid-cols-5 lg:gap-8">
                        {NODES.map((n, i) => (
                            <MLi key={n.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
                                transition={{ duration: 0.8, delay: i * 0.08, ease }}
                                className="grid grid-cols-[56px_minmax(0,1fr)] gap-5 lg:block">
                                <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-[#E2D6CC] bg-white text-[#C2185B]">
                                    <n.icon size={22} strokeWidth={1.5} />
                                </span>
                                <div className="lg:mt-7">
                                    <h3 className="text-[21px] font-normal leading-[1.25] tracking-[-0.01em] text-[#161412]">{n.title}</h3>
                                    <p className="mt-2.5 text-[14.5px] leading-[1.7] text-[#6B645D]">{n.text}</p>
                                </div>
                            </MLi>
                        ))}
                    </ol>
                </div>

                <div className="mt-16 flex flex-col gap-3 sm:flex-row">
                    <Link href="/campaigns" className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#1A1814] px-7 py-4 text-[15px] font-medium text-white transition-colors hover:bg-[#C2185B]">
                        Voir les campagnes en cours <ArrowUpRight size={16} className="transition-transform group-hover:rotate-45" />
                    </Link>
                    <Link href="/sponsor/inscription" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1A1814]/80 px-7 py-4 text-[15px] font-medium text-[#161412] transition-colors hover:border-[#C2185B] hover:text-[#C2185B]">
                        Financer une campagne
                    </Link>
                </div>
            </div>
        </section>
    );
}
