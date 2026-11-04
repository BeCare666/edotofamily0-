"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Download, EllipsisVertical, FileDown, Share, ShieldCheck, Smartphone, SquarePlus } from "lucide-react";
import Reveal from "./Reveal";
import { isStandalone, platformOf, promptInstall, useInstallPrompt } from "../../lib/installPrompt";

// Section « Installer l'application » de la page d'accueil (02/11/2026, demande de l'utilisateur).
// 04/11/2026 : deux façons d'installer, expliquées côte à côte (rapports/PLAN_APPLICATION_ANDROID_TWA.md, étape 9) :
//   Façon 1 : l'application Android (fichier APK, page /application), Android seulement ;
//   Façon 2 : l'icône sur l'écran d'accueil, ajoutée depuis le navigateur (Android et iPhone), rien à télécharger.
// Bouton « Ajouter à l'écran d'accueil » : fenêtre d'installation du navigateur quand elle existe (Android) ; sinon, le guide.
const APK_STEPS = [
    { icon: FileDown, text: "Touchez « Télécharger l’application Android » ci-dessus, ou ouvrez edotofamily.com/application." },
    { icon: ShieldCheck, text: "Ouvrez le fichier edoto-family.apk. Si Android le demande, autorisez l’installation, puis touchez « Installer »." },
    { icon: CheckCircle2, text: "E.doto family apparaît avec vos autres applications et sur votre écran d’accueil." },
];

const GUIDES = {
    android: {
        label: "Android",
        browser: "Chrome",
        steps: [
            { icon: null, text: "Ouvrez edotofamily.com dans Chrome." },
            { icon: Download, text: "Touchez « Ajouter à l’écran d’accueil » ci-dessus." },
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

function Steps({ steps }) {
    return (
        <ol className="mt-4 space-y-4">
            {steps.map((s, i) => {
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
    );
}

function WayTitle({ n, title, tag }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C2185B]">Façon {n}</span>
            <span className="text-[17px] font-medium text-[#1A1814]">{title}</span>
            <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium text-[#6B645D] ring-1 ring-[#EFECE7]">{tag}</span>
        </div>
    );
}

export default function InstallSection() {
    const { canPrompt, installed } = useInstallPrompt();
    const [tab, setTab] = useState("android");
    const [platform, setPlatform] = useState("other");
    const [standalone, setStandalone] = useState(false);
    const guideRef = useRef(null);
    const homeRef = useRef(null);

    useEffect(() => {
        const p = platformOf();
        setPlatform(p);
        if (p === "ios") setTab("ios");
        setStandalone(isStandalone());
    }, []);

    // Façon 2 : fenêtre du navigateur si elle existe, sinon le guide « écran d'accueil » du téléphone
    const onAddToHome = async () => {
        if (canPrompt) {
            await promptInstall();
            return;
        }
        if (platform === "ios" || platform === "android") setTab(platform);
        setTimeout(() => (homeRef.current || guideRef.current)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
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
                    <p className="mt-3 max-w-md text-[15px] leading-[1.7] text-[#1A1814]">
                        Deux façons, au choix : l’application Android à télécharger, ou une icône ajoutée depuis votre navigateur, sur Android comme sur iPhone.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        {done ? (
                            <span className="inline-flex items-center gap-2 rounded-full bg-[#F3F1EE] px-5 py-3 text-sm font-medium text-[#1A1814]">
                                <CheckCircle2 size={18} className="text-[#C2185B]" /> Application installée
                            </span>
                        ) : platform === "ios" ? (
                            <button type="button" onClick={onAddToHome}
                                className="inline-flex items-center gap-2 rounded-full bg-[#C2185B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#A3154D]">
                                <SquarePlus size={18} /> Ajouter à l’écran d’accueil
                            </button>
                        ) : (
                            <>
                                <Link href="/application"
                                    className="inline-flex items-center gap-2 rounded-full bg-[#C2185B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#A3154D]">
                                    <Smartphone size={18} /> Télécharger l’application Android
                                </Link>
                                <button type="button" onClick={onAddToHome}
                                    className="inline-flex items-center gap-2 rounded-full border border-[#E3DED7] bg-white px-6 py-3 text-sm font-semibold text-[#1A1814] transition hover:bg-[#F3F1EE]">
                                    <Download size={18} /> Ajouter à l’écran d’accueil
                                </button>
                            </>
                        )}
                    </div>
                    {platform === "other" && !done && (
                        <p className="mt-4 max-w-md text-[13px] leading-relaxed text-[#8A837A]">
                            Sur ordinateur : ouvrez edotofamily.com sur votre téléphone et suivez le guide ci-contre.
                        </p>
                    )}

                    <div className="mt-10 max-w-md rounded-2xl border border-[#EFECE7] p-5">
                        <p className="text-[15px] font-medium text-[#1A1814]">Quelle différence ?</p>
                        <dl className="mt-3 space-y-3 text-[14px] leading-relaxed text-[#6B645D]">
                            <div>
                                <dt className="font-medium text-[#1A1814]">Façon 1 · L’application Android</dt>
                                <dd>Un vrai fichier d’application, installé comme les autres : elle apparaît dans la liste de vos applications. Android seulement.</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-[#1A1814]">Façon 2 · L’icône sur l’écran d’accueil</dt>
                                <dd>Rien à télécharger ni à autoriser : votre navigateur ajoute l’icône en un instant. Android et iPhone.</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-[#1A1814]">Dans les deux cas</dt>
                                <dd>Le même E.doto family, en plein écran, mis à jour tout seul. Aucune donnée de santé n’est gardée sur le téléphone. Une seule des deux suffit.</dd>
                            </div>
                        </dl>
                    </div>
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

                        {tab === "android" ? (
                            <>
                                <div className="mt-6">
                                    <WayTitle n={1} title="L’application Android" tag="Recommandée" />
                                    <Steps steps={APK_STEPS} />
                                    <Link href="/application" className="mt-4 inline-block text-[14px] font-medium text-[#C2185B] hover:underline">
                                        Toutes les étapes en détail
                                    </Link>
                                </div>
                                <div ref={homeRef} className="mt-8 scroll-mt-28 border-t border-[#EFECE7] pt-6">
                                    <WayTitle n={2} title="L’icône sur l’écran d’accueil" tag="Sans téléchargement" />
                                    <p className="mt-3 text-[13px] text-[#8A837A]">Avec {guide.browser}, en quatre étapes :</p>
                                    <Steps steps={guide.steps} />
                                </div>
                            </>
                        ) : (
                            <div ref={homeRef} className="mt-6 scroll-mt-28">
                                <WayTitle n={2} title="L’icône sur l’écran d’accueil" tag="Sans téléchargement" />
                                <p className="mt-3 text-[14px] leading-relaxed text-[#6B645D]">
                                    L’application Android (façon 1) ne s’installe pas sur iPhone. Sur iPhone, ajoutez l’icône depuis Safari.
                                </p>
                                <p className="mt-4 text-[13px] text-[#8A837A]">Avec {guide.browser}, en quatre étapes :</p>
                                <Steps steps={guide.steps} />
                            </div>
                        )}
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
