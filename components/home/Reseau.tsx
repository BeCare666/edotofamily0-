"use client";

import React from "react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowUpRight, HeartHandshake } from "lucide-react";
import Reveal, { PhotoFrame, photoClass } from "./Reveal";
import medecinPhoto from "../../public/images/site/services.jpg";
import centrePhoto from "../../public/images/site/contraception-hero.jpg";
import pointPhoto from "../../public/images/site/drawer-kits.jpg";

// « Un réseau, pas seulement une application » (26/11/2026) : les acteurs qui existent déjà dans la
// plateforme (espaces /medecin, /centre, /pickup-dashboard, /sponsor) et la façon de les rejoindre.
// Médecins et centres : comptes créés par l'équipe, d'où le renvoi vers la page Contact.
type Actor = { title: string; text: string; photo: StaticImageData; position?: string; link: { label: string; href: string } };

const ACTORS: Actor[] = [
    {
        title: "Médecins",
        text: "Ils vous reçoivent en téléconsultation et transmettent leurs consignes au centre de santé.",
        photo: medecinPhoto,
        position: "object-[55%_40%]",
        link: { label: "Professionnel de santé", href: "/contact" },
    },
    {
        title: "Centres de santé partenaires",
        text: "Ils vous accueillent avec votre dossier, prêt avant votre arrivée.",
        photo: centrePhoto,
        position: "object-[30%_40%]",
        link: { label: "Rejoindre le réseau", href: "/contact" },
    },
    {
        title: "Points de retrait",
        text: "Des commerces de quartier qui vous remettent kits et produits, avec un simple code.",
        photo: pointPhoto,
        link: { label: "Devenir point de retrait", href: "/devenir-point-de-retrait" },
    },
];

export default function Reseau() {
    return (
        <section className="bg-white" aria-labelledby="reseau-title">
            <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-36">
                <Reveal>
                    <h2 id="reseau-title" className="max-w-3xl text-[44px] font-normal leading-[1.02] tracking-[-0.04em] text-[#161412] sm:text-[64px]">
                        Un réseau, pas seulement une application
                    </h2>
                    <p className="mt-7 max-w-2xl text-[16px] leading-[1.8] text-[#6B645D]">
                        Derrière E.doto family, des personnes et des lieux de confiance travaillent ensemble. Chacun a son propre espace sur la plateforme.
                    </p>
                </Reveal>

                <div className="mt-16 grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
                    {ACTORS.map((a, i) => (
                        <Reveal key={a.title} delay={i * 0.08}>
                            <PhotoFrame className="aspect-[4/5]">
                                <Image src={a.photo} alt="" fill placeholder="blur" sizes="(min-width: 1024px) 23vw, (min-width: 640px) 46vw, 100vw" className={`${photoClass} ${a.position || ""}`} />
                            </PhotoFrame>
                            <h3 className="mt-6 text-[22px] font-normal leading-[1.25] tracking-[-0.01em] text-[#161412]">{a.title}</h3>
                            <p className="mt-2.5 text-[15px] leading-[1.7] text-[#6B645D]">{a.text}</p>
                            <Link href={a.link.href} className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-[#161412] transition hover:text-[#C2185B]">
                                {a.link.label} <ArrowUpRight size={15} />
                            </Link>
                        </Reveal>
                    ))}

                    {/* Sponsors : panneau typographique (aucune photo inventée) */}
                    <Reveal delay={0.24}>
                        <div className="flex aspect-[4/5] flex-col justify-between rounded-[28px] bg-[#F7E9EE] p-7">
                            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D6457F]/30 text-[#B8336A]">
                                <HeartHandshake size={18} strokeWidth={1.5} />
                            </span>
                            <p className="text-[22px] font-normal leading-[1.3] tracking-[-0.01em] text-[#161412]">
                                Chaque kit remis est enregistré : le sponsor suit sa campagne en temps réel.
                            </p>
                        </div>
                        <h3 className="mt-6 text-[22px] font-normal leading-[1.25] tracking-[-0.01em] text-[#161412]">Sponsors</h3>
                        <p className="mt-2.5 text-[15px] leading-[1.7] text-[#6B645D]">
                            Entreprises et organisations qui financent des kits gratuits et suivent leur impact en temps réel.
                        </p>
                        <Link href="/sponsor/inscription" className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-[#161412] transition hover:text-[#C2185B]">
                            Financer une campagne <ArrowUpRight size={15} />
                        </Link>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
