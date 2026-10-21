import { useCallback, useEffect, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { AlertTriangle, ArrowLeft, Camera, CheckCircle2, ClipboardCheck, Eye, Hourglass, Inbox, KeyRound, LayoutDashboard, Loader2, Printer, X } from "lucide-react";
import SpaceShell from "../components/teleconsultation/SpaceShell";
import useSpaceAccess from "../components/teleconsultation/useSpaceAccess";
import AccessDenied from "../components/dashboard-ui/AccessDenied";
import { Badge, Card, Empty, ErrorBox, SectionTitle, Skeleton, StatCard, Tabs } from "../components/pickup-dashboard/ui";
import { api, dayLabel, fullLabel, qs } from "../components/teleconsultation/tcShared";

// Espace centre (19/10/2026) : ABPF, ABMS, cliniques. Le jeune présente son code QR (ou son code de secours) :
// le dossier rédigé par le médecin s'affiche, sans avoir à lui reposer de questions.
const MENU = [
    { key: "home", label: "Accueil", icon: LayoutDashboard },
    { key: "referrals", label: "Jeunes orientés", icon: Inbox },
];
const refTone = { issued: "rose", viewed: "wait", completed: "ok", expired: "off" };
const urgTone = { urgent: "off", soon: "wait", routine: "ink" };
const SEX = { female: "Femme", male: "Homme" };

function CameraScanner({ onToken, onClose }) {
    const video = useRef(null);
    const [error, setError] = useState("");
    useEffect(() => {
        let stream;
        let stop = false;
        (async () => {
            try {
                // eslint-disable-next-line no-undef
                const detector = new BarcodeDetector({ formats: ["qr_code"] });
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                video.current.srcObject = stream;
                await video.current.play();
                const loop = async () => {
                    if (stop) return;
                    try {
                        const codes = await detector.detect(video.current);
                        const raw = codes?.[0]?.rawValue;
                        const m = raw && /\/dossier\/([a-f0-9]{48})/.exec(raw);
                        if (m) { onToken(m[1]); return; }
                    } catch { }
                    requestAnimationFrame(loop);
                };
                loop();
            } catch {
                setError("Caméra indisponible. Saisissez le code de secours, ou scannez le code QR avec l’appareil photo du téléphone.");
            }
        })();
        return () => { stop = true; stream?.getTracks().forEach((t) => t.stop()); };
    }, [onToken]);
    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#1A1814]/80 p-4">
            <div className="w-full max-w-md overflow-hidden rounded-3xl bg-black">
                <div className="flex items-center justify-between bg-white px-4 py-3">
                    <p className="font-medium text-[#1A1814]">Scanner le code QR du jeune</p>
                    <button onClick={onClose} aria-label="Fermer" className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#F3F1EE]"><X size={18} /></button>
                </div>
                {error ? <p className="bg-white p-5 text-sm text-[#9B2C2C]">{error}</p> : <video ref={video} playsInline muted className="aspect-square w-full object-cover" />}
            </div>
        </div>
    );
}

