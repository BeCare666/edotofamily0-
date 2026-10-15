import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Loader2, Eye, EyeOff, Building, User, Phone, Mail, Lock, CheckCircle2, Send, Radio, BarChart3 } from "lucide-react";
import BrandMark from "../../components/BrandMark";
import { api } from "../../components/pickup-dashboard/api";
import { useAuthContext } from "../../context/AuthContext";
import { authService } from "../../services/authService";

const MIN = 8;

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
    const [show, setShow] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const [done, setDone] = useState(null);
    const set = (k) => (e) => setV((p) => ({ ...p, [k]: e.target.value }));

    const valid = v.organization.trim() && v.contact_name.trim() && v.phone.trim() && v.email.trim() && v.password.length >= MIN && v.password === v.confirm && accepted;

    const submit = async (e) => {
        e.preventDefault();
        if (!valid || busy) return;
        setBusy(true);
        setError(null);
        try {
            const res = await api("sponsor-signup", {
                method: "POST",
                body: JSON.stringify({ organization: v.organization, contact_name: v.contact_name, phone: v.phone, email: v.email, password: v.password }),
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

    const input = "w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E4DBCE] bg-white text-[#1F1B16] placeholder:text-[#B0A598] focus:outline-none focus:ring-2 focus:ring-[#FF6EA9]/30";
    const Icon = ({ as: I }) => <I size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8E80]" aria-hidden="true" />;

    return (
        <div className="min-h-screen bg-[#FAF7F2]">
            <Head><title>Devenir sponsor · E.doto family</title></Head>
            <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16 lg:py-16">
                <section className="lg:pt-6">
                    <Link href="/" aria-label="Accueil E.doto family"><BrandMark /></Link>
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

                <section className="rounded-[28px] border border-[#EDE6DC] bg-[#FFFDF9] p-6 shadow-[0_24px_60px_-40px_rgba(60,40,20,0.45)] sm:p-10">
                    {done ? (
                        <div className="py-10 text-center">
                            <CheckCircle2 size={44} className="mx-auto text-[#3F6B45]" strokeWidth={1.5} />
                            <p className="mt-5 text-2xl text-[#1F1B16]">Votre espace sponsor est créé</p>
                            <p className="mt-3 text-sm text-[#6B645D]">{done.message}</p>
                            {done.email_sent === false && <p className="mt-2 text-xs text-[#9A8E80]">L’e-mail de bienvenue n’a pas pu être envoyé, mais votre espace est bien actif.</p>}
                            <Link href="/login" className="mt-8 inline-flex w-full justify-center rounded-2xl bg-[#1F1B16] py-3.5 text-white">Se connecter</Link>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="space-y-4" noValidate>
                            <div>
                                <h2 className="text-2xl text-[#1F1B16]">Créer mon espace sponsor</h2>
                                <p className="mt-1 text-sm text-[#7A6E62]">Déjà inscrit ? <Link href="/login" className="text-[#C2185B] hover:underline">Se connecter</Link></p>
                            </div>
                            <div className="relative"><Icon as={Building} /><input className={input} value={v.organization} onChange={set("organization")} maxLength={255} placeholder="Nom de l’organisation" aria-label="Nom de l’organisation" autoComplete="organization" required /></div>
                            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
                                <div className="relative"><Icon as={User} /><input className={input} value={v.contact_name} onChange={set("contact_name")} maxLength={255} placeholder="Personne de contact" aria-label="Personne de contact" autoComplete="name" required /></div>
                                <div className="relative"><Icon as={Phone} /><input className={input} value={v.phone} onChange={set("phone")} maxLength={40} placeholder="Téléphone" aria-label="Téléphone" inputMode="tel" autoComplete="tel" required /></div>
                            </div>
                            <div className="relative"><Icon as={Mail} /><input type="email" className={input} value={v.email} onChange={set("email")} maxLength={255} placeholder="E-mail professionnel" aria-label="E-mail professionnel" autoComplete="email" required /></div>
                            <div className="relative">
                                <Icon as={Lock} />
                                <input type={show ? "text" : "password"} className={`${input} pr-12`} value={v.password} onChange={set("password")} placeholder={`Mot de passe (${MIN} caractères minimum)`} aria-label="Mot de passe" autoComplete="new-password" required />
                                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A8E80]" aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                            </div>
                            <div className="relative"><Icon as={Lock} /><input type={show ? "text" : "password"} className={input} value={v.confirm} onChange={set("confirm")} placeholder="Confirmer le mot de passe" aria-label="Confirmer le mot de passe" autoComplete="new-password" required /></div>
                            {v.password && v.password.length < MIN && <p className="text-xs text-[#9B2C2C]">Au moins {MIN} caractères.</p>}
                            {v.confirm && v.confirm !== v.password && <p className="text-xs text-[#9B2C2C]">Les deux mots de passe ne correspondent pas.</p>}
                            <label className="flex items-start gap-3 text-sm text-[#6B645D]">
                                <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 h-4 w-4 accent-[#C2185B]" />
                                <span>J’accepte les <Link href="/terms" className="text-[#C2185B] hover:underline">conditions d’utilisation</Link> et la <Link href="/privacy" className="text-[#C2185B] hover:underline">politique de confidentialité</Link>.</span>
                            </label>
                            {error && <p className="rounded-2xl bg-[#F5E4E4] px-4 py-3 text-sm text-[#9B2C2C]">{error}</p>}
                            <button type="submit" disabled={!valid || busy} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#C2185B] py-3.5 font-medium text-white transition disabled:opacity-40">
                                {busy && <Loader2 size={16} className="animate-spin" />} Créer mon espace sponsor
                            </button>
                            <p className="text-xs text-[#9A8E80]">Votre organisation a déjà été enregistrée par l’équipe E.doto family ? Utilisez le lien d’invitation reçu par e-mail.</p>
                        </form>
                    )}
                </section>
            </div>
        </div>
    );
}
