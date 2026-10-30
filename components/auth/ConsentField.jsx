"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { ShieldCheck, X } from "lucide-react"
import { CONSENT_SECTIONS, CONSENT_TITLE } from "../../lib/consent"

// Case de consentement des pages d'inscription (APDP, point b, 30/10/2026) : le document s'ouvre dans une fenêtre,
// « J'accepte » coche la case. Le formulaire envoie ensuite « consent: true » à l'API.
export default function ConsentField({ id = "consent", checked, onChange }) {
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    useEffect(() => {
        if (!open) return
        const onKey = (e) => { if (e.key === "Escape") setOpen(false) }
        document.addEventListener("keydown", onKey)
        return () => document.removeEventListener("keydown", onKey)
    }, [open])

    return (
        <>
            <div className="flex items-start gap-2.5 text-sm text-[#57524B]">
                <input type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#C2185B]" />
                <label htmlFor={id} className="cursor-pointer">
                    J’ai lu et j’accepte le{" "}
                    <button type="button" onClick={() => setOpen(true)} className="font-medium text-[#C2185B] hover:underline underline-offset-4">
                        document de consentement
                    </button>{" "}
                    à la collecte et au transfert de mes données, les{" "}
                    <Link href="/terms" className="text-[#C2185B] hover:underline underline-offset-4">conditions d’utilisation</Link>{" "}
                    et la{" "}
                    <Link href="/privacy" className="text-[#C2185B] hover:underline underline-offset-4">politique de confidentialité</Link>.
                </label>
            </div>

            {open && mounted && createPortal(
                <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={() => setOpen(false)}>
                    <div role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} onClick={(e) => e.stopPropagation()}
                        className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
                        <div className="flex items-start gap-3 border-b border-[#E9E5DF] p-5">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#FCE4EF] text-[#C2185B]"><ShieldCheck size={18} /></span>
                            <h2 id={`${id}-title`} className="min-w-0 flex-1 text-base font-semibold text-[#1A1814]">{CONSENT_TITLE}</h2>
                            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="rounded-full p-1 text-[#57524B] hover:bg-[#F5F2EE]"><X size={18} /></button>
                        </div>
                        <div className="space-y-4 overflow-y-auto p-5 text-sm leading-relaxed text-[#3D3934]">
                            {CONSENT_SECTIONS.map((s) => (
                                <section key={s.title}>
                                    <h3 className="font-semibold text-[#1A1814]">{s.title}</h3>
                                    <p className="mt-1">{s.text}</p>
                                </section>
                            ))}
                        </div>
                        <div className="flex flex-wrap justify-end gap-3 border-t border-[#E9E5DF] p-4">
                            <button type="button" onClick={() => setOpen(false)}
                                className="rounded-full border border-[#E9E5DF] px-5 py-2 text-sm font-semibold text-[#1A1814] hover:bg-[#F5F2EE]">
                                Fermer
                            </button>
                            <button type="button" onClick={() => { onChange(true); setOpen(false) }}
                                className="rounded-full bg-[#1A1814] px-5 py-2 text-sm font-semibold text-white hover:bg-[#C2185B]">
                                J’accepte
                            </button>
                        </div>
                    </div>
                </div>,
                document.body,
            )}
        </>
    )
}
