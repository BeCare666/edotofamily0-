"use client"

import { useState } from "react"
import { Mail } from "lucide-react"
import { authService } from "../../services/authService"
import { AuthAlert, AuthField, AuthSubmit } from "./AuthShell"

// Nouvel appareil (29/10/2026) : jeunes et points de retrait reçoivent un code à 6 chiffres par e-mail.
// Après le bon code, cet appareil est reconnu 30 jours (plus de code demandé).
export default function DeviceCodeStep({ email, check, onSession, onCancel }) {
    const [current, setCurrent] = useState(check)
    const [code, setCode] = useState("")
    const [error, setError] = useState("")
    const [info, setInfo] = useState("")
    const [loading, setLoading] = useState(false)
    const [resending, setResending] = useState(false)

    const submit = async (e) => {
        e.preventDefault()
        setError("")
        setInfo("")
        setLoading(true)
        try {
            const res = await authService.totp("device", { challenge: current.challenge, code })
            authService.rememberDevice(email, res.device_token)
            await onSession(res)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const resend = async () => {
        setError("")
        setInfo("")
        setResending(true)
        try {
            const res = await authService.totp("device-resend", { challenge: current.challenge })
            setCurrent(res)
            setCode("")
            setInfo("Un nouveau code vient d'être envoyé.")
        } catch (err) {
            setError(err.message)
        } finally {
            setResending(false)
        }
    }

    return (
        <form onSubmit={submit} noValidate className="space-y-5">
            <AuthAlert type={error ? "error" : info ? "success" : ""} message={error || info} />
            <p className="text-sm text-[#57524B]">
                Vous vous connectez depuis un nouvel appareil. Nous avons envoyé un code à 6 chiffres à{" "}
                <strong>{current.email_hint}</strong>. Pensez à regarder dans les courriers indésirables (spams).
            </p>
            <AuthField id="device-code" label="Code reçu par e-mail" icon={Mail} inputMode="numeric" autoComplete="one-time-code"
                autoFocus placeholder="123456" maxLength={6}
                value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
            <AuthSubmit loading={loading} disabled={code.length !== 6} loadingText="Vérification...">Valider</AuthSubmit>
            <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={resend} disabled={resending} className="font-medium text-[#C2185B] hover:underline disabled:opacity-50">
                    {resending ? "Envoi…" : "Renvoyer le code"}
                </button>
                <button type="button" onClick={onCancel} className="text-[#57524B] hover:underline">Revenir à la connexion</button>
            </div>
        </form>
    )
}
