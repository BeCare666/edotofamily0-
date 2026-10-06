// Dates des campagnes : jour au Bénin (le statut est calculé par l'API, fin incluse)
const DAY_FMT = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Porto-Novo", year: "numeric", month: "2-digit", day: "2-digit" });

export function beninDay(v) {
    if (!v) return null;
    const s = String(v);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : DAY_FMT.format(d);
}

// Début : 00:00 du premier jour ; fin : 23:59:59 du dernier jour (heure du Bénin, UTC+1)
export const startMoment = (c) => (beninDay(c.date_start) ? new Date(`${beninDay(c.date_start)}T00:00:00+01:00`) : null);
export const endMoment = (c) => (beninDay(c.date_end) ? new Date(`${beninDay(c.date_end)}T23:59:59+01:00`) : null);

export const longDate = (v) =>
    beninDay(v) ? new Date(`${beninDay(v)}T12:00:00+01:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—";
export const shortDate = (v) =>
    beninDay(v) ? new Date(`${beninDay(v)}T12:00:00+01:00`).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—";

export const nf = (n) => Math.round(Number(n) || 0).toLocaleString("fr-FR");

export function daysUntil(date) {
    if (!date) return null;
    return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86400000));
}

export const STATUS = {
    en_cours: { label: "En cours", dot: "bg-[#FF6EA9]", chip: "bg-[#FF6EA9]/15 text-[#FFB8D5] ring-[#FF6EA9]/30", light: "bg-rose-50 text-[#C2185B] ring-rose-200/70" },
    a_venir: { label: "À venir", dot: "bg-[#C9A96E]", chip: "bg-[#C9A96E]/15 text-[#E9D3A6] ring-[#C9A96E]/30", light: "bg-amber-50 text-amber-800 ring-amber-200/70" },
    terminee: { label: "Terminée", dot: "bg-slate-400", chip: "bg-white/10 text-white/70 ring-white/15", light: "bg-slate-100 text-slate-600 ring-slate-200" },
};
