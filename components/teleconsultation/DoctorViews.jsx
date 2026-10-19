"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, CalendarClock, CalendarX2, CheckCircle2, ClipboardList, FileText, Loader2, Phone, PhoneCall, Plus, Trash2, UserX, Video } from "lucide-react";
import { Badge, Card, Empty, ErrorBox, SectionTitle, Skeleton, StatCard, Tabs } from "../pickup-dashboard/ui";
import { api, dayLabel, fullLabel, qs, timeLabel } from "./tcShared";

// Espace médecin (19/10/2026) : vues de l'agenda, du rendez-vous (compte rendu) et des disponibilités.
const statusTone = { booked: "rose", completed: "ok", cancelled: "off", no_show: "wait" };
const WEEKDAYS = ["", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const MODES = { both: "Visio et appel", video: "Visio seulement", phone: "Appel seulement" };
const SEX = { female: "Femme", male: "Homme" };

const input = "w-full rounded-xl border border-[#E9E5DF] bg-white px-3.5 py-2.5 text-sm text-[#1A1814] outline-none transition focus:border-[#1A1814]";

function Field({ label, hint, children }) {
    return (
        <label className="block">
            <span className="text-sm font-medium text-[#1A1814]">{label}</span>
            {hint && <span className="ml-1 text-xs text-[#8A837A]">{hint}</span>}
            <div className="mt-1.5">{children}</div>
        </label>
    );
}

/** Action « Appeler maintenant » / « Rejoindre la visio » : enregistre le début puis ouvre l'appel */
export function StartButton({ a, onDone, compact = false }) {
    const [busy, setBusy] = useState(false);
    const start = async () => {
        setBusy(true);
        try {
            const res = await api(`teleconsultation/doctor/appointments/${a.id}/start`, { method: "POST" });
            if (a.mode === "video" && res.room_url) window.open(res.room_url, "_blank", "noopener,noreferrer");
            if (a.mode === "phone" && res.phone) window.location.href = `tel:${res.phone}`;
            onDone?.();
        } catch (e) {
            alert(e.message);
        } finally {
            setBusy(false);
        }
    };
    return (
        <button onClick={start} disabled={busy} className={`inline-flex items-center gap-2 rounded-xl bg-[#C2185B] font-semibold text-white transition hover:bg-[#A0124A] disabled:opacity-60 ${compact ? "px-3.5 py-2 text-xs" : "px-5 py-3 text-sm"}`}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : a.mode === "video" ? <Video size={16} /> : <PhoneCall size={16} />}
            {a.mode === "video" ? "Rejoindre la visio" : "Appeler maintenant"}
        </button>
    );
}

