"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Store, Bike, LocateFixed, Loader2, ArrowLeft } from "lucide-react";
import PickupPointPicker from "./PickupPointPicker";

const LocationPickerMap = dynamic(() => import("./map/LocationPickerMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <Loader2 className="animate-spin text-[#FF6EA9]" />
        </div>
    ),
});

const API = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
export const DESCRIPTION_MAX_LENGTH = 150;

const fcfa = (n) => `${Math.round(Number(n) || 0).toLocaleString("fr-FR")} FCFA`;

/**
 * Choix du lieu AVANT le paiement : point de retrait, ou livraison à domicile
 * (position obligatoire, description 150 caractères max, téléphone obligatoire).
 * Le prix affiché vient du serveur, qui le recalcule de toute façon à la commande.
 * onConfirm(delivery) : { type: "PICKUP", pickup_point_id } ou { type: "CUSTOM", lat, lng, description, phone }.
 */
export default function DeliveryChoiceStep({ productsTotal, onBack, onConfirm, submitting }) {
    const [mode, setMode] = useState("PICKUP");
    const [point, setPoint] = useState(null);
    const [position, setPosition] = useState(null);
    const [locating, setLocating] = useState(false);
    const [geoError, setGeoError] = useState(null);
    const [description, setDescription] = useState("");
    const [phone, setPhone] = useState("");
    const [quote, setQuote] = useState({ status: "idle", data: null, error: null });

    const useMyPosition = useCallback(() => {
        if (!navigator.geolocation) {
            setGeoError("La géolocalisation n'est pas disponible sur cet appareil. Placez le repère sur la carte.");
            return;
        }
        setLocating(true);
        setGeoError(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLocating(false);
            },
            (err) => {
                setGeoError(
                    err.code === 1
                        ? "Position refusée. Placez le repère sur la carte."
                        : "Position introuvable. Placez le repère sur la carte."
                );
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
        );
    }, []);

    // Prix de la livraison : recalculé à chaque déplacement du repère
    useEffect(() => {
        if (mode !== "CUSTOM" || !position) {
            setQuote({ status: "idle", data: null, error: null });
            return;
        }
        const ctrl = new AbortController();
        setQuote({ status: "loading", data: null, error: null });
        const t = setTimeout(async () => {
            try {
                const qs = new URLSearchParams({ lat: String(position.lat), lng: String(position.lng) });
                const res = await fetch(`${API}/delivery/quote?${qs.toString()}`, { signal: ctrl.signal });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data?.message || "Prix de livraison indisponible.");
                setQuote({ status: "ok", data, error: null });
            } catch (e) {
                if (e.name !== "AbortError") setQuote({ status: "error", data: null, error: e.message });
            }
        }, 500);
        return () => {
            clearTimeout(t);
            ctrl.abort();
        };
    }, [mode, position]);

    const phoneDigits = phone.replace(/\D/g, "").length;
    const customReady =
        !!position &&
        description.trim().length > 0 &&
        description.trim().length <= DESCRIPTION_MAX_LENGTH &&
        phoneDigits >= 8 &&
        phoneDigits <= 15 &&
        quote.status === "ok";
    const ready = mode === "PICKUP" ? !!point : customReady;
    const fee = mode === "CUSTOM" && quote.status === "ok" ? quote.data.fee : 0;

    const confirm = () => {
        if (!ready || submitting) return;
        if (mode === "PICKUP") {
            onConfirm({ type: "PICKUP", pickup_point_id: point.id });
        } else {
            onConfirm({ type: "CUSTOM", lat: position.lat, lng: position.lng, description: description.trim(), phone: phone.trim() });
        }
    };

    const tabClass = (active) =>
        `flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition ${active ? "bg-[#FF6EA9] text-white border-[#FF6EA9]" : "bg-white text-gray-700 border-gray-200 hover:border-[#FF6EA9]"
        }`;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <button onClick={onBack} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500" aria-label="Retour à la quantité">
                    <ArrowLeft size={18} />
                </button>
                <h3 className="text-lg font-semibold">Où récupérer votre commande ?</h3>
            </div>

            <div className="flex gap-2" role="tablist">
                <button role="tab" aria-selected={mode === "PICKUP"} className={tabClass(mode === "PICKUP")} onClick={() => setMode("PICKUP")}>
                    <Store size={16} /> Point de retrait
                </button>
                <button role="tab" aria-selected={mode === "CUSTOM"} className={tabClass(mode === "CUSTOM")} onClick={() => setMode("CUSTOM")}>
                    <Bike size={16} /> Livraison à domicile
                </button>
            </div>

            {mode === "PICKUP" ? (
                <div>
                    <PickupPointPicker selectedId={point?.id} onSelect={(p) => setPoint(p)} />
                    {point && (
                        <p className="mt-3 text-sm text-gray-700">
                            Point choisi : <span className="font-semibold">{point.name}</span>
                        </p>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-gray-600">Placez le repère sur le lieu exact de livraison.</p>
                        <button
                            onClick={useMyPosition}
                            disabled={locating}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border border-[#FF6EA9] text-[#FF6EA9] hover:bg-pink-50 disabled:opacity-60"
                        >
                            {locating ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
                            Utiliser ma position
                        </button>
                    </div>
                    {geoError && <p className="text-sm text-amber-700">{geoError}</p>}
                    <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-gray-200">
                        <LocationPickerMap value={position} onChange={setPosition} />
                    </div>

                    <label className="text-sm font-medium" htmlFor="delivery-description">
                        Description du lieu
                    </label>
                    <textarea
                        id="delivery-description"
                        rows={2}
                        maxLength={DESCRIPTION_MAX_LENGTH}
                        value={description}
                        onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_MAX_LENGTH))}
                        placeholder="Ex. : portail bleu derrière la pharmacie"
                        className="w-full border rounded-xl p-3 text-sm focus:ring-pink-300 focus:ring-2 outline-none"
                    />
                    <p className="-mt-2 text-right text-xs text-gray-500">
                        {description.length}/{DESCRIPTION_MAX_LENGTH}
                    </p>

                    <label className="text-sm font-medium" htmlFor="delivery-phone">
                        Votre numéro de téléphone
                    </label>
                    <input
                        id="delivery-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ex. : +229 01 97 00 00 00"
                        className="w-full border rounded-xl p-3 text-sm focus:ring-pink-300 focus:ring-2 outline-none"
                    />

                    <div className="rounded-xl bg-gray-50 p-3 text-sm">
                        {!position ? (
                            <p className="text-gray-500">Le prix de la livraison s'affiche une fois le lieu placé.</p>
                        ) : quote.status === "loading" ? (
                            <p className="flex items-center gap-2 text-gray-600">
                                <Loader2 size={14} className="animate-spin" /> Calcul du prix de livraison…
                            </p>
                        ) : quote.status === "error" ? (
                            <p className="text-red-600">{quote.error}</p>
                        ) : quote.status === "ok" ? (
                            <p className="text-gray-700">
                                Livraison : <span className="font-semibold">{fcfa(quote.data.fee)}</span>{" "}
                                <span className="text-gray-500">({String(quote.data.distance_km).replace(".", ",")} km)</span>
                            </p>
                        ) : null}
                    </div>
                </div>
            )}

            <div className="border-t pt-3 flex flex-col gap-1 text-sm">
                <div className="flex justify-between text-gray-600">
                    <span>Produits</span>
                    <span>{fcfa(productsTotal)}</span>
                </div>
                {mode === "CUSTOM" && (
                    <div className="flex justify-between text-gray-600">
                        <span>Livraison</span>
                        <span>{quote.status === "ok" ? fcfa(fee) : "Calcul en cours"}</span>
                    </div>
                )}
                <div className="flex justify-between text-base font-semibold">
                    <span>Total à payer</span>
                    <span className="text-pink-600">{fcfa(productsTotal + fee)}</span>
                </div>
            </div>

            <button
                onClick={confirm}
                disabled={!ready || submitting}
                className="w-full bg-pink-600 text-white py-3 rounded-xl font-medium hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {submitting ? "Commande en cours…" : "Confirmer et payer"}
            </button>
        </div>
    );
}