function Section({ title, children }) {
    if (!children) return null;
    return (
        <div className="border-t border-[#EFECE7] py-4 first:border-t-0 first:pt-0">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#8A837A]">{title}</p>
            <div className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-[#1A1814]">{children}</div>
        </div>
    );
}

function Dossier({ keyInfo, onBack }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [note, setNote] = useState("");
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState(null);
    const load = useCallback(async () => {
        try {
            const path = keyInfo.token ? `teleconsultation/center/dossier/token/${keyInfo.token}` : `teleconsultation/center/dossier/code/${encodeURIComponent(keyInfo.code)}`;
            setData(await api(path)); setError(null);
        } catch (e) { setError(e.message); }
    }, [keyInfo]);
    useEffect(() => { load(); }, [load]);

    // outcome : adoption d'un contraceptif faite (done) ou non (not_done), étape 6 (21/10/2026)
    const complete = async (outcome) => {
        setBusy(true); setMsg(null);
        try {
            const res = await api(`teleconsultation/center/referrals/${data.referral.id}/complete`, { method: "POST", body: JSON.stringify({ note, outcome }) });
            setMsg(res.message); await load();
        } catch (e) { setMsg(e.message); } finally { setBusy(false); }
    };

    if (error) return (
        <div className="space-y-4">
            <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-[#57524B] hover:text-[#1A1814]"><ArrowLeft size={16} /> Retour</button>
            <Card className="p-8 text-center"><AlertTriangle className="mx-auto text-[#9B2C2C]" /><p className="mt-3 font-serif text-xl text-[#1A1814]">Dossier inaccessible</p><p className="mt-1 text-sm text-[#57524B]">{error}</p></Card>
        </div>
    );
    if (!data) return <Skeleton className="h-96" />;
    const { patient: p, report: r, consultation: c, referral: f, contraception: k } = data;
    const done = f.status === "completed";
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-[#57524B] hover:text-[#1A1814]"><ArrowLeft size={16} /> Retour</button>
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-[#E9E5DF] bg-white px-4 py-2.5 text-sm text-[#1A1814] hover:border-[#1A1814]"><Printer size={16} /> Imprimer</button>
            </div>
            <Card className="p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-[#8A837A]">Dossier d’orientation · {f.short_code}</p>
                        <h1 className="mt-1 font-serif text-3xl text-[#1A1814]">{p.name}</h1>
                        <p className="mt-1 text-sm text-[#57524B]">{[p.age != null ? `${p.age} ans` : null, SEX[p.sex]].filter(Boolean).join(" · ") || "Âge et sexe non renseignés"}{p.phone ? ` · ${p.phone}` : ""}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {r && <Badge tone={urgTone[r.urgency] || "ink"}>{r.urgency_label}</Badge>}
                        <Badge tone={done ? "ok" : "rose"}>{f.status_label}</Badge>
                    </div>
                </div>
                <div className="mt-6 rounded-2xl border border-[#1A1814] p-5">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#C2185B]">Ce que le jeune souhaite</p>
                    <p className="mt-1 font-serif text-2xl text-[#1A1814]">{k ? `Contraception : ${k.method}` : r?.request_label}</p>
                    {r?.request_detail && <p className="mt-1 text-[#1A1814]">{r.request_detail}</p>}
                    {k && (
                        <p className="mt-1 text-sm text-[#57524B]">
                            {k.requires_doctor ? `Adoption conclue par le médecin${k.conclusion_label ? ` : ${k.conclusion_label.toLowerCase()}` : ""}.` : "Méthode sans médecin : orientation directe par E.doto family."}
                            {k.youth_note ? ` Message du jeune : ${k.youth_note}` : ""}
                        </p>
                    )}
                    {r?.center_instructions && (
                        <>
                            <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-[#C2185B]">Consignes du médecin pour votre centre</p>
                            <p className="mt-1 whitespace-pre-line text-[15px] text-[#1A1814]">{r.center_instructions}</p>
                        </>
                    )}
                </div>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
                {r ? (
                    <Card className="p-5 sm:p-7">
                        <p className="mb-4 font-serif text-xl text-[#1A1814]">Compte rendu de téléconsultation</p>
                        <Section title="Motif de consultation">{r.chief_complaint}</Section>
                        <Section title="Antécédents médicaux">{r.history}</Section>
                        <Section title="Antécédents gynécologiques">{r.gyneco_history}</Section>
                        <Section title="Allergies">{r.allergies}</Section>
                        <Section title="Traitements en cours">{r.current_treatments}</Section>
                        <Section title="Observations">{r.findings}</Section>
                        <Section title="Conclusion">{r.assessment}</Section>
                        <Section title="Conduite à tenir">{r.plan}</Section>
                    </Card>
                ) : (
                    <Card className="p-5 sm:p-7">
                        <p className="font-serif text-xl text-[#1A1814]">Sans téléconsultation</p>
                        <p className="mt-2 text-sm leading-relaxed text-[#57524B]">Cette méthode ne nécessite pas de rencontre avec un médecin : la demande du jeune a été acceptée par l’équipe E.doto family, qui vous l’oriente directement.</p>
                    </Card>
                )}
                <div className="space-y-4">
                    {c && (
                        <Card className="p-5 text-sm">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-[#8A837A]">Téléconsultation</p>
                            <p className="mt-1 text-[#1A1814] first-letter:uppercase">{fullLabel(c.date)}</p>
                            <p className="text-[#57524B]">{c.mode_label} · {c.reference}</p>
                            <p className="mt-2 text-[#1A1814]">{c.doctor}{c.doctor_title ? `, ${c.doctor_title}` : ""}</p>
                        </Card>
                    )}
                    <Card className="p-5 text-sm print:hidden">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-[#8A837A]">Prise en charge</p>
                        {done ? (
                            <div className="mt-2">
                                <p className="flex items-center gap-2 text-[#3F6B45]"><CheckCircle2 size={16} /> Faite le {dayLabel(f.completed_at, { year: "numeric" })}</p>
                                {f.outcome && <p className="mt-1 font-medium text-[#1A1814]">{f.outcome === "done" ? "Méthode adoptée" : "Méthode non adoptée"}</p>}
                                {f.completed_note && <p className="mt-2 whitespace-pre-line text-[#1A1814]">{f.completed_note}</p>}
                            </div>
                        ) : (
                            <div className="mt-2 space-y-3">
                                <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value.slice(0, 600))} placeholder="Note (facultatif) : ce qui a été fait"
                                    className="w-full resize-none rounded-xl border border-[#E9E5DF] px-3.5 py-2.5 text-sm outline-none focus:border-[#1A1814]" />
                                {k ? (
                                    <div className="grid gap-2">
                                        <button onClick={() => complete("done")} disabled={busy} className="w-full rounded-xl bg-[#1A1814] py-3 text-sm font-semibold text-white disabled:opacity-50">Méthode adoptée</button>
                                        <button onClick={() => complete("not_done")} disabled={busy} className="w-full rounded-xl border border-[#E9E5DF] py-3 text-sm font-medium text-[#9B2C2C] disabled:opacity-50">Pas d’adoption</button>
                                    </div>
                                ) : (
                                    <button onClick={() => complete()} disabled={busy} className="w-full rounded-xl bg-[#1A1814] py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Enregistrement…" : "Prise en charge effectuée"}</button>
                                )}
                            </div>
                        )}
                        {msg && <p className="mt-2 text-xs text-[#57524B]">{msg}</p>}
                        <p className="mt-3 text-xs text-[#8A837A]">Code valable jusqu’au {dayLabel(f.expires_at, { year: "numeric" })}</p>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function CentrePage() {
    const router = useRouter();
    const { me, denied } = useSpaceAccess("health_center", "/centre", "Cet espace est réservé aux centres partenaires de E.doto family.");
    const [view, setView] = useState("home");
    const [dossier, setDossier] = useState(null);
    const [overview, setOverview] = useState(null);
    const [list, setList] = useState(null);
    const [status, setStatus] = useState("");
    const [error, setError] = useState(null);
    const [code, setCode] = useState("");
    const [scan, setScan] = useState(false);
    const [canScan, setCanScan] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => { setCanScan(typeof window !== "undefined" && "BarcodeDetector" in window && !!navigator.mediaDevices?.getUserMedia); }, []);

    // Code QR scanné avec l'appareil photo : /dossier/<jeton> → /centre?dossier=<jeton>
    useEffect(() => {
        if (!router.isReady || !me) return;
        const t = router.query.dossier;
        if (typeof t === "string" && /^[a-f0-9]{48}$/.test(t)) { setDossier({ token: t }); setView("dossier"); }
    }, [router.isReady, router.query.dossier, me]);

    const load = useCallback(async () => {
        try {
            const [o, l] = await Promise.all([api("teleconsultation/center/overview"), api(`teleconsultation/center/referrals${qs({ status, search })}`)]);
            setOverview(o); setList(l); setError(null);
        } catch (e) { setError(e.message); }
    }, [status, search]);
    useEffect(() => { if (me) load(); }, [me, load]);

    const openToken = useCallback((token) => { setScan(false); setDossier({ token }); setView("dossier"); }, []);
    const openCode = (e) => {
        e.preventDefault();
        const c = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (c.length !== 8) return;
        setDossier({ code: c }); setView("dossier"); setCode("");
    };
    const changeView = (v) => {
        setView(v); setDossier(null);
        if (router.query.dossier) router.replace("/centre", undefined, { shallow: true });
        window.scrollTo({ top: 0 });
    };

    if (denied) return <AccessDenied message={denied} here="/centre" />;
    if (!me) return <div className="flex min-h-screen items-center justify-center bg-[#F9F8F6]"><Loader2 className="h-8 w-8 animate-spin text-[#C2185B]" /></div>;

    const CodeEntry = (
        <Card className="p-5 sm:p-7">
            <p className="font-serif text-2xl text-[#1A1814]">Recevoir un jeune</p>
            <p className="mt-1 text-sm text-[#57524B]">Scannez son code QR avec l’appareil photo du téléphone, ou saisissez son code de secours (8 caractères).</p>
            <form onSubmit={openCode} className="mt-5 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A837A]" />
                    <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 12))} placeholder="Ex. K7M4 Q9XP" autoComplete="off" aria-label="Code de secours"
                        className="w-full rounded-2xl border border-[#E9E5DF] bg-white py-3.5 pl-11 pr-4 font-mono text-lg tracking-[0.2em] text-[#1A1814] outline-none focus:border-[#1A1814]" />
                </div>
                <button disabled={code.replace(/[^A-Z0-9]/gi, "").length !== 8} className="rounded-2xl bg-[#1A1814] px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-40">Ouvrir le dossier</button>
                {canScan && <button type="button" onClick={() => setScan(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#1A1814] px-5 py-3.5 text-sm font-semibold text-[#1A1814]"><Camera size={16} /> Scanner</button>}
            </form>
        </Card>
    );

    return (
        <>
            <Head><title>Espace centre · E.doto family</title></Head>
            <SpaceShell
                space="Espace centre"
                roleLabel={overview?.center?.organization || "Centre"}
                identity={{ name: overview?.center?.name || me.name, detail: me.email }}
                menu={MENU.map((m) => ({ ...m, badge: m.key === "referrals" ? overview?.stats?.waiting || 0 : 0 }))}
                view={view === "dossier" ? "referrals" : view}
                viewKey={view === "dossier" ? `d-${dossier?.token || dossier?.code}` : view}
                onView={changeView}
                storageKey="edoto:center-sidebar"
                showProfile={false}
            >
                {error && view !== "dossier" && <div className="mb-6"><ErrorBox message={error} onRetry={load} /></div>}
                {view === "home" && (
                    <div className="space-y-6">
                        <SectionTitle title={overview?.center?.name || "Espace centre"} subtitle={[overview?.center?.organization, overview?.center?.city].filter(Boolean).join(" · ")} />
                        {CodeEntry}
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                            <StatCard label="Attendus" value={overview?.stats?.waiting ?? "…"} icon={Hourglass} tone="rose" />
                            <StatCard label="Dossiers ouverts" value={overview?.stats?.viewed ?? "…"} icon={Eye} tone="sand" />
                            <StatCard label="Pris en charge" value={overview?.stats?.completed ?? "…"} icon={ClipboardCheck} tone="sage" />
                            <StatCard label="Total reçus" value={overview?.stats?.total ?? "…"} icon={Inbox} tone="ink" />
                        </div>
                    </div>
                )}
                {view === "referrals" && (
                    <div>
                        <SectionTitle title="Jeunes orientés vers votre centre" subtitle="Les urgences apparaissent en premier." />
                        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <Tabs value={status} onChange={setStatus} items={[{ key: "", label: "Tous" }, { key: "issued", label: "Attendus" }, { key: "viewed", label: "Dossier ouvert" }, { key: "completed", label: "Pris en charge" }, { key: "expired", label: "Expirés" }]} />
                            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, code ou référence…" className="rounded-2xl border border-[#E9E5DF] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1A1814] lg:w-72" />
                        </div>
                        {!list ? <Skeleton className="h-64" /> : list.length === 0 ? <Card><Empty title="Aucun jeune orienté pour le moment" /></Card> : (
                            <Card className="divide-y divide-[#EFECE7]">
                                {list.map((f) => (
                                    <button key={f.id} onClick={() => { setDossier({ token: f.token }); setView("dossier"); }} className="flex w-full flex-col gap-2 p-4 text-left hover:bg-[#F9F8F6] sm:flex-row sm:items-center sm:justify-between">
                                        <span className="min-w-0">
                                            <span className="block truncate font-medium text-[#1A1814]">{f.patient_name}</span>
                                            <span className="block text-xs text-[#8A837A]">{f.request_label} · {f.short_code} · orienté le {dayLabel(f.created_at, { year: "numeric" })} par {f.doctor_name}</span>
                                        </span>
                                        <span className="flex shrink-0 gap-2"><Badge tone={urgTone[f.urgency] || "ink"}>{f.urgency_label}</Badge><Badge tone={refTone[f.status] || "ink"}>{f.status_label}</Badge></span>
                                    </button>
                                ))}
                            </Card>
                        )}
                    </div>
                )}
                {view === "dossier" && dossier && <Dossier keyInfo={dossier} onBack={() => { changeView("home"); load(); }} />}
            </SpaceShell>
            {scan && <CameraScanner onToken={openToken} onClose={() => setScan(false)} />}
        </>
    );
}
