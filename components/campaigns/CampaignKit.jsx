"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { Check, Mail, MapPin, PackageCheck, Send, ShieldCheck, X, Loader2, ChevronLeft, ArrowRight, Lock, LocateFixed, Users } from "lucide-react";
import PickupPointPicker from "../PickupPointPicker";
import { deviceMarks } from "../../lib/deviceIdentity";
import { birthDateError, birthDateLimits, SEX_OPTIONS, sexError } from "../../lib/fieldRules";

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

// Frise d'étapes (même principe que la barre de suivi d'une commande) : encre pour le fait, rose pour l'étape en cours
export function KitStepsTracker({ reg, onRegenerate, regenerating }) {
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
                            {i > 0 && <span aria-hidden="true" className={`absolute right-1/2 top-[15px] h-px w-full ${steps[i - 1].done && s.done ? "bg-[#161412]" : "bg-[#E2DCD5]"}`} />}
                            <span
                                className={`relative z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full border transition ${
                                    s.warn
                                        ? "border-[#B8336A] bg-white text-[#B8336A]"
                                        : s.done
                                          ? "border-[#161412] bg-[#161412] text-white"
                                          : isCurrent
                                            ? "border-[#D6457F] bg-white text-[#D6457F]"
                                            : "border-[#E2DCD5] bg-white text-[#B5AEA6]"
                                }`}
                            >
                                {s.done && !s.warn ? <Check size={14} strokeWidth={2.5} /> : <Icon size={14} strokeWidth={1.8} />}
                            </span>
                            <span className={`mt-2 px-1 text-[11px] font-medium leading-tight sm:text-xs ${s.warn ? "text-[#B8336A]" : s.done || isCurrent ? "text-[#161412]" : "text-[#A8A29B]"}`}>{s.title}</span>
                            {s.detail && <span className="max-w-full truncate px-1 text-[10px] text-[#8A847D] sm:text-[11px]">{s.detail}</span>}
                        </li>
                    );
                })}
            </ol>
            {expired && !withdrawn && onRegenerate && (
                <div className="mt-5 flex flex-col gap-3 border-t border-[#EDE8E2] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[13px] text-[#5E5953]">Votre code a expiré. Un nouveau code vous sera envoyé par e-mail.</p>
                    <button
                        type="button"
                        onClick={onRegenerate}
                        disabled={regenerating}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#161412] px-5 py-2.5 text-[13px] font-medium text-white disabled:opacity-60"
                    >
                        {regenerating && <Loader2 size={15} className="animate-spin" />}
                        {regenerating ? "Envoi…" : "Générer un nouveau code"}
                    </button>
                </div>
            )}
        </div>
    );
}

const FLOW = ["Votre ville", "Point de retrait", "Confirmation"];

