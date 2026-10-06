"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Loader2, Navigation } from "lucide-react";
import { CumulativeLines, Funnel, HBars, useAnimateIn } from "../dashboard-ui/charts";
import { KitStepsTracker } from "./CampaignKit";
import { INK, ROSE, STATUS, endMoment, longDate, nf, startMoment } from "./campaignUtils";

const API = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
const CHART_COLORS = { registrations: INK, withdrawals: ROSE, objective: "#A8A29B" };

// Compte à rebours en direct jusqu'à une date
export function Countdown({ to }) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);
    const ms = Math.max(0, (to?.getTime() || 0) - now);
    const parts = [
        [Math.floor(ms / 86400000), "jours"],
        [Math.floor(ms / 3600000) % 24, "heures"],
        [Math.floor(ms / 60000) % 60, "minutes"],
        [Math.floor(ms / 1000) % 60, "secondes"],
    ];
    return (
        <div className="grid grid-cols-4 divide-x divide-[#EDE8E2] border-y border-[#EDE8E2]">
            {parts.map(([v, l]) => (
                <div key={l} className="py-4 text-center">
                    <p className="font-brand text-[32px] font-semibold tabular-nums leading-none text-[#161412]">{String(v).padStart(2, "0")}</p>
                    <p className="mt-1.5 text-[11px] text-[#8A847D]">{l}</p>
                </div>
            ))}
        </div>
    );
}

// Anneau de progression (kits retirés / kits prévus) : trait fin, encre sur gris clair
export function Ring({ value, max, size = 128, stroke = 6, caption = "kits retirés" }) {
    const on = useAnimateIn();
    const pct = max > 0 ? Math.min(1, value / max) : 0;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EDE8E2" strokeWidth={stroke} />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={INK}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={on ? c * (1 - pct) : c}
                    style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-brand font-semibold leading-none tabular-nums text-[#161412]" style={{ fontSize: size * 0.24 }}>{Math.round(pct * 100)}%</span>
                <span className="mt-1 text-[10px] text-[#8A847D]">{caption}</span>
            </div>
        </div>
    );
}

