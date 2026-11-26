"use client";

import React, { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, MotionValue } from "framer-motion";

// « Nos engagements » (26/11/2026) : cinq engagements que la plateforme tient réellement
// (anonymat de l'Assistant, données de santé chiffrées, rien sur le téléphone, points de retrait, téléconsultation,
// fiches d'après le manuel de l'OMS, kits financés et suivis). Chaque phrase s'éclaire au défilement.
const MSpan = motion.span as unknown as React.FC<any>;

const ITEMS = [
    { key: "Sans jugement.", rest: "Vos questions restent anonymes." },
    { key: "Confidentiel.", rest: "Vos données de santé sont chiffrées, et rien n’est gardé sur votre téléphone." },
    { key: "Proche.", rest: "Un point de retrait dans votre quartier, une consultation sans vous déplacer." },
    { key: "Encadré.", rest: "Des contraceptifs présentés d’après le manuel de l’OMS, des consultations assurées par des médecins." },
    { key: "Gratuit quand c’est possible.", rest: "Des kits financés par des sponsors, dont chaque remise est suivie." },
];

function Line({ progress, index, total, item }: { progress: MotionValue<number>; index: number; total: number; item: (typeof ITEMS)[number] }) {
    const reduce = useReducedMotion();
    const start = index / total;
    const end = start + 1 / total;
    const opacity = useTransform(progress, [start, end], [reduce ? 1 : 0.18, 1]);
    return (
        <MSpan style={{ opacity }} className="block">
            <span className="text-[#B8336A]">{item.key}</span> {item.rest}
        </MSpan>
    );
}

export default function Engagements() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 45%"] });

    return (
        <section className="bg-white" aria-labelledby="engagements-title">
            <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-40">
                <p className="text-[14px] text-[#8A827A]">Ce que nous garantissons</p>
                <h2 id="engagements-title" className="mt-3 text-[44px] font-normal leading-[1.02] tracking-[-0.04em] text-[#161412] sm:text-[60px]">Nos engagements</h2>
                <div ref={ref} className="mt-16 grid gap-10 text-[26px] font-normal leading-[1.35] tracking-[-0.02em] text-[#161412] sm:text-[36px] lg:text-[44px]">
                    {ITEMS.map((it, i) => (
                        <Line key={it.key} progress={scrollYProgress} index={i} total={ITEMS.length} item={it} />
                    ))}
                </div>
            </div>
        </section>
    );
}
