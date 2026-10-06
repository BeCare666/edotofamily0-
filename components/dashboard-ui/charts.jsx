"use client";

import { useEffect, useId, useRef, useState } from "react";

// Graphiques des dashboards (aucune bibliothèque) : animés à l'apparition, info-bulle au survol,
// au toucher (mobile) et au clavier. Palette : brun profond, rose E.doto, sauge, sable.
export const PALETTE = { ink: "#1F1B16", rose: "#FF6EA9", roseDeep: "#C2185B", sage: "#3F6B45", sand: "#C9A96E", grid: "#EFE8DE", muted: "#9A8E80" };

// Passe à true juste après le premier affichage : déclenche les transitions CSS depuis zéro
export function useAnimateIn() {
    const [on, setOn] = useState(false);
    useEffect(() => {
        let r2;
        const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setOn(true)); });
        return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
    }, []);
    return on;
}

// Largeur réelle du graphique : sert à espacer les étiquettes selon l'écran
function useWidth() {
    const ref = useRef(null);
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        setWidth(el.clientWidth);
        if (typeof ResizeObserver === "undefined") return;
        const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    return [ref, width];
}

const labelStep = (count, width, minPx) => (width ? Math.max(1, Math.ceil(count / Math.max(2, Math.floor(width / minPx)))) : Math.max(1, Math.ceil(count / 6)));

// Info-bulle : x en % de la largeur ; reste dans le cadre près des bords
function Tip({ x, children }) {
    const shift = x < 18 ? "0%" : x > 82 ? "-100%" : "-50%";
    return (
        <div className="pointer-events-none absolute top-0 z-10" style={{ left: `${x}%`, transform: `translateX(${shift})` }}>
            <div className="dash-pop-in rounded-xl bg-[#1F1B16] text-white text-xs px-3 py-2 shadow-xl whitespace-nowrap">{children}</div>
        </div>
    );
}

