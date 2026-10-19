import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { CalendarCheck2, CalendarPlus, Download, Expand, Home, Loader2, MapPin, MessageCircleHeart, Phone, QrCode, ShoppingBag, Video } from "lucide-react";
import SpaceShell from "../components/teleconsultation/SpaceShell";
import useSpaceAccess from "../components/teleconsultation/useSpaceAccess";
import AccessDenied from "../components/dashboard-ui/AccessDenied";
import { Badge, Card, Empty, ErrorBox, SectionTitle, Skeleton, Tabs } from "../components/pickup-dashboard/ui";
import { API, api, downloadIcs, fullLabel, timeLabel, dayLabel } from "../components/teleconsultation/tcShared";
import { useChatAI } from "../context/ChatAIContext";

// Dashboard du jeune (19/10/2026), ouvert depuis l'avatar (« Mon dashboard ») :
// rendez-vous de téléconsultation, orientations avec code QR, accès rapides.
const MENU = [
    { key: "home", label: "Accueil", icon: Home },
    { key: "appointments", label: "Mes rendez-vous", icon: CalendarCheck2 },
    { key: "referrals", label: "Mes orientations", icon: QrCode },
];

const statusTone = { booked: "rose", completed: "ok", cancelled: "off", no_show: "wait" };
const refTone = { issued: "rose", viewed: "wait", completed: "ok", expired: "off" };

