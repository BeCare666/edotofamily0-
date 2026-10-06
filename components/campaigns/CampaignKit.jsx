"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { Check, Mail, MapPin, PackageCheck, Send, ShieldCheck, X, Loader2, Building2, ChevronLeft, ArrowRight, Sparkles, Lock } from "lucide-react";
import PickupPointPicker from "../PickupPointPicker";
import { deviceMarks } from "../../lib/deviceIdentity";

const API = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
const fmt = (d) => new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

// Étapes réelles d'une demande de kit (champs de /campaign-registrations/mine)
export function kitSteps(reg) {
    const withdrawn = Number(reg.picked_up) === 1 || reg.order_status === "order-completed";
    const validated = withdrawn || Number(reg.otp_used) === 1;
    const expired = !validated && !!reg.otp_expires_at && new Date(reg.otp_expires_at).getTime() < Date.now();
    return {
        withdrawn,
        validated,
        expired,
        steps: [
            { key: "sent", icon: Send, done: true, title: "Demande envoyée", detail: reg.created_at ? fmt(reg.created_at) : null },
            {
                key: "code",
                icon: Mail,
                done: !expired,
                warn: expired,
                title: expired ? "Code expiré" : "Code reçu par e-mail",
                detail: reg.otp_expires_at && !validated ? `${expired ? "depuis le" : "valable jusqu'au"} ${fmt(reg.otp_expires_at)}` : null,
            },
            { key: "valid", icon: ShieldCheck, done: validated, title: "Code validé au point", detail: reg.verified_at ? fmt(reg.verified_at) : null },
            { key: "out", icon: PackageCheck, done: withdrawn, title: "Kit retiré", detail: reg.picked_up_at ? fmt(reg.picked_up_at) : null },
        ],
    };
}

