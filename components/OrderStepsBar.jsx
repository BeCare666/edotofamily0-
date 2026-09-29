"use client";

import { Check, CreditCard, MapPin, PackageCheck, Navigation, Loader2, XCircle } from "lucide-react";

const CANCELLED = ["order-cancelled", "order-refunded", "order-failed"];

// États réels de la commande (aucun statut inventé)
export function orderSteps(order) {
    const paid = order?.payment_status === "payment-success";
    const hasPoint = Boolean(order?.pickup_point_id);
    // Livraison à domicile choisie et payée avec la commande
    const isCustomDelivery = order?.delivery_type === "CUSTOM";
    // Ancien « point personnalisé » (texte libre) des commandes antérieures
    const hasCustomPlace = !hasPoint && !isCustomDelivery && Boolean(order?.note && String(order.note).trim());
    const withdrawn =
        Number(order?.otp_used) === 1 || order?.order_status === "order-completed" || Boolean(order?.delivered_at);
    return { paid, hasPoint, isCustomDelivery, hasCustomPlace, pointChosen: hasPoint || isCustomDelivery || hasCustomPlace, withdrawn };
}

const formatDate = (d) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

/**
 * Barre fixe en bas de la page commande : 3 étapes (payée, point choisi, retirée)
 * et l'action utile au moment présent.
 */
export default function OrderStepsBar({ order, onPay, paying, canPay, onChoosePoint, onVisit }) {
    const { paid, hasPoint, isCustomDelivery, hasCustomPlace, pointChosen, withdrawn } = orderSteps(order);
    const cancelled = CANCELLED.includes(order?.order_status);

    const steps = [
        {
            key: "paid",
            icon: CreditCard,
            done: paid,
            title: paid ? "Commande payée" : "Paiement en attente",
            detail: null,
        },
        {
            key: "point",
            icon: MapPin,
            done: pointChosen,
            title: hasPoint
                ? "Point de retrait choisi"
                : isCustomDelivery
                    ? "Lieu de livraison choisi"
                    : hasCustomPlace ? "Lieu personnalisé choisi" : "Point de retrait à choisir",
            detail: hasPoint ? order?.pickup_point?.name : null,
        },
        {
            key: "withdrawn",
            icon: PackageCheck,
            done: withdrawn,
            title: withdrawn ? "Commande retirée" : "Pas encore retirée",
            detail: withdrawn && order?.delivered_at ? formatDate(order.delivered_at) : null,
        },
    ];
    // Étape en cours : la première non faite
    const currentIndex = steps.findIndex((s) => !s.done);
    const canVisit = hasPoint && !withdrawn && order?.pickup_point?.pickup_lat != null && order?.pickup_point?.pickup_lng != null;

    let action = null;
    if (cancelled) {
        action = (
            <p className="text-sm font-medium text-red-600 flex items-center gap-1.5">
                <XCircle size={16} /> Commande {order.order_status === "order-refunded" ? "remboursée" : "annulée"}
            </p>
        );
    } else if (!paid && canPay) {
        action = (
            <button onClick={onPay} disabled={paying}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold shadow-md disabled:opacity-70">
                {paying ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                {paying ? "Ouverture du paiement…" : "Payer ma commande"}
            </button>
        );
    } else if (paid && !pointChosen) {
        action = (
            <button onClick={onChoosePoint}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FF6EA9] text-white font-semibold shadow-md hover:bg-[#ff579d]">
                <MapPin size={18} /> Choisir un point de retrait
            </button>
        );
    } else if (canVisit) {
        action = (
            <button onClick={onVisit}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0B57D0] text-white font-semibold shadow-md hover:bg-[#0a4dbb]">
                <Navigation size={18} /> Visiter votre point de retrait
            </button>
        );
    }

    return (
        <div className="fixed inset-x-0 z-50 px-3 pointer-events-none" style={{ bottom: 5 }}>
            <nav aria-label="Suivi de la commande"
                className="pointer-events-auto mx-auto max-w-4xl rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-xl shadow-[0_10px_40px_rgba(15,23,42,0.18)] px-4 py-3 sm:px-5 flex flex-col sm:flex-row sm:items-center gap-3">
                <ol className="flex-1 flex items-start">
                    {steps.map((s, i) => {
                        const Icon = s.icon;
                        const isCurrent = i === currentIndex && !cancelled;
                        return (
                            <li key={s.key} className="flex-1 flex flex-col items-center text-center relative min-w-0"
                                aria-current={isCurrent ? "step" : undefined}>
                                {i > 0 && (
                                    <span aria-hidden="true"
                                        className={`absolute top-[18px] right-1/2 w-full h-[3px] -z-0 rounded-full ${steps[i - 1].done ? "bg-emerald-500" : "bg-gray-200"}`} />
                                )}
                                <span className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center border-2 transition ${s.done
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : isCurrent ? "bg-white border-[#FF6EA9] text-[#FF6EA9] shadow-[0_0_0_4px_rgba(255,110,169,0.18)]"
                                        : "bg-white border-gray-200 text-gray-400"}`}>
                                    {s.done ? <Check size={18} strokeWidth={3} /> : <Icon size={17} />}
                                </span>
                                <span className={`mt-1.5 text-[11px] sm:text-xs font-semibold leading-tight px-1 ${s.done ? "text-emerald-700" : isCurrent ? "text-[#0F172A]" : "text-gray-400"}`}>
                                    {s.title}
                                </span>
                                {s.detail && (
                                    <span className="text-[10px] sm:text-[11px] text-gray-500 truncate max-w-full px-1">{s.detail}</span>
                                )}
                            </li>
                        );
                    })}
                </ol>
                {action && <div className="sm:pl-2 shrink-0">{action}</div>}
            </nav>
        </div>
    );
}
