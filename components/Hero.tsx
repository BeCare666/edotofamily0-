"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Gift } from "lucide-react";
import { useRouter } from "next/navigation";
import Reveal, { PhotoFrame, photoClass } from "./home/Reveal";
import heroPhoto from "../public/images/campagnes_uac.png";

// Repositionnement écosystème (26/11/2026, rapports/PROPOSITION_ECOSYSTEME_EDOTO_FAMILY.md) :
// le hero présente le parcours complet du jeune, plus seulement l'accès aux produits.
// Avant : « Accès simple, confidentiel et immédiat aux produits SSR », bouton « Visiter nos produits »,
// halos colorés et orbite « Soins, Maternité, Fertilité… ».
// « Commencer mon parcours » ouvre le tiroir d'accès (SSRAccessDrawer) par l'événement edoto:open-access.
export const OPEN_ACCESS_EVENT = "edoto:open-access";

const STEPS = ["Comprendre", "Consulter", "Être orienté", "Obtenir", "Être suivi"];

const Hero: React.FC = () => {
    const router = useRouter();
    const openAccess = () => window.dispatchEvent(new Event(OPEN_ACCESS_EVENT));

    return (
        <section className="bg-white">
            <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-12 px-5 pb-20 pt-6 sm:px-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16 lg:pb-28 lg:pt-10">
                <Reveal>
                    <p className="text-[13px] font-medium text-[#B8336A]">Santé sexuelle et reproductive des jeunes, au Bénin</p>
                    <h1 className="mt-5 text-[38px] font-normal leading-[1.05] tracking-[-0.04em] text-[#161412] sm:text-[56px] lg:text-[64px]">
                        De la première question à la prise en charge, E.doto family vous accompagne.
                    </h1>
                    <p className="mt-7 max-w-xl text-[16px] leading-[1.8] text-[#6B645D]">
                        S’informer, parler à un médecin, être orienté vers un centre de santé, recevoir un kit gratuit ou retirer un produit près de chez vous : tout se fait au même endroit, en toute confidentialité.
                    </p>

                    <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={openAccess}
                            className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#1A1814] px-7 py-4 text-[15px] font-medium text-white transition hover:bg-[#C2185B]"
                        >
                            Commencer mon parcours
                            <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/campaigns")}
                            className="inline-flex items-center justify-center gap-2.5 rounded-full border border-[#E7DFD8] bg-white px-7 py-4 text-[15px] font-medium text-[#161412] transition hover:border-[#C2185B] hover:text-[#C2185B]"
                        >
                            <Gift size={17} strokeWidth={1.7} />
                            Kits gratuits près de moi
                        </button>
                    </div>

                    <ol className="mt-12 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#ECE6E0] pt-6 text-[13px] text-[#8A827A]">
                        {STEPS.map((s, i) => (
                            <li key={s} className="flex items-center gap-2">
                                <span className="tabular-nums text-[#D6457F]">{i + 1}</span>
                                {s}
                            </li>
                        ))}
                    </ol>
                </Reveal>

                <Reveal delay={0.12}>
                    <PhotoFrame className="aspect-[4/5] lg:aspect-[4/5]">
                        <Image src={heroPhoto} alt="" fill priority placeholder="blur" sizes="(min-width: 1024px) 40vw, 100vw" className={`${photoClass} object-[30%_50%]`} />
                    </PhotoFrame>
                </Reveal>
            </div>
        </section>
    );
};

export default Hero;