// Position du téléphone, demandée à l'étape « Votre ville »
function currentPosition() {
    return new Promise((resolve, reject) => {
        if (typeof navigator === "undefined" || !navigator.geolocation) return reject({ code: 0 });
        navigator.geolocation.getCurrentPosition(
            (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
            (e) => reject(e),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
        );
    });
}

const apiMessage = (data, fallback) => (Array.isArray(data?.message) ? data.message[0] : data?.message || fallback);

/**
 * Demande de kit en 3 étapes (ville → point de retrait → confirmation), puis écran de réussite.
 * Les règles sont revérifiées par l'API (campagne en cours, ville, point validé, une demande par personne).
 * 16/10/2026 : la ville n'est plus choisie, elle est lue à partir de la position GPS (obligatoire) ;
 * seuls les points de retrait de cette ville sont proposés ; les comptes sans date de naissance
 * ni sexe les complètent ici une seule fois (public ciblé de la campagne).
 */
export function CampaignRequestFlow({ campaign, onClose, onDone }) {
    const cities = campaign.cities || [];
    const needProfile = !!campaign.profile_incomplete;
    const [step, setStep] = useState(0);
    const [city, setCity] = useState("");
    const [position, setPosition] = useState(null);
    const [locating, setLocating] = useState(false);
    const [locError, setLocError] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [sex, setSex] = useState("");
    const [profileTouched, setProfileTouched] = useState(false);
    const [point, setPoint] = useState(null);
    const [sending, setSending] = useState(false);
    const [done, setDone] = useState(null);
    const limits = birthDateLimits();
    const profileErrors = needProfile ? { birthDate: birthDateError(birthDate), sex: sexError(sex) } : { birthDate: "", sex: "" };
    const profileOk = !profileErrors.birthDate && !profileErrors.sex;

    // Position → ville de la campagne, vérifiée par l'API (même contrôle qu'à l'envoi)
    const locate = async () => {
        setLocating(true);
        setLocError("");
        setCity("");
        setPoint(null);
        try {
            const pos = await currentPosition();
            const res = await fetch(`${API}/campaigns/${campaign.id}/locate`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify(pos),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setLocError(apiMessage(data, "Vérification de votre position impossible."));
                return;
            }
            setPosition(pos);
            setCity(data.city);
        } catch (e) {
            setLocError(e?.code === 1
                ? "Autorisez la localisation de votre téléphone : elle est obligatoire pour demander un kit."
                : "Position introuvable. Activez la localisation puis réessayez.");
        } finally {
            setLocating(false);
        }
    };

    const submit = async () => {
        if (sending) return;
        setSending(true);
        try {
            const res = await fetch(`${API}/campaigns/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify({
                    campaign_id: campaign.id,
                    pickup_center: String(point.id),
                    city,
                    lat: position?.lat,
                    lng: position?.lng,
                    ...(needProfile ? { birth_date: birthDate, sex } : {}),
                    ...(await deviceMarks()),
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast.error(apiMessage(data, "La demande n'a pas pu être envoyée."));
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
    const next = () => {
        if (step === 0 && !profileOk) {
            setProfileTouched(true);
            return;
        }
        setStep((s) => s + 1);
    };
    const field = (bad) =>
        `mt-2 h-12 w-full rounded-xl border bg-white px-4 text-[15px] text-[#161412] focus:outline-none focus:ring-2 ${bad ? "border-[#D9534F] focus:ring-[#D9534F]/20" : "border-[#E2DCD5] focus:border-[#C2185B] focus:ring-[#C2185B]/15"}`;

    return (
        <motion.div className="fixed inset-0 z-[300] flex items-end justify-center bg-[#161412]/40 sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
                role="dialog"
                aria-label="Demander mon kit"
                className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_30px_80px_-30px_rgba(22,20,18,0.45)] sm:rounded-2xl"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
                <div className="border-b border-[#EDE8E2] px-6 pb-5 pt-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-[12px] text-[#8A847D]">Demande de kit gratuit</p>
                            <p className="mt-0.5 truncate font-brand text-[28px] font-semibold leading-tight text-[#161412]">{campaign.title}</p>
                        </div>
                        <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-full p-2 text-[#77716B] hover:bg-[#F4F1ED]">
                            <X size={18} />
                        </button>
                    </div>
                    {!done && (
                        <ol className="mt-5 flex items-center gap-3">
                            {FLOW.map((label, i) => (
                                <li key={label} className="flex flex-1 items-center gap-2">
                                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${i < step ? "bg-[#161412] text-white" : i === step ? "border border-[#161412] text-[#161412]" : "border border-[#E2DCD5] text-[#A8A29B]"}`}>
                                        {i < step ? <Check size={12} strokeWidth={2.5} /> : i + 1}
                                    </span>
                                    <span className={`hidden text-[12px] sm:inline ${i === step ? "text-[#161412]" : "text-[#A8A29B]"}`}>{label}</span>
                                    {i < FLOW.length - 1 && <span className={`h-px flex-1 ${i < step ? "bg-[#161412]" : "bg-[#E2DCD5]"}`} />}
                                </li>
                            ))}
                        </ol>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <AnimatePresence mode="wait">
                        {done ? (
                            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#161412] text-white">
                                    <Check size={26} strokeWidth={2.2} />
                                </span>
                                <p className="mt-5 font-brand text-[30px] font-semibold text-[#161412]">Demande enregistrée</p>
                                <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-[#5E5953]">
                                    Votre code de retrait vient de vous être envoyé par e-mail. Présentez-le à <span className="font-medium text-[#161412]">{done.pickup_center_name || point?.name}</span> pour recevoir votre kit.
                                </p>
                                <div className="mx-auto mt-7 max-w-lg rounded-xl border border-[#EDE8E2] p-5">
                                    <KitStepsTracker reg={{ created_at: new Date().toISOString(), otp_expires_at: done.otp_expires_at, otp_used: 0, picked_up: 0 }} />
                                </div>
                                <p className="mt-4 text-[12px] text-[#8A847D]">Le suivi reste disponible sur cette page et dans « Mes commandes ».</p>
                                <button type="button" onClick={onClose} className="mt-6 h-12 w-full rounded-full bg-[#161412] text-sm font-medium text-white sm:w-auto sm:px-12">
                                    Terminer
                                </button>
                            </motion.div>
                        ) : step === 0 ? (
                            <motion.div key="city" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                                <p className="text-[17px] font-medium text-[#161412]">Dans quelle ville retirerez-vous votre kit ?</p>
                                <p className="mt-1 text-sm text-[#77716B]">
                                    La campagne se déroule dans {cities.length > 1 ? "ces villes" : "cette ville"} : {cities.join(", ")}. Seules les personnes qui s’y trouvent peuvent obtenir un kit, votre position est vérifiée.
                                </p>
                                {campaign.target_label && campaign.target_label !== "Tout public" && (
                                    <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#FBEEF3] px-3 py-1.5 text-[12.5px] font-medium text-[#A0124A]">
                                        <Users size={14} strokeWidth={1.8} /> Campagne réservée : {campaign.target_label}
                                    </p>
                                )}

                                <div className={`mt-5 rounded-xl border p-4 ${city ? "border-[#161412] bg-[#161412] text-white" : "border-[#E2DCD5]"}`}>
                                    {city ? (
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="flex items-center gap-3">
                                                <MapPin size={16} strokeWidth={1.8} className="text-white/70" />
                                                <span>
                                                    <span className="block text-[12px] text-white/60">Votre position est à</span>
                                                    <span className="font-medium">{city}</span>
                                                </span>
                                            </span>
                                            <Check size={16} />
                                        </div>
                                    ) : (
                                        <button type="button" onClick={locate} disabled={locating}
                                            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#161412] text-sm font-medium text-[#161412] transition hover:bg-[#161412] hover:text-white disabled:opacity-60">
                                            {locating ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
                                            {locating ? "Vérification de votre position…" : "Utiliser ma position"}
                                        </button>
                                    )}
                                </div>
                                {locError && <p role="alert" className="mt-3 rounded-xl bg-[#FDF1EF] px-4 py-3 text-[13px] text-[#9B2C2C]">{locError}</p>}
                                {city && (
                                    <button type="button" onClick={locate} className="mt-2 text-[12.5px] text-[#77716B] underline-offset-4 hover:underline">
                                        Vérifier à nouveau ma position
                                    </button>
                                )}

                                {needProfile && (
                                    <div className="mt-6 border-t border-[#EDE8E2] pt-5">
                                        <p className="text-[15px] font-medium text-[#161412]">Complétez votre profil</p>
                                        <p className="mt-1 text-sm text-[#77716B]">Une seule fois : certaines campagnes sont réservées à un âge ou à un sexe.</p>
                                        <label htmlFor="kit-birth" className="mt-4 block text-sm font-medium text-[#3D3934]">Date de naissance</label>
                                        <input id="kit-birth" type="date" min={limits.min} max={limits.max} value={birthDate}
                                            onChange={(e) => setBirthDate(e.target.value)} className={field(profileTouched && profileErrors.birthDate)} />
                                        {profileTouched && profileErrors.birthDate && <p className="mt-1.5 text-[13px] text-[#B42318]">{profileErrors.birthDate}</p>}
                                        <p className="mt-4 text-sm font-medium text-[#3D3934]">Sexe</p>
                                        <div className="mt-2 grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Sexe">
                                            {SEX_OPTIONS.map((o) => (
                                                <button key={o.value} type="button" role="radio" aria-checked={sex === o.value} onClick={() => setSex(o.value)}
                                                    className={`rounded-xl border px-4 py-3 text-left transition ${sex === o.value ? "border-[#C2185B] bg-[#FBEEF3]" : "border-[#E2DCD5] hover:border-[#161412]"}`}>
                                                    <span className={`block text-[15px] font-medium ${sex === o.value ? "text-[#A0124A]" : "text-[#161412]"}`}>{o.label}</span>
                                                    <span className="block text-[12.5px] text-[#8A847D]">{o.hint}</span>
                                                </button>
                                            ))}
                                        </div>
                                        {profileTouched && profileErrors.sex && <p className="mt-1.5 text-[13px] text-[#B42318]">{profileErrors.sex}</p>}
                                    </div>
                                )}
                            </motion.div>
                        ) : step === 1 ? (
                            <motion.div key="point" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                                <p className="mb-1 text-[17px] font-medium text-[#161412]">Choisissez votre point de retrait</p>
                                <p className="mb-4 text-sm text-[#77716B]">Votre kit y sera remis contre votre code.</p>
                                <PickupPointPicker city={city} selectedId={point?.id} onSelect={(p) => setPoint(p)} />
                            </motion.div>
                        ) : (
                            <motion.div key="confirm" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                                <p className="text-[17px] font-medium text-[#161412]">Vérifiez votre demande</p>
                                <dl className="mt-4 divide-y divide-[#EDE8E2] rounded-xl border border-[#EDE8E2]">
                                    {[
                                        ["Campagne", campaign.title],
                                        ["Ville", city],
                                        ["Point de retrait", point?.name],
                                        ["Code de retrait", "Envoyé par e-mail après validation"],
                                    ].map(([k, v]) => (
                                        <div key={k} className="flex items-center justify-between gap-4 px-4 py-3.5">
                                            <dt className="text-[13px] text-[#8A847D]">{k}</dt>
                                            <dd className="text-right text-[14px] font-medium text-[#161412]">{v}</dd>
                                        </div>
                                    ))}
                                </dl>
                                <p className="mt-4 flex items-start gap-2.5 text-[13px] leading-relaxed text-[#5E5953]">
                                    <Lock size={15} strokeWidth={1.8} className="mt-0.5 shrink-0 text-[#8A847D]" />
                                    Une seule demande par personne et par campagne : elle ne pourra pas être refaite, ni depuis un autre compte, ni depuis cet appareil.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {!done && (
                    <div className="flex gap-2 border-t border-[#EDE8E2] px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                        {step > 0 && (
                            <button type="button" onClick={() => setStep((s) => s - 1)} className="flex h-12 items-center gap-1 rounded-full border border-[#E2DCD5] px-5 text-sm font-medium text-[#3A3632]">
                                <ChevronLeft size={16} /> Retour
                            </button>
                        )}
                        {step < 2 ? (
                            <button type="button" disabled={!canNext} onClick={next} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#161412] text-sm font-medium text-white transition disabled:opacity-30">
                                Continuer <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button type="button" onClick={submit} disabled={sending} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#161412] text-sm font-medium text-white disabled:opacity-60">
                                {sending && <Loader2 size={16} className="animate-spin" />}
                                {sending ? "Envoi de la demande…" : "Confirmer ma demande"}
                            </button>
                        )}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
