"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock } from "lucide-react"
import Link from "next/link"
import { authService } from "../services/authService"
import { useAuthContext } from "../context/AuthContext" // ✅ import du contexte
import AuthShell, { AuthAlert, AuthField, AuthLink, AuthSubmit, PasswordField } from "../components/auth/AuthShell"
import { emailError, emailInput } from "../lib/fieldRules"
import { pathAfterLogin, takeRedirect } from "../lib/roleHome"
import TotpStep from "../components/auth/TotpStep"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState({ type: "", message: "" })
    const [touched, setTouched] = useState(false)
    const { setUser } = useAuthContext() // ✅ accès au setter global
    const [resendState, setResendState] = useState({ loading: false, message: "" })
    // Double authentification (audit 3.1) : défi renvoyé par /token à la place de la session
    const [totp, setTotp] = useState(null)

    // Session reçue (directement ou après le code) : profil, puis espace du compte
    const finishLogin = async () => {
        const me = await authService.me()
        setUser(me)
        setAlert({ type: "success", message: "Connexion réussie !" })
        router.push(pathAfterLogin(me?.role, takeRedirect()))
    }

    // Contrôle des champs (16/10/2026) : e-mail valide, mot de passe saisi.
    // Les règles de création du mot de passe ne s'appliquent pas ici (anciens comptes).
    const errors = {
        email: emailError(email),
        password: password ? "" : "Le mot de passe est obligatoire.",
    }

    // Point de retrait en attente : son e-mail n'est peut-être pas confirmé (lien valable 5 min)
    const handleResendVerification = async () => {
        setResendState({ loading: true, message: "" })
        try {
            const res = await authService.resendVerificationEmail(email.trim())
            setResendState({ loading: false, message: res?.message || "E-mail envoyé." })
        } catch (err) {
            setResendState({ loading: false, message: err.message || "Envoi impossible pour le moment." })
        }
    }
    const handleLogin = async (e) => {
        e.preventDefault()
        setTouched(true)
        if (errors.email || errors.password) return
        setAlert({ type: "", message: "" })
        setLoading(true)

        try {
            const res = await authService.login(email.trim(), password)

            if (res.totp_required && res.challenge) {
                setTotp({ challenge: res.challenge, setup_required: !!res.setup_required })
            } else if (res.token) {
                // Redirection immédiate selon le rôle (19/10/2026) : sponsor → espace sponsor,
                // point de retrait → dashboard, médecin → espace médecin, centre → espace centre ;
                // l'adresse mémorisée n'est suivie que si elle appartient à l'espace du compte.
                await finishLogin()
            } else {
                throw new Error("Identifiants invalides.")
            }
        } catch (err) {
            console.error("Erreur de connexion :", err)
            const message =
                err.message?.includes("valider votre email")
                    ? "Veuillez d’abord valider votre adresse email."
                    : err.message?.includes("Session expirée")
                        ? "Email ou mot de passe incorrect."
                        : err.message || "Une erreur est survenue."

            setAlert({ type: "error", message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthShell
            title="Connectez-vous"
            footer={
                <>
                    <p>Pas encore de compte ? <AuthLink href="/register">Créez-en un</AuthLink></p>
                    <p>Bailleur, entreprise ou institution ? <AuthLink href="/sponsor/inscription">Devenir sponsor</AuthLink></p>
                </>
            }
        >
            <AuthAlert type={alert.type} message={alert.message}>
                {/* Point de retrait en attente, ou rôle sensible dont l'e-mail n'est pas confirmé (audit 3.8, 29/10/2026) */}
                {alert.type === "error" && (alert.message.includes("en attente de validation") || alert.message.includes("Confirmez d'abord votre adresse e-mail")) && (
                    <div className="mt-2 text-[#57524B]">
                        Adresse e-mail pas encore confirmée ?{" "}
                        <button type="button" onClick={handleResendVerification} disabled={resendState.loading}
                            className="font-medium text-[#C2185B] hover:underline disabled:opacity-50">
                            {resendState.loading ? "Envoi…" : "Renvoyer l'e-mail de confirmation"}
                        </button>
                        {resendState.message && <p role="status" className="mt-1 text-xs text-[#8A837A]">{resendState.message}</p>}
                    </div>
                )}
            </AuthAlert>

            {totp ? (
                <TotpStep challenge={totp} onCancel={() => setTotp(null)}
                    onSession={async () => {
                        try { await finishLogin() } catch (err) { setTotp(null); setAlert({ type: "error", message: err.message }) }
                    }} />
            ) : (
            <form onSubmit={handleLogin} noValidate className="space-y-5">
                <AuthField id="email" label="Adresse e-mail" icon={Mail} type="email" inputMode="email" autoComplete="email"
                    placeholder="exemple@email.com" value={email} onChange={(e) => setEmail(emailInput(e.target.value))}
                    error={touched ? errors.email : ""} />

                <div>
                    <PasswordField icon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
                        placeholder="••••••••" error={touched ? errors.password : ""} />
                    <div className="mt-2 text-right">
                        <Link href="/forgot-password" className="text-sm font-medium text-[#C2185B] hover:underline underline-offset-4">
                            Mot de passe oublié ?
                        </Link>
                    </div>
                </div>

                <AuthSubmit loading={loading} loadingText="Connexion en cours...">Se connecter</AuthSubmit>
            </form>
            )}
        </AuthShell>
    )
}