// Frise d'étapes (même principe que la barre de suivi d'une commande)
export function KitStepsTracker({ reg, dark = false, onRegenerate, regenerating }) {
    const { steps, expired, withdrawn } = kitSteps(reg);
    const current = steps.findIndex((s) => !s.done);
    return (
        <div>
            <ol className="flex items-start">
                {steps.map((s, i) => {
                    const Icon = s.icon;
                    const isCurrent = i === current;
                    return (
                        <li key={s.key} className="relative flex min-w-0 flex-1 flex-col items-center text-center" aria-current={isCurrent ? "step" : undefined}>
                            {i > 0 && (
                                <span aria-hidden="true" className={`absolute right-1/2 top-[17px] h-[3px] w-full rounded-full ${steps[i - 1].done && s.done ? "bg-emerald-500" : dark ? "bg-white/15" : "bg-slate-200"}`} />
                            )}
                            <span
                                className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${
                                    s.warn
                                        ? "border-amber-400 bg-amber-50 text-amber-600"
                                        : s.done
                                          ? "border-emerald-500 bg-emerald-500 text-white"
                                          : isCurrent
                                            ? `border-[#FF6EA9] text-[#FF6EA9] shadow-[0_0_0_4px_rgba(255,110,169,0.18)] ${dark ? "bg-[#1F1B16]" : "bg-white"}`
                                            : dark ? "border-white/15 bg-transparent text-white/40" : "border-slate-200 bg-white text-slate-400"
                                }`}
                            >
                                {s.done && !s.warn ? <Check size={17} strokeWidth={3} /> : <Icon size={16} />}
                            </span>
                            <span className={`mt-1.5 px-1 text-[11px] font-semibold leading-tight sm:text-xs ${s.warn ? "text-amber-600" : s.done ? (dark ? "text-emerald-300" : "text-emerald-700") : isCurrent ? (dark ? "text-white" : "text-slate-900") : dark ? "text-white/40" : "text-slate-400"}`}>
                                {s.title}
                            </span>
                            {s.detail && <span className={`max-w-full truncate px-1 text-[10px] sm:text-[11px] ${dark ? "text-white/50" : "text-slate-500"}`}>{s.detail}</span>}
                        </li>
                    );
                })}
            </ol>
            {expired && !withdrawn && onRegenerate && (
                <div className={`mt-4 flex flex-col gap-3 rounded-2xl p-3.5 sm:flex-row sm:items-center sm:justify-between ${dark ? "bg-white/5 ring-1 ring-white/10" : "bg-amber-50/70 ring-1 ring-amber-100"}`}>
                    <p className={`text-[13px] ${dark ? "text-white/70" : "text-slate-700"}`}>Votre code a expiré. Un nouveau code vous sera envoyé par e-mail.</p>
                    <button
                        type="button"
                        onClick={onRegenerate}
                        disabled={regenerating}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6EA9] to-[#C2185B] px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
                    >
                        {regenerating && <Loader2 size={15} className="animate-spin" />}
                        {regenerating ? "Envoi…" : "Générer un nouveau code"}
                    </button>
                </div>
            )}
        </div>
    );
}

const FLOW = [
    { key: "city", label: "Votre ville", icon: Building2 },
    { key: "point", label: "Point de retrait", icon: MapPin },
    { key: "confirm", label: "Confirmation", icon: ShieldCheck },
];

/**
 * Demande de kit en 3 étapes (ville → point de retrait → confirmation), puis écran de réussite.
 * Les règles sont revérifiées par l'API (campagne en cours, ville, point validé, une demande par personne).
 */
export function CampaignRequestFlow({ campaign, initialCity, onClose, onDone }) {
    const cities = campaign.cities || [];
    const [step, setStep] = useState(0);
    const [city, setCity] = useState(initialCity || (cities.length === 1 ? cities[0] : ""));
    const [point, setPoint] = useState(null);
    const [sending, setSending] = useState(false);
    const [done, setDone] = useState(null);

    const submit = async () => {
        if (sending) return;
        setSending(true);
        try {
            const res = await fetch(`${API}/campaigns/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify({ campaign_id: campaign.id, pickup_center: String(point.id), city, ...(await deviceMarks()) }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast.error(Array.isArray(data?.message) ? data.message[0] : data?.message || "La demande n'a pas pu être envoyée.");
                return;
            }
            setDone(data);
            onDone?.(data);
        } catch {
            toast.error("Erreur réseau. Veuillez réessayer.");
        } finally {
            setSending(false);
        }
    };

    const canNext = step === 0 ? !!city : step === 1 ? !!point : true;

    return (
        <motion.div className="fixed inset-0 z-[300] flex items-end justify-center bg-[#0F0C0A]/60 backdrop-blur-md sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
                role="dialog"
                aria-label="Demander mon kit"
                className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[32px] bg-[#FBF7F2] shadow-2xl sm:rounded-[32px]"
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
                {/* En-tête */}
                <div className="relative bg-[#1F1B16] px-6 pb-5 pt-6 text-white">
                    <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#FF6EA9]/25 blur-3xl" />
                    <div className="relative flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#F6C8DB]">Kit gratuit</p>
                            <p className="mt-1 truncate font-brand text-[26px] font-semibold leading-tight">{campaign.title}</p>
                        </div>
                        <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20">
                            <X size={18} />
                        </button>
                    </div>
                    {!done && (
                        <ol className="relative mt-5 flex items-center gap-2">
                            {FLOW.map((f, i) => (
                                <li key={f.key} className="flex flex-1 items-center gap-2">
                                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition ${i < step ? "bg-emerald-500 text-white" : i === step ? "bg-[#FF6EA9] text-white shadow-[0_0_0_4px_rgba(255,110,169,0.25)]" : "bg-white/10 text-white/50"}`}>
                                        {i < step ? <Check size={14} strokeWidth={3} /> : i + 1}
                                    </span>
                                    <span className={`hidden text-[12px] font-medium sm:inline ${i === step ? "text-white" : "text-white/50"}`}>{f.label}</span>
                                    {i < FLOW.length - 1 && <span className={`h-px flex-1 ${i < step ? "bg-emerald-400" : "bg-white/15"}`} />}
                                </li>
                            ))}
                        </ol>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
                    <AnimatePresence mode="wait">
                        {done ? (
                            <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                                <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_18px_40px_-14px_rgba(16,185,129,0.7)]">
                                    <Check size={38} strokeWidth={2.6} />
                                </span>
                                <p className="mt-5 font-brand text-[30px] font-semibold text-[#1F1B16]">Demande enregistrée</p>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#6B6158]">
                                    Votre code de retrait vient de vous être envoyé par e-mail. Présentez-le à <strong className="text-[#1F1B16]">{done.pickup_center_name || point?.name}</strong> pour recevoir votre kit.
                                </p>
                                <div className="mx-auto mt-7 max-w-lg rounded-3xl bg-white p-5 ring-1 ring-[#EFE8DE]">
                                    <KitStepsTracker reg={{ created_at: new Date().toISOString(), otp_expires_at: done.otp_expires_at, otp_used: 0, picked_up: 0 }} />
                                </div>
                                <p className="mt-4 text-[12px] text-[#9A8E80]">Retrouvez le suivi à tout moment sur cette page et dans « Mes commandes ».</p>
                                <button type="button" onClick={onClose} className="mt-6 h-12 w-full rounded-2xl bg-[#1F1B16] text-sm font-semibold text-white sm:w-auto sm:px-10">
                                    Terminer
                                </button>
                            </motion.div>
                        ) : step === 0 ? (
                            <motion.div key="city" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                                <p className="text-lg font-semibold text-[#1F1B16]">Dans quelle ville retirerez-vous votre kit ?</p>
                                <p className="mt-1 text-sm text-[#7A6E62]">La campagne se déroule dans {cities.length > 1 ? "ces villes" : "cette ville"}.</p>
                                <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                                    {cities.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setCity(c)}
                                            className={`flex items-center justify-between rounded-2xl px-4 py-4 text-left ring-1 transition ${city === c ? "bg-[#1F1B16] text-white ring-[#1F1B16] shadow-lg" : "bg-white text-[#1F1B16] ring-[#EFE8DE] hover:ring-[#C9A96E]"}`}
                                        >
                                            <span className="flex items-center gap-3">
                                                <MapPin size={18} className={city === c ? "text-[#FF9CC6]" : "text-[#C9A96E]"} />
                                                <span className="font-medium">{c}</span>
                                            </span>
                                            {city === c && <Check size={18} />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : step === 1 ? (
                            <motion.div key="point" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                                <p className="mb-1 text-lg font-semibold text-[#1F1B16]">Choisissez votre point de retrait</p>
                                <p className="mb-4 text-sm text-[#7A6E62]">Votre kit y sera remis contre votre code.</p>
                                <PickupPointPicker selectedId={point?.id} onSelect={(p) => setPoint(p)} />
                            </motion.div>
                        ) : (
                            <motion.div key="confirm" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                                <p className="text-lg font-semibold text-[#1F1B16]">Vérifiez votre demande</p>
                                <dl className="mt-4 divide-y divide-[#EFE8DE] overflow-hidden rounded-3xl bg-white ring-1 ring-[#EFE8DE]">
                                    {[
                                        ["Campagne", campaign.title],
                                        ["Ville", city],
                                        ["Point de retrait", point?.name],
                                        ["Code de retrait", "Envoyé par e-mail après validation"],
                                    ].map(([k, v]) => (
                                        <div key={k} className="flex items-center justify-between gap-4 px-5 py-3.5">
                                            <dt className="text-[13px] text-[#9A8E80]">{k}</dt>
                                            <dd className="text-right text-[14px] font-medium text-[#1F1B16]">{v}</dd>
                                        </div>
                                    ))}
                                </dl>
                                <p className="mt-4 flex items-start gap-2.5 rounded-2xl bg-[#F6F1EA] p-4 text-[13px] leading-relaxed text-[#5C5249]">
                                    <Lock size={16} className="mt-0.5 shrink-0 text-[#C9A96E]" />
                                    Une seule demande par personne et par campagne : elle ne pourra pas être refaite, ni depuis un autre compte, ni depuis cet appareil.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {!done && (
                    <div className="flex gap-2 border-t border-[#EFE8DE] bg-white/70 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur sm:px-7">
                        {step > 0 && (
                            <button type="button" onClick={() => setStep((s) => s - 1)} className="flex h-12 items-center gap-1 rounded-2xl bg-[#F1ECE4] px-4 text-sm font-semibold text-[#3B342D]">
                                <ChevronLeft size={17} /> Retour
                            </button>
                        )}
                        {step < 2 ? (
                            <button
                                type="button"
                                disabled={!canNext}
                                onClick={() => setStep((s) => s + 1)}
                                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#1F1B16] text-sm font-semibold text-white transition disabled:opacity-40"
                            >
                                Continuer <ArrowRight size={17} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={submit}
                                disabled={sending}
                                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6EA9] to-[#C2185B] text-sm font-semibold text-white shadow-[0_14px_30px_-12px_rgba(194,24,91,0.7)] disabled:opacity-60"
                            >
                                {sending ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
                                {sending ? "Envoi de la demande…" : "Confirmer ma demande"}
                            </button>
                        )}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
