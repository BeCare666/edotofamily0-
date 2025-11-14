"use client";
import { useEffect } from "react";

export default function FeexPayModal({ payment, onClose }) {
    useEffect(() => {
        if (!payment) return;

        // Charger dynamiquement le script FeexPay
        const script = document.createElement("script");
        script.src = "https://cdn.feexpay.com/sdk.js";
        script.async = true;
        script.onload = () => {
            if (window.FeexPayCheckout) {
                window.FeexPayCheckout.open({
                    publicKey: process.env.NEXT_PUBLIC_FEEXPAY_PUBLIC_KEY, // ✅ depuis ton .env
                    id: process.env.NEXT_PUBLIC_FEEXPAY_STORE_ID,          // ✅ ID de ta boutique
                    reference: payment.reference,
                    amount: payment.amount,
                    currency: payment.currency || "XOF",
                    description: payment.description || "Paiement commande e-doto",
                    mode: payment.mode || "LIVE",

                    // Callback succès/erreur
                    onSuccess: () => {
                        alert("✅ Paiement réussi !");
                        onClose?.();
                    },
                    onError: (err) => {
                        console.error("Erreur paiement:", err);
                        alert("❌ Une erreur est survenue pendant le paiement.");
                    },
                });
            }
        };
        document.body.appendChild(script);

        return () => {
            if (window.FeexPayCheckout) window.FeexPayCheckout.close();
        };
    }, [payment]);

    return null;
}
