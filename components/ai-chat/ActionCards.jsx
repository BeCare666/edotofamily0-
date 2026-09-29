"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarCheck, Gift, HeartHandshake, Phone, ArrowUpRight, MapPin } from "lucide-react";

const appear = {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { type: "spring", stiffness: 320, damping: 28 },
};

function CalendlyButton({ url, t, variant = "solid" }) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={
                variant === "solid"
                    ? "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6EA9] to-[#f0468f] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(255,110,169,0.7)] transition hover:shadow-[0_10px_28px_-8px_rgba(255,110,169,0.9)] hover:brightness-105 active:scale-[0.98]"
                    : "inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-pink-600 ring-1 ring-pink-200 transition hover:ring-pink-300 active:scale-[0.98]"
            }
        >
            <CalendarCheck size={16} />
            {t.expertCta}
            <ArrowUpRight size={14} className="opacity-80" />
        </a>
    );
}

function ExpertCard({ action, t }) {
    return (
        <motion.div {...appear}
            className="relative overflow-hidden rounded-2xl border border-pink-100 bg-gradient-to-br from-white via-pink-50/60 to-sky-50/60 p-4">
            <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-pink-200/40 blur-2xl" />
            <div className="relative flex items-start gap-3">
                <div className="rounded-xl bg-white p-2.5 text-pink-500 shadow-sm ring-1 ring-pink-100">
                    <HeartHandshake size={20} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{t.expertTitle}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{t.expertText}</p>
                    <div className="mt-3"><CalendlyButton url={action.url} t={t} /></div>
                </div>
            </div>
        </motion.div>
    );
}

function EmergencyCard({ action, t }) {
    return (
        <motion.div {...appear} className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
            <p className="font-semibold text-rose-700">{t.emergencyTitle}</p>
            <p className="mt-1.5 text-[15px] leading-7 text-slate-700">{action.message}</p>
            {action.contacts?.length > 0 && (
                <div className="mt-3 space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-rose-500">{t.emergencyContacts}</p>
                    {action.contacts.map((c) => (
                        <a key={c.number} href={`tel:${c.number}`}
                            className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-rose-100 hover:ring-rose-300">
                            <span className="text-slate-700">{c.label}</span>
                            <span className="inline-flex items-center gap-1.5 font-semibold text-rose-600"><Phone size={14} />{c.number}</span>
                        </a>
                    ))}
                </div>
            )}
            <div className="mt-3"><CalendlyButton url={action.calendlyUrl} t={t} variant="outline" /></div>
        </motion.div>
    );
}

const price = (v) => (v != null ? `${Number(v).toLocaleString()} FCFA` : null);

function ProductsCard({ action, t }) {
    return (
        <motion.div {...appear}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{t.products}</p>
            <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:none]">
                {action.items.map((p) => (
                    <Link key={p.slug} href={`/product/${p.slug}`}
                        className="group w-40 shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="aspect-square bg-gradient-to-br from-pink-50 to-sky-50">
                            {p.image && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={p.image} alt={p.name} loading="lazy"
                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                            )}
                        </div>
                        <div className="p-2.5">
                            <p className="line-clamp-2 text-[13px] font-medium leading-snug text-slate-800">{p.name}</p>
                            <p className="mt-1 text-[13px] font-semibold text-pink-600">
                                {price(p.sale_price) || price(p.price)}
                                {p.sale_price != null && p.price != null && (
                                    <span className="ml-1.5 text-[11px] font-normal text-slate-400 line-through">{price(p.price)}</span>
                                )}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </motion.div>
    );
}

const fmtDate = (d) => {
    const date = d ? new Date(d) : null;
    return date && !isNaN(date) ? date.toLocaleDateString(undefined, { day: "numeric", month: "short" }) : null;
};

function CampaignsCard({ action, t }) {
    return (
        <motion.div {...appear} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
                <div className="rounded-lg bg-gradient-to-br from-[#FF6EA9] to-[#f0468f] p-1.5 text-white"><Gift size={15} /></div>
                <p className="text-sm font-semibold text-slate-900">{t.campaigns}</p>
            </div>
            <ul className="mt-3 space-y-2">
                {action.items.map((c) => (
                    <li key={c.id} className="rounded-xl bg-slate-50 px-3 py-2">
                        <p className="text-sm font-medium text-slate-800">{c.title}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                            {c.cities?.length > 0 && (
                                <span className="inline-flex items-center gap-1"><MapPin size={12} />{c.cities.join(", ")}</span>
                            )}
                            {fmtDate(c.date_start) && (
                                <span>{fmtDate(c.date_start)}{fmtDate(c.date_end) ? ` → ${fmtDate(c.date_end)}` : ""}</span>
                            )}
                        </p>
                    </li>
                ))}
            </ul>
            <Link href="/campaigns"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-pink-600 hover:text-pink-700">
                {t.seeCampaigns} <ArrowUpRight size={14} />
            </Link>
        </motion.div>
    );
}

export default function ActionCards({ actions, t }) {
    if (!actions?.length) return null;
    return (
        <div className="mt-3 space-y-3">
            {actions.map((a, i) => {
                if (a.type === "calendly") return <ExpertCard key={i} action={a} t={t} />;
                if (a.type === "emergency") return <EmergencyCard key={i} action={a} t={t} />;
                if (a.type === "products" && a.items?.length) return <ProductsCard key={i} action={a} t={t} />;
                if (a.type === "campaigns" && a.items?.length) return <CampaignsCard key={i} action={a} t={t} />;
                return null;
            })}
        </div>
    );
}
