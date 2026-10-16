import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Building, User, Phone, Mail, Lock, CheckCircle2, Send, Radio, BarChart3 } from "lucide-react";
import BrandMark from "../../components/BrandMark";
import { AuthAlert, AuthField, AuthSubmit, PasswordField } from "../../components/auth/AuthShell";
import { emailError, emailInput, nameError, nameInput, orgError, orgInput, passwordError, passwordInput, phoneError, phoneInput } from "../../lib/fieldRules";
import { api } from "../../components/pickup-dashboard/api";
import { useAuthContext } from "../../context/AuthContext";
import { authService } from "../../services/authService";

// Inscription libre d'un sponsor (bailleur, société) : 15/10/2026.
// Parcours : inscription → demande de campagne depuis l'espace → validation par E.doto family → création de la campagne.
const STEPS = [
    { icon: Send, title: "Soumettez votre demande", text: "Décrivez la campagne souhaitée : villes, dates, nombre de kits, budget." },
    { icon: CheckCircle2, title: "Nous la validons", text: "L’équipe E.doto family étudie la demande puis crée la campagne." },
    { icon: Radio, title: "Suivez-la en direct", text: "Carte GPS des points de retrait, inscriptions et retraits en temps réel." },
    { icon: BarChart3, title: "Mesurez l’impact", text: "Statistiques, prévisions et export des données une fois la campagne terminée." },
];

