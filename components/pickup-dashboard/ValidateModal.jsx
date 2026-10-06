"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2, ShieldCheck, Package, Gift } from "lucide-react";
import toast from "react-hot-toast";
import { api, dateTime, fcfa, isExpired } from "./api";
import { Badge } from "./ui";

/**
 * Remise d'une commande ou d'un kit : le point saisit le code donné par le client.
 * Commande : POST orders/verify-otp. Kit : POST campaigns/verify-otp puis campaigns/mark-pickup
 * (si le code du kit a déjà été validé sans que le retrait soit enregistré, seule la 2e étape est faite).
 */
export default function ValidateModal({ item, onClose, onDone }) {
    const [otp, setOtp] = useState("");
    const [busy, setBusy] = useState(false);
    const inputRef = useRef(null);
    const isKit = item.type === "kit";
    const d = item.data;
    const withdrawn = isKit ? d.picked_up : d.withdrawn;
    const codeAlreadyValidated = isKit && d.otp_used && !d.picked_up;
    const expired = isExpired(d.otp_expires_at);

    useEffect(() => {
        inputRef.current?.focus();
        const onKey = (e) => e.key === "Escape" && !busy && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [busy, onClose]);

    // Page figée derrière la fenêtre
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true);
        try {
            if (isKit) {
                if (!codeAlreadyValidated) {
                    await api("campaigns/verify-otp", { method: "POST", body: JSON.stringify({ registration_id: d.id, otp: otp.trim() }) });
                }
                await api("campaigns/mark-pickup", { method: "POST", body: JSON.stringify({ registration_id: d.id }) });
                toast.success("Kit remis : retrait enregistré.");
            } else {
                await api("orders/verify-otp", { method: "POST", body: JSON.stringify({ order_id: d.id, otp_code: otp.trim() }) });
                toast.success("Code valide : commande remise.");
            }
            onDone();
        } catch (err) {
            toast.error(err.message || "Validation impossible.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="validate-title">
            <div className="dash-view-in absolute inset-0 bg-[#1F1B16]/40 backdrop-blur-sm" onClick={() => !busy && onClose()} />
            <div className="dash-sheet-in relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-[#FFFDF9] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#EDE6DC] p-6 sm:p-8" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
                <span className="sm:hidden block mx-auto -mt-2 mb-4 w-10 h-1 rounded-full bg-[#E4DBCE]" aria-hidden="true" />
                <button onClick={() => !busy && onClose()} className="absolute right-5 top-5 p-2 rounded-full hover:bg-[#F3EEE7] text-[#7A6E62]" aria-label="Fermer">
                    <X size={18} />
                </button>
                <div className="flex items-start gap-4 pr-10">
                    <span className="w-12 h-12 rounded-2xl bg-[#FCE8F0] text-[#C2185B] flex items-center justify-center shrink-0">
                        {isKit ? <Gift size={22} /> : <Package size={22} />}
                    </span>
                    <div className="min-w-0">
                        <h2 id="validate-title" className="font-serif text-xl text-[#1F1B16] truncate">
                            {isKit ? d.campaign_title : `Commande ${d.tracking_number}`}
                        </h2>
                        <p className="text-sm text-[#7A6E62] mt-0.5">{isKit ? d.full_name : d.customer_name || "Client"}</p>
                    </div>
                </div>

                <dl className="grid grid-cols-2 gap-4 mt-6 text-sm">
                    <div>
                        <dt className="text-[#9A8E80] text-xs uppercase tracking-wider">{isKit ? "Inscrit le" : "Commandé le"}</dt>
                        <dd className="text-[#1F1B16] mt-1">{dateTime(d.created_at)}</dd>
                    </div>
                    <div>
                        <dt className="text-[#9A8E80] text-xs uppercase tracking-wider">{isKit ? "Ville" : "Montant des produits"}</dt>
                        <dd className="text-[#1F1B16] mt-1">{isKit ? d.city || "Non renseignée" : fcfa(d.products_amount)}</dd>
                    </div>
                    <div className="col-span-2">
                        <dt className="text-[#9A8E80] text-xs uppercase tracking-wider">État</dt>
                        <dd className="mt-1">
                            {withdrawn ? (
                                <Badge tone="ok">Remis le {dateTime(isKit ? d.picked_up_at : d.delivered_at)}</Badge>
                            ) : codeAlreadyValidated ? (
                                <Badge tone="wait">Code déjà validé : retrait à enregistrer</Badge>
                            ) : expired ? (
                                <Badge tone="off">Code expiré : le client doit en générer un nouveau</Badge>
                            ) : (
                                <Badge tone="wait">En attente du client</Badge>
                            )}
                        </dd>
                    </div>
                </dl>

                {!withdrawn && (
                    <form onSubmit={submit} className="mt-7">
                        {!codeAlreadyValidated && (
                            <>
                                <label htmlFor="otp" className="text-sm font-medium text-[#1F1B16]">Code du client</label>
                                <input
                                    id="otp"
                                    ref={inputRef}
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    placeholder="000000"
                                    className="mt-2 w-full px-4 py-3.5 rounded-2xl border border-[#E4DBCE] bg-white text-center text-2xl tracking-[0.5em] text-[#1F1B16] focus:outline-none focus:ring-2 focus:ring-[#FF6EA9]/40"
                                />
                            </>
                        )}
                        <button
                            type="submit"
                            disabled={busy || (!codeAlreadyValidated && otp.length !== 6)}
                            className="mt-4 w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#1F1B16] text-white font-medium hover:bg-[#2E2822] disabled:opacity-40 transition"
                        >
                            {busy ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                            {codeAlreadyValidated ? "Enregistrer le retrait" : "Valider et remettre"}
                        </button>
                        <p className="text-xs text-[#9A8E80] mt-3 text-center">Seuls les retraits rattachés à votre point peuvent être validés.</p>
                    </form>
                )}
            </div>
        </div>
    );
}
