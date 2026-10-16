"use client"

import { useEffect, useState } from "react"
import { Mail, Lock, User, CheckCircle2, MapPin, LocateFixed, Loader2 } from "lucide-react"
import Link from "next/link"
import { authService } from "../services/authService"
import AuthShell, { AuthAlert, AuthField, AuthLink, AuthSubmit, PasswordField, PasswordRules, inputClass } from "../components/auth/AuthShell"
import { emailError, emailInput, orgError, orgInput, passwordError, passwordInput } from "../lib/fieldRules"

// Coordonnée GPS : chiffres, un point décimal et un signe moins au début seulement
const coordInput = (v) => {
    const s = String(v ?? "").replace(",", ".").replace(/[^\d.\-]/g, "")
    const neg = s.startsWith("-")
    const [int = "", ...dec] = s.replace(/-/g, "").split(".")
    return (neg ? "-" : "") + int.slice(0, 3) + (dec.length ? "." + dec.join("").slice(0, 8) : "")
}

// Inscription d'un point de retrait : le compte est créé en attente.
// Parcours : inscription → confirmation de l'e-mail → validation par l'admin → connexion possible.
export default function PickupPointRegisterPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [address, setAddress] = useState("")
    const [lat, setLat] = useState("")
    const [lng, setLng] = useState("")
    const [accuracy, setAccuracy] = useState(null)
    const [locating, setLocating] = useState(false)
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState({ type: "", message: "" })
    const [touched, setTouched] = useState(false)
    const [done, setDone] = useState(false)
    const [resendIn, setResendIn] = useState(0)
    const [resending, setResending] = useState(false)
    const [resendMessage, setResendMessage] = useState({ type: "", text: "" })

    // Compte à rebours avant un nouveau renvoi (l'API limite à un envoi par minute)
    useEffect(() => {
        if (resendIn <= 0) return
        const t = setTimeout(() => setResendIn((n) => n - 1), 1000)
        return () => clearTimeout(t)
    }, [resendIn])

    const handleResend = async () => {
        setResending(true)
        setResendMessage({ type: "", text: "" })
        try {
            await authService.resendVerificationEmail(email.trim())
            setResendMessage({ type: "success", text: "Un nouveau lien vient de vous être envoyé." })
            setResendIn(60)
        } catch (err) {
            setResendMessage({ type: "error", text: err.message || "Envoi impossible pour le moment." })
        } finally {
            setResending(false)
        }
    }

    const coordsValid =
        lat !== "" && lng !== "" &&
        Number.isFinite(Number(lat)) && Math.abs(Number(lat)) <= 90 &&
        Number.isFinite(Number(lng)) && Math.abs(Number(lng)) <= 180

    // Contrôle des champs (16/10/2026), règles identiques à l'API
    const errors = {
        name: orgError(name, "Le nom du point de retrait"),
        email: emailError(email),
        password: passwordError(password),
        confirm: confirmPassword === password ? "" : "Les mots de passe ne correspondent pas.",
        address: address.length > 255 ? "L'adresse ne doit pas dépasser 255 caractères." : "",
    }
    const err = (k) => (touched ? errors[k] : "")

    const handleLocate = () => {
        if (!navigator.geolocation) {
            setAlert({ type: "error", message: "La géolocalisation n'est pas disponible sur cet appareil. Saisissez les coordonnées." })
            return
        }
        setLocating(true)
        setAlert({ type: "", message: "" })
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLat(pos.coords.latitude.toFixed(6))
                setLng(pos.coords.longitude.toFixed(6))
                setAccuracy(Math.round(pos.coords.accuracy))
                setLocating(false)
            },
            (err) => {
                setLocating(false)
                setAlert({
                    type: "error",
                    message: err.code === 1
                        ? "Autorisez l'accès à votre position, ou saisissez les coordonnées manuellement."
                        : "Position introuvable. Réessayez sur place ou saisissez les coordonnées.",
                })
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setTouched(true)
        setAlert({ type: "", message: "" })

        if (Object.values(errors).some(Boolean)) return
        if (!coordsValid) {
            setAlert({ type: "error", message: "Indiquez la position du point de retrait (bouton « Utiliser ma position »)." })
            return
        }

        setLoading(true)
        try {
            await authService.registerPickUpPoint({
                name: name.trim().replace(/\s+/g, " "),
                email: email.trim(),
                password,
                pickup_lat: Number(lat),
                pickup_lng: Number(lng),
                pickup_address: address.trim() || null,
            })
            setDone(true)
            setResendIn(60)
        } catch (err) {
            const message = err.message?.includes("existe déjà")
                ? "Cette adresse e-mail est déjà utilisée."
                : err.message || "Une erreur est survenue."
            setAlert({ type: "error", message })
        } finally {
            setLoading(false)
        }
    }

    if (done) {
        return (
            <AuthShell wide>
                <div className="text-center">
                    <CheckCircle2 size={44} strokeWidth={1.5} className="mx-auto mb-4 text-[#2F5D3A]" />
                    <h1 className="mb-4 text-xl font-semibold text-[#1A1814]">Demande enregistrée</h1>
                    <ol className="mb-6 space-y-2 rounded-xl border border-[#EFECE7] bg-[#F9F8F6] p-4 text-left text-sm text-[#57524B]">
                        <li><strong>1.</strong> Confirmez votre adresse e-mail grâce au lien reçu à <strong>{email}</strong> (valable 5 minutes).</li>
                        <li><strong>2.</strong> Notre équipe vérifie votre point de retrait.</li>
                        <li><strong>3.</strong> Une fois validé, vous pourrez vous connecter à votre espace partenaire.</li>
                    </ol>
                    <div className="mb-6">
                        <p className="mb-2 text-sm text-[#8A837A]">Lien expiré ou e-mail non reçu ?</p>
                        <button type="button" onClick={handleResend} disabled={resending || resendIn > 0}
                            className="h-11 rounded-xl border border-[#E6E2DC] px-5 text-sm font-medium text-[#1A1814] transition hover:border-[#1A1814] disabled:cursor-not-allowed disabled:opacity-50">
                            {resending ? "Envoi…" : resendIn > 0 ? `Renvoyer l'e-mail (${resendIn} s)` : "Renvoyer l'e-mail de confirmation"}
                        </button>
                        {resendMessage.text && (
                            <p role="status" className={`mt-2 text-xs ${resendMessage.type === "error" ? "text-[#B42318]" : "text-[#2F5D3A]"}`}>
                                {resendMessage.text}
                            </p>
                        )}
                    </div>
                    <AuthLink href="/">Retour à l'accueil</AuthLink>
                </div>
            </AuthShell>
        )
    }

    return (
        <AuthShell
            wide
            title="Devenir Point de Retrait"
            subtitle="Inscrivez votre établissement. Votre compte sera activé après validation par notre équipe."
            footer={<p>Déjà partenaire ? <AuthLink href="/login">Connectez-vous</AuthLink></p>}
        >
            <AuthAlert type={alert.type} message={alert.message} />

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <AuthField id="pp-name" label="Nom du point de retrait" icon={User} value={name}
                    onChange={(e) => setName(orgInput(e.target.value))} placeholder="Ex : Pharmacie du Marché" error={err("name")} />

                <AuthField id="pp-email" label="Adresse e-mail" icon={Mail} type="email" inputMode="email" autoComplete="email"
                    value={email} onChange={(e) => setEmail(emailInput(e.target.value))} error={err("email")} />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <PasswordField id="pp-password" label="Mot de passe" icon={Lock} value={password}
                        onChange={(e) => setPassword(passwordInput(e.target.value))} autoComplete="new-password" error={err("password")} />
                    <PasswordField id="pp-password2" label="Confirmation" icon={Lock} value={confirmPassword}
                        onChange={(e) => setConfirmPassword(passwordInput(e.target.value))} autoComplete="new-password"
                        error={touched || confirmPassword ? errors.confirm : ""} />
                </div>
                <PasswordRules value={password} className="-mt-2" />

                <div>
                    <label htmlFor="pp-address" className="block text-sm font-medium text-[#3D3934]">Adresse du point de retrait</label>
                    <textarea id="pp-address" rows={2} maxLength={255} value={address} onChange={(e) => setAddress(e.target.value)}
                        placeholder="Ex : Cotonou, Akpakpa, à côté du marché…"
                        className="mt-2 w-full rounded-xl border border-[#E6E2DC] bg-white p-3 text-[15px] text-[#1A1814] placeholder:text-[#A8A29A] focus:border-[#C2185B] focus:outline-none focus:ring-2 focus:ring-[#C2185B]/15" />
                    {err("address") && <p className="mt-1.5 text-[13px] text-[#B42318]">{errors.address}</p>}
                </div>

                {/* Position GPS */}
                <fieldset className="rounded-xl border border-[#EFECE7] bg-[#F9F8F6] p-4">
                    <legend className="px-1 text-sm font-medium text-[#3D3934]">Position GPS</legend>
                    <p className="mb-3 text-xs text-[#8A837A]">
                        Faites l'inscription depuis votre point de retrait, puis utilisez votre position actuelle.
                    </p>
                    <button type="button" onClick={handleLocate} disabled={locating}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#1A1814] bg-white text-sm font-medium text-[#1A1814] transition hover:bg-[#1A1814] hover:text-white disabled:opacity-60">
                        {locating ? <Loader2 size={18} className="animate-spin" /> : <LocateFixed size={18} />}
                        {locating ? "Localisation…" : "Utiliser ma position actuelle"}
                    </button>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                        {[["pp-lat", "Latitude", lat, setLat, "6.3703"], ["pp-lng", "Longitude", lng, setLng, "2.3912"]].map(([id, label, val, setter, ph]) => (
                            <div key={id}>
                                <label htmlFor={id} className="text-xs text-[#8A837A]">{label}</label>
                                <div className="relative mt-1">
                                    <MapPin size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A29A]" />
                                    <input id={id} inputMode="decimal" value={val}
                                        onChange={(e) => { setter(coordInput(e.target.value)); setAccuracy(null) }}
                                        placeholder={ph} className={inputClass(false, true, "h-11 text-sm")} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {coordsValid && (
                        <p className="mt-2 flex flex-wrap gap-x-3 text-xs text-[#8A837A]">
                            {accuracy !== null && <span>Précision : ± {accuracy} m</span>}
                            <a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`}
                                target="_blank" rel="noopener noreferrer" className="text-[#C2185B] hover:underline">
                                Vérifier sur la carte
                            </a>
                        </p>
                    )}
                </fieldset>

                <label htmlFor="pp-terms" className="flex cursor-pointer items-start gap-2.5 text-sm text-[#57524B]">
                    <input type="checkbox" id="pp-terms" checked={acceptedTerms}
                        onChange={() => setAcceptedTerms(!acceptedTerms)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#C2185B]" />
                    <span>
                        J'accepte les{" "}
                        <Link href="/terms" className="text-[#C2185B] hover:underline underline-offset-4">termes et conditions d'utilisation</Link>
                    </span>
                </label>

                <AuthSubmit loading={loading} disabled={!acceptedTerms} loadingText="Envoi en cours…">Envoyer ma demande</AuthSubmit>
            </form>
        </AuthShell>
    )
}

