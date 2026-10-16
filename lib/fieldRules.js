// Règles de saisie du site (16/10/2026), identiques à celles de l'API
// (edoto-api/src/common/field-rules.ts). L'API reste la référence ; ici elles servent à guider
// la saisie (caractères refusés dès la frappe, messages sous les champs).

// Téléphone : on ne garde que les chiffres (et un « + » au tout début)
export function phoneInput(v) {
    const s = String(v ?? "");
    const plus = s.trimStart().startsWith("+");
    const digits = s.replace(/\D/g, "").slice(0, 15);
    return (plus ? "+" : "") + digits;
}
export function phoneError(v, { required = true } = {}) {
    const s = String(v ?? "").replace(/[\s.]/g, "");
    if (!s) return required ? "Le numéro de téléphone est obligatoire." : "";
    if (!/^\+?\d+$/.test(s)) return "Le numéro de téléphone ne doit contenir que des chiffres.";
    const n = s.replace("+", "").length;
    if (n < 8 || n > 15) return "Le numéro de téléphone doit contenir entre 8 et 15 chiffres.";
    return "";
}

// Nom de personne : lettres (accents compris), espaces, apostrophe, trait d'union, point
const NAME_RE = /^[\p{L}][\p{L}\p{M}' .\-]*$/u;
export function nameInput(v) {
    return String(v ?? "").replace(/[^\p{L}\p{M}' .\-]/gu, "").replace(/\s{2,}/g, " ").slice(0, 100);
}
export function nameError(v, label = "Le nom") {
    const s = String(v ?? "").replace(/\s+/g, " ").trim();
    if (!s) return `${label} est obligatoire.`;
    if (s.length < 2) return `${label} doit contenir au moins 2 caractères.`;
    if (!NAME_RE.test(s)) return `${label} ne doit contenir que des lettres, espaces, apostrophes ou traits d'union.`;
    return "";
}

// Nom d'organisation ou d'établissement : chiffres permis en plus
const ORG_RE = /^[\p{L}\p{N}][\p{L}\p{M}\p{N}' .,&()\-]*$/u;
export function orgInput(v) {
    return String(v ?? "").replace(/[^\p{L}\p{M}\p{N}' .,&()\-]/gu, "").replace(/\s{2,}/g, " ").slice(0, 150);
}
export function orgError(v, label = "Le nom") {
    const s = String(v ?? "").replace(/\s+/g, " ").trim();
    if (!s) return `${label} est obligatoire.`;
    if (s.length < 2) return `${label} doit contenir au moins 2 caractères.`;
    if (!ORG_RE.test(s)) return `${label} contient des caractères non autorisés.`;
    return "";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function emailInput(v) {
    return String(v ?? "").replace(/\s/g, "").slice(0, 190);
}
export function emailError(v) {
    const s = String(v ?? "").trim();
    if (!s) return "L'adresse e-mail est obligatoire.";
    if (!EMAIL_RE.test(s)) return "L'adresse e-mail n'est pas valide.";
    return "";
}

// Mot de passe : 8 à 72 caractères, une minuscule, une majuscule, un chiffre, sans espace
export const PASSWORD_RULES = [
    { key: "len", label: "8 caractères minimum", test: (p) => p.length >= 8 },
    { key: "lower", label: "Une lettre minuscule", test: (p) => /[a-z]/.test(p) },
    { key: "upper", label: "Une lettre majuscule", test: (p) => /[A-Z]/.test(p) },
    { key: "digit", label: "Un chiffre", test: (p) => /\d/.test(p) },
];
export function passwordInput(v) {
    return String(v ?? "").replace(/\s/g, "").slice(0, 72);
}
export function passwordError(v) {
    const p = String(v ?? "");
    if (!p) return "Le mot de passe est obligatoire.";
    if (/\s/.test(p)) return "Le mot de passe ne doit pas contenir d'espace.";
    const missing = PASSWORD_RULES.filter((r) => !r.test(p)).map((r) => r.label.toLowerCase());
    return missing.length ? `Le mot de passe doit contenir : ${missing.join(", ")}.` : "";
}

// Date de naissance (AAAA-MM-JJ) : vraie date, pas dans le futur, 10 à 100 ans
export const MIN_AGE = 10;
export const MAX_AGE = 100;
export function beninToday() {
    return new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10);
}
export function ageOn(birth, day = beninToday()) {
    const [by, bm, bd] = birth.split("-").map(Number);
    const [y, m, d] = day.split("-").map(Number);
    return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0);
}
export function birthDateLimits() {
    const t = beninToday();
    const y = Number(t.slice(0, 4));
    return { min: `${y - MAX_AGE}${t.slice(4)}`, max: `${y - MIN_AGE}${t.slice(4)}` };
}
export function birthDateError(v) {
    const s = String(v ?? "").trim();
    if (!s) return "La date de naissance est obligatoire.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return "Date de naissance non valide.";
    const d = new Date(`${s}T00:00:00Z`);
    if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) return "Date de naissance non valide.";
    if (s > beninToday()) return "La date de naissance ne peut pas être dans le futur.";
    const age = ageOn(s);
    if (age < MIN_AGE) return `Il faut avoir au moins ${MIN_AGE} ans.`;
    if (age > MAX_AGE) return "Date de naissance non valide.";
    return "";
}

export const SEX_OPTIONS = [
    { value: "female", label: "Féminin", hint: "Femme ou fille" },
    { value: "male", label: "Masculin", hint: "Homme ou garçon" },
];
export function sexError(v) {
    return v === "female" || v === "male" ? "" : "Choisissez votre sexe.";
}

// Nombre entier positif (quantités, kits, âges…) : chiffres seulement
export function intInput(v, max = 9) {
    return String(v ?? "").replace(/\D/g, "").slice(0, max);
}
