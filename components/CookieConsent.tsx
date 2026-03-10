"use client"

import { useState, useEffect } from "react"
import { Lock, Activity } from "lucide-react"

const STORAGE_KEY = "edoto-cookie-preferences"

export default function CookieConsent() {
    const [open, setOpen] = useState(false)
    const [analytics, setAnalytics] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (!saved) setOpen(true)
    }, [])

    const handleAccept = () => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ necessary: true, analytics })
        )
        setOpen(false)
    }

    const handleReject = () => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ necessary: true, analytics: false })
        )
        setOpen(false)
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="bg-gray-900 text-gray-100 p-6 rounded-2xl w-11/12 max-w-md shadow-lg space-y-4">
                <h2 className="text-xl font-bold text-pink-400 flex items-center gap-2">
                    🍪 Gestion des cookies
                </h2>
                <p className="text-sm">
                    Nous utilisons des cookies pour assurer le bon fonctionnement du site
                    et améliorer votre expérience sur <b>E·Doto Family</b>.
                </p>

                <div className="flex items-center gap-3 mt-3">
                    <Lock className="text-pink-400" size={20} />
                    <label className="flex-1 flex items-center gap-2">
                        <input type="checkbox" checked disabled className="accent-pink-400" />
                        <b>Cookies nécessaires</b> (obligatoires)
                    </label>
                </div>

                <div className="flex items-center gap-3 mt-2">
                    <Activity className="text-pink-400" size={20} />
                    <label className="flex-1 flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={analytics}
                            onChange={(e) => setAnalytics(e.target.checked)}
                            className="accent-pink-400"
                        />
                        Cookies analytiques (amélioration du service)
                    </label>
                </div>

                <a href="/privacy" className="text-pink-400 text-sm underline block mt-2">
                    Consulter la politique de confidentialité
                </a>

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={handleReject}
                        className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                    >
                        Refuser
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-4 py-2 rounded-lg bg-pink-400 hover:bg-pink-500 text-gray-900 font-semibold transition"
                    >
                        Accepter
                    </button>
                </div>
            </div>
        </div>
    )
}