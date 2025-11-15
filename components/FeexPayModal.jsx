"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"
export default function FeexPayModal({ payment, onClose }) {
    const router = useRouter()
    useEffect(() => {
        if (!payment) return;

        console.log("📌 FeexPayModal payment data :", payment.orderId);

        // Injecte le bon SDK FEEXPAY
        const script = document.createElement("script");
        script.src = "https://api.feexpay.me/feexpay-javascript-sdk/index.js";
        script.async = true;
        console.log("STORE ID =", process.env.NEXT_PUBLIC_FEEXPAY_STORE_ID);
        console.log("PUBLIC KEY =", process.env.NEXT_PUBLIC_FEEXPAY_PUBLIC_KEY);
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
            const API_BASE_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
            window.FeexPayButton.init("render", {
                token: "fp_NpBZ5JP0ncTGKszqKbYIXs8IYv5vzkhXbx5eZciUCmmc0YMvRGCyVyuUHiV9aMEl",
                id: "672b15e3c8365bbb9b3ed029",
                amount: payment.amount,
                custom_id: payment.reference,
                description: "Paiement commande " + payment.reference,
                mode: "LIVE",
                currency: "XOF",

                callback: async (response) => {
                    console.log("FeexPay callback:", response);

                    // Vérifier que FeexPay confirme vraiment le paiement
                    if (response?.status !== "SUCCESSFUL") {
                        console.error("Paiement FeexPay non conclu :", response);
                        toast.error("Le paiement n’a pas été confirmé par FeexPay.");
                        return;
                    }

                    try {
                        const res = await fetch(`${API_BASE_URL}/payments/feexpay/complete`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                transaction_id: response.transaction_id,
                                custom_id: payment.reference,
                                feexpay_response: response
                            })
                        });

                        const data = await res.json().catch(() => ({}));
                        console.log("Complete API response:", res.status, data);

                        /** 🔥 Cas 1 : Tout a fonctionné */
                        if (res.ok && data.processed) {
                            toast.success("Paiement validé 🎉 Votre commande est confirmée.");
                            onClose?.();
                            router.push(`/orders/${payment.orderId}`)
                            return;
                        }

                        /** 🔥 Cas 2 : Paiement OK mais finalisation incomplète → PENDING */
                        if (res.ok && !data.processed && data.pendingPaymentId) {
                            toast.success(
                                `Paiement reçu ✔️\nFinalisation en attente (#${data.pendingPaymentId}).`
                            );
                            onClose?.();
                            router.push(`/orders/${payment.orderId}`)
                            return;
                        }

                        /** ❌ Cas 3 : Erreur backend **/
                        console.error("Erreur backend lors de la finalisation:", data);
                        toast.error(
                            "Le paiement a été capturé, mais une erreur interne a empêché la finalisation. Contactez le support."
                        );
                        onClose?.();
                        router.push(`/orders/${payment.orderId}`)

                    } catch (err) {
                        /** ❌ Cas 4 : Erreur réseau */
                        console.error("Erreur réseau / exception:", err);
                        toast.error(
                            "Erreur réseau. Si le paiement a été débité, contactez le support."
                        );
                        onClose?.();
                    }
                }



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
