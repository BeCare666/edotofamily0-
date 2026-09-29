"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { Gift, CheckCircle, Clock, Loader2, MapPin } from "lucide-react";

const PickupMapModal = dynamic(() => import("./pickupmap/PickupMapModal"), { ssr: false });

const API = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;

const formatDate = (d) =>
    new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" });

// Inscriptions du participant aux campagnes de kits, avec régénération du code de retrait.
// Règle identique aux commandes : nouveau code seulement si le code a expiré et que le kit
// n'a pas été retiré (l'API revérifie tout).
export default function CampaignKitsSection() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [mapTarget, setMapTarget] = useState(null);

    const load = async () => {
        const token = localStorage.getItem("token");
        if (!token) return setLoading(false);
        try {
            const res = await fetch(`${API}/campaign-registrations/mine`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => []);
            setRegistrations(res.ok && Array.isArray(data) ? data : []);
        } catch {
            setRegistrations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const regenerate = async (reg) => {
        setBusyId(reg.id);
        try {
            const res = await fetch(`${API}/campaign-registrations/${reg.id}/regenerate-otp`, {
                method: "POST",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast.error(data?.message || "Impossible de générer un nouveau code.");
                return;
            }
            toast.success(data.message || "Un nouveau code vous a été envoyé par e-mail.");
            await load();
        } catch {
            toast.error("Erreur réseau. Veuillez réessayer.");
        } finally {
            setBusyId(null);
        }
    };

    if (loading || registrations.length === 0) return null;

    return (
        <section className="mt-12" aria-labelledby="kits-title">
            <h2 id="kits-title" className="text-xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <Gift className="text-[#FF6EA9]" /> Mes kits de campagne
            </h2>
            <div className="space-y-4">
                {registrations.map((reg) => {
                    const withdrawn = Number(reg.picked_up) === 1 || reg.order_status === "order-completed";
                    const validated = Number(reg.otp_used) === 1;
                    const expired = !!reg.otp_expires_at && new Date(reg.otp_expires_at).getTime() < Date.now();
                    const hasCoords = reg.pickup_lat !== null && reg.pickup_lat !== undefined && reg.pickup_lng !== null;

                    return (
                        <div key={reg.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                <div>
                                    <p className="font-semibold text-[#0F172A]">{reg.campaign_title}</p>
                                    <p className="text-sm text-gray-500">
                                        Point de retrait : {reg.pickup_center_name || "—"}
                                        {reg.campaign_location ? ` · ${reg.campaign_location}` : ""}
                                    </p>
                                </div>
                                {hasCoords && !withdrawn && (
                                    <button
                                        onClick={() => setMapTarget(reg)}
                                        className="inline-flex items-center gap-1 text-sm text-[#FF6EA9] font-medium hover:underline"
                                    >
                                        <MapPin size={16} /> Itinéraire
                                    </button>
                                )}
                            </div>

                            <div className="mt-3 text-sm">
                                {withdrawn ? (
                                    <p className="text-green-700 flex items-center gap-2">
                                        <CheckCircle size={18} /> Kit retiré
                                        {reg.picked_up_at ? ` le ${formatDate(reg.picked_up_at)}` : ""}.
                                    </p>
                                ) : validated ? (
                                    <p className="text-blue-700 flex items-center gap-2">
                                        <Clock size={18} /> Code validé au point de retrait : remise du kit en cours.
                                    </p>
                                ) : expired ? (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <p className="text-gray-700">
                                            Votre code a expiré le {formatDate(reg.otp_expires_at)}. Générez-en un nouveau : il vous sera envoyé par e-mail.
                                        </p>
                                        <button
                                            onClick={() => regenerate(reg)}
                                            disabled={busyId === reg.id}
                                            className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#FF6EA9] text-white font-semibold hover:bg-[#ff579d] disabled:opacity-60 transition"
                                        >
                                            {busyId === reg.id && <Loader2 size={16} className="animate-spin" />}
                                            {busyId === reg.id ? "Envoi…" : "Générer un nouveau code"}
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-gray-700">
                                        Votre code vous a été envoyé par e-mail
                                        {reg.otp_expires_at ? `. Il est valable jusqu'au ${formatDate(reg.otp_expires_at)}` : ""}.
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <PickupMapModal
                open={!!mapTarget}
                onClose={() => setMapTarget(null)}
                pickupLat={mapTarget?.pickup_lat}
                pickupLng={mapTarget?.pickup_lng}
                name={mapTarget?.pickup_center_name}
            />
        </section>
    );
}
