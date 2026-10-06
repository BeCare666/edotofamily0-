"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, MapPin, CalendarDays, Gift, Loader2, Navigation, Sparkles, Clock3 } from "lucide-react";
import { CumulativeLines, Funnel, HBars, useAnimateIn } from "../dashboard-ui/charts";
import { KitStepsTracker } from "./CampaignKit";
import { STATUS, endMoment, longDate, nf, startMoment } from "./campaignUtils";

const API = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;

// Compte à rebours en direct jusqu'à une date
export function Countdown({ to, dark = false }) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);
    const ms = Math.max(0, (to?.getTime() || 0) - now);
    const parts = [
        [Math.floor(ms / 86400000), "jours"],
        [Math.floor(ms / 3600000) % 24, "heures"],
        [Math.floor(ms / 60000) % 60, "min"],
        [Math.floor(ms / 1000) % 60, "sec"],
    ];
    return (
        <div className="grid grid-cols-4 gap-2">
            {parts.map(([v, l]) => (
                <div key={l} className={`rounded-2xl px-2 py-3 text-center ${dark ? "bg-white/[0.06] ring-1 ring-white/10" : "bg-white ring-1 ring-[#EFE8DE]"}`}>
                    <p className={`font-brand text-[28px] font-semibold tabular-nums leading-none ${dark ? "text-white" : "text-[#1F1B16]"}`}>{String(v).padStart(2, "0")}</p>
                    <p className={`mt-1 text-[10px] uppercase tracking-[0.16em] ${dark ? "text-white/50" : "text-[#9A8E80]"}`}>{l}</p>
                </div>
            ))}
        </div>
    );
}

// Anneau de progression animé (kits retirés / kits prévus)
export function Ring({ value, max, size = 132, stroke = 11, dark = false, caption = "kits retirés" }) {
    const on = useAnimateIn();
    const pct = max > 0 ? Math.min(1, value / max) : 0;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const id = `ring${size}${dark ? "d" : "l"}`;
    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
                <defs>
                    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#FF9CC6" />
                        <stop offset="100%" stopColor="#C2185B" />
                    </linearGradient>
                </defs>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={dark ? "rgba(255,255,255,0.08)" : "#F1ECE4"} strokeWidth={stroke} />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={`url(#${id})`}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={on ? c * (1 - pct) : c}
                    style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`font-brand text-[30px] font-semibold leading-none tabular-nums ${dark ? "text-white" : "text-[#1F1B16]"}`}>{Math.round(pct * 100)}%</span>
                <span className={`mt-1 text-[10px] uppercase tracking-[0.14em] ${dark ? "text-white/50" : "text-[#9A8E80]"}`}>{caption}</span>
            </div>
        </div>
    );
}

function Card({ title, sub, children }) {
    return (
        <section className="rounded-[28px] bg-white p-5 ring-1 ring-[#EFE8DE] sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9A8E80]">{title}</p>
            {sub && <p className="mt-0.5 text-[13px] text-[#7A6E62]">{sub}</p>}
            <div className="mt-4">{children}</div>
        </section>
    );
}

/**
 * Fiche d'une campagne (panneau latéral ; plein écran sur mobile) : dates, compte à rebours,
 * chiffres réels (GET /campaigns/:id/stats), graphiques, villes, et suivi de la demande.
 */
