// components/UniversFemme.tsx
"use client";

import React from "react";
import Image from "next/image";
import { MapPin, ShoppingCart, Heart, User } from "lucide-react";
import Reveal, { PhotoFrame, photoClass } from "./home/Reveal";
import campagnesPhoto from "../public/images/campagnes_uac.png";
import produitsPhoto from "../public/images/reproductive-health.jpg";
import conseillerPhoto from "../public/icons/conseiller.jpg";

// Refonte du 06/10/2026 : mosaïque de photos (photos existantes du site), textes inchangés.
const FEATURES = [
    {
        icon: MapPin,
        title: "Localisation instantanée des campagnes SSR",
        text: "Trouvez en temps réel les distributions gratuites de préservatifs, kits SSR et services communautaires, près de chez vous.",
    },
    {
        icon: ShoppingCart,
        title: "Marketplace confidentielle de produits SSR",
        text: "Commandez vos produits en toute discrétion et retirez-les dans des points de proximité fiables : Mobile Money, boutiques, coiffeurs.",
    },
    {
        icon: Heart,
        title: "Conseiller SSR",
        text: "Posez toutes vos questions sur la sexualité, la fertilité, l’hygiène, la grossesse, etc. Réponses anonymes, fiables.",
    },
    {
        icon: User,
        title: "Module RSE pour entreprises",
        text: "Les entreprises financent des campagnes SSR et offrent des kits gratuits à la population. Suivi d’impact inclus.",
    },
];

function Caption({ index, f }: { index: number; f: (typeof FEATURES)[number] }) {
    const Icon = f.icon;
    return (
        <div className="mt-7 grid grid-cols-[auto_minmax(0,1fr)] gap-x-5">
            <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-[#E7DFD8] text-[#D6457F]">
                <Icon size={17} strokeWidth={1.5} />
            </span>
            <div>
                <p className="text-[12px] font-medium tracking-[0.2em] text-[#A8A29B]">0{index}</p>
                <h3 className="mt-1.5 text-[22px] font-normal leading-[1.25] tracking-[-0.01em] text-[#161412] sm:text-[26px]">{f.title}</h3>
                <p className="mt-3 max-w-xl text-[15px] leading-[1.75] text-[#6B645D]">{f.text}</p>
            </div>
        </div>
    );
}

export default function UniversFemme() {
    return (
        <section className="bg-[#FCFAF8]">
            <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-20 px-5 py-24 sm:px-8 lg:grid-cols-12 lg:gap-y-28 lg:py-36">
                {/* 1 : grande photo */}
                <Reveal className="lg:col-span-7">
                    <PhotoFrame className="aspect-[4/3]">
                        <Image src={campagnesPhoto} alt="" fill placeholder="blur" sizes="(min-width: 1024px) 58vw, 100vw" className={photoClass} />
                    </PhotoFrame>
                    <Caption index={1} f={FEATURES[0]} />
                </Reveal>

                {/* 2 : photo plus haute, décalée vers le bas */}
                <Reveal className="lg:col-span-5 lg:mt-40" delay={0.1}>
                    <PhotoFrame className="aspect-[4/5]">
                        <Image src={produitsPhoto} alt="" fill placeholder="blur" sizes="(min-width: 1024px) 40vw, 100vw" className={photoClass} />
                    </PhotoFrame>
                    <Caption index={2} f={FEATURES[1]} />
                </Reveal>

                {/* 3 : portrait */}
                <Reveal className="lg:col-span-5">
                    <PhotoFrame className="aspect-[4/5]">
                        <Image src={conseillerPhoto} alt="" fill placeholder="blur" sizes="(min-width: 1024px) 40vw, 100vw" className={`${photoClass} object-[50%_25%]`} />
                    </PhotoFrame>
                    <Caption index={3} f={FEATURES[2]} />
                </Reveal>

                {/* 4 : panneau typographique (aucune photo inventée) */}
                <Reveal className="lg:col-span-7 lg:self-end" delay={0.1}>
                    <div className="relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-[28px] bg-[#F7E9EE] p-8 sm:aspect-[4/3] sm:p-12">
                        <span className="text-[120px] font-normal leading-none tracking-[-0.06em] text-[#D6457F]/25 sm:text-[180px]">04</span>
                        <div>
                            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D6457F]/30 text-[#B8336A]">
                                <User size={18} strokeWidth={1.5} />
                            </span>
                            <h3 className="mt-6 text-[28px] font-normal leading-[1.15] tracking-[-0.02em] text-[#161412] sm:text-[38px]">{FEATURES[3].title}</h3>
                            <p className="mt-4 max-w-lg text-[15px] leading-[1.75] text-[#6B645D]">{FEATURES[3].text}</p>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
