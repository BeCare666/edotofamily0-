// Téléconsultation (19/10/2026) : utilitaires communs du site (dates à l'heure du Bénin, libellés, brouillon).
export { api, API, token, qs } from "../pickup-dashboard/api";

export const TZ = "Africa/Porto-Novo";

export const MODE_LABEL = { video: "Visio", phone: "Appel téléphonique" };

/** « mardi 21 octobre » */
export const dayLabel = (iso, opts = {}) =>
    new Date(iso).toLocaleDateString("fr-FR", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", ...opts });

/** « 14:30 » → « 14 h 30 » */
export const timeLabel = (iso) =>
    new Date(iso).toLocaleTimeString("fr-FR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).replace(":", " h ");

export const fullLabel = (iso) => `${dayLabel(iso, { year: "numeric" })} à ${timeLabel(iso)}`;

/** Jour du Bénin (AAAA-MM-JJ) d'un instant */
export const beninDay = (d = new Date()) => new Date(new Date(d).getTime() + 3600000).toISOString().slice(0, 10);

// Brouillon de réservation gardé pendant la connexion (créneau choisi avant de se connecter)
const DRAFT_KEY = "edoto-tc-draft";
export function saveDraft(draft) {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, saved: Date.now() })); } catch { }
}
export function readDraft() {
    try {
        const d = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null");
        // Brouillon valable 30 minutes
        return d && Date.now() - d.saved < 30 * 60000 ? d : null;
    } catch {
        return null;
    }
}
export function clearDraft() {
    try { sessionStorage.removeItem(DRAFT_KEY); } catch { }
}

/** Fichier agenda (.ics) du rendez-vous, généré dans le navigateur */
export function downloadIcs({ reference, starts_at, ends_at, mode, room_url }) {
    const fmt = (iso) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//E.doto family//Teleconsultation//FR",
        "BEGIN:VEVENT",
        `UID:${reference}@edotofamily`,
        `DTSTAMP:${fmt(new Date().toISOString())}`,
        `DTSTART:${fmt(starts_at)}`,
        `DTEND:${fmt(ends_at)}`,
        `SUMMARY:Téléconsultation E.doto family (${MODE_LABEL[mode]})`,
        `DESCRIPTION:Référence ${reference}${room_url ? `\\nVisio : ${room_url}` : "\\nLe médecin vous appelle à l'heure du rendez-vous."}`,
        ...(room_url ? [`URL:${room_url}`] : []),
        "BEGIN:VALARM",
        "TRIGGER:-PT15M",
        "ACTION:DISPLAY",
        "DESCRIPTION:Téléconsultation dans 15 minutes",
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR",
    ];
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `rendez-vous-${reference}.ics`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