function Legend({ items }) {
    return (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs text-[#7A6E62]">
            {items.map((it) => (
                <span key={it.label} className="inline-flex items-center gap-1.5">
                    <span className={it.line ? `w-3.5 ${it.dashed ? "border-t border-dashed" : "h-0.5"}` : "w-2.5 h-2.5 rounded-sm"} style={it.dashed ? { borderColor: it.color } : { background: it.color }} />
                    {it.label}
                </span>
            ))}
        </div>
    );
}

/**
 * Barres (empilées si plusieurs séries).
 * data : [{ key, label, title?, values: { [serie]: nombre } }] ; series : [{ key, label, color }]
 */
export function StackedBars({ data, series, height = 170, label, format = (v) => v, legend = series.length > 1 }) {
    const on = useAnimateIn();
    const [ref, width] = useWidth();
    const [active, setActive] = useState(null);
    const sums = data.map((d) => series.reduce((s, se) => s + (Number(d.values[se.key]) || 0), 0));
    const max = Math.max(1, ...sums);
    const every = labelStep(data.length, width, 40);
    const stagger = Math.min(40, 600 / Math.max(1, data.length));
    const a = active === null ? null : data[active];

    return (
        <div ref={ref}>
            <div className="relative" style={{ height }} role="img" aria-label={label} onMouseLeave={() => setActive(null)}>
                {[0.25, 0.5, 0.75, 1].map((f) => (
                    <div key={f} className="absolute inset-x-0 border-t border-[#EFE8DE]" style={{ bottom: `${f * 92}%` }} />
                ))}
                <div className="absolute inset-0 flex items-end">
                    {data.map((d, i) => {
                        const pct = (sums[i] / max) * 92;
                        return (
                            <div
                                key={d.key}
                                className="flex-1 h-full flex items-end justify-center outline-none"
                                tabIndex={0}
                                aria-label={`${d.title || d.label} : ${series.map((se) => `${se.label} ${format(d.values[se.key] || 0)}`).join(", ")}`}
                                onMouseEnter={() => setActive(i)}
                                onFocus={() => setActive(i)}
                                onBlur={() => setActive(null)}
                                onClick={() => setActive(i)}
                            >
                                <div
                                    className={`dash-grow-h w-[62%] max-w-[38px] flex flex-col-reverse rounded-t-[6px] overflow-hidden ${active === i ? "ring-2 ring-[#FF6EA9]/30" : ""}`}
                                    style={{
                                        height: on && sums[i] > 0 ? `max(3px, ${pct}%)` : 0,
                                        transitionDelay: `${i * stagger}ms`,
                                        opacity: active !== null && active !== i ? 0.4 : 1,
                                    }}
                                >
                                    {series.map((se) => (
                                        <div key={se.key} style={{ height: sums[i] ? `${((Number(d.values[se.key]) || 0) / sums[i]) * 100}%` : 0, background: se.color }} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {a && (
                    <Tip x={((active + 0.5) / data.length) * 100}>
                        <p className="font-medium mb-1">{a.title || a.label}</p>
                        {series.map((se) => (
                            <p key={se.key} className="flex items-center gap-1.5 text-white/80">
                                <span className="w-2 h-2 rounded-sm" style={{ background: se.color === PALETTE.ink ? "#EDE6DC" : se.color }} />
                                {se.label} : <span className="text-white font-medium">{format(a.values[se.key] || 0)}</span>
                            </p>
                        ))}
                    </Tip>
                )}
            </div>
            <div className="flex text-[10px] text-[#9A8E80] mt-1.5">
                {data.map((d, i) => (
                    <span key={d.key} className="flex-1 text-center whitespace-nowrap overflow-visible">{i % every === 0 ? d.label : ""}</span>
                ))}
            </div>
            {legend && <Legend items={series} />}
        </div>
    );
}

// Série simple (compatibilité) : [{ label, value }]
export function Bars({ data, color = PALETTE.ink, height = 170, label, format, seriesLabel = "Valeur" }) {
    return (
        <StackedBars
            label={label}
            height={height}
            format={format}
            series={[{ key: "v", label: seriesLabel, color }]}
            data={data.map((d, i) => ({ key: `${d.label}-${i}`, label: d.label, title: d.title, values: { v: d.value } }))}
        />
    );
}

// Deux courbes cumulées (inscriptions, retraits) + ligne d'objectif
// colors (facultatif) : { registrations, withdrawals, objective } ; par défaut la palette des dashboards
export function CumulativeLines({ series, objective, height = 200, colors }) {
    const C = { registrations: PALETTE.ink, withdrawals: PALETTE.rose, objective: PALETTE.sand, ...colors };
    const on = useAnimateIn();
    const [ref, width] = useWidth();
    const [active, setActive] = useState(null);
    const clip = `clip${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
    if (!series.length) return <p className="text-sm text-[#7A6E62]">La campagne n’a pas encore commencé.</p>;

    const max = Math.max(1, objective || 0, ...series.map((s) => Math.max(s.registrations, s.withdrawals)));
    const W = 100;
    const xp = (i) => (series.length === 1 ? 50 : (i / (series.length - 1)) * 100);
    const y = (v) => height - (v / max) * (height - 12);
    const path = (key) => series.map((s, i) => `${i ? "L" : "M"}${xp(i)},${y(s[key])}`).join(" ");
    const area = `${path("withdrawals")} L${xp(series.length - 1)},${height} L${xp(0)},${height} Z`;
    const every = labelStep(series.length, width, 64);
    const dateLabel = (d, opts) => new Date(`${d}T12:00:00Z`).toLocaleDateString("fr-FR", opts);

    const pick = (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        setActive(series.length === 1 ? 0 : Math.round(ratio * (series.length - 1)));
    };
    const a = active === null ? null : series[active];

    return (
        <div ref={ref}>
            <div
                className="relative touch-pan-y"
                style={{ height }}
                role="img"
                aria-label="Évolution cumulée des inscriptions et des retraits"
                onPointerMove={pick}
                onPointerDown={pick}
                onMouseLeave={() => setActive(null)}
            >
                <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id={`${clip}g`} x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor={C.withdrawals} stopOpacity="0.28" />
                            <stop offset="100%" stopColor={C.withdrawals} stopOpacity="0" />
                        </linearGradient>
                        <clipPath id={clip}>
                            <rect className="dash-reveal" x="0" y="-10" width={W} height={height + 20} style={{ transform: `scaleX(${on ? 1 : 0})` }} />
                        </clipPath>
                    </defs>
                    {[0.25, 0.5, 0.75, 1].map((f) => (
                        <line key={f} x1="0" x2={W} y1={height - (height - 12) * f} y2={height - (height - 12) * f} stroke={PALETTE.grid} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                    ))}
                    {objective > 0 && (
                        <line x1="0" x2={W} y1={y(objective)} y2={y(objective)} stroke={C.objective} strokeWidth="1.2" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                    )}
                    <g clipPath={`url(#${clip})`}>
                        <path d={area} fill={`url(#${clip}g)`} />
                        <path d={path("registrations")} fill="none" stroke={C.registrations} strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                        <path d={path("withdrawals")} fill="none" stroke={C.withdrawals} strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                    </g>
                </svg>
                {a && (
                    <>
                        <div className="absolute top-0 bottom-0 w-px bg-[#1F1B16]/15 pointer-events-none" style={{ left: `${xp(active)}%` }} />
                        {[["registrations", C.registrations], ["withdrawals", C.withdrawals]].map(([k, color]) => (
                            <span key={k} className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full border-2 border-white shadow pointer-events-none" style={{ left: `${xp(active)}%`, top: `${(y(a[k]) / height) * 100}%`, background: color }} />
                        ))}
                        <Tip x={xp(active)}>
                            <p className="font-medium mb-1">{dateLabel(a.date, { day: "numeric", month: "long", year: "numeric" })}</p>
                            <p className="text-white/80">Inscriptions (cumul) : <span className="text-white font-medium">{a.registrations}</span></p>
                            <p className="text-white/80">Kits retirés (cumul) : <span className="text-[#FF9CC6] font-medium">{a.withdrawals}</span></p>
                            {objective > 0 && <p className="text-white/60 mt-0.5">Objectif : {objective}</p>}
                        </Tip>
                    </>
                )}
            </div>
            <div className="flex justify-between text-[10px] text-[#9A8E80] mt-1.5">
                {series.filter((_, i) => i % every === 0 || i === series.length - 1).map((s) => (
                    <span key={s.date}>{dateLabel(s.date, { day: "2-digit", month: "short" })}</span>
                ))}
            </div>
            <Legend items={[
                { label: "Inscriptions (cumul)", color: C.registrations, line: true },
                { label: "Kits retirés (cumul)", color: C.withdrawals, line: true },
                ...(objective > 0 ? [{ label: `Objectif (${objective})`, color: C.objective, line: true, dashed: true }] : []),
            ]} />
        </div>
    );
}

// Anneau : segments animés ; au survol (ou toucher), le centre affiche le segment
export function Donut({ items, label, unit = "campagnes" }) {
    const on = useAnimateIn();
    const [active, setActive] = useState(null);
    const total = items.reduce((s, i) => s + i.value, 0);
    const r = 60;
    const c = 2 * Math.PI * r;
    let offset = 0;
    const a = active === null ? null : items[active];
    return (
        <div className="flex flex-col sm:flex-row xl:flex-col 2xl:flex-row items-center gap-6" onMouseLeave={() => setActive(null)}>
            <svg viewBox="0 0 160 160" className="w-40 h-40 shrink-0" role="img" aria-label={label}>
                <circle cx="80" cy="80" r={r} fill="none" stroke={PALETTE.grid} strokeWidth="18" />
                {total > 0 && items.map((it, i) => {
                    const len = (it.value / total) * c;
                    const el = (
                        <circle key={it.label} className="dash-arc cursor-pointer" cx="80" cy="80" r={r} fill="none" stroke={it.color}
                            strokeWidth={active === i ? 22 : 18}
                            strokeDasharray={on ? `${len} ${c - len}` : `0 ${c}`}
                            strokeDashoffset={-offset}
                            transform="rotate(-90 80 80)"
                            opacity={active !== null && active !== i ? 0.35 : 1}
                            onMouseEnter={() => setActive(i)}
                            onClick={() => setActive(i)} />
                    );
                    offset += len;
                    return el;
                })}
                <text x="80" y="78" textAnchor="middle" className="font-serif" fontSize="30" fill={PALETTE.ink}>{a ? a.value : total}</text>
                <text x="80" y="98" textAnchor="middle" fontSize="10" fill={PALETTE.muted}>{a ? a.label.toLowerCase() : unit}</text>
            </svg>
            <ul className="space-y-1 text-sm w-full sm:w-auto">
                {items.map((it, i) => (
                    <li key={it.label}>
                        <button onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onBlur={() => setActive(null)} onClick={() => setActive(i)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${active === i ? "bg-[#F6F1EA]" : ""}`}>
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: it.color }} />
                            <span className="flex-1 text-[#3B342D]">{it.label}</span>
                            <span className="text-[#1F1B16] font-medium tabular-nums">{it.value}</span>
                            <span className="text-[#9A8E80] text-xs w-10 text-right tabular-nums">{total ? `${Math.round((it.value / total) * 100)} %` : ""}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Barres horizontales : inscrits / retirés par ville ou par point
export function HBars({ rows }) {
    const on = useAnimateIn();
    const max = Math.max(1, ...rows.map((r) => r.registrations));
    return (
        <ul className="space-y-3.5">
            {rows.map((r, i) => {
                const rate = r.registrations ? Math.round((r.withdrawn / r.registrations) * 100) : 0;
                return (
                    <li key={r.label} className="group" title={`${r.label} : ${r.withdrawn} retiré(s) sur ${r.registrations} inscrit(s) (${rate} %)`}>
                        <div className="flex justify-between text-sm mb-1.5 gap-2">
                            <span className="text-[#1F1B16] truncate">{r.label}</span>
                            <span className="text-[#7A6E62] shrink-0 tabular-nums">
                                {r.withdrawn} / {r.registrations}
                                <span className="ml-1.5 text-[#9A8E80] opacity-0 group-hover:opacity-100 transition-opacity">{rate} %</span>
                            </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-[#F1ECE4] overflow-hidden relative">
                            <div className="dash-grow absolute inset-y-0 left-0 rounded-full bg-[#1F1B16]/15" style={{ width: on ? `${(r.registrations / max) * 100}%` : 0, transitionDelay: `${i * 60}ms` }} />
                            <div className="dash-grow absolute inset-y-0 left-0 rounded-full bg-[#FF6EA9]" style={{ width: on ? `${(r.withdrawn / max) * 100}%` : 0, transitionDelay: `${i * 60 + 150}ms` }} />
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

// colors (facultatif) : une couleur par étape ; par défaut la palette des dashboards
export function Funnel({ steps, colors = [PALETTE.ink, PALETTE.sand, PALETTE.rose] }) {
    const on = useAnimateIn();
    const top = Math.max(1, steps[0]?.value || 0);
    return (
        <div className="space-y-3">
            {steps.map((s, i) => (
                <div key={s.step}>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#1F1B16]">{s.step}</span>
                        <span className="text-[#7A6E62] tabular-nums">{s.value}{i > 0 && steps[0].value > 0 ? ` · ${Math.round((s.value / steps[0].value) * 100)} %` : ""}</span>
                    </div>
                    <div className="h-8 rounded-xl bg-[#F1ECE4] overflow-hidden">
                        <div className="dash-grow h-full rounded-xl" style={{ width: on ? `${(s.value / top) * 100}%` : 0, transitionDelay: `${i * 120}ms`, background: colors[i] }} />
                    </div>
                </div>
            ))}
        </div>
    );
}
