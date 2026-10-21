"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarPlus, ChevronDown, Download, Expand, Loader2, MapPin, MessageSquareText, Phone, Video } from "lucide-react";
import { API, api } from "../pickup-dashboard/api";
import { Badge, Card, SectionTitle, Skeleton } from "../pickup-dashboard/ui";
import { AdoptionSteps, DoctorBadge, MethodVisual } from "./ContraShared";

// « Ma contraception » dans le dashboard du jeune (21/10/2026) : chaque demande et ses 7 étapes,
// avec l'action attendue à l'étape en cours (rendez-vous, code QR, rapport de suivi).
const TONE = { pending: "wait", accepted: "rose", meeting: "rose", center: "rose", followup: "ok", refused: "off", not_adopted: "off", not_done: "off", cancelled: "off" };
const when = (iso) => (iso ? new Date(iso).toLocaleString("fr-FR", { timeZone: "Africa/Porto-Novo", weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).replace(":", " h ") : "");
const day = (iso) => (iso ? new Date(iso).toLocaleDateString("fr-FR", { timeZone: "Africa/Porto-Novo", day: "numeric", month: "long", year: "numeric" }) : "");

/** Ce que le jeune doit faire maintenant (ou ce qu'il attend) */
export function nextActionOf(r) {
    switch (r.status) {
        case "pending": return "Votre demande est en cours d’étude par l’équipe E.doto family.";
        case "accepted": return r.requires_doctor ? "Demande acceptée : prenez rendez-vous avec un médecin." : "Demande acceptée : votre code QR arrive.";
        case "meeting": return r.appointment ? `Rencontre prévue le ${when(r.appointment.starts_at)}.` : "Rencontre avec un médecin à venir.";
        case "center": return `Présentez votre code QR au centre ${r.referral?.center?.name || "recommandé"}.`;
        case "followup": return "Méthode adoptée : partagez comment cela se passe.";
        case "not_adopted": return "Le médecin n’a pas conclu d’adoption pour cette méthode.";
        case "not_done": return "Le centre indique que la méthode n’a pas été adoptée.";
        case "refused": return "Votre demande n’a pas pu être acceptée.";
        default: return "Demande annulée.";
    }
}

function QrBlock({ r }) {
    const f = r.referral;
    const img = `${API}${f.qr_image}`;
    const c = f.center || {};
    return (
        <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-[22px] border border-[#E9E5DF] md:grid-cols-[200px_1fr]">
            <div className="flex flex-col items-center justify-center border-b border-[#E9E5DF] bg-[#F9F8F6] p-5 md:border-b-0 md:border-r">
                <img src={img} alt="Code QR pour le centre" className="h-36 w-36 rounded-xl border border-[#E9E5DF] bg-white p-2" />
                <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-[#8A837A]">Code de secours</p>
                <p className="font-mono text-lg font-bold tracking-[0.2em] text-[#1A1814]">{f.short_code}</p>
            </div>
            <div className="p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-[#8A837A]">Centre recommandé</p>
                <p className="mt-1 font-serif text-xl text-[#1A1814]">{c.name}</p>
                <p className="mt-1 text-sm text-[#57524B]">{[c.address, c.city].filter(Boolean).join(", ")}</p>
                {c.opening_hours && <p className="text-sm text-[#57524B]">Horaires : {c.opening_hours}</p>}
                {c.phone && <a href={`tel:${c.phone}`} className="text-sm text-[#C2185B] hover:underline">{c.phone}</a>}
                {f.expires_at && <p className="mt-2 text-xs text-[#8A837A]">Valable jusqu’au {day(f.expires_at)}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/qr/${f.token}`} className="inline-flex items-center gap-2 rounded-xl bg-[#1A1814] px-4 py-2.5 text-sm font-semibold text-white"><Expand size={16} /> Afficher en grand</Link>
                    <a href={`${img}?download=1`} className="inline-flex items-center gap-2 rounded-xl border border-[#E9E5DF] bg-white px-4 py-2.5 text-sm text-[#1A1814] hover:border-[#1A1814]"><Download size={16} /> Télécharger</a>
                    {c.lat != null && c.lng != null && (
                        <a href={`https://www.openstreetmap.org/?mlat=${c.lat}&mlon=${c.lng}#map=17/${c.lat}/${c.lng}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[#E9E5DF] bg-white px-4 py-2.5 text-sm text-[#1A1814] hover:border-[#1A1814]"><MapPin size={16} /> Itinéraire</a>
                    )}
                </div>
            </div>
        </div>
    );
}

function RequestCard({ r, open, onToggle, onBook, onChanged }) {
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState(null);
    const [report, setReport] = useState("");
    const current = r.steps.find((s) => s.state === "current" || s.state === "failed");

    const cancel = async () => {
        setBusy(true); setMsg(null);
        try { await api(`contraception/me/requests/${r.id}/cancel`, { method: "POST" }); await onChanged(); }
        catch (e) { setMsg(e.message); } finally { setBusy(false); }
    };
    const sendReport = async () => {
        setBusy(true); setMsg(null);
        try {
            await api(`contraception/me/requests/${r.id}/followups`, { method: "POST", body: JSON.stringify({ content: report.trim() }) });
            setReport(""); await onChanged();
        } catch (e) { setMsg(e.message); } finally { setBusy(false); }
    };

    return (
        <Card className="overflow-hidden">
            <button onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-4 p-4 text-left sm:p-5">
                <MethodVisual method={{ ...r.method, name: r.method.name }} className="h-16 w-16 shrink-0 sm:h-20 sm:w-20" rounded="rounded-2xl" />
                <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                        <span className="font-serif text-lg text-[#1A1814] sm:text-xl">{r.method.name}</span>
                        <Badge tone={TONE[r.status] || "ink"}>{r.status_label}</Badge>
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-[#6B655D]">
                        {current ? `Étape ${current.n} sur 7 : ${current.label}` : "Parcours terminé"} · demandé le {day(r.created_at)}
                    </span>
                    <span className="mt-2.5 block max-w-md"><AdoptionSteps steps={r.steps} horizontal /></span>
                </span>
                <ChevronDown size={18} className={`shrink-0 text-[#8A837A] transition ${open ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="grid grid-cols-1 gap-6 border-t border-[#EFECE7] p-4 sm:p-6 lg:grid-cols-[0.9fr_1.1fr]">
                            <AdoptionSteps steps={r.steps} />
                            <div className="space-y-4">
                                <div className="rounded-2xl bg-[#F9F8F6] p-4">
                                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#8A837A]">Maintenant</p>
                                    <p className="mt-1 text-[15px] text-[#1A1814]">{nextActionOf(r)}</p>
                                    {r.refuse_reason && <p className="mt-2 whitespace-pre-line text-sm text-[#57524B]">Motif : {r.refuse_reason}</p>}
                                    {r.admin_note && r.status !== "refused" && <p className="mt-2 whitespace-pre-line text-sm text-[#57524B]">Message de l’équipe : {r.admin_note}</p>}
                                    {r.conclusion_note && <p className="mt-2 whitespace-pre-line text-sm text-[#57524B]">Le mot du médecin : {r.conclusion_note}</p>}
                                    {r.outcome_note && <p className="mt-2 whitespace-pre-line text-sm text-[#57524B]">Note du centre : {r.outcome_note}</p>}
                                </div>

                                {r.status === "accepted" && r.requires_doctor && (
                                    <button onClick={() => onBook(r)} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#C2185B] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#A0124A]">
                                        <CalendarPlus size={17} /> Prendre rendez-vous avec un médecin
                                    </button>
                                )}

                                {r.status === "meeting" && r.appointment && (
                                    <div className="flex items-center gap-3 rounded-2xl border border-[#E9E5DF] p-4">
                                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F9F8F6] text-[#1A1814]">{r.appointment.mode === "video" ? <Video size={19} /> : <Phone size={19} />}</span>
                                        <span className="min-w-0">
                                            <span className="block text-sm font-medium text-[#1A1814] first-letter:uppercase">{when(r.appointment.starts_at)}</span>
                                            <span className="block text-[13px] text-[#6B655D]">Avec {r.appointment.doctor} · {r.appointment.reference}</span>
                                        </span>
                                    </div>
                                )}

                                {r.referral && (r.status === "center" || r.status === "followup") && <QrBlock r={r} />}

                                {r.status === "followup" && (
                                    <div className="rounded-2xl border border-[#E9E5DF] p-4">
                                        <p className="flex items-center gap-2 font-medium text-[#1A1814]"><MessageSquareText size={16} /> Rapports de suivi</p>
                                        <textarea value={report} onChange={(e) => setReport(e.target.value.slice(0, 2000))} rows={3} placeholder="Comment cela se passe ? Effets ressentis, questions…"
                                            className="mt-3 w-full resize-none rounded-2xl border border-[#E9E5DF] bg-white px-4 py-3 text-sm outline-none focus:border-[#1A1814]" />
                                        <button onClick={sendReport} disabled={busy || !report.trim()} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#1A1814] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
                                            {busy && <Loader2 size={14} className="animate-spin" />} Envoyer mon rapport
                                        </button>
                                        {r.followups?.length > 0 && (
                                            <ul className="mt-4 space-y-2">
                                                {r.followups.map((f) => (
                                                    <li key={f.id} className={`rounded-2xl p-3 text-sm ${f.author_role === "youth" ? "bg-[#F9F8F6]" : "bg-[#FBEEF3]"}`}>
                                                        <p className="text-[11px] uppercase tracking-[0.14em] text-[#8A837A]">{f.author_label} · {day(f.created_at)}</p>
                                                        <p className="mt-1 whitespace-pre-line text-[#1A1814]">{f.content}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}

                                {msg && <p className="rounded-xl bg-[#FDF1E0] px-4 py-3 text-sm text-[#9A5B13]">{msg}</p>}
                                <div className="flex flex-wrap gap-2">
                                    <Link href={`/contraception/${r.method.slug}`} className="inline-flex items-center gap-2 rounded-xl border border-[#E9E5DF] bg-white px-4 py-2.5 text-sm text-[#1A1814] hover:border-[#1A1814]">Revoir la fiche</Link>
                                    {(r.status === "pending" || r.status === "accepted") && (
                                        <button onClick={cancel} disabled={busy} className="rounded-xl px-4 py-2.5 text-sm text-[#9B2C2C] hover:bg-[#F5E4E4] disabled:opacity-40">Annuler la demande</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}

export default function MyContraception({ requests, onBook, onChanged }) {
    const [open, setOpen] = useState(null);
    const openId = open ?? requests?.find((r) => ["pending", "accepted", "meeting", "center", "followup"].includes(r.status))?.id ?? null;
    return (
        <div>
            <SectionTitle
                title="Ma contraception"
                subtitle="Vos demandes d’adoption et chacune de leurs 7 étapes, en toute confidentialité."
                action={<Link href="/contraception" className="inline-flex items-center gap-2 rounded-xl bg-[#1A1814] px-5 py-3 text-sm font-semibold text-white">Découvrir les méthodes <ArrowRight size={16} /></Link>}
            />
            {!requests ? (
                <Skeleton className="h-40" />
            ) : requests.length === 0 ? (
                <Card className="overflow-hidden">
                    <div className="grid md:grid-cols-[1fr_280px]">
                        <div className="p-6 sm:p-8">
                            <p className="font-serif text-2xl text-[#1A1814]">Aucune demande pour le moment</p>
                            <p className="mt-2 max-w-md text-sm leading-relaxed text-[#57524B]">Découvrez les contraceptifs modernes, leurs avantages et leurs critères, puis demandez à adopter celui qui vous convient. Chaque étape apparaîtra ici.</p>
                            <Link href="/contraception" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#C2185B] px-5 py-3 text-sm font-semibold text-white">Voir les contraceptifs <ArrowRight size={16} /></Link>
                        </div>
                        <img src="/images/site/contraception-dashboard.jpg" alt="" className="hidden h-full w-full object-cover md:block" />
                    </div>
                </Card>
            ) : (
                <div className="space-y-3">
                    {requests.map((r) => (
                        <RequestCard key={r.id} r={r} open={openId === r.id} onToggle={() => setOpen(openId === r.id ? 0 : r.id)} onBook={onBook} onChanged={onChanged} />
                    ))}
                </div>
            )}
            {requests?.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-[#8A837A]">
                    <DoctorBadge requires /> rencontre avec un médecin à l’étape 3
                    <DoctorBadge requires={false} /> sans rencontre, orientation directe
                </div>
            )}
        </div>
    );
}