function AppointmentRow({ a, onOpen, onStarted }) {
    return (
        <div className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${a.is_live ? "bg-[#FBEEF3]/60" : ""}`}>
            <button onClick={() => onOpen(a.id)} className="flex min-w-0 items-center gap-4 text-left">
                <span className="w-16 shrink-0 text-center">
                    <span className="block text-lg font-semibold text-[#1A1814]">{timeLabel(a.starts_at)}</span>
                    <span className="block text-[11px] text-[#8A837A]">{dayLabel(a.starts_at, { weekday: "short", month: "short" })}</span>
                </span>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F9F8F6] text-[#1A1814]">{a.mode === "video" ? <Video size={18} /> : <Phone size={18} />}</span>
                <span className="min-w-0">
                    <span className="block truncate font-medium text-[#1A1814]">{a.patient_name}</span>
                    <span className="block truncate text-xs text-[#8A837A]">{a.mode_label} · {a.reference}{a.reason ? ` · ${a.reason}` : ""}</span>
                </span>
            </button>
            <div className="flex shrink-0 items-center gap-2">
                {a.is_live && <Badge tone="rose">C’est l’heure</Badge>}
                {!a.is_live && <Badge tone={statusTone[a.status] || "ink"}>{a.status_label}</Badge>}
                {a.status === "booked" && a.is_live && <StartButton a={a} compact onDone={onStarted} />}
                {a.status === "completed" && !a.has_report && <Badge tone="wait">Compte rendu à faire</Badge>}
            </div>
        </div>
    );
}

export function TodayView({ onOpen, onSchedule }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        try { setData(await api("teleconsultation/doctor/overview")); setError(null); } catch (e) { setError(e.message); }
    }, []);
    useEffect(() => {
        load();
        const t = setInterval(load, 30000);
        return () => clearInterval(t);
    }, [load]);
    // Onglet du navigateur : signale un rendez-vous qui commence
    const live = (data?.today || []).find((a) => a.is_live && a.status === "booked");
    useEffect(() => {
        const base = "Espace médecin · E.doto family";
        document.title = live ? `C’est l’heure : ${live.patient_name}` : base;
        return () => { document.title = base; };
    }, [live]);

    if (error) return <ErrorBox message={error} onRetry={load} />;
    if (!data) return <div className="space-y-4"><Skeleton className="h-24" /><Skeleton className="h-64" /></div>;
    return (
        <div className="space-y-6">
            <SectionTitle title={`Bonjour ${data.doctor.name}`} subtitle={dayLabel(new Date().toISOString(), { year: "numeric" }).replace(/^./, (c) => c.toUpperCase())} />
            {!data.has_availability && (
                <Card className="flex flex-col gap-3 border-[#F3CADB] bg-[#FBEEF3]/50 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-[#1A1814]"><b>Aucune disponibilité :</b> les jeunes ne peuvent pas encore réserver avec vous.</p>
                    <button onClick={onSchedule} className="rounded-xl bg-[#1A1814] px-4 py-2.5 text-sm font-semibold text-white">Définir mes disponibilités</button>
                </Card>
            )}
            {live && (
                <Card className="flex flex-col gap-4 border-[#C2185B] p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-[#C2185B]">C’est l’heure</p>
                        <p className="mt-1 font-serif text-2xl text-[#1A1814]">{live.patient_name}</p>
                        <p className="text-sm text-[#57524B]">{live.mode_label} à {timeLabel(live.starts_at)}{live.mode === "phone" && live.phone ? ` · ${live.phone}` : ""}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <StartButton a={live} onDone={load} />
                        <button onClick={() => onOpen(live.id)} className="rounded-xl border border-[#1A1814] px-5 py-3 text-sm font-semibold text-[#1A1814]">Ouvrir le dossier</button>
                    </div>
                </Card>
            )}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="À venir" value={data.stats.upcoming} icon={CalendarClock} tone="rose" />
                <StatCard label="Terminés (30 j)" value={data.stats.done_30} icon={CheckCircle2} tone="sage" />
                <StatCard label="Absents" value={data.stats.no_show} icon={UserX} tone="sand" />
                <StatCard label="Annulés" value={data.stats.cancelled} icon={CalendarX2} tone="ink" />
            </div>
            <Card>
                <div className="flex items-center justify-between border-b border-[#EFECE7] px-5 py-4">
                    <p className="font-serif text-lg text-[#1A1814]">Aujourd’hui</p>
                    <span className="text-sm text-[#8A837A]">{data.today.length} rendez-vous</span>
                </div>
                {data.today.length === 0 ? <Empty title="Aucun rendez-vous aujourd’hui" /> : <div className="divide-y divide-[#EFECE7]">{data.today.map((a) => <AppointmentRow key={a.id} a={a} onOpen={onOpen} onStarted={load} />)}</div>}
            </Card>
            {data.to_write.length > 0 && (
                <Card>
                    <div className="border-b border-[#EFECE7] px-5 py-4"><p className="font-serif text-lg text-[#1A1814]">Comptes rendus à rédiger</p></div>
                    <div className="divide-y divide-[#EFECE7]">
                        {data.to_write.map((a) => (
                            <button key={a.id} onClick={() => onOpen(a.id)} className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left hover:bg-[#F9F8F6]">
                                <span className="min-w-0"><span className="block truncate text-sm font-medium text-[#1A1814]">{a.patient_name}</span><span className="block text-xs text-[#8A837A] first-letter:uppercase">{fullLabel(a.starts_at)} · {a.reference}</span></span>
                                <FileText size={18} className="shrink-0 text-[#C2185B]" />
                            </button>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}

export function AppointmentsView({ onOpen, search }) {
    const [when, setWhen] = useState("upcoming");
    const [mode, setMode] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [page, setPage] = useState(1);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        try {
            const params = { page, search, mode, date_from: from, date_to: to, sort: when === "upcoming" ? "asc" : "desc" };
            if (when === "upcoming" || when === "to_write") params.when = when;
            else if (when !== "all") params.status = when;
            setData(await api(`teleconsultation/doctor/appointments${qs(params)}`));
            setError(null);
        } catch (e) { setError(e.message); }
    }, [when, mode, from, to, page, search]);
    useEffect(() => { load(); }, [load]);
    useEffect(() => { setPage(1); }, [when, mode, from, to, search]);
    return (
        <div>
            <SectionTitle title="Rendez-vous" subtitle="Recherche par nom, référence ou téléphone dans la barre du haut." />
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <Tabs value={when} onChange={setWhen} items={[
                    { key: "upcoming", label: "À venir" }, { key: "to_write", label: "Compte rendu à faire" }, { key: "completed", label: "Terminés" },
                    { key: "no_show", label: "Absents" }, { key: "cancelled", label: "Annulés" }, { key: "all", label: "Tous" },
                ]} />
                <div className="flex flex-wrap gap-2">
                    <select value={mode} onChange={(e) => setMode(e.target.value)} className={`${input} w-auto`}><option value="">Visio et appel</option><option value="video">Visio</option><option value="phone">Appel</option></select>
                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={`${input} w-auto`} aria-label="Du" />
                    <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={`${input} w-auto`} aria-label="Au" />
                </div>
            </div>
            {error ? <ErrorBox message={error} onRetry={load} /> : !data ? <Skeleton className="h-64" /> : (
                <Card>
                    {data.data.length === 0 ? <Empty title="Aucun rendez-vous" /> : <div className="divide-y divide-[#EFECE7]">{data.data.map((a) => <AppointmentRow key={a.id} a={a} onOpen={onOpen} onStarted={load} />)}</div>}
                    {data.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-[#EFECE7] px-5 py-3 text-sm">
                            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg px-3 py-1.5 disabled:opacity-30">Précédent</button>
                            <span className="text-[#8A837A]">Page {data.page} sur {data.last_page} · {data.total} rendez-vous</span>
                            <button disabled={page >= data.last_page} onClick={() => setPage((p) => p + 1)} className="rounded-lg px-3 py-1.5 disabled:opacity-30">Suivant</button>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
}

const EMPTY_REPORT = {
    request_type: "", request_detail: "", chief_complaint: "", history: "", gyneco_history: "", allergies: "", current_treatments: "",
    findings: "", assessment: "", plan: "", urgency: "routine", center_id: "", center_instructions: "", patient_summary: "",
};

export function AppointmentDetail({ id, onBack }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [form, setForm] = useState(EMPTY_REPORT);
    const [msg, setMsg] = useState(null);
    const [busy, setBusy] = useState(null);
    const [cancel, setCancel] = useState(null);

    const load = useCallback(async () => {
        try {
            const d = await api(`teleconsultation/doctor/appointments/${id}`);
            setData(d); setError(null);
            if (d.report) {
                const r = d.report;
                setForm(Object.fromEntries(Object.keys(EMPTY_REPORT).map((k) => [k, r[k] == null ? (k === "urgency" ? "routine" : "") : String(r[k])])));
            }
        } catch (e) { setError(e.message); }
    }, [id]);
    useEffect(() => { load(); }, [load]);

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
    const finalized = Boolean(data?.report?.finalized_at);
    const a = data?.appointment;
    const canWrite = a && (a.status === "booked" || a.status === "completed") && new Date(a.starts_at).getTime() - Date.now() <= 15 * 60000;

    const save = async (finalize) => {
        if (finalize && !window.confirm("Finaliser le compte rendu ? Il ne pourra plus être modifié" + (form.center_id ? " et le jeune recevra son code QR d’orientation." : "."))) return;
        setBusy(finalize ? "final" : "draft"); setMsg(null);
        try {
            const res = await api(`teleconsultation/doctor/appointments/${id}/report${finalize ? "/finalize" : ""}`, { method: finalize ? "POST" : "PUT", body: JSON.stringify(form) });
            setMsg({ ok: true, text: res.message });
            if (finalize) await load();
        } catch (e) { setMsg({ ok: false, text: e.message }); } finally { setBusy(null); }
    };
    const act = async (path, body) => {
        setBusy(path); setMsg(null);
        try {
            const res = await api(`teleconsultation/doctor/appointments/${id}/${path}`, { method: "POST", body: JSON.stringify(body || {}) });
            setMsg({ ok: true, text: res.message || "Enregistré." }); setCancel(null); await load();
        } catch (e) { setMsg({ ok: false, text: e.message }); } finally { setBusy(null); }
    };

    if (error) return <ErrorBox message={error} onRetry={load} />;
    if (!data) return <Skeleton className="h-96" />;
    const p = data.patient;
    const types = Object.entries(data.options.request_types);
    const urg = Object.entries(data.options.urgency);

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-[#57524B] hover:text-[#1A1814]"><ArrowLeft size={16} /> Retour</button>
            <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
                <div className="space-y-4">
                    <Card className="p-5">
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-xs uppercase tracking-[0.14em] text-[#8A837A]">{a.mode_label} · {a.reference}</p>
                            <Badge tone={statusTone[a.status] || "ink"}>{a.status_label}</Badge>
                        </div>
                        <p className="mt-2 font-serif text-xl text-[#1A1814] first-letter:uppercase">{fullLabel(a.starts_at)}</p>
                        {a.status === "booked" && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                <StartButton a={{ ...a, id: Number(id) }} onDone={load} />
                                {new Date(a.starts_at).getTime() <= Date.now() && (
                                    <button onClick={() => act("no-show")} disabled={!!busy} className="rounded-xl border border-[#E9E5DF] px-4 py-2.5 text-sm text-[#57524B] hover:border-[#1A1814]">Absent</button>
                                )}
                                <button onClick={() => setCancel({ reason: "" })} className="rounded-xl px-4 py-2.5 text-sm text-[#9B2C2C] hover:bg-[#F5E4E4]">Annuler</button>
                            </div>
                        )}
                    </Card>
                    <Card className="p-5">
                        <p className="text-xs uppercase tracking-[0.14em] text-[#8A837A]">Patient</p>
                        <p className="mt-1 font-serif text-xl text-[#1A1814]">{p.name}</p>
                        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div><dt className="text-xs text-[#8A837A]">Âge</dt><dd className="text-[#1A1814]">{p.age != null ? `${p.age} ans` : "Non renseigné"}</dd></div>
                            <div><dt className="text-xs text-[#8A837A]">Sexe</dt><dd className="text-[#1A1814]">{SEX[p.sex] || "Non renseigné"}</dd></div>
                            <div className="col-span-2"><dt className="text-xs text-[#8A837A]">Téléphone</dt><dd>{p.phone ? <a href={`tel:${p.phone}`} className="text-[#C2185B]">{p.phone}</a> : "Non renseigné"}</dd></div>
                            <div className="col-span-2"><dt className="text-xs text-[#8A837A]">E-mail</dt><dd className="truncate text-[#1A1814]">{p.email || "Non renseigné"}</dd></div>
                        </dl>
                        {a.reason && <div className="mt-4 rounded-xl bg-[#F9F8F6] p-3 text-sm text-[#1A1814]"><p className="text-xs text-[#8A837A]">Motif indiqué par le jeune</p>{a.reason}</div>}
                    </Card>
                    {data.history.length > 0 && (
                        <Card className="p-5">
                            <p className="text-xs uppercase tracking-[0.14em] text-[#8A837A]">Consultations précédentes</p>
                            <ul className="mt-3 space-y-3">
                                {data.history.map((h) => (
                                    <li key={h.reference} className="border-l-2 border-[#E9E5DF] pl-3 text-sm">
                                        <p className="font-medium text-[#1A1814]">{h.request_label} · {dayLabel(h.starts_at, { year: "numeric" })}</p>
                                        {h.assessment && <p className="text-[#57524B]">{h.assessment}</p>}
                                        <p className="text-xs text-[#8A837A]">{h.doctor_name}</p>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}
                </div>

                <Card className="p-5 sm:p-7">
                    <div className="mb-5 flex items-center gap-3">
                        <ClipboardList size={20} className="text-[#C2185B]" />
                        <h2 className="font-serif text-2xl text-[#1A1814]">Compte rendu</h2>
                        {finalized && <Badge tone="ok">Finalisé</Badge>}
                    </div>
                    {msg && <p className={`mb-4 rounded-xl px-4 py-3 text-sm ${msg.ok ? "bg-[#E8EFE6] text-[#3F6B45]" : "bg-[#F5E4E4] text-[#9B2C2C]"}`}>{msg.text}</p>}
                    {data.referral && (
                        <div className="mb-5 rounded-2xl border border-[#E9E5DF] bg-[#F9F8F6] p-4 text-sm">
                            <p className="font-medium text-[#1A1814]">Orientation envoyée au jeune</p>
                            <p className="text-[#57524B]">Code : <span className="font-mono font-bold tracking-widest">{data.referral.short_code}</span> · valable jusqu’au {dayLabel(data.referral.expires_at, { year: "numeric" })}</p>
                        </div>
                    )}
                    {!canWrite && !finalized ? (
                        <p className="text-sm text-[#57524B]">Le compte rendu se rédige pendant ou après la consultation.</p>
                    ) : (
                        <fieldset disabled={finalized} className="space-y-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Demande du jeune">
                                    <select value={form.request_type} onChange={set("request_type")} className={input}>
                                        <option value="">Choisir…</option>
                                        {types.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                    </select>
                                </Field>
                                <Field label="Précision" hint="(ex. méthode souhaitée)"><input value={form.request_detail} onChange={set("request_detail")} maxLength={300} className={input} /></Field>
                            </div>
                            <Field label="Motif de consultation"><textarea rows={3} value={form.chief_complaint} onChange={set("chief_complaint")} className={input} /></Field>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Antécédents médicaux"><textarea rows={3} value={form.history} onChange={set("history")} className={input} /></Field>
                                <Field label="Antécédents gynécologiques" hint="(règles, grossesses, contraception)"><textarea rows={3} value={form.gyneco_history} onChange={set("gyneco_history")} className={input} /></Field>
                                <Field label="Allergies"><input value={form.allergies} onChange={set("allergies")} maxLength={300} className={input} /></Field>
                                <Field label="Traitements en cours"><input value={form.current_treatments} onChange={set("current_treatments")} maxLength={300} className={input} /></Field>
                            </div>
                            <Field label="Observations" hint="(ce que le jeune rapporte, signes décrits)"><textarea rows={3} value={form.findings} onChange={set("findings")} className={input} /></Field>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Conclusion"><textarea rows={3} value={form.assessment} onChange={set("assessment")} className={input} /></Field>
                                <Field label="Conduite à tenir"><textarea rows={3} value={form.plan} onChange={set("plan")} className={input} /></Field>
                            </div>

                            <div className="rounded-2xl border border-[#E9E5DF] p-4 sm:p-5">
                                <p className="font-medium text-[#1A1814]">Orientation vers un centre</p>
                                <p className="text-xs text-[#8A837A]">Facultatif. Le jeune recevra un code QR : le centre choisi verra ce dossier en le scannant.</p>
                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <Field label="Centre recommandé">
                                        <select value={form.center_id} onChange={set("center_id")} className={input}>
                                            <option value="">Aucune orientation</option>
                                            {data.centers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.organization}{c.city ? `, ${c.city}` : ""})</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Urgence">
                                        <select value={form.urgency} onChange={set("urgency")} className={input}>{urg.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                                    </Field>
                                </div>
                                {form.center_id && (
                                    <div className="mt-4"><Field label="Consignes pour le centre" hint="(ce que le centre doit faire pour ce jeune)"><textarea rows={3} value={form.center_instructions} onChange={set("center_instructions")} className={input} /></Field></div>
                                )}
                            </div>

                            <Field label="Message au jeune" hint="(mots simples, visible dans son dashboard et son e-mail)"><textarea rows={3} maxLength={1500} value={form.patient_summary} onChange={set("patient_summary")} className={input} /></Field>

                            {!finalized && (
                                <div className="flex flex-wrap justify-end gap-2 border-t border-[#EFECE7] pt-5">
                                    <button type="button" onClick={() => save(false)} disabled={!!busy} className="rounded-xl border border-[#1A1814] px-5 py-3 text-sm font-semibold text-[#1A1814] disabled:opacity-50">{busy === "draft" ? "Enregistrement…" : "Enregistrer le brouillon"}</button>
                                    <button type="button" onClick={() => save(true)} disabled={!!busy} className="rounded-xl bg-[#1A1814] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy === "final" ? "Finalisation…" : form.center_id ? "Finaliser et envoyer le code QR" : "Finaliser le compte rendu"}</button>
                                </div>
                            )}
                        </fieldset>
                    )}
                </Card>
            </div>

            {cancel && (
                <div className="fixed inset-0 z-[90] flex items-end justify-center bg-[#1A1814]/35 p-4 sm:items-center" onClick={() => setCancel(null)}>
                    <div className="w-full max-w-md rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
                        <p className="font-serif text-xl text-[#1A1814]">Annuler le rendez-vous</p>
                        <p className="mt-1 text-sm text-[#57524B]">Le jeune est prévenu par e-mail avec ce motif.</p>
                        <textarea rows={3} value={cancel.reason} onChange={(e) => setCancel({ reason: e.target.value.slice(0, 300) })} placeholder="Motif (obligatoire)" className={`${input} mt-4`} />
                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => setCancel(null)} className="rounded-xl px-4 py-2.5 text-sm text-[#57524B]">Retour</button>
                            <button onClick={() => act("cancel", { reason: cancel.reason })} disabled={!cancel.reason.trim() || !!busy} className="rounded-xl bg-[#9B2C2C] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Annuler le rendez-vous</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export function ScheduleView() {
    const [data, setData] = useState(null);
    const [rules, setRules] = useState([]);
    const [slot, setSlot] = useState(30);
    const [msg, setMsg] = useState(null);
    const [busy, setBusy] = useState(false);
    const [off, setOff] = useState({ date_from: "", date_to: "", reason: "" });
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        try {
            const d = await api("teleconsultation/doctor/schedule");
            setData(d); setRules(d.rules); setSlot(d.slot_minutes); setError(null);
        } catch (e) { setError(e.message); }
    }, []);
    useEffect(() => { load(); }, [load]);

    const byDay = useMemo(() => {
        const m = {};
        rules.forEach((r, i) => (m[r.weekday] ||= []).push({ ...r, i }));
        return m;
    }, [rules]);
    const update = (i, patch) => setRules((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
    const add = (weekday) => setRules((rs) => [...rs, { weekday, start_time: "09:00", end_time: "12:00", modes: "both" }]);
    const remove = (i) => setRules((rs) => rs.filter((_, j) => j !== i));
    const copyMonday = () => {
        const mon = rules.filter((r) => r.weekday === 1);
        if (!mon.length) return;
        setRules((rs) => [...rs.filter((r) => r.weekday === 1 || r.weekday > 5), ...[2, 3, 4, 5].flatMap((d) => mon.map((r) => ({ ...r, weekday: d })))]);
    };

    const save = async () => {
        setBusy(true); setMsg(null);
        try {
            const res = await api("teleconsultation/doctor/schedule", { method: "PUT", body: JSON.stringify({ rules, slot_minutes: Number(slot) }) });
            setMsg({ ok: true, text: res.message }); await load();
        } catch (e) { setMsg({ ok: false, text: e.message }); } finally { setBusy(false); }
    };
    const addOff = async () => {
        setMsg(null);
        try {
            const res = await api("teleconsultation/doctor/time-off", { method: "POST", body: JSON.stringify(off) });
            setMsg({ ok: !/Attention/.test(res.message), text: res.message }); setOff({ date_from: "", date_to: "", reason: "" }); await load();
        } catch (e) { setMsg({ ok: false, text: e.message }); }
    };
    const delOff = async (oid) => {
        try { await api(`teleconsultation/doctor/time-off/${oid}`, { method: "DELETE" }); await load(); } catch (e) { setMsg({ ok: false, text: e.message }); }
    };

    if (error) return <ErrorBox message={error} onRetry={load} />;
    if (!data) return <Skeleton className="h-96" />;
    return (
        <div className="space-y-6">
            <SectionTitle title="Mes disponibilités" subtitle="Heure du Bénin. Les jeunes réservent dans ces plages, sur les 30 prochains jours." action={
                <button onClick={save} disabled={busy} className="rounded-xl bg-[#1A1814] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Enregistrement…" : "Enregistrer"}</button>
            } />
            {msg && <p className={`rounded-xl px-4 py-3 text-sm ${msg.ok ? "bg-[#E8EFE6] text-[#3F6B45]" : "bg-[#FDF1E0] text-[#9A5B13]"}`}>{msg.text}</p>}
            <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
                <label className="flex items-center gap-3 text-sm text-[#1A1814]">
                    Durée d’une consultation
                    <select value={slot} onChange={(e) => setSlot(e.target.value)} className={`${input} w-auto`}>{[15, 20, 30, 45, 60].map((n) => <option key={n} value={n}>{n} minutes</option>)}</select>
                </label>
                <button onClick={copyMonday} className="text-sm font-medium text-[#C2185B] hover:underline">Copier le lundi sur mardi à vendredi</button>
            </Card>
            <Card className="divide-y divide-[#EFECE7]">
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <div key={d} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                        <p className="w-28 shrink-0 pt-2 font-medium text-[#1A1814]">{WEEKDAYS[d]}</p>
                        <div className="flex-1 space-y-2">
                            {(byDay[d] || []).length === 0 && <p className="pt-2 text-sm text-[#8A837A]">Indisponible</p>}
                            {(byDay[d] || []).map((r) => (
                                <div key={r.i} className="flex flex-wrap items-center gap-2">
                                    <input type="time" value={r.start_time} onChange={(e) => update(r.i, { start_time: e.target.value })} className={`${input} w-auto`} aria-label="Début" />
                                    <span className="text-[#8A837A]">à</span>
                                    <input type="time" value={r.end_time} onChange={(e) => update(r.i, { end_time: e.target.value })} className={`${input} w-auto`} aria-label="Fin" />
                                    <select value={r.modes} onChange={(e) => update(r.i, { modes: e.target.value })} className={`${input} w-auto`}>{Object.entries(MODES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                                    <button onClick={() => remove(r.i)} aria-label="Retirer la plage" className="grid h-10 w-10 place-items-center rounded-xl text-[#9B2C2C] hover:bg-[#F5E4E4]"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => add(d)} className="inline-flex items-center gap-1.5 self-start rounded-xl border border-[#E9E5DF] px-3 py-2 text-sm text-[#1A1814] hover:border-[#1A1814]"><Plus size={14} /> Plage</button>
                    </div>
                ))}
            </Card>

            <Card className="p-5">
                <p className="font-serif text-lg text-[#1A1814]">Absences</p>
                <p className="text-sm text-[#57524B]">Aucun créneau n’est proposé ces jours-là.</p>
                <div className="mt-4 flex flex-wrap items-end gap-2">
                    <Field label="Du"><input type="date" value={off.date_from} onChange={(e) => setOff((o) => ({ ...o, date_from: e.target.value }))} className={input} /></Field>
                    <Field label="Au"><input type="date" value={off.date_to} min={off.date_from || undefined} onChange={(e) => setOff((o) => ({ ...o, date_to: e.target.value }))} className={input} /></Field>
                    <div className="min-w-[200px] flex-1"><Field label="Motif" hint="(facultatif)"><input value={off.reason} onChange={(e) => setOff((o) => ({ ...o, reason: e.target.value.slice(0, 200) }))} className={input} /></Field></div>
                    <button onClick={addOff} disabled={!off.date_from || !off.date_to} className="rounded-xl bg-[#1A1814] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">Ajouter</button>
                </div>
                {data.time_off.length > 0 && (
                    <ul className="mt-4 divide-y divide-[#EFECE7] border-t border-[#EFECE7]">
                        {data.time_off.map((o) => (
                            <li key={o.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                                <span className="text-[#1A1814]">Du {dayLabel(`${o.date_from}T12:00:00Z`, { year: "numeric" })} au {dayLabel(`${o.date_to}T12:00:00Z`, { year: "numeric" })}{o.reason ? ` · ${o.reason}` : ""}</span>
                                <button onClick={() => delOff(o.id)} className="text-[#9B2C2C] hover:underline">Retirer</button>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
            <p className="flex items-center gap-2 text-xs text-[#8A837A]"><AlertTriangle size={14} /> Les rendez-vous déjà réservés ne sont pas annulés quand vous retirez une plage.</p>
        </div>
    );
}
