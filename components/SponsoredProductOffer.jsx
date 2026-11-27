"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { Gift, Loader2, X } from "lucide-react"
import PickupPointPicker from "./PickupPointPicker"
import { orderSponsoredProduct, useProductFunding } from "../lib/sponsored"

// Produit offert par une campagne (26/11/2026) sur la fiche produit.
// Personne ciblée : « 0 FCFA pour vous », bouton « Obtenir gratuitement » (choix du point de retrait, code par e-mail).
// Personne hors cible ou profil incomplet : explication. Sans compte : invitation à se connecter.
// Le bouton d'achat normal reste disponible sur la fiche.
export default function SponsoredProductOffer({ product }) {
    const router = useRouter()
    const funding = useProductFunding(product?.id)
    const [open, setOpen] = useState(false)
    const [point, setPoint] = useState(null)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState(null)
    const [done, setDone] = useState(null)

    if (!product || funding.status === "loading" || funding.status === "none") return null
    const d = funding.data || {}

    const login = () => {
        try { localStorage.setItem("redirect_after_login", window.location.pathname) } catch { }
        router.push("/login")
    }

    const confirm = async () => {
        if (!point) return
        setBusy(true)
        setError(null)
        try {
            setDone(await orderSponsoredProduct(product.id, point.id))
        } catch (e) {
            setError(e.message)
        } finally {
            setBusy(false)
        }
    }

    return (
        <>
            <div className="rounded-2xl border border-[#F3C9DA] bg-[#FBEEF3] p-5">
                <p className="flex items-center gap-2 text-[13px] font-medium text-[#C2185B]">
                    <Gift size={16} /> {d.offered_by || "Offert par un sponsor"}
                </p>
                {funding.status === "guest" && (
                    <>
                        <p className="mt-2 text-[15px] text-[#161412]">Ce produit est offert à certains publics pendant une campagne.</p>
                        <button type="button" onClick={login} className="mt-4 rounded-full bg-[#1A1814] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#C2185B]">
                            Me connecter pour savoir s’il m’est offert
                        </button>
                    </>
                )}
                {funding.status === "ok" && d.eligible && (
                    <>
                        <p className="mt-2 flex items-baseline gap-3">
                            <span className="text-3xl font-semibold text-[#161412]">0 FCFA</span>
                            <span className="text-sm text-[#6B645D]">pour vous, retrait dans un point de retrait</span>
                        </p>
                        {d.campaign_title && <p className="mt-1 text-[13px] text-[#6B645D]">Campagne « {d.campaign_title} »{d.cities?.length ? `, ${d.cities.join(", ")}` : ""}</p>}
                        <button type="button" onClick={() => { setOpen(true); setDone(null); setError(null) }}
                            className="mt-4 rounded-full bg-[#1A1814] px-6 py-3 text-sm font-medium text-white hover:bg-[#C2185B]">
                            Obtenir gratuitement
                        </button>
                    </>
                )}
                {funding.status === "ok" && !d.eligible && (
                    <>
                        <p className="mt-2 text-[14px] leading-relaxed text-[#3E3832]">{d.message || "Ce produit ne vous est pas offert en ce moment."}</p>
                        {d.reason === "profile_incomplete" && (
                            <Link href="/profile" className="mt-3 inline-block text-sm font-medium text-[#C2185B] hover:underline">Compléter mon profil</Link>
                        )}
                    </>
                )}
            </div>

            {open && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                        <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        {done ? (
                            <div className="py-6 text-center">
                                <Gift size={32} className="mx-auto text-[#C2185B]" />
                                <h3 className="mt-4 text-xl font-semibold text-[#161412]">Produit offert réservé</h3>
                                <p className="mt-2 text-sm text-[#6B645D]">{done.message}</p>
                                <p className="mt-1 text-sm text-[#6B645D]">Point de retrait : {done.pickup_point_name}</p>
                                <Link href={`/orders/${done.id}`} className="mt-6 inline-block rounded-full bg-[#1A1814] px-6 py-3 text-sm font-medium text-white">Voir ma commande</Link>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-lg font-semibold text-[#161412]">Où retirer votre produit offert ?</h3>
                                <p className="mt-1 text-sm text-[#6B645D]">
                                    {d.cities?.length ? `Choisissez un point de retrait à ${d.cities.join(", ")}.` : "Choisissez votre point de retrait."} Votre code de retrait vous sera envoyé par e-mail.
                                </p>
                                <div className="mt-4">
                                    <PickupPointPicker selectedId={point?.id} onSelect={setPoint} city={d.cities?.length === 1 ? d.cities[0] : null} />
                                </div>
                                {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
                                <button type="button" disabled={!point || busy} onClick={confirm}
                                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A1814] py-3 text-sm font-medium text-white disabled:opacity-50">
                                    {busy && <Loader2 size={16} className="animate-spin" />}
                                    {point ? `Confirmer, 0 FCFA, retrait chez ${point.name}` : "Choisissez un point de retrait"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