export default function CampaignDetail({ campaign, registration, myCity, onClose, onRequest, onShowCity, onRegenerate, regenerating }) {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(false);
    const st = STATUS[campaign.status] || STATUS.en_cours;
    const live = campaign.status === "en_cours";
    const end = endMoment(campaign);
    const start = startMoment(campaign);

    useEffect(() => {
        let alive = true;
        setStats(null);
        setError(false);
        fetch(`${API}/campaigns/${campaign.id}/stats`)
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((d) => alive && setStats(d))
            .catch(() => alive && setError(true));
        return () => {
            alive = false;
        };
    }, [campaign.id]);

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [onClose]);

    const objective = Number(stats?.objective_kits ?? campaign.objective_kits) || 0;
    const registrations = stats?.registrations ?? campaign.registrations_count ?? 0;
    const withdrawn = stats?.withdrawn ?? campaign.picked_up_count ?? 0;
    const inMyCity = myCity && (campaign.cities || []).some((c) => c.toLowerCase() === myCity.toLowerCase());

    return (
        <>
            <motion.div className="fixed inset-0 z-[210] bg-[#0F0C0A]/55 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
            <motion.aside
                role="dialog"
                aria-label={campaign.title}
                className="fixed inset-y-0 right-0 z-[220] flex w-full max-w-[680px] flex-col bg-[#FBF7F2] shadow-2xl"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 34 }}
            >
                <div className="flex-1 overflow-y-auto">
                    {/* Visuel */}
                    <div className="relative h-64 overflow-hidden bg-[#1F1B16] sm:h-72">
                        {campaign.image_url ? (
                            <img src={campaign.image_url} alt="" className="h-full w-full object-cover opacity-80" />
                        ) : (
                            <div className="h-full w-full bg-[radial-gradient(600px_300px_at_20%_10%,rgba(255,110,169,0.45),transparent_60%),radial-gradient(500px_260px_at_90%_90%,rgba(201,169,110,0.35),transparent_60%)]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0C0A] via-[#0F0C0A]/40 to-transparent" />
                        <button type="button" onClick={onClose} aria-label="Fermer" className="absolute right-4 top-4 rounded-full bg-black/40 p-2.5 text-white backdrop-blur hover:bg-black/60">
                            <X size={18} />
                        </button>
                        <div className="absolute inset-x-0 bottom-0 p-6">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ${st.chip}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${st.dot} ${live ? "animate-pulse" : ""}`} />
                                    {st.label}
                                </span>
                                {inMyCity && <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white ring-1 ring-white/20">Près de chez vous</span>}
                            </div>
                            <h2 className="mt-3 font-brand text-[34px] font-semibold leading-[1.05] text-white sm:text-[40px]">{campaign.title}</h2>
                        </div>
                    </div>

                    <div className="space-y-4 p-4 sm:p-6">
                        {/* Dates + compte à rebours */}
                        <section className="rounded-[28px] bg-[#1F1B16] p-5 text-white sm:p-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/50">Ouverture</p>
                                    <p className="mt-1 flex items-center gap-2 font-medium"><CalendarDays size={15} className="text-[#C9A96E]" />{longDate(campaign.date_start)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/50">Clôture</p>
                                    <p className="mt-1 flex items-center gap-2 font-medium"><Clock3 size={15} className="text-[#C9A96E]" />{campaign.date_end ? longDate(campaign.date_end) : "Non définie"}</p>
                                </div>
                            </div>
                            {(live ? end : start) && (
                                <div className="mt-5">
                                    <p className="mb-2.5 text-[12px] text-white/60">{live ? "Fin de la campagne dans" : "Ouverture dans"}</p>
                                    <Countdown to={live ? end : start} dark />
                                </div>
                            )}
                        </section>

                        {/* Suivi de la demande */}
                        {registration && (
                            <Card title="Ma demande de kit" sub={registration.pickup_center_name ? `Point de retrait : ${registration.pickup_center_name}` : null}>
                                <KitStepsTracker reg={registration} onRegenerate={() => onRegenerate(registration)} regenerating={regenerating} />
                            </Card>
                        )}

                        {campaign.description && (
                            <Card title="La campagne">
                                <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#3B342D]">{campaign.description}</p>
                            </Card>
                        )}

                        {/* Chiffres */}
                        <Card title="En chiffres" sub="Données réelles de la campagne">
                            <div className="flex flex-col items-center gap-6 sm:flex-row">
                                <Ring value={withdrawn} max={objective} />
                                <dl className="grid w-full grid-cols-3 gap-3">
                                    {[
                                        ["Kits prévus", objective],
                                        ["Demandes", registrations],
                                        ["Kits retirés", withdrawn],
                                    ].map(([k, v]) => (
                                        <div key={k} className="rounded-2xl bg-[#FBF7F2] p-3 text-center ring-1 ring-[#EFE8DE]">
                                            <dd className="font-brand text-[26px] font-semibold leading-none tabular-nums text-[#1F1B16]">{nf(v)}</dd>
                                            <dt className="mt-1.5 text-[11px] text-[#7A6E62]">{k}</dt>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        </Card>

                        {!stats && !error && (
                            <div className="flex items-center justify-center gap-2 py-8 text-sm text-[#9A8E80]">
                                <Loader2 size={16} className="animate-spin" /> Chargement des graphiques…
                            </div>
                        )}
                        {error && <p className="rounded-2xl bg-white p-4 text-center text-sm text-[#9A8E80] ring-1 ring-[#EFE8DE]">Les graphiques ne sont pas disponibles pour le moment.</p>}

                        {stats && (
                            <>
                                {live && stats.daily?.length > 0 && (
                                    <Card title="Évolution" sub="Demandes et kits retirés, jour après jour">
                                        <CumulativeLines series={stats.daily} objective={objective} height={190} />
                                    </Card>
                                )}
                                {stats.registrations > 0 && (
                                    <Card title="Parcours" sub="De la demande au kit remis">
                                        <Funnel
                                            steps={[
                                                { step: "Demandes", value: stats.registrations },
                                                { step: "Codes validés au point", value: stats.validated },
                                                { step: "Kits retirés", value: stats.withdrawn },
                                            ]}
                                        />
                                    </Card>
                                )}
                                <Card title="Villes" sub="Demandes et kits retirés par ville">
                                    <HBars rows={stats.by_city.map((c) => ({ label: c.label, registrations: c.registrations, withdrawn: c.withdrawn }))} />
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {(campaign.cities || []).map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => onShowCity(c)}
                                                className="inline-flex items-center gap-1.5 rounded-full bg-[#FBF7F2] px-3.5 py-2 text-[12px] font-medium text-[#3B342D] ring-1 ring-[#EFE8DE] hover:ring-[#C9A96E]"
                                            >
                                                <Navigation size={13} className="text-[#C9A96E]" /> {c} sur la carte
                                            </button>
                                        ))}
                                    </div>
                                </Card>
                            </>
                        )}
                    </div>
                </div>

                {/* Action */}
                <div className="border-t border-[#EFE8DE] bg-white/80 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur sm:px-6">
                    {registration ? (
                        <p className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-700">
                            <Gift size={17} /> Demande déjà faite : suivez-la ci-dessus.
                        </p>
                    ) : live ? (
                        <button
                            type="button"
                            onClick={() => onRequest(campaign)}
                            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6EA9] to-[#C2185B] text-[15px] font-semibold text-white shadow-[0_18px_40px_-16px_rgba(194,24,91,0.8)] transition hover:brightness-105"
                        >
                            <Sparkles size={18} /> Demander mon kit gratuit
                        </button>
                    ) : (
                        <p className="flex items-center justify-center gap-2 text-sm text-[#7A6E62]">
                            <MapPin size={16} className="text-[#C9A96E]" /> Les demandes ouvriront le {longDate(campaign.date_start)}.
                        </p>
                    )}
                </div>
            </motion.aside>
        </>
    );
}