function useCountdown(iso) {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 30000);
        return () => clearInterval(t);
    }, []);
    if (!iso) return "";
    const ms = new Date(iso).getTime() - now;
    if (ms <= 0) return "C’est l’heure";
    const min = Math.round(ms / 60000);
    if (min < 60) return `Dans ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `Dans ${h} h ${String(min % 60).padStart(2, "0")}`;
    const d = Math.round(h / 24);
    return `Dans ${d} jour${d > 1 ? "s" : ""}`;
}

function AppointmentCard({ a, onCancel, big = false }) {
    const countdown = useCountdown(a.status === "booked" ? a.starts_at : null);
    return (
        <Card className={`p-5 ${big ? "sm:p-7" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F9F8F6] text-[#1A1814]">
                        {a.mode === "video" ? <Video size={20} /> : <Phone size={20} />}
                    </span>
                    <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-[#8A837A]">{a.mode_label} · {a.reference}</p>
                        <p className={`font-serif text-[#1A1814] first-letter:uppercase ${big ? "text-2xl" : "text-lg"}`}>{fullLabel(a.starts_at)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {a.status === "booked" && countdown && <Badge tone="ink">{countdown}</Badge>}
                    <Badge tone={statusTone[a.status] || "ink"}>{a.status_label}</Badge>
                </div>
            </div>
            <p className="mt-3 text-sm text-[#57524B]">Avec {a.doctor?.name}{a.doctor?.title ? `, ${a.doctor.title}` : ""}</p>
            {a.status === "booked" && (
                <p className="mt-1 text-sm text-[#57524B]">
                    {a.mode === "video" ? "Le lien de la visio s’active 15 minutes avant le début." : `Le médecin vous appellera au ${a.phone}.`}
                </p>
            )}
            {a.status === "booked" && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {a.room_url && (
                        <a href={a.room_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#C2185B] px-4 py-2.5 text-sm font-semibold text-white">
                            <Video size={16} /> Rejoindre la visio
                        </a>
                    )}
                    <button onClick={() => downloadIcs({ ...a, room_url: a.room_url })} className="inline-flex items-center gap-2 rounded-xl border border-[#E9E5DF] bg-white px-4 py-2.5 text-sm text-[#1A1814] hover:border-[#1A1814]">
                        <CalendarPlus size={16} /> Ajouter à l’agenda
                    </button>
                    {a.can_cancel && (
                        <button onClick={() => onCancel(a)} className="rounded-xl px-4 py-2.5 text-sm text-[#9B2C2C] hover:bg-[#F5E4E4]">Annuler</button>
                    )}
                </div>
            )}
        </Card>
    );
}

function ReferralCard({ r }) {
    const img = `${API}${r.qr_image}`;
    const active = r.status === "issued" || r.status === "viewed";
    return (
        <Card className="overflow-hidden">
            <div className="grid gap-0 md:grid-cols-[220px_1fr]">
                <div className="flex flex-col items-center justify-center border-b border-[#E9E5DF] bg-[#F9F8F6] p-5 md:border-b-0 md:border-r">
                    <img src={img} alt="Code QR de l’orientation" className={`h-40 w-40 rounded-xl border border-[#E9E5DF] bg-white p-2 ${active ? "" : "opacity-40"}`} />
                    <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-[#8A837A]">Code de secours</p>
                    <p className="font-mono text-lg font-bold tracking-[0.2em] text-[#1A1814]">{r.short_code}</p>
                </div>
                <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                            <p className="text-xs uppercase tracking-[0.14em] text-[#8A837A]">{r.center.organization} · {r.request_label}</p>
                            <p className="mt-1 font-serif text-xl text-[#1A1814]">{r.center.name}</p>
                        </div>
                        <Badge tone={refTone[r.status] || "ink"}>{r.status_label}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-[#57524B]">{[r.center.address, r.center.city].filter(Boolean).join(", ")}</p>
                    {r.center.opening_hours && <p className="text-sm text-[#57524B]">Horaires : {r.center.opening_hours}</p>}
                    {r.center.phone && <a href={`tel:${r.center.phone}`} className="text-sm text-[#C2185B] hover:underline">{r.center.phone}</a>}
                    {r.patient_summary && (
                        <div className="mt-4 rounded-2xl border border-[#E9E5DF] bg-[#F9F8F6] p-4">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-[#8A837A]">Le mot du médecin</p>
                            <p className="mt-1 whitespace-pre-line text-sm text-[#1A1814]">{r.patient_summary}</p>
                        </div>
                    )}
                    <p className="mt-3 text-xs text-[#8A837A]">
                        Consultation du {dayLabel(r.consultation.date, { year: "numeric" })} avec {r.consultation.doctor} · valable jusqu’au {dayLabel(r.expires_at, { year: "numeric" })}
                    </p>
                    {active && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link href={`/qr/${r.token}`} className="inline-flex items-center gap-2 rounded-xl bg-[#1A1814] px-4 py-2.5 text-sm font-semibold text-white"><Expand size={16} /> Afficher en grand</Link>
                            <a href={`${img}?download=1`} className="inline-flex items-center gap-2 rounded-xl border border-[#E9E5DF] bg-white px-4 py-2.5 text-sm text-[#1A1814] hover:border-[#1A1814]"><Download size={16} /> Télécharger</a>
                            {r.center.lat != null && r.center.lng != null && (
                                <a href={`https://www.openstreetmap.org/?mlat=${r.center.lat}&mlon=${r.center.lng}#map=17/${r.center.lat}/${r.center.lng}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[#E9E5DF] bg-white px-4 py-2.5 text-sm text-[#1A1814] hover:border-[#1A1814]"><MapPin size={16} /> Itinéraire</a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}

export default function MonEspacePage() {
    const { me, denied } = useSpaceAccess("customer", "/mon-espace", "« Mon dashboard » est réservé aux comptes jeunes (clients). Votre compte a son propre espace.");
    const { openBooking, openChat } = useChatAI();
    const [view, setView] = useState("home");
    const [appts, setAppts] = useState(null);
    const [refs, setRefs] = useState(null);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState("upcoming");
    const [cancelling, setCancelling] = useState(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        setError(null);
        try {
            const [a, r] = await Promise.all([api("teleconsultation/me/appointments"), api("teleconsultation/me/referrals")]);
            setAppts(a); setRefs(r);
        } catch (e) {
            setError(e.message);
        }
    }, []);

    useEffect(() => {
        if (!me) return;
        load();
        const h = window.location.hash.replace("#", "");
        if (MENU.some((m) => m.key === h)) setView(h);
    }, [me, load]);

    const changeView = (v) => {
        setView(v);
        window.history.replaceState(null, "", `#${v}`);
        window.scrollTo({ top: 0 });
    };

    const doCancel = async () => {
        setBusy(true);
        try {
            await api(`teleconsultation/me/appointments/${cancelling.id}/cancel`, { method: "POST", body: JSON.stringify({ reason: cancelling.reason || "" }) });
            setCancelling(null);
            await load();
        } catch (e) {
            setCancelling((c) => ({ ...c, error: e.message }));
        } finally {
            setBusy(false);
        }
    };

    if (denied) return <AccessDenied message={denied} here="/mon-espace" />;
    if (!me) return <div className="flex min-h-screen items-center justify-center bg-[#F9F8F6]"><Loader2 className="h-8 w-8 animate-spin text-[#C2185B]" /></div>;

    const next = appts?.upcoming?.[0];
    const activeRefs = (refs || []).filter((r) => r.status === "issued" || r.status === "viewed");
    const firstName = String(me.name || "").split(/\s+/)[0];
    const menu = MENU.map((m) => ({ ...m, badge: m.key === "appointments" ? appts?.upcoming?.length || 0 : m.key === "referrals" ? activeRefs.length : 0 }));

    return (
        <>
            <Head><title>Mon dashboard · E.doto family</title></Head>
            <SpaceShell
                space="Mon dashboard"
                roleLabel="Mon espace"
                identity={{ name: me.name, detail: me.email }}
                menu={menu}
                view={view}
                onView={changeView}
                storageKey="edoto:youth-sidebar"
                extraActions={
                    <button onClick={openBooking} className="hidden items-center gap-2 rounded-2xl bg-[#1A1814] px-4 py-3 text-sm font-semibold text-white transition hover:bg-black sm:inline-flex">
                        <CalendarPlus size={16} /> Prendre rendez-vous
                    </button>
                }
            >
                {error && <div className="mb-6"><ErrorBox message={error} onRetry={load} /></div>}

                {view === "home" && (
                    <div className="space-y-6">
                        <SectionTitle title={`Bonjour ${firstName}`} subtitle="Votre espace confidentiel : rendez-vous, orientations et accès rapides." />
                        {!appts ? (
                            <Skeleton className="h-40" />
                        ) : next ? (
                            <div>
                                <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[#8A837A]">Prochain rendez-vous</p>
                                <AppointmentCard a={next} big onCancel={(a) => setCancelling({ id: a.id, reason: "" })} />
                            </div>
                        ) : (
                            <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="font-serif text-xl text-[#1A1814]">Aucun rendez-vous à venir</p>
                                    <p className="mt-1 text-sm text-[#57524B]">Un professionnel de santé vous écoute en visio ou par appel, à l’heure qui vous convient.</p>
                                </div>
                                <button onClick={openBooking} className="shrink-0 rounded-xl bg-[#C2185B] px-5 py-3 text-sm font-semibold text-white">Prendre rendez-vous</button>
                            </Card>
                        )}

                        <div className="grid gap-4 md:grid-cols-3">
                            {[
                                { icon: CalendarPlus, title: "Prendre rendez-vous", text: "Visio ou appel avec un médecin.", onClick: openBooking },
                                { icon: MessageCircleHeart, title: "Assistant virtuel", text: "Vos questions, à toute heure.", onClick: openChat },
                                { icon: ShoppingBag, title: "Mes commandes", text: "Suivi et codes de retrait.", href: "/orders" },
                            ].map((x) => {
                                const Icon = x.icon;
                                const inner = (
                                    <>
                                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F9F8F6] text-[#1A1814] transition group-hover:bg-[#1A1814] group-hover:text-white"><Icon size={20} /></span>
                                        <span className="mt-4 block font-serif text-lg text-[#1A1814]">{x.title}</span>
                                        <span className="mt-1 block text-sm text-[#57524B]">{x.text}</span>
                                    </>
                                );
                                return x.href ? (
                                    <Link key={x.title} href={x.href} className="group rounded-2xl border border-[#E9E5DF] bg-white p-5 transition hover:border-[#1A1814]">{inner}</Link>
                                ) : (
                                    <button key={x.title} onClick={x.onClick} className="group rounded-2xl border border-[#E9E5DF] bg-white p-5 text-left transition hover:border-[#1A1814]">{inner}</button>
                                );
                            })}
                        </div>

                        {activeRefs[0] && (
                            <div>
                                <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[#8A837A]">Orientation en cours</p>
                                <ReferralCard r={activeRefs[0]} />
                            </div>
                        )}
                    </div>
                )}

                {view === "appointments" && (
                    <div>
                        <SectionTitle
                            title="Mes rendez-vous"
                            subtitle="Téléconsultations en visio ou par appel."
                            action={<button onClick={openBooking} className="rounded-xl bg-[#1A1814] px-5 py-3 text-sm font-semibold text-white">Prendre rendez-vous</button>}
                        />
                        <div className="mb-5"><Tabs value={tab} onChange={setTab} items={[{ key: "upcoming", label: "À venir", count: appts?.upcoming?.length ?? 0 }, { key: "past", label: "Passés", count: appts?.past?.length ?? 0 }]} /></div>
                        {!appts ? (
                            <Skeleton className="h-40" />
                        ) : (appts[tab] || []).length === 0 ? (
                            <Card><Empty title={tab === "upcoming" ? "Aucun rendez-vous à venir" : "Aucun rendez-vous passé"} /></Card>
                        ) : (
                            <div className="space-y-3">{appts[tab].map((a) => <AppointmentCard key={a.id} a={a} onCancel={(x) => setCancelling({ id: x.id, reason: "" })} />)}</div>
                        )}
                    </div>
                )}

                {view === "referrals" && (
                    <div>
                        <SectionTitle title="Mes orientations" subtitle="Présentez le code QR à l’accueil du centre : le professionnel voit votre dossier, sans avoir à vous reposer de questions." />
                        {!refs ? (
                            <Skeleton className="h-60" />
                        ) : refs.length === 0 ? (
                            <Card><Empty title="Aucune orientation" text="Après une téléconsultation, le médecin peut vous orienter vers un centre partenaire : votre code QR apparaîtra ici." /></Card>
                        ) : (
                            <div className="space-y-4">{refs.map((r) => <ReferralCard key={r.id} r={r} />)}</div>
                        )}
                    </div>
                )}
            </SpaceShell>

            {cancelling && (
                <div className="fixed inset-0 z-[90] flex items-end justify-center bg-[#1A1814]/35 p-4 sm:items-center" onClick={() => !busy && setCancelling(null)}>
                    <div className="w-full max-w-md rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
                        <p className="font-serif text-xl text-[#1A1814]">Annuler ce rendez-vous ?</p>
                        <p className="mt-1 text-sm text-[#57524B]">Le créneau sera libéré pour quelqu’un d’autre.</p>
                        <textarea value={cancelling.reason} onChange={(e) => setCancelling((c) => ({ ...c, reason: e.target.value.slice(0, 300) }))} rows={3} placeholder="Motif (facultatif)"
                            className="mt-4 w-full resize-none rounded-2xl border border-[#E9E5DF] px-4 py-3 text-sm outline-none focus:border-[#1A1814]" />
                        {cancelling.error && <p className="mt-2 text-sm text-[#9B2C2C]">{cancelling.error}</p>}
                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => setCancelling(null)} disabled={busy} className="rounded-xl px-4 py-2.5 text-sm text-[#57524B]">Garder</button>
                            <button onClick={doCancel} disabled={busy} className="rounded-xl bg-[#9B2C2C] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Annulation…" : "Annuler le rendez-vous"}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
