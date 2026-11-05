"use client";

import { Bell, BellOff, Loader2 } from "lucide-react";
import { Card } from "../pickup-dashboard/ui";
import { usePush } from "../../lib/push";
import PushTopics from "./PushTopics";

// Mon espace (04/11/2026, plan notifications étape 2.2, décision D3) : activer ou désactiver les notifications
// sur cet appareil. Textes discrets sur l'écran verrouillé (décision D2).
// 05/11/2026 (plan Paramètres 1.1) : onlyUntilOn = accueil de Mon espace, la carte disparaît une fois activées ;
// le réglage se fait alors dans Paramètres (carte sans onlyUntilOn, avec showTopics : choix par sujet, décision P4).
export default function PushCard({ onlyUntilOn = false, showTopics = false }) {
    const { state, busy, error, enable, disable } = usePush();
    if (state === "loading" || state === "unsupported") return null;
    if (onlyUntilOn && state === "on") return null;

    return (
        <Card className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FBEEF3] text-[#C2185B]">
                    {state === "on" ? <Bell size={20} /> : <BellOff size={20} />}
                </span>
                <div className="min-w-0 flex-1">
                    <p className="font-medium text-[#1A1814]">Notifications sur cet appareil</p>
                    <p className="mt-1 text-sm leading-relaxed text-[#57524B]">
                        {state === "on"
                            ? (showTopics
                                ? "Activées sur cet appareil. Choisissez ci-dessous ce que vous recevez ; votre rappel se règle dans Ma contraception. Les messages restent discrets sur l’écran verrouillé."
                                : "Activées sur cet appareil. Vos choix se règlent dans Paramètres. Les messages restent discrets sur l’écran verrouillé.")
                            : state === "denied"
                                ? "Bloquées par votre téléphone. Pour les autoriser : réglages du téléphone, Applications (ou Chrome), E.doto family, Notifications."
                                : "Soyez prévenu(e) quand votre commande avance, avant vos rendez-vous et pour votre rappel. Les messages restent discrets sur l’écran verrouillé."}
                    </p>
                    {error && <p className="mt-2 text-sm text-[#B91C1C]">{error}</p>}
                </div>
                {state === "on" ? (
                    <button type="button" onClick={disable} disabled={busy}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#E9E5DF] px-5 py-3 text-sm font-semibold text-[#1A1814] disabled:opacity-60">
                        {busy && <Loader2 size={16} className="animate-spin" />} Désactiver
                    </button>
                ) : state === "off" ? (
                    <button type="button" onClick={enable} disabled={busy}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#C2185B] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
                        {busy ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />} Activer les notifications
                    </button>
                ) : null}
            </div>
            {showTopics && state === "on" && <PushTopics />}
        </Card>
    );
}
