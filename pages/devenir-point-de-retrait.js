"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Mail, Lock, User, Eye, EyeOff, CheckCircle2, XCircle, MapPin, LocateFixed, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import logo from "../public/logo/favicon.png"
import { authService } from "../services/authService"

const inputClass =
    "w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6EA9] text-gray-800 transition"

// Inscription d'un point de retrait : le compte est créé en attente.
// Parcours : inscription → confirmation de l'e-mail → validation par l'admin → connexion possible.
export default function PickupPointRegisterPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [address, setAddress] = useState("")
    const [lat, setLat] = useState("")
    const [lng, setLng] = useState("")
    const [accuracy, setAccuracy] = useState(null)
    const [locating, setLocating] = useState(false)
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState({ type: "", message: "" })
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
        setAlert({ type: "", message: "" })

        if (password !== confirmPassword) {
            setAlert({ type: "error", message: "Les mots de passe ne correspondent pas." })
            return
        }
        if (!coordsValid) {
            setAlert({ type: "error", message: "Indiquez la position du point de retrait (bouton « Utiliser ma position »)." })
            return
        }

        setLoading(true)
        try {
            await authService.registerPickUpPoint({
                name: name.trim(),
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

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff5f8] to-[#ffe4ef] px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative bg-white/80 backdrop-blur-2xl border border-white/40 mt-7 px-6 sm:px-8 pt-16 pb-10 w-full max-w-lg rounded-2xl shadow-lg"
            >
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white p-3 rounded-full shadow-lg border border-white/40">
                    <Image src={logo} alt="E·Doto Family" width={64} height={64} className="rounded-full" />
                </div>

                {done ? (
                    <div className="text-center">
                        <CheckCircle2 size={44} className="mx-auto text-green-500 mb-4" />
                        <h1 className="text-xl font-bold text-[#0F172A] mb-3">Demande enregistrée</h1>
                        <ol className="text-sm text-gray-600 text-left space-y-2 bg-gray-50 rounded-xl p-4 mb-6">
                            <li><strong>1.</strong> Confirmez votre adresse e-mail grâce au lien reçu à <strong>{email}</strong> (valable 5 minutes).</li>
                            <li><strong>2.</strong> Notre équipe vérifie votre point de retrait.</li>
                            <li><strong>3.</strong> Une fois validé, vous pourrez vous connecter à votre espace partenaire.</li>
                        </ol>
                        <div className="mb-6">
                            <p className="text-sm text-gray-500 mb-2">Lien expiré ou e-mail non reçu ?</p>
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resending || resendIn > 0}
                                className="px-5 py-2.5 rounded-xl border border-[#FF6EA9] text-[#FF6EA9] text-sm font-semibold hover:bg-[#FF6EA9] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {resending ? "Envoi…" : resendIn > 0 ? `Renvoyer l'e-mail (${resendIn} s)` : "Renvoyer l'e-mail de confirmation"}
                            </button>
                            {resendMessage.text && (
                                <p role="status" className={`text-xs mt-2 ${resendMessage.type === "error" ? "text-red-600" : "text-green-700"}`}>
                                    {resendMessage.text}
                                </p>
                            )}
                        </div>
                        <Link href="/" className="text-[#FF6EA9] font-medium hover:underline text-sm">Retour à l'accueil</Link>
                    </div>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold text-center text-[#0F172A]">
                            Devenir <span className="text-[#FF6EA9]">Point de Retrait</span>
                        </h1>
                        <p className="text-gray-500 mt-2 mb-8 text-sm text-center">
                            Inscrivez votre établissement. Votre compte sera activé après validation par notre équipe.
                        </p>

                        {alert.message && (
                            <div
                                role="alert"
                                className={`flex items-start gap-2 p-3 mb-5 rounded-xl text-sm font-medium ${alert.type === "success"
                                    ? "bg-green-100 text-green-700 border border-green-300"
                                    : "bg-red-100 text-red-700 border border-red-300"}`}
                            >
                                {alert.type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} className="shrink-0 mt-0.5" />}
                                <span>{alert.message}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="pp-name" className="text-sm text-gray-700 font-medium">Nom du point de retrait</label>
                                <div className="relative mt-2">
                                    <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                    <input id="pp-name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex : Pharmacie du Marché" className={inputClass} />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="pp-email" className="text-sm text-gray-700 font-medium">Adresse e-mail</label>
                                <div className="relative mt-2">
                                    <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                    <input id="pp-email" type="email" required autoComplete="email" value={email}
                                        onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="pp-password" className="text-sm text-gray-700 font-medium">Mot de passe</label>
                                    <div className="relative mt-2">
                                        <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input id="pp-password" type={showPassword ? "text" : "password"} required minLength={6}
                                            autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
                                            className={`${inputClass} pr-10`} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                            className="absolute right-3 top-3.5 text-gray-400 hover:text-[#FF6EA9]">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="pp-password2" className="text-sm text-gray-700 font-medium">Confirmation</label>
                                    <div className="relative mt-2">
                                        <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input id="pp-password2" type={showPassword ? "text" : "password"} required
                                            autoComplete="new-password" value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="pp-address" className="text-sm text-gray-700 font-medium">Adresse du point de retrait</label>
                                <textarea id="pp-address" rows={2} value={address} onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Ex : Cotonou, Akpakpa, à côté du marché…"
                                    className="w-full mt-2 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6EA9] text-gray-800" />
                            </div>

                            {/* Position GPS */}
                            <fieldset className="rounded-xl border border-pink-100 bg-[#fff5f8]/60 p-4">
                                <legend className="px-1 text-sm text-gray-700 font-medium">Position GPS</legend>
                                <p className="text-xs text-gray-500 mb-3">
                                    Faites l'inscription depuis votre point de retrait, puis utilisez votre position actuelle.
                                </p>
                                <button type="button" onClick={handleLocate} disabled={locating}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FF6EA9] text-white font-semibold hover:bg-[#ff579d] disabled:opacity-60 transition">
                                    {locating ? <Loader2 size={18} className="animate-spin" /> : <LocateFixed size={18} />}
                                    {locating ? "Localisation…" : "Utiliser ma position actuelle"}
                                </button>

                                <div className="grid grid-cols-2 gap-3 mt-3">
                                    <div>
                                        <label htmlFor="pp-lat" className="text-xs text-gray-500">Latitude</label>
                                        <div className="relative mt-1">
                                            <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                                            <input id="pp-lat" type="number" step="any" inputMode="decimal" value={lat}
                                                onChange={(e) => { setLat(e.target.value); setAccuracy(null) }}
                                                placeholder="6.3703" className={`${inputClass} py-2.5 text-sm`} />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="pp-lng" className="text-xs text-gray-500">Longitude</label>
                                        <div className="relative mt-1">
                                            <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                                            <input id="pp-lng" type="number" step="any" inputMode="decimal" value={lng}
                                                onChange={(e) => { setLng(e.target.value); setAccuracy(null) }}
                                                placeholder="2.3912" className={`${inputClass} py-2.5 text-sm`} />
                                        </div>
                                    </div>
                                </div>

                                {coordsValid && (
                                    <p className="text-xs text-gray-500 mt-2 flex flex-wrap gap-x-3">
                                        {accuracy !== null && <span>Précision : ± {accuracy} m</span>}
                                        <a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`}
                                            target="_blank" rel="noopener noreferrer" className="text-[#FF6EA9] hover:underline">
                                            Vérifier sur la carte
                                        </a>
                                    </p>
                                )}
                            </fieldset>

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <input type="checkbox" id="pp-terms" checked={acceptedTerms}
                                    onChange={() => setAcceptedTerms(!acceptedTerms)} className="accent-[#FF6EA9] w-4 h-4" />
                                <label htmlFor="pp-terms" className="cursor-pointer">
                                    J'accepte les{" "}
                                    <Link href="/terms" className="text-[#FF6EA9] hover:underline">termes et conditions d'utilisation</Link>
                                </label>
                            </div>

                            <button type="submit" disabled={!acceptedTerms || loading}
                                className={`w-full py-3 rounded-xl font-semibold shadow-md transition-all ${acceptedTerms && !loading
                                    ? "bg-[#FF6EA9] text-white hover:bg-[#ff579d] hover:shadow-lg"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>
                                {loading ? "Envoi en cours…" : "Envoyer ma demande"}
                            </button>
                        </form>

                        <p className="text-gray-500 text-sm mt-6 text-center">
                            Déjà partenaire ?{" "}
                            <Link href="/login" className="text-[#FF6EA9] font-medium hover:underline">Connectez-vous</Link>
                        </p>
                    </>
                )}
            </motion.div>
        </main>
    )
}
