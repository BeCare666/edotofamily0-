"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Download, EllipsisVertical, Share, SquarePlus } from "lucide-react";
import Reveal from "./Reveal";
import { isStandalone, platformOf, promptInstall, useInstallPrompt } from "../../lib/installPrompt";

// Section « Installer l'application » de la page d'accueil (02/11/2026, demande de l'utilisateur).
// Bouton : fenêtre d'installation du navigateur quand elle existe (Android) ; sinon, le guide du téléphone.
// Guides : étapes proposées par Chrome (Android) et Safari (iPhone), sans magasin d'applications.
const GUIDES = {
    android: {
        label: "Android",
        browser: "Chrome",
        steps: [
            { icon: null, text: "Ouvrez edotofamily.com dans Chrome." },
            { icon: Download, text: "Touchez « Installer l’application » ci-dessus." },
            { icon: EllipsisVertical, text: "Si le bouton n’ouvre rien : touchez le menu ⋮ en haut à droite, puis « Ajouter à l’écran d’accueil » ou « Installer l’application »." },
            { icon: CheckCircle2, text: "Confirmez avec « Installer ». L’icône E.doto family apparaît sur votre écran d’accueil." },
        ],
    },
    ios: {
        label: "iPhone",
        browser: "Safari",
        steps: [
            { icon: null, text: "Ouvrez edotofamily.com dans Safari." },
            { icon: Share, text: "Touchez le bouton Partager (le carré avec une flèche vers le haut), en bas de l’écran." },
            { icon: SquarePlus, text: "Faites défiler et touchez « Sur l’écran d’accueil »." },
            { icon: CheckCircle2, text: "Touchez « Ajouter » en haut à droite. L’icône E.doto family apparaît sur votre écran d’accueil." },
        ],
    },
};

export default function InstallSection() {
    const { canPrompt, installed } = useInstallPrompt();
    const [tab, setTab] = useState("android");
    const [platform, setPlatform] = useState("other");
    const [standalone, setStandalone] = useState(false);
    const guideRef = useRef(null);

    useEffect(() => {
        const p = platformOf();
        setPlatform(p);
        if (p === "ios") setTab("ios");
        setStandalone(isStandalone());
    }, []);

    const onInstall = async () => {
        if (canPrompt) {
            await promptInstall();
            return;
        }
        if (platform === "ios" || platform === "android") setTab(platform);
        guideRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const done = standalone || installed;
    const guide = GUIDES[tab];

    return (
        <section id="application" className="bg-white">
            <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20 lg:py-32">
                <Reveal>
                    <Image src="/app/icon-192.png" alt="" width={72} height={72} className="rounded-2xl shadow-[0_12px_30px_-14px_rgba(26,24,20,0.35)]" />
                    <h2 className="mt-8 text-[40px] font-normal leading-[1.05] tracking-[-0.04em] text-[#161412] sm:text-[56px]">
                        L’application E.doto <span className="text-[#C2185B]">family</span>
                    </h2>
                    <p className="mt-6 max-w-md text-[16px] leading-[1.8] text-[#6B645D]">
                        Installez E.doto family sur votre téléphone : une icône sur l’écran d’accueil, l’ouverture en plein écran,
                        vos commandes, vos kits et vos rendez-vous en un geste. Gratuit, sans passer par un magasin d’applications.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        {done ? (
                            <span className="inline-flex items-center gap-2 rounded-full bg-[#F3F1EE] px-5 py-3 text-sm font-medium text-[#1A1814]">
                                <CheckCircle2 size={18} className="text-[#C2185B]" /> Application installée
                            </span>
                        ) : (
                            <button type="button" onClick={onInstall}
                                className="inline-flex items-center gap-2 rounded-full bg-[#C2185B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#A3154D]">
                                <Download size={18} /> Installer l’application
                            </button>
                        )}
                    </div>
                    {platform === "other" && !done && (
                        <p className="mt-4 max-w-md text-[13px] leading-relaxed text-[#8A837A]">
                            Sur ordinateur : ouvrez edotofamily.com sur votre téléphone et suivez le guide ci-contre.
                        </p>
                    )}
                </Reveal>

                <Reveal delay={0.1}>
                    <div ref={guideRef} className="scroll-mt-28 rounded-3xl border border-[#EFECE7] bg-[#F9F8F6] p-5 sm:p-8">
                        <div className="inline-flex rounded-2xl bg-white p-1 text-sm shadow-sm" role="tablist" aria-label="Choisir son téléphone">
                            {Object.entries(GUIDES).map(([k, g]) => (
                                <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                                    className={`rounded-xl px-5 py-2 font-medium transition ${tab === k ? "bg-[#1A1814] text-white" : "text-[#6B645D] hover:text-[#1A1814]"}`}>
                                    {g.label}
                                </button>
                            ))}
                        </div>
                        <p className="mt-5 text-[13px] text-[#8A837A]">Avec {guide.browser}, en quatre étapes :</p>
                        <ol className="mt-4 space-y-4">
                            {guide.steps.map((s, i) => {
                                const Icon = s.icon;
                                return (
                                    <li key={i} className="flex items-start gap-4">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#C2185B] ring-1 ring-[#EFECE7]">{i + 1}</span>
                                        <span className="min-w-0 pt-1 text-[15px] leading-relaxed text-[#1A1814]">
                                            {Icon && <Icon size={16} className="mr-1.5 inline -mt-0.5 text-[#6B645D]" aria-hidden />}
                                            {s.text}
                                        </span>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
