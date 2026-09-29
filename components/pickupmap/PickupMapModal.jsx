"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Navigation temps réel (MapLibre GL + OpenStreetMap), chargée uniquement côté navigateur
const NavigationMap = dynamic(() => import("../map/NavigationMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-[#FF6EA9]" size={30} />
        </div>
    ),
});

export default function PickupMapModal({ open, onClose, pickupLat, pickupLng, name }) {
    // Pas de défilement de la page derrière la carte ; fermeture avec Échap
    useEffect(() => {
        if (!open) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e) => e.key === "Escape" && onClose?.();
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = previous;
            window.removeEventListener("keydown", onKey);
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[10000] bg-white" role="dialog" aria-modal="true" aria-label={`Navigation vers ${name || "le point de retrait"}`}>
            <NavigationMap destLat={pickupLat} destLng={pickupLng} destName={name} onClose={onClose} />
        </div>
    );
}
