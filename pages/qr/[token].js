import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Download, Loader2, MapPin, Phone, Sun } from "lucide-react";
import { API, api, dayLabel } from "../../components/teleconsultation/tcShared";

// Code QR d'orientation en grand (19/10/2026) : lien reçu par e-mail ou SMS, à montrer à l'accueil du centre.
// Aucune donnée de santé ici : seulement le code, le centre et la date limite.
export default function QrPage() {
    const router = useRouter();
    const [info, setInfo] = useState(null);
    const [error, setError] = useState(null);
    const t = String(router.query.token || "");

    useEffect(() => {
        if (!router.isReady) return;
        api(`teleconsultation/qr-info/${encodeURIComponent(t)}`).then(setInfo).catch((e) => setError(e.message));
    }, [router.isReady, t]);

    const img = `${API}/teleconsultation/qr/${t}.png`;
    const active = info && (info.status === "issued" || info.status === "viewed");

    return (
        <div className="min-h-screen bg-[#F9F8F6] px-4 py-8 sm:py-12">
            <Head>
                <title>Mon code QR · E.doto family</title>
                <meta name="robots" content="noindex" />
            </Head>
            <div className="mx-auto max-w-md">
                <p className="text-center font-serif text-xl text-[#1A1814]">E.doto <span className="text-[#C2185B]">family</span></p>
                {error ? (
                    <div className="mt-10 rounded-3xl border border-[#E9E5DF] bg-white p-8 text-center">
                        <p className="font-serif text-2xl text-[#1A1814]">Code introuvable</p>
                        <p className="mt-2 text-sm text-[#57524B]">{error}</p>
                    </div>
                ) : !info ? (
                    <div className="grid h-80 place-items-center"><Loader2 className="h-8 w-8 animate-spin text-[#C2185B]" /></div>
                ) : (
                    <div className="mt-8 overflow-hidden rounded-[28px] border border-[#E9E5DF] bg-white">
                        <div className="p-6 text-center sm:p-8">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-[#8A837A]">À présenter à l’accueil</p>
                            <p className="mt-1 font-serif text-2xl text-[#1A1814]">{info.center.name}</p>
                            <p className="text-sm text-[#57524B]">{info.center.organization}</p>
                            <div className={`mx-auto mt-6 w-full max-w-[320px] rounded-3xl border border-[#E9E5DF] bg-white p-4 ${active ? "" : "opacity-40"}`}>
                                <img src={img} alt="Code QR d’orientation" className="aspect-square w-full" />
                            </div>
                            <p className="mt-5 text-[11px] uppercase tracking-[0.2em] text-[#8A837A]">Code de secours</p>
                            <p className="mt-1 font-mono text-3xl font-bold tracking-[0.25em] text-[#1A1814]">{info.short_code}</p>
                            <p className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-medium ${active ? "bg-[#FBEEF3] text-[#A0124A]" : "bg-[#ECE9E4] text-[#3D3934]"}`}>
                                {info.status_label} · valable jusqu’au {dayLabel(info.expires_at, { year: "numeric" })}
                            </p>
                            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#8A837A]"><Sun size={14} /> Montez la luminosité de l’écran pour faciliter le scan.</p>
                        </div>
                        <div className="space-y-3 border-t border-[#E9E5DF] bg-[#F9F8F6] p-6">
                            {(info.center.address || info.center.city) && <p className="flex items-start gap-2 text-sm text-[#1A1814]"><MapPin size={16} className="mt-0.5 shrink-0" />{[info.center.address, info.center.city].filter(Boolean).join(", ")}</p>}
                            {info.center.phone && <a href={`tel:${info.center.phone}`} className="flex items-center gap-2 text-sm text-[#1A1814]"><Phone size={16} />{info.center.phone}</a>}
                            {info.center.opening_hours && <p className="text-sm text-[#57524B]">Horaires : {info.center.opening_hours}</p>}
                            {active && (
                                <a href={`${img}?download=1`} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1A1814] py-3.5 text-sm font-semibold text-white">
                                    <Download size={16} /> Télécharger le code QR
                                </a>
                            )}
                            <Link href="/mon-espace#referrals" className="block text-center text-sm text-[#C2185B] hover:underline">Ouvrir mon dashboard</Link>
                        </div>
                    </div>
                )}
                <p className="mt-6 text-center text-xs text-[#8A837A]">Ce code est personnel : ne le partagez pas.</p>
            </div>
        </div>
    );
}
