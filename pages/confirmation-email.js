"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, MailCheck } from "lucide-react";
import AuthShell from "../components/auth/AuthShell";
import { authService } from "../services/authService";

// Page ouverte par le lien de confirmation reçu par e-mail (23/11/2026).
// Avant, le lien ouvrait directement l'API sur Render : réponse brute ou erreur si le lien avait expiré.
// Maintenant : ?token=... → la page confirme l'adresse auprès de l'API et affiche un message clair.
// ?statut=ok|invalide → anciens liens (encore dans les boîtes mail), déjà traités par l'API.
const API_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;

export default function ConfirmationEmailPage() {
    const router = useRouter();
    const [state, setState] = useState("loading"); // loading | ok | invalide
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [resend, setResend] = useState({ loading: false, message: "" });
    const done = useRef(false);

    useEffect(() => {
        if (!router.isReady || done.current) return;
        done.current = true;
        const { token, statut } = router.query;

        if (statut) {
            setState(statut === "ok" ? "ok" : "invalide");
            return;
        }
        if (!token) {
            setState("invalide");
            return;
        }
        (async () => {
            try {
                const res = await fetch(`${API_URL}/verify-email`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: String(token) }),
                });
                const data = await res.json().catch(() => ({}));
                if (res.ok && data?.success) {
                    setState("ok");
                } else {
                    setMessage(data?.message || "");
                    setState("invalide");
                }
            } catch {
                setMessage("Connexion impossible pour le moment. Vérifiez votre réseau puis rouvrez le lien.");
                setState("invalide");
            }
        })();
    }, [router.isReady, router.query]);

    const handleResend = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setResend({ loading: true, message: "" });
        try {
            const res = await authService.resendVerificationEmail(email.trim());
            setResend({ loading: false, message: res?.message || "E-mail envoyé." });
        } catch (err) {
            setResend({ loading: false, message: err.message || "Envoi impossible pour le moment." });
        }
    };

    if (state === "loading") {
        return (
            <AuthShell>
                <div className="flex flex-col items-center text-center">
                    <Loader2 size={34} className="mb-4 animate-spin text-[#C2185B]" />
                    <p className="text-sm text-[#57524B]">Confirmation de votre adresse e-mail en cours…</p>
                </div>
            </AuthShell>
        );
    }

    if (state === "ok") {
        return (
            <AuthShell>
                <div className="text-center">
                    <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF6F0] text-[#2F5D3A]">
                        <CheckCircle2 size={32} strokeWidth={1.6} />
                    </span>
                    <h1 className="mb-3 text-2xl font-semibold tracking-tight text-[#1A1814]">Adresse e-mail confirmée</h1>
                    <p className="text-sm leading-relaxed text-[#57524B] md:text-base">
                        Merci ! Votre compte <span className="font-semibold text-[#1A1814]">E.doto family</span> est activé.
                        Vous pouvez maintenant vous connecter.
                    </p>
                    <Link
                        href="/login"
                        className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-[#C2185B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#A3134C]"
                    >
                        Se connecter
                    </Link>
                </div>
            </AuthShell>
        );
    }

    return (
        <AuthShell>
            <div className="text-center">
                <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#FDECEF] text-[#B3261E]">
                    <XCircle size={32} strokeWidth={1.6} />
                </span>
                <h1 className="mb-3 text-2xl font-semibold tracking-tight text-[#1A1814]">Lien invalide ou expiré</h1>
                <p className="text-sm leading-relaxed text-[#57524B] md:text-base">
                    {message || "Ce lien de confirmation ne fonctionne plus. Il a peut-être déjà servi ou a expiré."}
                    <br />
                    Saisissez votre adresse pour recevoir un nouveau lien.
                </p>
            </div>
            <form onSubmit={handleResend} className="mt-6 space-y-3">
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@adresse.com"
                    className="w-full rounded-xl border border-[#E9E5DF] bg-white px-4 py-3 text-sm outline-none focus:border-[#C2185B]"
                />
                <button
                    type="submit"
                    disabled={resend.loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C2185B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#A3134C] disabled:opacity-60"
                >
                    {resend.loading ? <Loader2 size={16} className="animate-spin" /> : <MailCheck size={16} />}
                    Renvoyer le lien de confirmation
                </button>
                {resend.message && <p className="text-center text-sm text-[#57524B]">{resend.message}</p>}
            </form>
            <p className="mt-6 text-center text-sm text-[#6B655D]">
                Votre adresse est peut-être déjà confirmée :{" "}
                <Link href="/login" className="font-medium text-[#C2185B] hover:underline underline-offset-4">se connecter</Link>
            </p>
        </AuthShell>
    );
}
