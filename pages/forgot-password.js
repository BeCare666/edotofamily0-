"use client"

import { useState } from "react"
import { Mail, Lock, KeyRound } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { authService } from "../services/authService"
import AuthShell, { AuthField, AuthLink, AuthSubmit, PasswordField } from "../components/auth/AuthShell"
import { emailError, emailInput, intInput, passwordError, passwordInput } from "../lib/fieldRules"

export default function ForgotPassword() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [email, setEmail] = useState("")
    const [token, setToken] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [touched, setTouched] = useState({ 1: false, 2: false, 3: false })

    // Contrôle des champs (16/10/2026) : e-mail valide, code à 6 chiffres, nouveau mot de passe conforme
    const errors = {
        email: emailError(email),
        token: /^\d{6}$/.test(token) ? "" : "Le code reçu contient 6 chiffres.",
        password: passwordError(newPassword),
    }
    const touch = (n) => setTouched((t) => ({ ...t, [n]: true }))

    // 🔹 Étape 1 — Envoi du mail de réinitialisation
    const handleEmailSubmit = async (e) => {
        e.preventDefault()
        touch(1)
        if (errors.email) return
        setLoading(true)
        try {
            const res = await authService.forgetPassword(email.trim())
            toast.success(res?.message || "Un lien / code a été envoyé à votre e-mail 📩")
            setStep(2)
        } catch (err) {
            console.error("Erreur:", err)
            toast.error(err?.response?.data?.message || "Erreur lors de l’envoi du mail ❌")
        } finally {
            setLoading(false)
        }
    }

    // 🔹 Étape 2 — Vérification du token reçu par email
    const handleTokenVerify = async (e) => {
        e.preventDefault()
        touch(2)
        if (errors.token) return
        setLoading(true)
        try {
            const res = await authService.verifyForgetPasswordToken(email.trim(), token)
            toast.success(res?.message || "Code vérifié ✅")
            setStep(3)
        } catch (err) {
            console.error("Erreur:", err)
            toast.error(err?.response?.data?.message || "Code invalide ❌")
        } finally {
            setLoading(false)
        }
    }

    // 🔹 Étape 3 — Réinitialisation du mot de passe
    const handlePasswordReset = async (e) => {
        e.preventDefault()
        touch(3)
        if (errors.password) return
        setLoading(true)
        try {
            const res = await authService.resetPassword(email.trim(), token, newPassword)
            toast.success(res?.message || "Mot de passe réinitialisé avec succès ✅")

            setTimeout(() => {
                router.push("/login")
            }, 600)

            setStep(1)
            setEmail("")
            setToken("")
            setNewPassword("")
        } catch (err) {
            console.error("Erreur:", err)
            toast.error(err?.message || err?.response?.data?.message || "Impossible de réinitialiser ❌")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthShell
            title="Réinitialiser votre mot de passe"
            subtitle="Suivez les étapes pour récupérer l’accès à votre compte"
            footer={<p><AuthLink href="/login">Retour à la connexion</AuthLink></p>}
        >
            {/* Étapes : 1 e-mail, 2 code, 3 nouveau mot de passe */}
            <ol className="mb-6 grid grid-cols-3 gap-2" aria-label="Étapes">
                {[1, 2, 3].map((n) => (
                    <li key={n} className={`h-1 rounded-full ${n <= step ? "bg-[#C2185B]" : "bg-[#EFECE7]"}`} aria-current={n === step ? "step" : undefined} />
                ))}
            </ol>

            {step === 1 && (
                <form onSubmit={handleEmailSubmit} noValidate className="space-y-5">
                    <AuthField id="email" label="Adresse e-mail" icon={Mail} type="email" inputMode="email" autoComplete="email"
                        placeholder="exemple@email.com" value={email} onChange={(e) => setEmail(emailInput(e.target.value))}
                        error={touched[1] ? errors.email : ""} />
                    <AuthSubmit loading={loading} loadingText="Envoi...">Envoyer le lien / code</AuthSubmit>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleTokenVerify} noValidate className="space-y-5">
                    <AuthField id="token" label="Code de vérification" icon={KeyRound} inputMode="numeric" autoComplete="one-time-code"
                        placeholder="Entrez le code reçu" value={token} onChange={(e) => setToken(intInput(e.target.value, 6))}
                        error={touched[2] ? errors.token : ""} />
                    <AuthSubmit loading={loading} loadingText="Vérification...">Vérifier le code</AuthSubmit>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={handlePasswordReset} noValidate className="space-y-5">
                    <PasswordField id="new_password" label="Nouveau mot de passe" icon={Lock} value={newPassword}
                        onChange={(e) => setNewPassword(passwordInput(e.target.value))} autoComplete="new-password"
                        placeholder="••••••••" showRules error={touched[3] ? errors.password : ""} />
                    <AuthSubmit loading={loading} loadingText="Réinitialisation...">Réinitialiser le mot de passe</AuthSubmit>
                </form>
            )}
        </AuthShell>
    )
}
