"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowLeft, CalendarPlus, Check, ChevronLeft, ChevronRight, Clock3, Globe2, Loader2, LockKeyhole, Phone, ShieldCheck, Video, X,
} from "lucide-react";
import { useRouter } from "next/router";
import { useChatAI } from "../../context/ChatAIContext";
import { useAuthContext } from "../../context/AuthContext";
import { rememberRedirect } from "../../lib/roleHome";
import { api, clearDraft, dayLabel, downloadIcs, fullLabel, MODE_LABEL, readDraft, saveDraft, timeLabel, token, TZ } from "./tcShared";

// Prise de rendez-vous de téléconsultation (19/10/2026), à la manière de Calendly :
// 1. visio ou appel  2. jour et heure (calendrier réel des médecins)  3. coordonnées  4. confirmation.
const spring = { type: "spring", stiffness: 260, damping: 32, mass: 0.9 };
const WEEKDAYS = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];

function monthDays(year, month) {
    // Grille du mois (lundi en premier), jours au format AAAA-MM-JJ
    const first = new Date(Date.UTC(year, month, 1));
    const offset = (first.getUTCDay() + 6) % 7;
    const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const cells = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= count; d++) cells.push(new Date(Date.UTC(year, month, d)).toISOString().slice(0, 10));
    while (cells.length % 7) cells.push(null);
    return cells;
}

