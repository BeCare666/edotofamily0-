import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Loader2, Lock } from "lucide-react";
import { api } from "../../components/pickup-dashboard/api";
import { roleHome } from "../../lib/roleHome";
import AuthShell, { AuthAlert, AuthSubmit, PasswordField } from "../../components/auth/AuthShell";
import { passwordError, passwordInput } from "../../lib/fieldRules";

// Activation de l'espace médecin ou centre (19/10/2026) : lien reçu par e-mail (invitation du super admin, 7 jours).
// Même parcours que l'activation de l'espace sponsor.
export default function SpaceActivation() {
    const router = useRouter();
    const { token } = router.query;
    const [info, setInfo] = useState(null);
    const [error, setError] = useState(null);
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [touched, setTouched] = useState(false);
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!router.isReady) return;
        if (!token) {
            setError("Lien d’invitation incomplet.");
            return;
        }
        api(`teleconsultation/invitations/${encodeURIComponent(token)}`).then(setInfo).catch((e) => setError(e.message));
    }, [router.isReady, token]);

    // Même règle de mot de passe que tous les comptes (16/10/2026)
    const errors = {
        password: passwordError(password),
        confirm: confirm === password ? "" : "Les deux mots de passe ne correspondent pas.",
    };

    const submit = async (e) => {
        e.preventDefault();
        setTouched(true);
        if (errors.password || errors.confirm || busy) return;
        setBusy(true);
        setError(null);
        try {
            await api("teleconsultation/invitations/accept", { method: "POST", body: JSON.stringify({ token, password }) });
            try { localStorage.setItem("redirect_after_login", roleHome(info.kind === "doctor" ? "doctor" : "health_center")); } catch { }
            setDone(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthShell title={info?.space || "Activation de votre espace"}>
            <Head><title>Activer mon espace · E.doto family</title></Head>
            {done ? (
                <div className="text-center">
                    <AuthAlert type="success" message="Votre espace est activé." />
                    <Link href="/login" className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#1A1814] text-[15px] font-medium text-white">Se connecter</Link>
                </div>
            ) : error && !info ? (
                <AuthAlert type="error" message={error} />
            ) : !info ? (
                <p className="flex items-center justify-center gap-2 text-[#6B655D]"><Loader2 size={16} className="animate-spin" /> Vérification du lien…</p>
            ) : (
                <form onSubmit={submit} noValidate className="space-y-5">
                    <p className="text-sm text-[#6B655D]">Bonjour <strong className="text-[#1A1814]">{info.name}</strong>, choisissez le mot de passe de votre espace ({info.email}).</p>
                    <PasswordField id="password" label="Mot de passe" icon={Lock} value={password} onChange={(e) => setPassword(passwordInput(e.target.value))}
                        autoComplete="new-password" placeholder="••••••••" showRules error={touched ? errors.password : ""} />
                    <PasswordField id="confirm" label="Confirmer le mot de passe" icon={Lock} value={confirm} onChange={(e) => setConfirm(passwordInput(e.target.value))}
                        autoComplete="new-password" placeholder="••••••••" error={touched || confirm ? errors.confirm : ""} />
                    <AuthAlert type="error" message={error} />
                    <AuthSubmit loading={busy}>Activer mon espace</AuthSubmit>
                </form>
            )}
        </AuthShell>
    );
}
