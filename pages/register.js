"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, CalendarDays } from "lucide-react"
import { authService } from "../services/authService"
import AuthShell, { AuthAlert, AuthField, AuthLink, AuthSubmit, ChoiceField, PasswordField } from "../components/auth/AuthShell"
import ConsentField from "../components/auth/ConsentField"
import {
    birthDateError, birthDateLimits, emailError, emailInput, nameError, nameInput,
    passwordError, passwordInput, SEX_OPTIONS, sexError,
} from "../lib/fieldRules"

export default function RegisterPage() {
    const router = useRouter()

    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    // Date de naissance et sexe (16/10/2026) : servent au ciblage des campagnes (âge, sexe)
    const [birthDate, setBirthDate] = useState("")
    const [sex, setSex] = useState("")
    const [touched, setTouched] = useState(false)
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState({ type: "", message: "" })
    const [resendState, setResendState] = useState({ loading: false, message: "" })

    const limits = birthDateLimits()
    const errors = {
        name: nameError(name, "Le nom complet"),
        email: emailError(email),
        password: passwordError(password),
        birthDate: birthDateError(birthDate),
        sex: sexError(sex),
    }
    const hasErrors = Object.values(errors).some(Boolean)

    // Compte créé mais e-mail non parti : l'utilisateur redemande le lien de confirmation
    const handleResendVerification = async () => {
        setResendState({ loading: true, message: "" })
        try {
            const res = await authService.resendVerificationEmail(email.trim())
            setResendState({ loading: false, message: res?.message || "E-mail envoyé." })
        } catch (err) {
            setResendState({ loading: false, message: err.message || "Envoi impossible pour le moment." })
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setTouched(true)
        if (hasErrors) return
        setAlert({ type: "", message: "" })
        setLoading(true)

        try {
            const res = await authService.register(name.trim().replace(/\s+/g, " "), email.trim(), password, birthDate, sex, acceptedTerms)

            // Stockage temporaire (session uniquement)
            sessionStorage.setItem("register_email", email.trim());

            if (res?.verified === true) {
                sessionStorage.setItem("register_verified", "true");
            }

            router.push("/succesregister");
        } catch (err) {
            // Gestion fine des erreurs renvoyées par NestJS
            const message =
                err.message?.includes("existe déjà")
                    ? "Cet utilisateur existe déjà. Essaie de te connecter."
                    : err.message || "Une erreur est survenue."

            setAlert({ type: "error", message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthShell
            title="Créez votre compte"
            footer={
                <>
                    <p>Déjà membre ? <AuthLink href="/login">Connectez-vous</AuthLink></p>
                    <p>Vous êtes un établissement ? <AuthLink href="/devenir-point-de-retrait">Devenir point de retrait</AuthLink></p>
                </>
            }
        >
            <AuthAlert type={alert.type} message={alert.message}>
                {alert.type === "error" && alert.message.includes("Votre compte est créé") && (
                    <div className="mt-2">
                        <button type="button" onClick={handleResendVerification} disabled={resendState.loading}
                            className="font-medium text-[#C2185B] hover:underline disabled:opacity-50">
                            {resendState.loading ? "Envoi…" : "Renvoyer l'e-mail de confirmation"}
                        </button>
                        {resendState.message && <p role="status" className="mt-1 text-xs text-[#8A837A]">{resendState.message}</p>}
                    </div>
                )}
            </AuthAlert>

            <form onSubmit={handleRegister} noValidate className="space-y-5">
                <AuthField id="name" label="Nom complet" icon={User} autoComplete="name" placeholder="Votre nom"
                    value={name} onChange={(e) => setName(nameInput(e.target.value))} error={touched ? errors.name : ""} />

                <AuthField id="email" label="Adresse e-mail" icon={Mail} type="email" inputMode="email" autoComplete="email"
                    placeholder="exemple@email.com" value={email} onChange={(e) => setEmail(emailInput(e.target.value))}
                    error={touched ? errors.email : ""} />

                <AuthField id="birth_date" label="Date de naissance" icon={CalendarDays} type="date" autoComplete="bday"
                    min={limits.min} max={limits.max} value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
                    error={touched ? errors.birthDate : ""} hint="Certaines campagnes sont réservées à une tranche d’âge." />

                <ChoiceField label="Sexe" name="sex" options={SEX_OPTIONS} value={sex} onChange={setSex} error={touched ? errors.sex : ""} />

                <PasswordField icon={Lock} value={password} onChange={(e) => setPassword(passwordInput(e.target.value))}
                    autoComplete="new-password" placeholder="••••••••" showRules error={touched ? errors.password : ""} />

                <ConsentField id="terms" checked={acceptedTerms} onChange={setAcceptedTerms} />

                <AuthSubmit loading={loading} disabled={!acceptedTerms} loadingText="Création en cours...">Créer mon compte</AuthSubmit>
            </form>
        </AuthShell>
    )
}
