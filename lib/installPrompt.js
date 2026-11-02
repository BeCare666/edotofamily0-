"use client";

import { useEffect, useState } from "react";

// Application installable (02/11/2026) : proposition d'installation du navigateur (Android : Chrome, Edge, Samsung).
// Le navigateur l'envoie une seule fois, tôt : ce module est importé dès _app pour ne pas la manquer.
// Partagé par le bandeau (components/mobile/InstallApp.jsx) et la section de la page d'accueil.
let deferred = null;
let installed = false;
const subs = new Set();
const notify = () => subs.forEach((f) => f());

if (typeof window !== "undefined") {
    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault(); // notre propre invitation remplace la petite barre du navigateur
        deferred = e;
        notify();
    });
    window.addEventListener("appinstalled", () => {
        deferred = null;
        installed = true;
        notify();
    });
}

/** Déjà ouvert depuis l'écran d'accueil */
export function isStandalone() {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

/** "ios" (iPhone, iPad), "android" ou "other" (ordinateur…) */
export function platformOf() {
    if (typeof window === "undefined") return "other";
    const ua = window.navigator.userAgent || "";
    if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
    if (/android/i.test(ua)) return "android";
    return "other";
}

/** iPhone : Safari seulement (les autres navigateurs ne proposent pas toujours « Sur l'écran d'accueil ») */
export function isIosSafari() {
    if (typeof window === "undefined") return false;
    const ua = window.navigator.userAgent || "";
    return platformOf() === "ios" && /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
}

/** Ouvre la fenêtre d'installation du navigateur ; true si la personne a accepté */
export async function promptInstall() {
    if (!deferred) return false;
    const e = deferred;
    deferred = null;
    notify();
    e.prompt();
    try {
        const choice = await e.userChoice;
        return choice?.outcome === "accepted";
    } catch {
        return false;
    }
}

export function useInstallPrompt() {
    const [, setTick] = useState(0);
    useEffect(() => {
        const f = () => setTick((n) => n + 1);
        subs.add(f);
        return () => subs.delete(f);
    }, []);
    return { canPrompt: Boolean(deferred), installed };
}
