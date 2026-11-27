"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Globe, Shield, Users } from "lucide-react";
import Visions from "../../../public/icons/edotocenter.gif";

// Section « Une vision durable & humaine » avec l'illustration animée des produits (GIF), remise en bas de
// l'accueil le 26/11/2026 à la demande de l'utilisateur. Textes repris mot pour mot de l'ancienne section
// (pages/index.tsx avant le 26/11/2026) ; seule la mise en forme suit la vitrine.
const MDiv = motion.div as unknown as React.FC<any>;
const ease = [0.22, 1, 0.36, 1];

const ROWS = [
    { icon: Globe, text: "Rayonner à l'échelle africaine" },
    { icon: Shield, text: "Promouvoir la durabilité et l'écologie" },
    { icon: Users, text: "Créer des liens forts entre les praticiens et les patients" },
];

export default function VisionProduits() {
    return (
        <section className="bg-[#FCF1EB]" aria-labelledby="vision-title">
            <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-16 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:gap-24 lg:py-36">
                <MDiv initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease }}
                    className="relative">
                    <div className="overflow-hidden rounded-[32px] bg-[#FCE6DC]">
                        <Image src={Visions} alt="Illustration animée de produits de santé" unoptimized className="h-auto w-full" />
                    </div>
                    <div className="absolute -bottom-8 right-4 hidden max-w-xs rounded-[22px] border border-[#EFE3DA] bg-white p-6 md:block lg:-right-8">
                        <div className="mb-3 flex items-center gap-4">
                            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EEF6F0] text-[#2F7A4A]">
                                <Shield size={20} strokeWidth={1.7} />
                            </span>
                            <div>
                                <p className="text-[15px] font-medium text-[#161412]">100% Sécurisé</p>
                                <p className="text-xs text-[#8A827A]">Produits certifiés</p>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed text-[#6B645D]">Nous travaillons uniquement avec des laboratoires reconnus.</p>
                    </div>
                </MDiv>

                <MDiv initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.1, ease }}>
                    <h2 id="vision-title" className="text-[42px] font-normal leading-[1.04] tracking-[-0.04em] text-[#161412] sm:text-[58px]">
                        Une vision <span className="text-[#B8336A]">durable</span> & <span className="text-[#B8336A]">humaine</span>.
                    </h2>
                    <p className="mt-7 max-w-xl text-[17px] leading-[1.8] text-[#6B645D]">
                        Nos objectifs guident chaque création. Car pour nous, la santé féminine est une mission de cœur, pas une simple tendance. Nous voulons réconcilier science, nature et élégance.
                    </p>
                    <ul className="mt-10">
                        {ROWS.map((r) => (
                            <li key={r.text} className="flex items-center gap-4 border-t border-[#EADCD2] py-5 text-[17px] text-[#161412] last:border-b">
                                <r.icon size={19} strokeWidth={1.6} className="shrink-0 text-[#C2185B]" />
                                {r.text}
                            </li>
                        ))}
                    </ul>
                </MDiv>
            </div>
        </section>
    );
}
