"use client";

import React from "react";
import Image from "next/image";
import Reveal, { PhotoFrame, photoClass } from "./home/Reveal";
import mainsPhoto from "../public/images/pil-.png";

// Refonte du 06/10/2026 : titre et photo à gauche, raisons numérotées en grand à droite.
// Textes revus le 26/11/2026 (repositionnement écosystème).
export default function PourquoiEDoto() {
    // Recentré le 26/11/2026 sur des engagements réels de la plateforme (avant : six « Pour… »).
    const items = [
        "Sans jugement : vos questions restent anonymes.",
        "Confidentiel : vos données de santé sont chiffrées et rien n’est gardé sur votre téléphone.",
        "Proche : un point de retrait dans votre quartier, une consultation sans vous déplacer.",
        "Encadré : contraceptifs présentés d’après le manuel de l’OMS, consultations assurées par des médecins.",
        "Gratuit quand c’est possible : des kits financés par des sponsors, dont chaque remise est suivie.",
    ];

    return (
        <section className="bg-white">
            <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24 lg:py-36">
                <div className="lg:sticky lg:top-28 lg:self-start">
                    <Reveal>
                        <h2 className="text-[44px] font-normal leading-[1.02] tracking-[-0.04em] text-[#161412] sm:text-[64px]">
                            Nos engagements
                        </h2>
                        <p className="mt-7 max-w-md text-[16px] leading-[1.8] text-[#6B645D]">
                            Ce que E.doto family garantit à chaque jeune, à chaque étape de son parcours.
                        </p>
                    </Reveal>
                    <Reveal delay={0.15} className="mt-12">
                        <PhotoFrame className="aspect-[16/11]">
                            <Image src={mainsPhoto} alt="" fill placeholder="blur" sizes="(min-width: 1024px) 38vw, 100vw" className={photoClass} />
                        </PhotoFrame>
                    </Reveal>
                </div>

                <ol>
                    {items.map((txt, i) => (
                        <li key={txt}>
                            <Reveal delay={i * 0.05} y={18}>
                                <div className="group grid grid-cols-[3.5rem_minmax(0,1fr)] items-baseline gap-5 border-t border-[#ECE6E0] py-9 sm:grid-cols-[5rem_minmax(0,1fr)]">
                                    <span className="text-[15px] font-normal tabular-nums tracking-[0.15em] text-[#B5AEA6] transition-colors duration-500 group-hover:text-[#D6457F]">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <p className="text-[21px] font-normal leading-[1.4] tracking-[-0.01em] text-[#161412] transition-transform duration-500 group-hover:translate-x-1 sm:text-[27px]">{txt}</p>
                                </div>
                            </Reveal>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
