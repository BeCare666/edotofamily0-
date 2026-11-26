"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

// Bandeau qui défile (26/11/2026) : les services réels de la plateforme, sans chiffre.
const MDiv = motion.div as unknown as React.FC<any>;

const ITEMS = [
    "Assistant SSR",
    "Contraception expliquée",
    "Téléconsultation",
    "Centres de santé partenaires",
    "Kits gratuits",
    "Points de retrait de quartier",
    "Livraison discrète",
    "Suivi confidentiel",
];

function Row() {
    return (
        <div className="flex shrink-0 items-center">
            {ITEMS.map((t) => (
                <span key={t} className="flex items-center whitespace-nowrap px-7 text-[22px] font-normal tracking-[-0.02em] text-[#161412] sm:text-[30px]">
                    {t}
                    <span aria-hidden className="ml-14 h-2 w-2 rounded-full bg-[#D6457F]" />
                </span>
            ))}
        </div>
    );
}

export default function Ruban() {
    const reduce = useReducedMotion();
    return (
        <section aria-label="Nos services" className="overflow-hidden border-y border-[#ECE6E0] bg-white py-7">
            <MDiv className="flex w-max" animate={reduce ? undefined : { x: ["0%", "-50%"] }}
                transition={{ duration: 38, ease: "linear", repeat: Infinity }}>
                <Row />
                <Row />
            </MDiv>
        </section>
    );
}
