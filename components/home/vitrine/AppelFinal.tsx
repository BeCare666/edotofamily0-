"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Gift } from "lucide-react";

// Dernier appel de la vitrine (26/11/2026) : ouvre le tiroir d'accès (événement edoto:open-access).
const MDiv = motion.div as unknown as React.FC<any>;
const ease = [0.22, 1, 0.36, 1];

export default function AppelFinal() {
    const openAccess = () => window.dispatchEvent(new Event("edoto:open-access"));
    return (
        <section className="bg-[#F7E9EE]">
            <MDiv initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease }}
                className="mx-auto flex max-w-5xl flex-col items-center px-5 py-28 text-center sm:px-8 lg:py-40">
                <h2 className="max-w-4xl text-[44px] font-normal leading-[1.04] tracking-[-0.045em] text-[#161412] [text-wrap:balance] sm:text-[66px]">
                    Votre parcours commence ici.
                </h2>
                <p className="mt-7 max-w-xl text-[17px] leading-[1.8] text-[#6B645D]">
                    Une question, un rendez-vous, un kit gratuit : choisissez par où commencer. Tout reste confidentiel.
                </p>
                <div className="mt-11 flex flex-col gap-3 sm:flex-row">
                    <button type="button" onClick={openAccess}
                        className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#1A1814] px-8 py-4 text-[15px] font-medium text-white transition-colors hover:bg-[#C2185B]">
                        Commencer mon parcours <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                    </button>
                    <Link href="/campaigns"
                        className="inline-flex items-center justify-center gap-2.5 rounded-full border border-[#1A1814]/70 bg-white/60 px-8 py-4 text-[15px] font-medium text-[#161412] transition-colors hover:border-[#C2185B] hover:text-[#C2185B]">
                        <Gift size={17} strokeWidth={1.7} /> Kits gratuits près de moi
                    </Link>
                </div>
            </MDiv>
        </section>
    );
}
