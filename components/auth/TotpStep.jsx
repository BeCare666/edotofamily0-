"use client"

import { useEffect, useState } from "react"
import { ShieldCheck } from "lucide-react"
import { authService } from "../../services/authService"
import { AuthAlert, AuthField, AuthSubmit } from "./AuthShell"

// Double authentification (audit sécurité 3.1, 29/10/2026) : étape 2 de la connexion
// (médecin, centre de santé, sponsor). Activation obligatoire : code QR, premier code,
// puis codes de secours montrés une seule fois.
export default function TotpStep({ challenge, onSession, onCancel }) {
    const [code, setCode] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [setup, setSetup] = useState(null)
    const [recovery, setRecovery] = useState(null)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        if (!challenge.setup_required) return
        authService.totp("setup", { challenge: challenge.challenge }).then(setSetup).catch((e) => setError(e.message))
    }, [challenge])

    const submit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            if (challenge.setup_required) {
                const { recovery_codes, ...session } = await authService.totp("activate", { challenge: challenge.challenge, code })
                setRecovery({ codes: recovery_codes || [], session })
            } else {
                onSession(await authService.totp("login", { challenge: challenge.challenge, code }))
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (recovery) {
        return (
            <div className="space-y-4">
                <h2 className="text-base font-semibold text-[#1A1814]">Vos codes de secours</h2>
                <p className="text-sm text-[#57524B]">
                    Chaque code permet une seule connexion si vous n’avez plus votre téléphone. Notez-les et gardez-les en lieu sûr :
                    ils ne seront plus jamais affichés.
                </p>
                <ul className="grid grid-cols-2 gap-2 rounded-xl border border-[#E9E5DF] bg-[#F9F8F6] p-4 font-mono text-sm">
                    {recovery.codes.map((c) => <li key={c}>{c}</li>)}
                </ul>
                <label className="flex items-center gap-2 text-sm text-[#3D3934]">
                    <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
                    J’ai noté mes codes de secours
                </label>
                <button type="button" disabled={!saved} onClick={() => onSession(recovery.session)}
                    className="w-full rounded-xl bg-[#C2185B] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
                    Continuer
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={submit} noValidate className="space-y-5">
            <AuthAlert type={error ? "error" : ""} message={error} />
            {challenge.setup_required ? (
                <div className="space-y-3 text-sm text-[#57524B]">
                    <p>
                        La double authentification est obligatoire pour ce compte. Scannez ce code avec une application
                        d’authentification (Google Authenticator, Microsoft Authenticator, Authy…), puis saisissez le code à 6 chiffres affiché.
                    </p>
                    {setup ? (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={setup.qr_image} alt="Code QR de la double authentification" className="mx-auto h-56 w-56" />
                            <p className="text-center text-xs">Ou saisissez la clé : <span className="break-all font-mono">{setup.secret}</span></p>
                        </>
                    ) : (
                        <p className="text-center">Préparation du code QR…</p>
                    )}
                </div>
            ) : (
                <p className="text-sm text-[#57524B]">
                    Saisissez le code à 6 chiffres de votre application d’authentification, ou l’un de vos codes de secours.
                </p>
            )}
            <AuthField id="totp" label="Code de vérification" icon={ShieldCheck} autoComplete="one-time-code" autoFocus
                inputMode={challenge.setup_required ? "numeric" : "text"} placeholder="123456"
                value={code} onChange={(e) => setCode(e.target.value)} />
            <AuthSubmit loading={loading} disabled={!code.trim()} loadingText="Vérification...">Vérifier</AuthSubmit>
            <button type="button" onClick={onCancel} className="block text-sm font-medium text-[#C2185B] hover:underline">
                Revenir à la connexion
            </button>
        </form>
    )
}
