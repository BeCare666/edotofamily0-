"use client";

import { useEffect } from "react";

export default function FeexPayModal({ payment, onClose }) {
    useEffect(() => {
        if (!payment) return;

        console.log("📌 FeexPayModal payment data :", payment);

        // Injecte le bon SDK FEEXPAY
        const script = document.createElement("script");
        script.src = "https://api.feexpay.me/feexpay-javascript-sdk/index.js";
        script.async = true;

        script.onload = () => {
            console.log("🚀 FEEXPAY SDK LOADED :", window.FeexPayButton);

            if (!window.FeexPayButton) {
                console.error("❌ FeexPayButton introuvable !");
                return;
            }

            // Créer un div qui recevra leur widget
            const container = document.createElement("div");
            container.id = "render";
            document.body.appendChild(container);

            window.FeexPayButton.init("render", {
                id: process.env.NEXT_PUBLIC_FEEXPAY_STORE_ID,
                amount: payment.amount,
                token: process.env.NEXT_PUBLIC_FEEXPAY_PUBLIC_KEY,
                custom_id: payment.reference,
                description: "Paiement commande " + payment.reference,
                mode: "LIVE",
                currency: "XOF",

                callback: async (response) => {
                    console.log("FeexPay success :", response);
                    if (response.status !== "SUCCESS") {
                        console.error("❌ Paiement échoué ou annulé.");
                        return;
                    }
                    const API_BASE_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
                    await fetch(`${API_BASE_URL}/payments/feexpay/complete`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            transaction_id: response.transaction_id,
                            custom_id: payment.reference // ta ref interne ou tracking number
                        })
                    });

                    onClose?.();
                },

                //error_callback_url: "https://tonsite.com/erreur",
                //callback_url: "https://tonsite.com/success",
            });
        };

        document.body.appendChild(script);

        return () => {

            const div = document.getElementById("render");
            if (div) div.remove();
        };
    }, [payment]);

    return null;
}