function Section({ title, sub, children }) {
    return (
        <section className="border-t border-[#EDE8E2] px-6 py-7 sm:px-8">
            <h3 className="font-brand text-[22px] font-semibold text-[#161412]">{title}</h3>
            {sub && <p className="mt-0.5 text-[13px] text-[#8A847D]">{sub}</p>}
            <div className="mt-5">{children}</div>
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
            <motion.div className="fixed inset-0 z-[210] bg-[#161412]/35" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
            <motion.aside
                role="dialog"
                aria-label={campaign.title}
                className="fixed inset-y-0 right-0 z-[220] flex w-full max-w-[640px] flex-col bg-white shadow-[0_0_80px_-20px_rgba(22,20,18,0.35)]"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 36 }}
            >
                <div className="flex-1 overflow-y-auto">
                    <div className="flex items-center justify-between px-6 pt-5 sm:px-8">
                        <span className={`inline-flex items-center gap-2 text-[12px] font-medium ${st.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                            {inMyCity && <span className="text-[#8A847D]">· près de chez vous</span>}
                        </span>
                        <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-full p-2 text-[#77716B] hover:bg-[#F4F1ED]">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="px-6 pb-6 pt-3 sm:px-8">
                        <h2 className="font-brand text-[38px] font-semibold leading-[1.05] text-[#161412] sm:text-[44px]">{campaign.title}</h2>
                        <p className="mt-2 text-[14px] text-[#5E5953]">{(campaign.cities || []).join(" · ") || campaign.location}</p>
                    </div>
                    {campaign.image_url && (
                        <div className="px-6 sm:px-8">
                            <img src={campaign.image_url} alt="" className="aspect-[16/9] w-full rounded-xl object-cover" />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6 px-6 py-6 text-[14px] sm:px-8">
                        <div>
                            <p className="text-[12px] text-[#8A847D]">Ouverture</p>
                            <p className="mt-1 font-medium text-[#161412]">{longDate(campaign.date_start)}</p>
                        </div>
                        <div>
                            <p className="text-[12px] text-[#8A847D]">Clôture</p>
                            <p className="mt-1 font-medium text-[#161412]">{campaign.date_end ? longDate(campaign.date_end) : "Non définie"}</p>
                        </div>
                    </div>
                    {(live ? end : start) && (
                        <div className="px-6 pb-7 sm:px-8">
                            <p className="mb-3 text-[13px] text-[#77716B]">{live ? "Fin de la campagne dans" : "Ouverture dans"}</p>
                            <Countdown to={live ? end : start} />
                        </div>
                    )}

                    {registration && (
                        <Section title="Ma demande" sub={registration.pickup_center_name ? `Point de retrait : ${registration.pickup_center_name}` : null}>
                            <KitStepsTracker reg={registration} onRegenerate={() => onRegenerate(registration)} regenerating={regenerating} />
                        </Section>
                    )}

                    {campaign.description && (
                        <Section title="La campagne">
                            <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#3A3632]">{campaign.description}</p>
                        </Section>
                    )}

                    <Section title="En chiffres">
                        <div className="flex flex-col items-center gap-7 sm:flex-row">
                            <Ring value={withdrawn} max={objective} />
                            <dl className="grid w-full grid-cols-3 divide-x divide-[#EDE8E2]">
                                {[
                                    ["Kits prévus", objective],
                                    ["Demandes", registrations],
                                    ["Kits retirés", withdrawn],
                                ].map(([k, v]) => (
                                    <div key={k} className="px-3 text-center first:pl-0 last:pr-0">
                                        <dd className="font-brand text-[30px] font-semibold leading-none tabular-nums text-[#161412]">{nf(v)}</dd>
                                        <dt className="mt-1.5 text-[12px] text-[#8A847D]">{k}</dt>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </Section>

                    {!stats && !error && (
                        <div className="flex items-center justify-center gap-2 border-t border-[#EDE8E2] py-8 text-sm text-[#8A847D]">
                            <Loader2 size={16} className="animate-spin" /> Chargement des graphiques…
                        </div>
                    )}
                    {error && <p className="border-t border-[#EDE8E2] px-8 py-6 text-center text-sm text-[#8A847D]">Les graphiques ne sont pas disponibles pour le moment.</p>}

                    {stats && (
                        <>
                            {live && stats.daily?.length > 0 && (
                                <Section title="Évolution" sub="Demandes et kits retirés, jour après jour">
                                    <CumulativeLines series={stats.daily} objective={objective} height={190} colors={CHART_COLORS} />
                                </Section>
                            )}
                            {stats.registrations > 0 && (
                                <Section title="Parcours" sub="De la demande au kit remis">
                                    <Funnel
                                        colors={[INK, "#8A847D", ROSE]}
                                        steps={[
                                            { step: "Demandes", value: stats.registrations },
                                            { step: "Codes validés au point", value: stats.validated },
                                            { step: "Kits retirés", value: stats.withdrawn },
                                        ]}
                                    />
                                </Section>
                            )}
                            <Section title="Villes" sub="Demandes et kits retirés par ville">
                                <HBars rows={stats.by_city.map((c) => ({ label: c.label, registrations: c.registrations, withdrawn: c.withdrawn }))} />
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {(campaign.cities || []).map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => onShowCity(c)}
                                            className="inline-flex items-center gap-1.5 rounded-full border border-[#E2DCD5] px-3.5 py-1.5 text-[12px] text-[#3A3632] hover:border-[#161412]"
                                        >
                                            <Navigation size={12} strokeWidth={1.8} /> {c} sur la carte
                                        </button>
                                    ))}
                                </div>
                            </Section>
                        </>
                    )}
                </div>

                <div className="border-t border-[#EDE8E2] bg-white px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-8">
                    {registration ? (
                        <p className="text-center text-sm text-[#5E5953]">Demande déjà faite : suivez-la ci-dessus.</p>
                    ) : live ? (
                        <button type="button" onClick={() => onRequest(campaign)} className="flex w-full items-center justify-center rounded-full bg-[#161412] py-4 text-[15px] font-medium text-white transition hover:bg-black">
                            Demander mon kit gratuit
                        </button>
                    ) : (
                        <p className="text-center text-sm text-[#5E5953]">Les demandes ouvriront le {longDate(campaign.date_start)}.</p>
                    )}
                </div>
            </motion.aside>
        </>
    );
}
