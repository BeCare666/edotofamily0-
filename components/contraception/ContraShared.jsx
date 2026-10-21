"use client";

import { Check, Clock3, ShieldCheck, Stethoscope, UserRound, X } from "lucide-react";

// Adoption des contraceptifs (21/10/2026) : éléments communs du catalogue, des fiches et du dashboard.

/** Image d'une fiche : chemin du site (/images/...) ou adresse complète (image envoyée depuis l'admin) */
export const methodImage = (url) => (url ? String(url) : null);

// Les 7 étapes, expliquées avant la demande (fiche) ; l'étape 3 n'existe pas sans médecin
export const STEP_TEXT = [
    { title: "Votre demande", text: "Vous choisissez la méthode et envoyez votre demande, en toute confidentialité." },
    { title: "Demande acceptée", text: "L’équipe E.doto family étudie votre demande et vous répond par e-mail." },
    { title: "Rencontre avec un médecin", text: "Un échange en visio ou par téléphone avec un médecin, pour choisir en toute sécurité.", doctorOnly: true },
    { title: "Adoption conclue", text: "La méthode est confirmée et un centre partenaire vous est recommandé." },
    { title: "Passage au centre", text: "Vous présentez votre code QR à l’accueil du centre recommandé." },
    { title: "Adoption faite", text: "Le centre confirme la pose, la prescription ou la remise de la méthode." },
    { title: "Suivi", text: "Vous partagez comment cela se passe ; l’équipe vous accompagne." },
];

/** Visuel d'une méthode : sa photo, sinon un fond ivoire avec le nom en grand (aucune illustration) */
export function MethodVisual({ method, className = "", rounded = "rounded-[28px]" }) {
    const src = methodImage(method?.image_url);
    if (src) {
        return (
            <div className={`relative overflow-hidden bg-[#F3F0EB] ${rounded} ${className}`}>
                <img src={src} alt={method?.name || ""} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            </div>
        );
    }
    return (
        <div className={`relative flex flex-col justify-end overflow-hidden bg-[#F3EEE7] p-6 ${rounded} ${className}`}>
            <span className="absolute -right-6 -top-10 font-serif text-[180px] leading-none text-[#E6DED3]" aria-hidden="true">
                {String(method?.name || "?").charAt(0)}
            </span>
            <span className="relative text-[11px] uppercase tracking-[0.2em] text-[#8A837A]">{method?.family}</span>
            <span className="relative mt-1 font-serif text-2xl leading-tight text-[#1A1814]">{method?.name}</span>
        </div>
    );
}

/** Avec ou sans médecin */
export function DoctorBadge({ requires, light = false }) {
    return requires ? (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${light ? "bg-white/90 text-[#1A1814]" : "bg-[#1A1814] text-white"}`}>
            <Stethoscope size={12} /> Avec un médecin
        </span>
    ) : (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${light ? "bg-white/90 text-[#A0124A]" : "bg-[#FBEEF3] text-[#A0124A]"}`}>
            <UserRound size={12} /> Sans médecin
        </span>
    );
}

export function StiBadge() {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8EFE6] px-2.5 py-1 text-[11px] font-medium text-[#3F6B45]">
            <ShieldCheck size={12} /> Protège des IST
        </span>
    );
}

const dateFr = (iso) => (iso ? new Date(iso).toLocaleDateString("fr-FR", { timeZone: "Africa/Porto-Novo", day: "numeric", month: "long", year: "numeric" }) : "");

/**
 * Frise des 7 étapes d'une demande (états calculés par l'API : done, current, todo, skipped, failed).
 * horizontal : barre compacte (cartes) ; sinon frise verticale détaillée.
 */
export function AdoptionSteps({ steps, horizontal = false, requiresDoctor = true }) {
    const list = steps?.length
        ? steps
        : STEP_TEXT.map((s, i) => ({ n: i + 1, label: s.title, state: s.doctorOnly && !requiresDoctor ? "skipped" : "todo", date: null }));
    if (horizontal) {
        return (
            <ol className="flex items-center gap-1" aria-label="Étapes de l’adoption">
                {list.map((s) => (
                    <li key={s.n} className="flex flex-1 flex-col gap-1.5" title={`${s.n}. ${s.label}`}>
                        <span
                            className={`h-1.5 rounded-full ${s.state === "done" ? "bg-[#1A1814]" : s.state === "current" ? "bg-[#C2185B]" : s.state === "failed" ? "bg-[#9B2C2C]" : s.state === "skipped" ? "bg-[repeating-linear-gradient(90deg,#D9D3CA_0_4px,transparent_4px_7px)]" : "bg-[#E9E5DF]"}`}
                        />
                    </li>
                ))}
            </ol>
        );
    }
    return (
        <ol className="relative space-y-0" aria-label="Étapes de l’adoption">
            {list.map((s, i) => {
                const last = i === list.length - 1;
                const info = STEP_TEXT[s.n - 1];
                return (
                    <li key={s.n} className="relative flex gap-4 pb-6 last:pb-0">
                        {!last && <span className={`absolute left-[17px] top-9 bottom-0 w-px ${s.state === "done" ? "bg-[#1A1814]" : "bg-[#E9E5DF]"}`} aria-hidden="true" />}
                        <span
                            className={`relative z-[1] grid h-9 w-9 shrink-0 place-items-center rounded-full border text-[13px] font-semibold ${
                                s.state === "done"
                                    ? "border-[#1A1814] bg-[#1A1814] text-white"
                                    : s.state === "current"
                                        ? "border-[#C2185B] bg-white text-[#C2185B] ring-4 ring-[#FBEEF3]"
                                        : s.state === "failed"
                                            ? "border-[#9B2C2C] bg-[#9B2C2C] text-white"
                                            : s.state === "skipped"
                                                ? "border-dashed border-[#D9D3CA] bg-white text-[#B3ABA1]"
                                                : "border-[#E9E5DF] bg-white text-[#8A837A]"
                            }`}
                        >
                            {s.state === "done" ? <Check size={15} /> : s.state === "failed" ? <X size={15} /> : s.state === "current" ? <Clock3 size={15} /> : s.n}
                        </span>
                        <div className="min-w-0 pt-1">
                            <p className={`text-[15px] font-medium ${s.state === "skipped" ? "text-[#B3ABA1] line-through decoration-[#D9D3CA]" : "text-[#1A1814]"}`}>
                                {s.n}. {s.label}
                            </p>
                            <p className="mt-0.5 text-[13px] leading-relaxed text-[#6B655D]">
                                {s.state === "skipped"
                                    ? "Pas nécessaire pour cette méthode : aucune rencontre avec un médecin."
                                    : s.date
                                        ? `${s.state === "failed" ? "Arrêtée le" : "Faite le"} ${dateFr(s.date)}`
                                        : info?.text}
                            </p>
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
