"use client";

import { useEffect, useState } from "react";

// Tournées de retrait 09 h / 17 h (12/11/2026, rapports/PLAN_TOURNEES_RETRAIT.md, étape 2).
// Les heures sont calculées par l'API (pickup/pickup-rounds.ts) ; le site ne fait que les afficher, en heure du Bénin.
const API = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
const TZ = "Africa/Porto-Novo";

/** { day: « jeudi 12 novembre », hour: « 09 h 00 » } pour une date renvoyée par l'API */
export function roundParts(value) {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    const day = d.toLocaleDateString("fr-FR", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });
    const parts = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(d);
    const get = (t) => parts.find((p) => p.type === t)?.value ?? "00";
    return { day, hour: `${get("hour")} h ${get("minute")}` };
}

/**
 * Commande ou demande de kit (champs available_at, available_notified_at renvoyés par l'API) :
 * « Disponible à votre point de retrait le … à … », puis « Disponible depuis le … à … » une fois annoncée disponible.
 * null : livraison à domicile, pas encore payée, ou antérieure aux tournées.
 */
export function availabilityText(item) {
    const p = roundParts(item?.available_at);
    if (!p) return null;
    return item.available_notified_at
        ? `Disponible depuis le ${p.day} à ${p.hour}`
        : `Disponible à votre point de retrait le ${p.day} à ${p.hour}`;
}

/** Texte court pour la cloche */
export function availabilityShort(item) {
    const p = roundParts(item?.available_at);
    if (!p) return null;
    return item.available_notified_at ? "disponible au point de retrait" : `disponible le ${p.day} à ${p.hour}`;
}

/** Sous un point de retrait au moment du choix (D9) : « Fermé le dimanche : disponible lundi 16 novembre à 09 h 00 » */
export function nextRoundLabel(info) {
    if (!info || !info.day) return null;
    return info.closed_on
        ? `Fermé le ${info.closed_on} : disponible ${info.day} à ${info.hour}`
        : `Disponible le ${info.day} à ${info.hour}`;
}

// Petite mémoire (1 minute) : la liste des points change de page sans refaire tous les appels
const cache = new Map();
const TTL_MS = 60 * 1000;

async function fetchNextRounds(ids) {
    const now = Date.now();
    const missing = ids.filter((id) => !(cache.get(id)?.until > now));
    if (missing.length) {
        const res = await fetch(`${API}/pickup-rounds/next?points=${missing.slice(0, 50).join(",")}`);
        const rows = res.ok ? await res.json().catch(() => []) : [];
        for (const id of missing) cache.set(id, { until: now + TTL_MS, info: null });
        for (const r of Array.isArray(rows) ? rows : []) cache.set(Number(r.id), { until: now + TTL_MS, info: r });
    }
    const out = {};
    for (const id of ids) out[id] = cache.get(id)?.info ?? null;
    return out;
}

/** Prochaine tournée de chaque point affiché ; { [id]: { day, hour, closed_on } } */
export function useNextRounds(ids) {
    const key = [...new Set((ids || []).map(Number).filter((n) => n > 0))].sort((a, b) => a - b).join(",");
    const [rounds, setRounds] = useState({});
    useEffect(() => {
        if (!key) return;
        let cancelled = false;
        fetchNextRounds(key.split(",").map(Number))
            .then((r) => { if (!cancelled) setRounds((prev) => ({ ...prev, ...r })); })
            .catch(() => undefined);
        return () => { cancelled = true; };
    }, [key]);
    return rounds;
}
