"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CalendarHeart, ClipboardCheck, Gift, LayoutDashboard, MessageCircleHeart } from "lucide-react";
import Reveal, { PhotoFrame, photoClass } from "./Reveal";
import { useChatAI } from "../../context/ChatAIContext";
import parcoursPhoto from "../../public/images/site/choix-assistant.jpg";

// « Votre parcours, en cinq temps » (26/11/2026) : remplace la section UniversFemme.
// Chaque temps renvoie vers une fonction qui existe déjà (aucune fonction nouvelle).
type Step = { icon: React.ElementType; title: string; text: string; cta: string; action: "contraception" | "booking" | "space" | "campaigns" };

const STEPS: Step[] = [
    {
        icon: MessageCircleHeart,
        title: "Comprendre",
        text: "Posez vos questions à toute heure, de façon anonyme, et découvrez les contraceptifs modernes expliqués d’après le manuel de l’OMS.",
        cta: "Découvrir la contraception",
        action: "contraception",
    },
    {
        icon: CalendarHeart,
        title: "Consulter",
        text: "Un médecin vous reçoit en visio ou par appel, au créneau que vous choisissez.",
        cta: "Prendre rendez-vous",
        action: "booking",
    },
    {
        icon: ClipboardCheck,
        title: "Être orienté",
        text: "Si votre situation le demande, votre dossier est transmis à un centre de santé partenaire. Vous vous y présentez avec votre code QR, sans tout réexpliquer.",
        cta: "Mon espace",
        action: "space",
    },
    {
        icon: Gift,
        title: "Obtenir",
        text: "Kits gratuits offerts par nos sponsors, ou produits commandés en toute discrétion, à retirer avec un code dans un point de retrait proche de chez vous.",
        cta: "Voir les kits gratuits",
        action: "campaigns",
    },
    {
        icon: LayoutDashboard,
        title: "Être suivi",
        text: "Votre espace confidentiel garde vos rendez-vous, vos orientations, vos commandes et vos rappels.",
        cta: "Mon espace",
        action: "space",
    },
];

export default function Parcours() {
    const router = useRouter();
    const { openChoice, openBooking } = useChatAI() as { openChoice: () => void; openBooking: (ctx?: unknown) => void };

    const run = (a: Step["action"]) => {
        if (a === "contraception") router.push("/contraception");
        else if (a === "booking") openBooking();
        else if (a === "campaigns") router.push("/campaigns");
        else router.push("/mon-espace");
    };

    return (
        <section id="parcours" className="scroll-mt-24 bg-[#FCFAF8]">
            <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24 lg:py-36">
                <div className="lg:sticky lg:top-28 lg:self-start">
                    <Reveal>
                        <h2 className="text-[44px] font-normal leading-[1.02] tracking-[-0.04em] text-[#161412] sm:text-[64px]">Votre parcours, en cinq temps</h2>
                        <p className="mt-7 max-w-md text-[16px] leading-[1.8] text-[#6B645D]">
                            Vous avancez à votre rythme. À chaque étape, une personne ou un lieu de confiance prend le relais.
                        </p>
                        <button
                            type="button"
                            onClick={openChoice}
                            className="mt-8 inline-flex items-center gap-2 text-[15px] font-medium text-[#C2185B] hover:underline"
                        >
                            Poser une question à l’Assistant <ArrowUpRight size={16} />
                        </button>
                    </Reveal>
                    <Reveal delay={0.15} className="mt-12">
                        <PhotoFrame className="aspect-[4/5] max-w-md">
                            <Image src={parcoursPhoto} alt="" fill placeholder="blur" sizes="(min-width: 1024px) 38vw, 100vw" className={`${photoClass} object-[50%_30%]`} />
                        </PhotoFrame>
                    </Reveal>
                </div>

                <ol>
                    {STEPS.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <li key={s.title}>
                                <Reveal delay={i * 0.05} y={18}>
                                    <div className="group grid grid-cols-[3.5rem_minmax(0,1fr)] gap-5 border-t border-[#ECE6E0] py-9 sm:grid-cols-[5rem_minmax(0,1fr)]">
                                        <span className="pt-1 text-[15px] font-normal tabular-nums tracking-[0.15em] text-[#B5AEA6] transition-colors duration-500 group-hover:text-[#D6457F]">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <Icon size={20} strokeWidth={1.5} className="text-[#D6457F]" />
                                                <h3 className="text-[24px] font-normal leading-[1.25] tracking-[-0.01em] text-[#161412] sm:text-[30px]">{s.title}</h3>
                                            </div>
                                            <p className="mt-3 max-w-xl text-[15px] leading-[1.75] text-[#6B645D]">{s.text}</p>
                                            <button
                                                type="button"
                                                onClick={() => run(s.action)}
                                                className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-[#161412] transition hover:text-[#C2185B]"
                                            >
                                                {s.cta} <ArrowUpRight size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </Reveal>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </section>
    );
}