export default function SponsorSignup() {
    const router = useRouter();
    const auth = useAuthContext() || {};
    const [v, setV] = useState({ organization: "", contact_name: "", phone: "", email: "", password: "", confirm: "" });
    const [touched, setTouched] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const [done, setDone] = useState(null);
    // Chaque champ filtre la saisie (téléphone : chiffres seulement, etc.) ; règles identiques à l'API (16/10/2026)
    const FILTERS = { organization: orgInput, contact_name: nameInput, phone: phoneInput, email: emailInput, password: passwordInput, confirm: passwordInput };
    const set = (k) => (e) => setV((p) => ({ ...p, [k]: FILTERS[k](e.target.value) }));

    const errors = {
        organization: orgError(v.organization, "Le nom de l’organisation"),
        contact_name: nameError(v.contact_name, "Le nom de la personne de contact"),
        phone: phoneError(v.phone),
        email: emailError(v.email),
        password: passwordError(v.password),
        confirm: v.confirm === v.password ? "" : "Les deux mots de passe ne correspondent pas.",
    };
    const valid = !Object.values(errors).some(Boolean) && accepted;

    const submit = async (e) => {
        e.preventDefault();
        setTouched(true);
        if (!valid || busy) return;
        setBusy(true);
        setError(null);
        try {
            const res = await api("sponsor-signup", {
                method: "POST",
                body: JSON.stringify({ organization: v.organization.trim(), contact_name: v.contact_name.trim(), phone: v.phone, email: v.email.trim(), password: v.password }),
            });
            setDone(res);
            // Connexion directe avec le compte créé, puis ouverture des demandes de campagne
            try { localStorage.setItem("redirect_after_login", "/sponsor?vue=proposals"); } catch { }
            try {
                const r = await authService.login(res.email, v.password);
                if (r?.token) {
                    try { auth.setUser?.(await authService.me()); } catch { }
                    try { localStorage.removeItem("redirect_after_login"); } catch { }
                    router.push("/sponsor?vue=proposals");
                }
            } catch { /* la connexion manuelle reste proposée (bouton « Se connecter ») */ }
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const err = (k) => (touched ? errors[k] : "");

    return (
        <div className="min-h-screen bg-[#F9F8F6]">
            <Head><title>Devenir sponsor · E.doto family</title></Head>
            <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16 lg:py-16">
                <section className="lg:pt-6">
                    <Link href="/" aria-label="Accueil E.doto family"><BrandMark size="lg" /></Link>
                    <p className="mt-10 text-[12px] font-medium tracking-[0.2em] text-[#A8A29B]">ESPACE SPONSOR</p>
                    <h1 className="mt-3 text-[36px] font-normal leading-[1.08] tracking-[-0.03em] text-[#161412] sm:text-[46px]">Financez une campagne et suivez son impact en temps réel</h1>
                    <p className="mt-5 max-w-md text-[15px] leading-[1.8] text-[#6B645D]">Bailleurs, agences, ambassades, entreprises : créez votre espace pour proposer une campagne de distribution de kits avec E.doto family.</p>
                    <ol className="mt-10 space-y-6">
                        {STEPS.map((s, i) => (
                            <li key={s.title} className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 border-t border-[#ECE6E0] pt-5">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7DFD8] text-[#D6457F]"><s.icon size={17} strokeWidth={1.6} /></span>
                                <div>
                                    <p className="text-[11px] tracking-[0.2em] text-[#A8A29B]">0{i + 1}</p>
                                    <p className="text-[17px] text-[#161412]">{s.title}</p>
                                    <p className="mt-1 text-sm leading-relaxed text-[#6B645D]">{s.text}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="rounded-2xl border border-[#E9E5DF] bg-[#FFFFFF] p-6 sm:p-10">
                    {done ? (
                        <div className="py-10 text-center">
                            <CheckCircle2 size={44} className="mx-auto text-[#3F6B45]" strokeWidth={1.5} />
                            <p className="mt-5 text-2xl text-[#1A1814]">Votre espace sponsor est créé</p>
                            <p className="mt-3 text-sm text-[#6B645D]">{done.message}</p>
                            {done.email_sent === false && <p className="mt-2 text-xs text-[#8A837A]">L’e-mail de bienvenue n’a pas pu être envoyé, mais votre espace est bien actif.</p>}
                            <Link href="/login" className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#1A1814] text-[15px] font-medium text-white">Se connecter</Link>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="space-y-4" noValidate>
                            <div>
                                <h2 className="text-2xl text-[#1A1814]">Créer mon espace sponsor</h2>
                                <p className="mt-1 text-sm text-[#6B655D]">Déjà inscrit ? <Link href="/login" className="text-[#C2185B] hover:underline">Se connecter</Link></p>
                            </div>
                            <AuthField id="organization" label="Nom de l’organisation" icon={Building} value={v.organization} onChange={set("organization")} autoComplete="organization" error={err("organization")} />
                            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
                                <AuthField id="contact_name" label="Personne de contact" icon={User} value={v.contact_name} onChange={set("contact_name")} autoComplete="name" error={err("contact_name")} />
                                <AuthField id="phone" label="Téléphone" icon={Phone} value={v.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" placeholder="0197000000" error={err("phone")} />
                            </div>
                            <AuthField id="email" label="E-mail professionnel" icon={Mail} type="email" value={v.email} onChange={set("email")} inputMode="email" autoComplete="email" error={err("email")} />
                            <PasswordField id="password" label="Mot de passe" icon={Lock} value={v.password} onChange={set("password")} autoComplete="new-password" placeholder="••••••••" showRules error={err("password")} />
                            <PasswordField id="confirm" label="Confirmer le mot de passe" icon={Lock} value={v.confirm} onChange={set("confirm")} autoComplete="new-password" placeholder="••••••••" error={(touched || v.confirm) ? errors.confirm : ""} />
                            <label className="flex items-start gap-3 text-sm text-[#6B645D]">
                                <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 h-4 w-4 accent-[#C2185B]" />
                                <span>J’accepte les <Link href="/terms" className="text-[#C2185B] hover:underline">conditions d’utilisation</Link> et la <Link href="/privacy" className="text-[#C2185B] hover:underline">politique de confidentialité</Link>.</span>
                            </label>
                            <AuthAlert type="error" message={error} />
                            <AuthSubmit loading={busy} disabled={!accepted}>Créer mon espace sponsor</AuthSubmit>
                            <p className="text-xs text-[#8A837A]">Votre organisation a déjà été enregistrée par l’équipe E.doto family ? Utilisez le lien d’invitation reçu par e-mail.</p>
                        </form>
                    )}
                </section>
            </div>
        </div>
    );
}
