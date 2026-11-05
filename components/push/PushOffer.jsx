"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2, X } from "lucide-react";
import { pushLater, shouldOfferPush, usePush } from "../../lib/push";

// Proposition discrète juste après une action (04/11/2026, décision D3) : commande payée, rendez-vous réservé.
// N'apparaît que si l'appareil peut recevoir les notifications et n'est pas encore abonné ; « Plus tard » : 30 jours sans la revoir.
export default function PushOffer({ text = "Être prévenu(e) sur ce téléphone de la suite ?" }) {
    const { state, busy, error, enable } = usePush();
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(shouldOfferPush(state));
    }, [state]);

    if (!show) return null;

    const later = () => {
        pushLater();
        setShow(false);
    };

    return (
        <div role="dialog" aria-label="Activer les notifications"
            className="rounded-2xl border border-[#E9E5DF] bg-white p-4 shadow-[0_18px_40px_-24px_rgba(26,24,20,0.35)]">
            <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FBEEF3] text-[#C2185B]"><Bell size={18} /></span>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#1A1814]">{text}</p>
                    <p className="mt-0.5 text-[13px] text-[#6B655D]">Activez les notifications : messages discrets, désactivables dans Mon espace.</p>
                    {error && <p className="mt-1 text-[13px] text-[#B91C1C]">{error}</p>}
                </div>
                <button type="button" onClick={later} aria-label="Fermer" className="-m-1 rounded-full p-1 text-[#9A8E80] hover:bg-[#F3F1EE]"><X size={18} /></button>
            </div>
            <div className="mt-3 flex justify-end gap-2">
                <button type="button" onClick={later} className="rounded-full px-4 py-2 text-sm text-[#6B655D] hover:bg-[#F3F1EE]">Plus tard</button>
                <button type="button" onClick={enable} disabled={busy}
                    className="inline-flex items-center gap-2 rounded-full bg-[#C2185B] px-5 py-2 text-sm font-semibold text-white hover:bg-[#A3154D] disabled:opacity-60">
                    {busy && <Loader2 size={14} className="animate-spin" />} Activer
                </button>
            </div>
        </div>
    );
}
