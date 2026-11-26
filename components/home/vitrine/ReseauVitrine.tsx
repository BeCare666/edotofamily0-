"use client";

import React from "react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import photoMedecins from "../../../public/images/site/services.jpg";
import photoCentres from "../../../public/images/site/drawer-contraception.jpg";
import photoPoints from "../../../public/images/site/drawer-kits.jpg";
import photoSponsors from "../../../public/images/site/apropos-sante.jpg";

// « Un réseau, pas seulement une application » (26/11/2026) : les quatre acteurs qui ont réellement
// leur espace sur la plateforme (/medecin, /centre, /pickup-dashboard, /sponsor) et la façon de les rejoindre.
// Médecins et centres : comptes créés par l'équipe, d'où le renvoi vers la page Contact.
const MDiv = motion.div as unknown as React.FC<any>;
const ease = [0.22, 1, 0.36, 1];

type Actor = { title: string; text: string; space: string; photo: StaticImageData; position: string; span: string; aspect: string; link: { label: string; href: string } };

const ACTORS: Actor[] = [
    {
        title: "Médecins",
        text: "Ils vous reçoivent en téléconsultation, en visio ou par appel, et transmettent leurs consignes au centre de santé.",
        space: "Rendez-vous du jour, visio, compte rendu et consignes.",
        photo: photoMedecins,
        position: "object-[55%_35%]",
        span: "lg:col-span-7",
        aspect: "aspect-[4/3] lg:aspect-auto lg:h-[460px]",
        link: { label: "Professionnel de santé", href: "/contact" },
    },
    {
        title: "Centres de santé partenaires",
        text: "Ils vous accueillent avec votre dossier, prêt avant votre arrivée.",
        space: "Scan du code QR, dossier et consignes du médecin, urgences en premier.",
        photo: photoCentres,
        position: "object-[50%_40%]",
        span: "lg:col-span-5",
        aspect: "aspect-[4/3] lg:aspect-auto lg:h-[460px]",
        link: { label: "Rejoindre le réseau", href: "/contact" },
    },
    {
        title: "Points de retrait",
        text: "Des commerces de quartier qui vous remettent kits et produits, avec un simple code.",
        space: "Remise par code, suivi des retraits et jours d’ouverture.",
        photo: photoPoints,
        position: "object-[50%_50%]",
        span: "lg:col-span-5",
        aspect: "aspect-[4/3] lg:aspect-auto lg:h-[460px]",
        link: { label: "Devenir point de retrait", href: "/devenir-point-de-retrait" },
    },
    {
        title: "Sponsors",
        text: "Entreprises et organisations qui financent des kits gratuits pour les jeunes.",
        space: "Demande de campagne, carte des points de retrait, retraits en temps réel, export des données.",
        photo: photoSponsors,
        position: "object-[50%_40%]",
        span: "lg:col-span-7",
        aspect: "aspect-[4/3] lg:aspect-auto lg:h-[460px]",
        link: { label: "Financer une campagne", href: "/sponsor/inscription" },
    },
];

export default function ReseauVitrine() {
    return (
        <section className="bg-white" aria-labelledby="reseau-title">
            <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-36">
                <MDiv initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease }}
                    className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
                    <div>
                        <p className="text-[14px] text-[#8A827A]">Le réseau E.doto family</p>
                        <h2 id="reseau-title" className="mt-3 text-[44px] font-normal leading-[1.02] tracking-[-0.04em] text-[#161412] sm:text-[60px]">
                            Un réseau, pas seulement une application
                        </h2>
                    </div>
                    <p className="text-[16px] leading-[1.8] text-[#6B645D]">
                        Derrière chaque étape de votre parcours, des personnes et des lieux de confiance. Chacun dispose de son propre espace sur la plateforme.
                    </p>
                </MDiv>

                <div className="mt-16 grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-12">
                    {ACTORS.map((a, i) => (
                        <MDiv key={a.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.9, delay: (i % 2) * 0.1, ease }} className={`group ${a.span}`}>
                            <div className={`relative overflow-hidden rounded-[30px] bg-[#F1ECE6] ${a.aspect}`}>
                                <Image src={a.photo} alt="" fill placeholder="blur" sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
                                    className={`object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.05] ${a.position}`} />
                                <span className="absolute bottom-4 left-4 right-4 hidden rounded-2xl sm:block border border-white/60 bg-white/95 px-4 py-3 text-[13px] leading-snug text-[#3E3832] sm:right-auto sm:max-w-[340px]">
                                    <span className="font-medium text-[#C2185B]">Son espace : </span>{a.space}
                                </span>
                            </div>
                            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="max-w-md">
                                    <h3 className="text-[26px] font-normal leading-[1.2] tracking-[-0.02em] text-[#161412]">{a.title}</h3>
                                    <p className="mt-2 text-[15px] leading-[1.7] text-[#6B645D]">{a.text}</p>
                                    <p className="mt-3 text-[13.5px] leading-snug text-[#3E3832] sm:hidden"><span className="font-medium text-[#C2185B]">Son espace : </span>{a.space}</p>
                                </div>
                                <Link href={a.link.href} className="inline-flex shrink-0 items-center gap-1.5 text-[14px] font-medium text-[#161412] transition-colors hover:text-[#C2185B] sm:mt-2">
                                    {a.link.label} <ArrowUpRight size={15} className="transition-transform group-hover:rotate-45" />
                                </Link>
                            </div>
                        </MDiv>
                    ))}
                </div>
            </div>
        </section>
    );
}
