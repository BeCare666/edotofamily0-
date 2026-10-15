"use client";

import { useCallback, useEffect, useState } from "react";
import { SlidersHorizontal, RotateCcw, X, Search } from "lucide-react";
import { api } from "../pickup-dashboard/api";
import { Card } from "../pickup-dashboard/ui";

// Filtres de l'espace sponsor (15/10/2026). Les options viennent toujours de l'API (GET sponsor/filters) :
// campagnes, villes et points de retrait réellement liés au sponsor. Aucune valeur inventée.

const control = "w-full min-w-0 rounded-xl border border-[#E7DFD4] bg-white px-3 py-2.5 text-sm text-[#1F1B16] focus:outline-none focus:ring-2 focus:ring-[#FF6EA9]/25 focus:border-[#E4DBCE]";

let cache = null;
export function useSponsorFilters() {
    const [data, setData] = useState(cache);
    useEffect(() => {
        if (cache) return;
        api("sponsor/filters").then((d) => { cache = d; setData(d); }).catch(() => setData({ campaigns: [], cities: [], points: [], statuses: [] }));
    }, []);
    return data;
}
export const resetFiltersCache = () => { cache = null; };

// État de filtres { clé: valeur } avec remise à zéro
export function useFilterState(initial) {
    const [values, setValues] = useState(initial);
    const set = useCallback((patch) => setValues((v) => ({ ...v, ...patch, ...(patch.page === undefined ? { page: 1 } : {}) })), []);
    const reset = useCallback(() => setValues(initial), [initial]);
    return [values, set, reset];
}

export function Field({ label, children, className = "" }) {
    return (
        <label className={`block min-w-0 ${className}`}>
            <span className="block text-[11px] uppercase tracking-[0.12em] text-[#9A8E80] mb-1.5">{label}</span>
            {children}
        </label>
    );
}

export function SelectField({ label, value, onChange, options = [], allLabel = "Tous", className }) {
    return (
        <Field label={label} className={className}>
            <select className={control} value={value} onChange={(e) => onChange(e.target.value)}>
                {allLabel !== null && <option value="">{allLabel}</option>}
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}{typeof o.count === "number" ? ` (${o.count})` : ""}
                    </option>
                ))}
            </select>
        </Field>
    );
}

export function DateField({ label, value, onChange, min, max }) {
    return (
        <Field label={label}>
            <input type="date" className={control} value={value} min={min || undefined} max={max || undefined} onChange={(e) => onChange(e.target.value)} />
        </Field>
    );
}

export function SearchField({ label = "Recherche", value, onChange, placeholder }) {
    const [text, setText] = useState(value);
    useEffect(() => setText(value), [value]);
    useEffect(() => {
        const t = setTimeout(() => text !== value && onChange(text), 350);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text]);
    return (
        <Field label={label}>
            <span className="relative block">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A8E80]" aria-hidden="true" />
                <input type="search" className={`${control} pl-9`} value={text} placeholder={placeholder} onChange={(e) => setText(e.target.value)} />
            </span>
        </Field>
    );
}

// Puces de choix exclusif avec compteurs réels
export function Chips({ value, onChange, items }) {
    return (
        <div className="dash-scroll-x flex gap-2 overflow-x-auto pb-1" role="tablist">
            {items.map((it) => {
                const on = value === it.value;
                return (
                    <button key={it.value || "all"} role="tab" aria-selected={on} onClick={() => onChange(it.value)}
                        className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${on ? "border-[#1F1B16] bg-[#1F1B16] text-white" : "border-[#E7DFD4] bg-white text-[#3B342D] hover:border-[#1F1B16]"}`}>
                        {it.label}
                        {typeof it.count === "number" && <span className={`ml-2 text-xs ${on ? "text-white/70" : "text-[#9A8E80]"}`}>{it.count.toLocaleString("fr-FR")}</span>}
                    </button>
                );
            })}
        </div>
    );
}

/**
 * Panneau de filtres : rangée principale toujours visible, filtres avancés repliables,
 * rappel des filtres actifs (supprimables un par un) et remise à zéro.
 * active : [{ key, label }] ; onRemove(key)
 */
export function FilterPanel({ main, advanced, active = [], onRemove, onReset, result }) {
    const [open, setOpen] = useState(false);
    return (
        <Card className="p-4 sm:p-5 mb-6">
            <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 xl:grid-cols-4">{main}</div>
            {advanced && (
                <>
                    <div className={`grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 xl:grid-cols-4 overflow-hidden transition-all duration-300 ${open ? "mt-3 max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`} aria-hidden={!open}>
                        {open && advanced}
                    </div>
                </>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
                {advanced && (
                    <button onClick={() => setOpen((v) => !v)} aria-expanded={open}
                        className="inline-flex items-center gap-2 rounded-full border border-[#E7DFD4] px-3.5 py-1.5 text-xs text-[#3B342D] hover:border-[#1F1B16]">
                        <SlidersHorizontal size={14} /> {open ? "Moins de filtres" : "Plus de filtres"}
                    </button>
                )}
                {active.map((a) => (
                    <span key={a.key} className="inline-flex items-center gap-1.5 rounded-full bg-[#F3EEE7] px-3 py-1.5 text-xs text-[#3B342D]">
                        {a.label}
                        <button onClick={() => onRemove(a.key)} aria-label={`Retirer le filtre ${a.label}`} className="text-[#9A8E80] hover:text-[#1F1B16]"><X size={13} /></button>
                    </span>
                ))}
                {active.length > 0 && (
                    <button onClick={onReset} className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs text-[#C2185B] hover:underline">
                        <RotateCcw size={13} /> Tout effacer
                    </button>
                )}
                {result && <span className="ml-auto text-xs text-[#9A8E80]">{result}</span>}
            </div>
        </Card>
    );
}

export const labelOf = (options, value) => options?.find((o) => String(o.value) === String(value))?.label ?? value;
export const dateFr = (d) => (d ? new Date(`${d}T12:00:00Z`).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "");
