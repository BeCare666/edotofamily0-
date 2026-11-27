"use client";

import React from "react";
import { motion } from "framer-motion";
import { EyeOff, Gift, LockKeyhole, MapPin, Stethoscope } from "lucide-react";

// « Nos engagements » (27/11/2026, deuxième version : moins de texte, rendu en cartes).
// Cinq engagements tenus par la plateforme : Assistant anonyme, données de santé chiffrées et rien sur le
// téléphone, points de retrait et téléconsultation, fiches d'après le manuel de l'OMS et médecins,
// kits et produits financés par des sponsors.
const MDiv = motion.div as unknown as React.FC<any>;
const ease = [0.22, 1, 0.36, 1];

const ITEMS = [
    { icon: EyeOff, title: "Sans jugement", text: "Vos questions restent anonymes." },
    { icon: LockKeyhole, title: "Confidentiel", text: "Données de santé chiffrées." },
    { icon: MapPin, title: "Proche de vous", text: "Un point de retrait dans votre quartier." },
    { icon: Stethoscope, title: "Encadré", text: "Manuel de l’OMS et vrais médecins." },
    { icon: Gift, title: "Offert", text: "Kits et produits financés par des sponsors." },
];

export default function Engagements() {
    return (
        <section className="bg-[#F8F4EF]" aria-labelledby="engagements-title">
            <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
                <MDiv initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease }}
                    className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <h2 id="engagements-title" className="text-[44px] font-light leading-[1.02] tracking-[-0.045em] text-[#14110F] sm:text-[60px]">
                        Nos <span className="text-[#B8336A]">engagements</span>
                    </h2>
                    <p className="max-w-sm text-[16px] leading-[1.7] text-[#6B645D]">Ce que E.doto family garantit à chaque jeune, à chaque étape.</p>
                </MDiv>

                <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {ITEMS.map((it, i) => (
                        <MDiv key={it.title} initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.8, delay: i * 0.07, ease }}
                            className="group flex flex-col justify-between gap-10 rounded-[26px] border border-[#ECE2D8] bg-white p-7 transition-[transform,border-color] duration-500 hover:-translate-y-1 hover:border-[#E3C3D1] lg:min-h-[260px]">
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FBEEF3] text-[#B8336A] transition-colors duration-500 group-hover:bg-[#B8336A] group-hover:text-white">
                                <it.icon size={23} strokeWidth={1.5} />
                            </span>
                            <div>
                                <h3 className="text-[22px] font-normal leading-[1.2] tracking-[-0.02em] text-[#14110F]">{it.title}</h3>
                                <p className="mt-2 text-[14.5px] leading-[1.6] text-[#7A7067]">{it.text}</p>
                            </div>
                        </MDiv>
                    ))}
                </div>
            </div>
        </section>
    );
}
