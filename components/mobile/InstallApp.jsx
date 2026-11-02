"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Share, X } from "lucide-react";
import { isIosSafari, isStandalone, promptInstall, useInstallPrompt } from "../../lib/installPrompt";

// Application installable (02/11/2026) : invitation discrète sur téléphone.
// - Android (Chrome, Edge, Samsung) : bouton « Installer » (fenêtre du navigateur) ;
// - iPhone (Safari) : explication, car Apple ne propose pas de bouton : Partager, puis « Sur l'écran d'accueil ».
// Jamais si l'application est déjà ouverte depuis l'écran d'accueil, ni avant le choix sur les cookies
// (pour ne pas empiler deux bandeaux). « Plus tard » : plus d'invitation pendant 30 jours sur ce téléphone.
// Guide complet : section « Installer l'application » de la page d'accueil (components/home/InstallSection.jsx).
const LATER_KEY = "edoto-install-later";
const COOKIE_KEY = "edoto-cookie-info"; // components/CookieConsent.tsx
const LATER_DAYS = 30;

const read = (k) => {
    try { return localStorage.getItem(k); } catch { return null; }
};

export default function InstallApp() {
    const { canPrompt, installed } = useInstallPrompt();
    const [allowed, setAllowed] = useState(false);
    const [ios, setIos] = useState(false);
    const [closed, setClosed] = useState(false);

    useEffect(() => {
        if (isStandalone()) return;
        const later = Number(read(LATER_KEY) || 0);
        if (later && Date.now() - later < LATER_DAYS * 86400000) return;
        setIos(isIosSafari());
        // Après le choix sur les cookies, et quelques secondes de visite
        const t = setTimeout(() => setAllowed(Boolean(read(COOKIE_KEY))), 8000);
        return () => clearTimeout(t);
    }, []);

    const later = () => {
        try { localStorage.setItem(LATER_KEY, String(Date.now())); } catch { }
        setClosed(true);
    };

    if (closed || installed || !allowed || (!canPrompt && !ios)) return null;

    return (
        <div role="dialog" aria-label="Installer l'application E.doto family"
            className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[44] mx-auto max-w-md rounded-2xl border border-[#E9E5DF] bg-white p-4 shadow-[0_18px_40px_-18px_rgba(26,24,20,0.35)] md:hidden">
            <div className="flex items-start gap-3">
                <Image src="/app/icon-192.png" alt="" width={44} height={44} className="shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#1A1814]">L&apos;application E.doto <span className="text-[#C2185B]">family</span></p>
                    {canPrompt ? (
                        <p className="mt-0.5 text-[13px] text-[#6B655D]">Sur votre écran d&apos;accueil, en plein écran.</p>
                    ) : (
                        <p className="mt-0.5 text-[13px] text-[#6B655D]">
                            Touchez <Share size={14} className="mx-0.5 inline -mt-0.5" aria-label="Partager" /> puis « Sur l&apos;écran d&apos;accueil ».
                        </p>
                    )}
                </div>
                <button type="button" onClick={later} aria-label="Fermer" className="-m-1 rounded-full p-1 text-[#9A8E80] hover:bg-[#F3F1EE]">
                    <X size={18} />
                </button>
            </div>
            <div className="mt-3 flex justify-end gap-2">
                <button type="button" onClick={later} className="rounded-full px-4 py-2 text-sm text-[#6B655D] hover:bg-[#F3F1EE]">Plus tard</button>
                {canPrompt && (
                    <button type="button" onClick={async () => { await promptInstall(); setClosed(true); }} className="rounded-full bg-[#C2185B] px-5 py-2 text-sm font-semibold text-white hover:bg-[#A3154D]">Installer</button>
                )}
            </div>
        </div>
    );
}
