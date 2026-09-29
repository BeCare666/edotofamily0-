import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { api } from "../../components/pickup-dashboard/api";

const MIN = 8;

// Activation de l'espace sponsor : lien reçu par e-mail (invitation de l'admin, valable 7 jours)
export default function SponsorActivation() {
    const router = useRouter();
    const { token } = router.query;
    const [info, setInfo] = useState(null);
    const [error, setError] = useState(null);
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [show, setShow] = useState(false);
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!router.isReady) return;
        if (!token) {
            setError("Lien d’invitation incomplet.");
            return;
        }
        api(`sponsor-invitations/${encodeURIComponent(token)}`).then(setInfo).catch((e) => setError(e.message));
    }, [router.isReady, token]);

    const submit = async (e) => {
        e.preventDefault();
        if (password.length < MIN || password !== confirm || busy) return;
        setBusy(true);
        setError(null);
        try {
            await api("sponsor-invitations/accept", { method: "POST", body: JSON.stringify({ token, password }) });
            try { localStorage.setItem("redirect_after_login", "/sponsor"); } catch { }
            setDone(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const input = "w-full px-4 py-3 rounded-2xl border border-[#E4DBCE] bg-white text-[#1F1B16] focus:outline-none focus:ring-2 focus:ring-[#FF6EA9]/30";
    return (
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
            <Head><title>Activer mon espace sponsor — E·Doto</title></Head>
            <div className="w-full max-w-md bg-[#FFFDF9] rounded-3xl border border-[#EDE6DC] shadow-xl p-8">
                <p className="font-serif text-2xl text-[#1F1B16] flex items-center gap-2"><ShieldCheck className="text-[#C2185B]" /> Espace sponsor</p>
                {done ? (
                    <div className="mt-6">
                        <p className="text-[#3F6B45]">Votre espace est activé.</p>
                        <Link href="/login" className="mt-6 inline-flex w-full justify-center py-3 rounded-2xl bg-[#1F1B16] text-white">Se connecter</Link>
                    </div>
                ) : error && !info ? (
                    <p className="mt-6 text-[#9B2C2C]">{error}</p>
                ) : !info ? (
                    <p className="mt-6 flex items-center gap-2 text-[#7A6E62]"><Loader2 size={16} className="animate-spin" /> Vérification du lien…</p>
                ) : (
                    <form onSubmit={submit} className="mt-6 space-y-4">
                        <p className="text-sm text-[#7A6E62]">Bonjour <strong className="text-[#1F1B16]">{info.name}</strong>, choisissez le mot de passe de votre espace ({info.email}).</p>
                        <div className="relative">
                            <input type={show ? "text" : "password"} autoComplete="new-password" placeholder={`Mot de passe (${MIN} caractères minimum)`} value={password} onChange={(e) => setPassword(e.target.value)} className={input} aria-label="Mot de passe" />
                            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A8E80]" aria-label={show ? "Masquer" : "Afficher"}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                        </div>
                        <input type={show ? "text" : "password"} autoComplete="new-password" placeholder="Confirmer le mot de passe" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} aria-label="Confirmer le mot de passe" />
                        {password && password.length < MIN && <p className="text-xs text-[#9B2C2C]">Au moins {MIN} caractères.</p>}
                        {confirm && confirm !== password && <p className="text-xs text-[#9B2C2C]">Les deux mots de passe ne correspondent pas.</p>}
                        {error && <p className="text-sm text-[#9B2C2C]">{error}</p>}
                        <button type="submit" disabled={busy || password.length < MIN || password !== confirm} className="w-full py-3 rounded-2xl bg-[#C2185B] text-white font-medium disabled:opacity-40 inline-flex justify-center items-center gap-2">
                            {busy && <Loader2 size={16} className="animate-spin" />} Activer mon espace
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
