"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Loader2, Lock, Phone, Navigation, PackageCheck, XCircle, ShieldCheck } from "lucide-react";

const API = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
const DEVICE_KEY = "edoto_courier_device";

// Identifiant propre à ce téléphone : le lien se verrouille sur le premier appareil qui l'ouvre.
function getDeviceId() {
    try {
        let id = localStorage.getItem(DEVICE_KEY);
        if (!id || !/^[A-Za-z0-9_-]{32,128}$/.test(id)) {
            const bytes = new Uint8Array(32);
            crypto.getRandomValues(bytes);
            id = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
            localStorage.setItem(DEVICE_KEY, id);
        }
        return id;
    } catch {
        return null;
    }
}

async function post(path, body) {
    const res = await fetch(`${API}/courier-links/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(Array.isArray(data?.message) ? data.message.join(", ") : data?.message || "Erreur serveur.");
    return data;
}

/**
 * Page du zem (lien sécurisé envoyé par l'admin) :
 * 1. le lien se verrouille sur ce téléphone ; 2. PIN donné par l'admin ;
 * 3. devant le client, fenêtre sécurisée : code de retrait du client → colis remis.
 */
export default function CourierDeliveryPage() {
    const router = useRouter();
    const { token } = router.query;
    const [step, setStep] = useState("opening"); // opening | pin | details | done | error
    const [error, setError] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [pin, setPin] = useState("");
    const [details, setDetails] = useState(null);
    const [busy, setBusy] = useState(false);
    const [otpOpen, setOtpOpen] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState(null);

    useEffect(() => {
        if (!token) return;
        const id = getDeviceId();
        if (!id) {
            setError("Ce navigateur bloque le stockage : ouvrez le lien dans Chrome, hors navigation privée.");
            setStep("error");
            return;
        }
        setDeviceId(id);
        post(`${encodeURIComponent(token)}/open`, { device_id: id })
            .then(() => setStep("pin"))
            .catch((e) => {
                setError(e.message);
                setStep("error");
            });
    }, [token]);

    const unlock = useCallback(async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true);
        setError(null);
        try {
            const data = await post(`${encodeURIComponent(token)}/unlock`, { device_id: deviceId, pin });
            setDetails(data);
            setStep("details");
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }, [busy, token, deviceId, pin]);

    const deliver = useCallback(async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true);
        setOtpError(null);
        try {
            await post(`${encodeURIComponent(token)}/deliver`, { device_id: deviceId, pin, otp });
            setOtpOpen(false);
            setStep("done");
        } catch (err) {
            setOtpError(err.message);
        } finally {
            setBusy(false);
        }
    }, [busy, token, deviceId, pin, otp]);

    return (
        <main className="min-h-screen bg-gradient-to-b from-white to-[#fff5f8] px-4 py-10">
            <div className="max-w-md mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl p-6">
                <h1 className="text-xl font-bold text-[#0F172A] flex items-center gap-2 mb-4">
                    <ShieldCheck className="text-[#FF6EA9]" /> Livraison E.doto family
                </h1>

                {step === "opening" && (
                    <p className="flex items-center gap-2 text-gray-600">
                        <Loader2 className="animate-spin" size={18} /> Vérification du lien…
                    </p>
                )}

                {step === "error" && (
                    <p className="flex items-start gap-2 text-red-600">
                        <XCircle size={20} className="shrink-0 mt-0.5" /> {error}
                    </p>
                )}

                {step === "pin" && (
                    <form onSubmit={unlock} className="flex flex-col gap-3">
                        <label htmlFor="pin" className="text-sm text-gray-700 flex items-center gap-2">
                            <Lock size={16} /> Code PIN donné par l'administrateur
                        </label>
                        <input
                            id="pin"
                            inputMode="numeric"
                            autoComplete="off"
                            maxLength={6}
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            className="w-full border rounded-xl p-3 text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-pink-300 outline-none"
                        />
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <button
                            type="submit"
                            disabled={pin.length !== 6 || busy}
                            className="w-full bg-pink-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                        >
                            {busy ? "Vérification…" : "Ouvrir la livraison"}
                        </button>
                    </form>
                )}

                {step === "details" && details && (
                    <div className="flex flex-col gap-4">
                        <div className="rounded-2xl bg-gray-50 p-4 text-sm">
                            <p className="text-gray-500">Commande {details.tracking_number}</p>
                            <p className="mt-2 font-medium text-[#0F172A] whitespace-pre-line">{details.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <a
                                href={`tel:${details.phone}`}
                                className="inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 font-semibold text-sm"
                            >
                                <Phone size={16} /> Appeler le client
                            </a>
                            <a
                                href={`geo:${details.lat},${details.lng}?q=${details.lat},${details.lng}`}
                                className="inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 font-semibold text-sm"
                            >
                                <Navigation size={16} /> Itinéraire (GPS)
                            </a>
                        </div>
                        <button
                            onClick={() => {
                                setOtp("");
                                setOtpError(null);
                                setOtpOpen(true);
                            }}
                            className="w-full inline-flex items-center justify-center gap-2 bg-pink-600 text-white py-3 rounded-xl font-semibold"
                        >
                            <PackageCheck size={18} /> Je suis devant le client
                        </button>
                    </div>
                )}

                {step === "done" && (
                    <div className="text-center flex flex-col items-center gap-3 py-4">
                        <PackageCheck size={48} className="text-emerald-500" />
                        <p className="text-lg font-semibold text-emerald-700">Code valide</p>
                        <p className="text-gray-700">Remettez le colis au client. Ce lien est maintenant expiré.</p>
                    </div>
                )}
            </div>

            {otpOpen && (
                <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="otp-title">
                    <form onSubmit={deliver} className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 flex flex-col gap-3">
                        <h2 id="otp-title" className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                            <Lock size={18} className="text-[#FF6EA9]" /> Code du client
                        </h2>
                        <p className="text-sm text-gray-600">
                            Le client saisit ici le code de retrait reçu par e-mail. Si le code est valide, remettez-lui le colis.
                        </p>
                        <input
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            className="w-full border rounded-xl p-3 text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-pink-300 outline-none"
                            aria-label="Code de retrait du client"
                            autoFocus
                        />
                        {otpError && <p className="text-sm text-red-600">{otpError}</p>}
                        <button
                            type="submit"
                            disabled={otp.length !== 6 || busy}
                            className="w-full bg-pink-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                        >
                            {busy ? "Vérification…" : "Valider le code"}
                        </button>
                        <button type="button" onClick={() => setOtpOpen(false)} className="text-sm text-gray-500 py-1">
                            Annuler
                        </button>
                    </form>
                </div>
            )}
        </main>
    );
}
