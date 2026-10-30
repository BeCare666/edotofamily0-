"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Cookie } from "lucide-react"

// Information sur les cookies et traces de connexion (autorisation APDP n° 2026-327/AT/APDP/DST/SC, point e, 30/10/2026).
// Le site n'utilise que des traceurs nécessaires à son fonctionnement (aucun outil de mesure d'audience ni de publicité) :
// - cookie « edoto_device_id » (60 jours) : une seule demande de kit gratuit par personne et par campagne ;
// - stockage du navigateur : session (fermée après 5 min d'inactivité), appareil reconnu après le code reçu par e-mail
//   (30 jours), préférences d'affichage ;
// - traces de connexion côté serveur : décrites dans la politique de confidentialité (section « Cookies et traces »).
// L'information est redonnée tous les 60 jours (durée de validité fixée par l'APDP).
const STORAGE_KEY = "edoto-cookie-info"
const VALIDITY_MS = 60 * 24 * 3600 * 1000

export default function CookieConsent() {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null")
            if (!saved?.at || Date.now() - Number(saved.at) > VALIDITY_MS) setOpen(true)
        } catch {
            setOpen(true)
        }
    }, [])

    const acknowledge = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ at: Date.now(), version: 1 }))
            localStorage.removeItem("edoto-cookie-preferences")
        } catch { }
        setOpen(false)
    }

    if (!open) return null

    return (
        <div role="dialog" aria-live="polite" aria-label="Cookies et traces de connexion"
            className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[45] mx-auto max-w-2xl rounded-2xl border border-[#E9E5DF] bg-white p-4 shadow-[0_18px_40px_-18px_rgba(26,24,20,0.35)] sm:bottom-5 sm:p-5">
            <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#FCE4EF] text-[#C2185B]"><Cookie size={18} /></span>
                <div className="min-w-0 text-sm text-[#3D3934]">
                    <p className="font-semibold text-[#1A1814]">Cookies et traces de connexion</p>
                    <p className="mt-1 leading-relaxed">
                        E.doto family n'utilise que des traceurs nécessaires au fonctionnement du site : votre session, la reconnaissance de votre
                        appareil et une seule demande de kit par personne. Aucune mesure d'audience, aucune publicité. Durée : 60 jours au plus.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <button type="button" onClick={acknowledge}
                            className="rounded-full bg-[#1A1814] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#C2185B]">
                            J'ai compris
                        </button>
                        <Link href="/privacy#cookies" className="text-sm font-medium text-[#C2185B] underline-offset-4 hover:underline">
                            En savoir plus
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