function Steps({ step }) {
    const items = ["Mode", "Date et heure", "Coordonnées", "Confirmation"];
    const idx = { mode: 0, date: 1, details: 2, done: 3 }[step];
    return (
        <ol className="flex items-center gap-2" aria-label="Étapes">
            {items.map((label, i) => (
                <li key={label} className="flex items-center gap-2">
                    <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold transition ${i < idx ? "bg-[#1A1814] text-white" : i === idx ? "border border-[#1A1814] text-[#1A1814]" : "border border-[#D9D3CA] text-[#8A837A]"}`}>
                        {i < idx ? <Check size={12} /> : i + 1}
                    </span>
                    <span className={`hidden text-xs lg:inline ${i === idx ? "text-[#1A1814]" : "text-[#8A837A]"}`}>{label}</span>
                    {i < items.length - 1 && <span className="h-px w-4 bg-[#D9D3CA] lg:w-6" />}
                </li>
            ))}
        </ol>
    );
}

function ModeCard({ icon: Icon, title, text, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group flex w-full items-start gap-4 rounded-[20px] border p-5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C2185B]/40 ${active ? "border-[#1A1814] bg-white" : "border-[#E9E5DF] bg-white hover:border-[#1A1814]"}`}
        >
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition ${active ? "bg-[#1A1814] text-white" : "bg-[#F9F8F6] text-[#1A1814] group-hover:bg-[#1A1814] group-hover:text-white"}`}>
                <Icon size={22} strokeWidth={1.6} />
            </span>
            <span className="min-w-0">
                <span className="block font-serif text-xl text-[#1A1814]">{title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-[#57524B]">{text}</span>
            </span>
        </button>
    );
}

export default function BookingDrawer() {
    const router = useRouter();
    const { bookingOpen, closeBooking, openBooking } = useChatAI();
    const { user } = useAuthContext() || {};
    const [step, setStep] = useState("mode");
    const [mode, setMode] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [month, setMonth] = useState(null); // { y, m }
    const [day, setDay] = useState(null);
    const [slot, setSlot] = useState(null);
    const [phone, setPhone] = useState("");
    const [reason, setReason] = useState("");
    const [sending, setSending] = useState(false);
    const [booked, setBooked] = useState(null);

    const reset = useCallback(() => {
        setStep("mode"); setMode(null); setData(null); setDay(null); setSlot(null); setError(""); setBooked(null); setReason("");
    }, []);

    const close = () => {
        closeBooking();
        setTimeout(reset, 300);
    };

    // Retour de la page de connexion : le créneau choisi est repris dès que le compte est chargé
    // (le composant reste monté entre les pages, d'où la dépendance au compte et non au montage)
    useEffect(() => {
        if (!user?.id || !token()) return;
        const d = readDraft();
        if (d) {
            setMode(d.mode); setSlot(d.slot); setDay(d.day); setPhone(d.phone || ""); setReason(d.reason || ""); setStep("details");
            clearDraft();
            openBooking();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    useEffect(() => {
        if (user?.profile?.contact && !phone) setPhone(String(user.profile.contact));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    useEffect(() => {
        if (!bookingOpen) return;
        const onKey = (e) => e.key === "Escape" && close();
        window.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookingOpen]);

    const load = useCallback(async (m) => {
        setLoading(true); setError("");
        try {
            const res = await api(`teleconsultation/availability?mode=${m}`);
            setData(res);
            const firstDay = res.days?.[0]?.date ?? res.window?.from;
            const [y, mm] = firstDay.split("-").map(Number);
            setMonth({ y, m: mm - 1 });
            setDay(res.days?.[0]?.date ?? null);
        } catch (e) {
            setError(e.message || "Calendrier indisponible pour le moment.");
        } finally {
            setLoading(false);
        }
    }, []);

    const chooseMode = (m) => {
        setMode(m); setSlot(null); setStep("date"); load(m);
    };

    const byDay = useMemo(() => new Map((data?.days ?? []).map((d) => [d.date, d.slots])), [data]);
    const cells = month ? monthDays(month.y, month.m) : [];
    const monthTitle = month ? new Date(Date.UTC(month.y, month.m, 1)).toLocaleDateString("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" }) : "";
    const winFrom = data?.window?.from;
    const winTo = data?.window?.to;
    const canPrev = month && winFrom && `${month.y}-${String(month.m + 1).padStart(2, "0")}` > winFrom.slice(0, 7);
    const canNext = month && winTo && `${month.y}-${String(month.m + 1).padStart(2, "0")}` < winTo.slice(0, 7);
    const shiftMonth = (n) => setMonth((cur) => {
        const d = new Date(Date.UTC(cur.y, cur.m + n, 1));
        return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
    });
    const slots = day ? byDay.get(day) ?? [] : [];
    const minutes = slots[0]?.minutes ?? data?.days?.[0]?.slots?.[0]?.minutes ?? 30;

    // Groupes d'heures : matin, après-midi, soir
    const groups = useMemo(() => {
        const g = { Matin: [], "Après-midi": [], Soir: [] };
        slots.forEach((s) => {
            const h = Number(new Date(s.start).toLocaleTimeString("fr-FR", { timeZone: TZ, hour: "2-digit", hour12: false }).slice(0, 2));
            (h < 12 ? g.Matin : h < 17 ? g["Après-midi"] : g.Soir).push(s);
        });
        return Object.entries(g).filter(([, v]) => v.length);
    }, [slots]);

    const goLogin = () => {
        saveDraft({ mode, slot, day, phone, reason });
        rememberRedirect(router.asPath || "/");
        closeBooking();
        router.push("/login");
    };

    const confirm = async () => {
        setSending(true); setError("");
        try {
            const res = await api("teleconsultation/me/appointments", {
                method: "POST",
                body: JSON.stringify({ mode, starts_at: slot.start, phone: phone.trim(), reason: reason.trim() }),
            });
            setBooked(res); setStep("done");
        } catch (e) {
            if (e.status === 409) {
                setError(e.message); setSlot(null); setStep("date"); load(mode);
            } else if (e.status === 401) {
                goLogin();
            } else setError(e.message);
        } finally {
            setSending(false);
        }
    };

    const isCustomer = !user || user.role === "customer";
    const phoneOk = mode !== "phone" || /^\+?\d{8,15}$/.test(phone.replace(/[\s.]/g, ""));

    // Panneau d'information (colonne gauche sur ordinateur)
    const Info = (
        <div className="border-b border-[#E9E5DF] p-5 lg:border-b-0 lg:border-r lg:p-7">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#8A837A]">E.doto family</p>
            <h2 className="mt-1 font-serif text-[26px] leading-tight text-[#1A1814]">Téléconsultation santé sexuelle</h2>
            <ul className="mt-5 space-y-3 text-sm text-[#57524B]">
                <li className="flex items-center gap-3"><Clock3 size={16} className="text-[#1A1814]" /> {minutes} minutes</li>
                {mode && (
                    <li className="flex items-center gap-3">
                        {mode === "video" ? <Video size={16} className="text-[#1A1814]" /> : <Phone size={16} className="text-[#1A1814]" />}
                        {MODE_LABEL[mode]}
                    </li>
                )}
                <li className="flex items-center gap-3"><Globe2 size={16} className="text-[#1A1814]" /> Heure du Bénin (UTC+1)</li>
                {slot && (
                    <li className="flex items-start gap-3 font-medium text-[#1A1814]">
                        <CalendarPlus size={16} className="mt-0.5" /> <span className="first-letter:uppercase">{fullLabel(slot.start)}</span>
                    </li>
                )}
            </ul>
            <div className="mt-6 hidden overflow-hidden rounded-2xl lg:block">
                <img src="/images/twopersons.avif" alt="" className="h-40 w-full object-cover" />
            </div>
            <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-[#8A837A]">
                <ShieldCheck size={14} className="mt-0.5 shrink-0" />
                Échange confidentiel avec un professionnel de santé. Si besoin, il vous oriente vers un centre partenaire (ABPF, ABMS ou clinique) avec un code QR.
            </p>
        </div>
    );

    return (
        <AnimatePresence>
            {bookingOpen && (
                <>
                    <motion.div key="tc-backdrop" className="fixed inset-0 z-[94] bg-[#1A1814]/35 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
                    <motion.aside
                        key="tc-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Prendre rendez-vous"
                        className="fixed inset-y-0 right-0 z-[95] flex w-full flex-col bg-[#F9F8F6] md:w-[min(1040px,calc(100vw-48px))] md:rounded-l-[28px]"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={spring}
                    >
                        {/* En-tête */}
                        <div className="flex items-center justify-between gap-3 border-b border-[#E9E5DF] px-4 py-3 sm:px-6">
                            <div className="flex items-center gap-3">
                                {step !== "mode" && step !== "done" && (
                                    <button onClick={() => setStep(step === "details" ? "date" : "mode")} aria-label="Retour" className="grid h-10 w-10 place-items-center rounded-full border border-[#E9E5DF] bg-white text-[#1A1814] transition hover:border-[#1A1814]">
                                        <ArrowLeft size={18} />
                                    </button>
                                )}
                                <Steps step={step} />
                            </div>
                            <button onClick={close} aria-label="Fermer" className="grid h-10 w-10 place-items-center rounded-full border border-[#E9E5DF] bg-white text-[#57524B] transition hover:border-[#1A1814] hover:text-[#1A1814]">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <div className="grid min-h-full lg:grid-cols-[320px_1fr]">
                                {Info}

                                <div className="p-5 sm:p-7">
                                    {error && <p role="alert" className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

                                    {/* 1. Mode */}
                                    {step === "mode" && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                            <h3 className="font-serif text-2xl text-[#1A1814]">Comment souhaitez-vous échanger ?</h3>
                                            <p className="mt-1 text-sm text-[#57524B]">Vous choisirez ensuite le jour et l’heure qui vous conviennent.</p>
                                            <div className="mt-6 grid gap-3">
                                                <ModeCard icon={Video} title="En visio" text="Face à face depuis votre téléphone ou votre ordinateur, sans rien installer. Le lien vous est envoyé par e-mail." active={mode === "video"} onClick={() => chooseMode("video")} />
                                                <ModeCard icon={Phone} title="Par appel téléphonique" text="Le médecin vous appelle sur votre numéro à l’heure choisie. Un SMS de rappel vous prévient juste avant." active={mode === "phone"} onClick={() => chooseMode("phone")} />
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* 2. Calendrier */}
                                    {step === "date" && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                            <h3 className="font-serif text-2xl text-[#1A1814]">Choisissez une date et une heure</h3>
                                            {loading || !data ? (
                                                <div className="grid h-72 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-[#C2185B]" /></div>
                                            ) : !data.days?.length ? (
                                                <div className="mt-6 rounded-[20px] border border-[#E9E5DF] bg-white p-6 text-center">
                                                    <p className="font-serif text-xl text-[#1A1814]">Aucun créneau libre pour le moment</p>
                                                    <p className="mt-2 text-sm text-[#57524B]">Nos médecins ouvrent régulièrement de nouveaux créneaux. Revenez bientôt, ou posez vos questions à l’assistant virtuel en attendant.</p>
                                                    {mode === "video" && <button onClick={() => chooseMode("phone")} className="mt-4 text-sm font-medium text-[#C2185B] hover:underline">Voir les créneaux par appel</button>}
                                                    {mode === "phone" && <button onClick={() => chooseMode("video")} className="mt-4 text-sm font-medium text-[#C2185B] hover:underline">Voir les créneaux en visio</button>}
                                                </div>
                                            ) : (
                                                <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_260px]">
                                                    {/* Mois */}
                                                    <div>
                                                        <div className="mb-4 flex items-center justify-between">
                                                            <p className="font-medium capitalize text-[#1A1814]">{monthTitle}</p>
                                                            <div className="flex gap-2">
                                                                <button disabled={!canPrev} onClick={() => shiftMonth(-1)} aria-label="Mois précédent" className="grid h-9 w-9 place-items-center rounded-full border border-[#E9E5DF] bg-white text-[#1A1814] transition hover:border-[#1A1814] disabled:opacity-30"><ChevronLeft size={16} /></button>
                                                                <button disabled={!canNext} onClick={() => shiftMonth(1)} aria-label="Mois suivant" className="grid h-9 w-9 place-items-center rounded-full border border-[#E9E5DF] bg-white text-[#1A1814] transition hover:border-[#1A1814] disabled:opacity-30"><ChevronRight size={16} /></button>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-7 gap-1 text-center">
                                                            {WEEKDAYS.map((w) => <span key={w} className="pb-2 text-[11px] uppercase tracking-wide text-[#8A837A]">{w}</span>)}
                                                            {cells.map((d, i) => {
                                                                if (!d) return <span key={`e${i}`} />;
                                                                const open = byDay.has(d);
                                                                const on = d === day;
                                                                return (
                                                                    <button
                                                                        key={d}
                                                                        disabled={!open}
                                                                        onClick={() => { setDay(d); setSlot(null); }}
                                                                        aria-pressed={on}
                                                                        aria-label={`${dayLabel(`${d}T12:00:00Z`)}${open ? `, ${byDay.get(d).length} créneaux` : ", complet ou fermé"}`}
                                                                        className={`relative mx-auto grid aspect-square w-full max-w-[52px] place-items-center rounded-full text-sm transition ${on ? "bg-[#1A1814] font-semibold text-white" : open ? "bg-white font-semibold text-[#1A1814] ring-1 ring-[#E9E5DF] hover:ring-[#1A1814]" : "text-[#C9C2B8]"}`}
                                                                    >
                                                                        {Number(d.slice(8))}
                                                                        {open && !on && <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-[#C2185B]" />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Heures du jour choisi */}
                                                    <div className="min-w-0">
                                                        {day ? (
                                                            <>
                                                                <p className="mb-3 font-medium first-letter:uppercase text-[#1A1814]">{dayLabel(`${day}T12:00:00Z`)}</p>
                                                                <div className="max-h-[420px] space-y-4 overflow-y-auto pe-1">
                                                                    {groups.map(([label, list]) => (
                                                                        <div key={label}>
                                                                            <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[#8A837A]">{label}</p>
                                                                            <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
                                                                                {list.map((s) => {
                                                                                    const on = slot?.start === s.start;
                                                                                    return (
                                                                                        <div key={s.start} className="flex gap-2">
                                                                                            <button
                                                                                                onClick={() => setSlot(s)}
                                                                                                className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition ${on ? "border-[#1A1814] bg-[#1A1814] text-white" : "border-[#E9E5DF] bg-white text-[#1A1814] hover:border-[#1A1814]"}`}
                                                                                            >
                                                                                                {timeLabel(s.start)}
                                                                                            </button>
                                                                                            {on && (
                                                                                                <motion.button initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} onClick={() => setStep("details")} className="hidden rounded-xl bg-[#C2185B] px-4 text-sm font-semibold text-white xl:block">
                                                                                                    Suivant
                                                                                                </motion.button>
                                                                                            )}
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <p className="text-sm text-[#57524B]">Choisissez un jour en surbrillance.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {slot && (
                                                <div className="sticky bottom-0 mt-6 flex items-center justify-between gap-3 rounded-2xl border border-[#E9E5DF] bg-white p-3 xl:hidden">
                                                    <span className="text-sm text-[#1A1814] first-letter:uppercase">{fullLabel(slot.start)}</span>
                                                    <button onClick={() => setStep("details")} className="rounded-xl bg-[#C2185B] px-5 py-3 text-sm font-semibold text-white">Suivant</button>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* 3. Coordonnées */}
                                    {step === "details" && slot && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl">
                                            <h3 className="font-serif text-2xl text-[#1A1814]">Vos coordonnées</h3>
                                            {!token() || !user ? (
                                                <div className="mt-6 rounded-[20px] border border-[#E9E5DF] bg-white p-6">
                                                    <LockKeyhole size={22} className="text-[#1A1814]" />
                                                    <p className="mt-3 font-serif text-xl text-[#1A1814]">Connectez-vous pour confirmer</p>
                                                    <p className="mt-1 text-sm text-[#57524B]">Votre créneau est gardé quelques minutes. Après la connexion, vous revenez ici pour confirmer. Vos rendez-vous et votre code QR seront dans votre dashboard.</p>
                                                    <div className="mt-5 flex flex-wrap gap-3">
                                                        <button onClick={goLogin} className="rounded-xl bg-[#1A1814] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black">Se connecter</button>
                                                        <button onClick={() => { saveDraft({ mode, slot, day, phone, reason }); rememberRedirect(router.asPath || "/"); closeBooking(); router.push("/register"); }} className="rounded-xl border border-[#1A1814] px-5 py-3 text-sm font-semibold text-[#1A1814]">Créer un compte</button>
                                                    </div>
                                                </div>
                                            ) : !isCustomer ? (
                                                <p className="mt-6 rounded-2xl border border-[#E9E5DF] bg-white p-5 text-sm text-[#57524B]">Les rendez-vous se prennent avec un compte jeune (client) E.doto family.</p>
                                            ) : (
                                                <div className="mt-6 space-y-4">
                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                        <div className="rounded-2xl border border-[#E9E5DF] bg-white px-4 py-3">
                                                            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8A837A]">Nom</p>
                                                            <p className="mt-0.5 truncate text-[#1A1814]">{user.name}</p>
                                                        </div>
                                                        <div className="rounded-2xl border border-[#E9E5DF] bg-white px-4 py-3">
                                                            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8A837A]">E-mail</p>
                                                            <p className="mt-0.5 truncate text-[#1A1814]">{user.email}</p>
                                                        </div>
                                                    </div>
                                                    <label className="block">
                                                        <span className="text-sm font-medium text-[#1A1814]">Téléphone {mode === "phone" ? "(le médecin vous appelle à ce numéro)" : "(facultatif)"}</span>
                                                        <input
                                                            value={phone}
                                                            onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s]/g, "").slice(0, 20))}
                                                            inputMode="tel"
                                                            autoComplete="tel"
                                                            placeholder="+229 01 00 00 00 00"
                                                            className="mt-1.5 w-full rounded-2xl border border-[#E9E5DF] bg-white px-4 py-3 text-[#1A1814] outline-none transition focus:border-[#1A1814]"
                                                        />
                                                        {mode === "phone" && phone && !phoneOk && <span className="mt-1 block text-xs text-red-700">Numéro invalide : 8 à 15 chiffres.</span>}
                                                    </label>
                                                    <label className="block">
                                                        <span className="text-sm font-medium text-[#1A1814]">Ce dont vous souhaitez parler (facultatif)</span>
                                                        <textarea
                                                            value={reason}
                                                            onChange={(e) => setReason(e.target.value.slice(0, 300))}
                                                            rows={3}
                                                            placeholder="Exemple : je voudrais des conseils sur la contraception."
                                                            className="mt-1.5 w-full resize-none rounded-2xl border border-[#E9E5DF] bg-white px-4 py-3 text-[#1A1814] outline-none transition focus:border-[#1A1814]"
                                                        />
                                                        <span className="mt-1 flex justify-between text-xs text-[#8A837A]"><span>Lu uniquement par le médecin.</span><span>{reason.length}/300</span></span>
                                                    </label>
                                                    <button
                                                        onClick={confirm}
                                                        disabled={sending || (mode === "phone" && !phoneOk)}
                                                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1A1814] py-4 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
                                                    >
                                                        {sending && <Loader2 size={16} className="animate-spin" />}
                                                        Confirmer le rendez-vous
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* 4. Confirmation */}
                                    {step === "done" && booked && (
                                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl">
                                            <span className="grid h-14 w-14 place-items-center rounded-full bg-[#1A1814] text-white"><Check size={26} /></span>
                                            <h3 className="mt-5 font-serif text-3xl text-[#1A1814]">Rendez-vous confirmé</h3>
                                            <p className="mt-2 text-[#57524B]">Un e-mail de confirmation vous a été envoyé à {booked.email}.</p>
                                            <dl className="mt-6 divide-y divide-[#E9E5DF] rounded-[20px] border border-[#E9E5DF] bg-white">
                                                {[
                                                    ["Date", <span key="d" className="first-letter:uppercase">{fullLabel(booked.starts_at)}</span>],
                                                    ["Mode", MODE_LABEL[booked.mode]],
                                                    ["Professionnel", `${booked.doctor?.name}${booked.doctor?.title ? `, ${booked.doctor.title}` : ""}`],
                                                    ["Référence", booked.reference],
                                                ].map(([k, v]) => (
                                                    <div key={k} className="flex items-start justify-between gap-4 px-5 py-3.5">
                                                        <dt className="text-sm text-[#8A837A]">{k}</dt>
                                                        <dd className="text-right text-sm font-medium text-[#1A1814]">{v}</dd>
                                                    </div>
                                                ))}
                                            </dl>
                                            <p className="mt-4 text-sm leading-relaxed text-[#57524B]">
                                                {booked.mode === "video"
                                                    ? "Le lien de la visio est dans votre e-mail et dans votre dashboard. Vous recevrez un rappel par e-mail moins de 10 minutes avant le début."
                                                    : `Le médecin vous appellera au ${booked.phone}. Un SMS de rappel vous prévient moins de 10 minutes avant le début.`}
                                            </p>
                                            <div className="mt-6 flex flex-wrap gap-3">
                                                <button onClick={() => downloadIcs(booked)} className="inline-flex items-center gap-2 rounded-xl border border-[#1A1814] px-5 py-3 text-sm font-semibold text-[#1A1814] transition hover:bg-white">
                                                    <CalendarPlus size={16} /> Ajouter à mon agenda
                                                </button>
                                                <button onClick={() => { close(); router.push("/mon-espace"); }} className="rounded-xl bg-[#1A1814] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black">
                                                    Voir mon dashboard
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
