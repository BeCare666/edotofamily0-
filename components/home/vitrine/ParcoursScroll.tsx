"use client";

import React, { useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { ArrowUpRight, CalendarHeart, ClipboardCheck, Gift, LayoutDashboard, MessageCircleHeart } from "lucide-react";
import { useChatAI } from "../../../context/ChatAIContext";
import photoComprendre from "../../../public/images/site/choix-assistant.jpg";
import photoConsulter from "../../../public/images/site/apropos-soins.jpg";
import photoOriente from "../../../public/images/site/contraception-hero.jpg";
import photoObtenir from "../../../public/images/reproductive-health.jpg";
import photoSuivi from "../../../public/images/site/objectifs-recadree.jpg";

// « Votre parcours, en cinq temps » en défilement accompagné (26/11/2026).
// Ordinateur : la colonne reste fixe pendant le défilement, chaque temps remplace le précédent avec sa photo.
// Téléphone : les cinq temps s'empilent, chacun avec sa photo. Chaque temps ouvre une fonction qui existe.
const MDiv = motion.div as unknown as React.FC<any>;
const ease = [0.22, 1, 0.36, 1];

type Action = "contraception" | "booking" | "space" | "campaigns";
type Step = { icon: React.ElementType; title: string; text: string; detail: string; cta: string; action: Action; photo: StaticImageData; position: string };

const STEPS: Step[] = [
    {
        icon: MessageCircleHeart,
        title: "Comprendre",
        text: "Posez vos questions à toute heure, de façon anonyme, et découvrez les contraceptifs modernes expliqués d’après le manuel de l’OMS.",
        detail: "Assistant SSR et fiches contraception",
        cta: "Découvrir la contraception",
        action: "contraception",
        photo: photoComprendre,
        position: "object-[50%_28%]",
    },
    {
        icon: CalendarHeart,
        title: "Consulter",
        text: "Un médecin vous reçoit en visio ou par appel, au créneau que vous choisissez. Le lien de la visio s’active quinze minutes avant le rendez-vous.",
        detail: "Téléconsultation",
        cta: "Prendre rendez-vous",
        action: "booking",
        photo: photoConsulter,
        position: "object-[62%_50%]",
    },
    {
        icon: ClipboardCheck,
        title: "Être orienté",
        text: "Si votre situation le demande, votre dossier est transmis à un centre de santé partenaire, avec les consignes du médecin. Vous vous y présentez avec votre code QR, sans tout réexpliquer.",
        detail: "Centres de santé partenaires",
        cta: "Mon espace",
        action: "space",
        photo: photoOriente,
        position: "object-[28%_45%]",
    },
    {
        icon: Gift,
        title: "Obtenir",
        text: "Kits gratuits offerts par nos sponsors, ou produits commandés en toute discrétion, à retirer avec un code dans un point de retrait proche de chez vous.",
        detail: "Kits gratuits, boutique et points de retrait",
        cta: "Voir les kits gratuits",
        action: "campaigns",
        photo: photoObtenir,
        position: "object-[50%_50%]",
    },
    {
        icon: LayoutDashboard,
        title: "Être suivi",
        text: "Votre espace confidentiel garde vos rendez-vous, vos orientations, vos commandes et vos rappels. Une notification vous prévient quand votre colis est prêt.",
        detail: "Mon espace",
        cta: "Ouvrir mon espace",
        action: "space",
        photo: photoSuivi,
        position: "object-[50%_30%]",
    },
];

function useRun() {
    const router = useRouter();
    const { openBooking } = useChatAI() as { openBooking: (ctx?: unknown) => void };
    return (a: Action) => {
        if (a === "contraception") router.push("/contraception");
        else if (a === "booking") openBooking();
        else if (a === "campaigns") router.push("/campaigns");
        else router.push("/mon-espace");
    };
}

function CtaButton({ step, run }: { step: Step; run: (a: Action) => void }) {
    return (
        <button type="button" onClick={() => run(step.action)}
            className="group inline-flex items-center gap-2 rounded-full border border-[#1A1814] px-6 py-3 text-[14px] font-medium text-[#161412] transition-colors duration-300 hover:bg-[#1A1814] hover:text-white">
            {step.cta}
            <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:rotate-45" />
        </button>
    );
}

export default function ParcoursScroll() {
    const run = useRun();
    const ref = useRef<HTMLDivElement>(null);
    const reduce = useReducedMotion();
    const [active, setActive] = useState(0);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    useMotionValueEvent(scrollYProgress, "change", (v: number) => {
        const i = Math.min(STEPS.length - 1, Math.max(0, Math.floor(v * STEPS.length)));
        if (i !== active) setActive(i);
    });

    // Aller directement à un temps : défile jusqu'à sa position dans la section
    const goTo = (i: number) => {
        const el = ref.current;
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY;
        const span = el.offsetHeight - window.innerHeight;
        window.scrollTo({ top: top + (span * (i + 0.5)) / STEPS.length, behavior: reduce ? "auto" : "smooth" });
    };

    return (
        <section id="parcours" className="scroll-mt-20 bg-white">
            {/* Ordinateur */}
            <div ref={ref} className="relative hidden lg:block" style={{ height: `${STEPS.length * 85}vh` }}>
                <div className="sticky top-0 flex h-screen items-center">
                    <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-center gap-20 px-8">
                        <div>
                            <p className="text-[14px] text-[#8A827A]">Votre parcours, en cinq temps</p>

                            {/* Les cinq temps sont tous rendus et se croisent en fondu (pas de sortie animée :
                                un défilement rapide ne peut plus laisser la zone vide). */}
                            <div className="relative mt-6 grid min-h-[380px]">
                                {STEPS.map((s, i) => (
                                    <MDiv key={s.title} aria-hidden={i !== active} className="[grid-area:1/1]"
                                        initial={false}
                                        animate={{ opacity: i === active ? 1 : 0, y: i === active ? 0 : i < active ? -18 : 24 }}
                                        transition={{ duration: 0.6, ease }}
                                        style={{ pointerEvents: i === active ? "auto" : "none" }}>
                                        <p className="flex items-center gap-2.5 text-[14px] font-medium text-[#C2185B]">
                                            <s.icon size={18} strokeWidth={1.6} />
                                            {s.detail}
                                        </p>
                                        <h2 className="mt-4 text-[72px] font-normal leading-[0.98] tracking-[-0.05em] text-[#161412]">{s.title}</h2>
                                        <p className="mt-7 max-w-md text-[17px] leading-[1.8] text-[#6B645D]">{s.text}</p>
                                        <div className="mt-9"><CtaButton step={s} run={run} /></div>
                                    </MDiv>
                                ))}
                            </div>

                            {/* Repères des cinq temps */}
                            <ol className="mt-12 flex gap-2">
                                {STEPS.map((s, i) => (
                                    <li key={s.title} className="flex-1">
                                        <button type="button" onClick={() => goTo(i)} aria-current={i === active ? "step" : undefined}
                                            className="group w-full text-left">
                                            <span className="block h-[3px] overflow-hidden rounded-full bg-[#ECE6E0]">
                                                <span className={`block h-full rounded-full bg-[#C2185B] transition-[width] duration-500 ${i < active ? "w-full" : i === active ? "w-1/2" : "w-0"}`} />
                                            </span>
                                            <span className={`mt-3 block text-[12.5px] transition-colors ${i === active ? "text-[#161412]" : "text-[#A8A29B] group-hover:text-[#57524B]"}`}>{s.title}</span>
                                        </button>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className="relative h-[78vh] max-h-[760px] overflow-hidden rounded-[36px] bg-[#F1ECE6]">
                            {STEPS.map((s, i) => (
                                <MDiv key={s.title} className="absolute inset-0" initial={false}
                                    animate={{ opacity: i === active ? 1 : 0, scale: i === active || reduce ? 1 : 1.06 }}
                                    transition={{ duration: 1, ease }}>
                                    <Image src={s.photo} alt="" fill placeholder="blur" sizes="56vw" className={`object-cover ${s.position}`} />
                                </MDiv>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Téléphone et tablette */}
            <div className="mx-auto max-w-2xl px-5 py-24 sm:px-8 lg:hidden">
                <p className="text-[14px] text-[#8A827A]">Votre parcours</p>
                <h2 className="mt-3 text-[44px] font-normal leading-[1.02] tracking-[-0.04em] text-[#161412]">En cinq temps</h2>
                <div className="mt-14 grid gap-16">
                    {STEPS.map((s) => (
                        <MDiv key={s.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.8, ease }}>
                            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[#F1ECE6]">
                                <Image src={s.photo} alt="" fill placeholder="blur" sizes="100vw" className={`object-cover ${s.position}`} />
                            </div>
                            <p className="mt-6 flex items-center gap-2 text-[13px] font-medium text-[#C2185B]"><s.icon size={16} strokeWidth={1.6} /> {s.detail}</p>
                            <h3 className="mt-2 text-[34px] font-normal leading-[1.05] tracking-[-0.03em] text-[#161412]">{s.title}</h3>
                            <p className="mt-4 text-[15.5px] leading-[1.75] text-[#6B645D]">{s.text}</p>
                            <div className="mt-6"><CtaButton step={s} run={run} /></div>
                        </MDiv>
                    ))}
                </div>
            </div>
        </section>
    );
}
