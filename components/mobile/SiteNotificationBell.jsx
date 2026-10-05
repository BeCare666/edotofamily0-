"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { BellIcon } from "./navIcons";
import { useAuthContext } from "../../context/AuthContext";

// Cloche du site : uniquement des données réelles de l'API.
//  - tout le monde : campagnes en cours (GET /campaigns/active) ;
//  - client connecté : ses commandes (GET /orders, limité à son compte par l'API)
//    et ses inscriptions aux campagnes (GET /campaign-registrations/mine).
// « Vu » est mémorisé dans ce navigateur ; une notification revient si le statut change.
const API = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
const SEEN_KEY = "edoto_site_notifications_seen";
const REFRESH_MS = 2 * 60 * 1000;
const RECENT_DAYS = 30;

const fcfa = (n) => `${Math.round(Number(n) || 0).toLocaleString("fr-FR")} FCFA`;

function orderMessage(o) {
  const ref = o.tracking_number || `#${o.id}`;
  if (["order-cancelled", "order-failed", "order-refunded"].includes(o.order_status)) {
    const word = o.order_status === "order-refunded" ? "remboursée" : o.order_status === "order-failed" ? "échouée" : "annulée";
    return { title: `Commande ${word}`, tone: "slate" };
  }
  if (o.order_status === "order-completed") {
    return { title: o.delivery_type === "CUSTOM" ? "Commande livrée" : "Commande retirée", tone: "green" };
  }
  if (o.payment_status === "payment-success") {
    return { title: o.delivery_type === "CUSTOM" ? "Commande payée · livraison à venir" : "Commande payée · à retirer", tone: "pink" };
  }
  if (o.payment_status === "payment-failed") return { title: "Paiement échoué", tone: "red" };
  return { title: "Paiement en attente", tone: "amber", ref };
}

const TONES = {
  pink: "bg-[#FFE4F0] text-[#C2185B]",
  green: "bg-[#DCFCE7] text-[#15803D]",
  amber: "bg-[#FEF3C7] text-[#B45309]",
  red: "bg-[#FEE2E2] text-[#B91C1C]",
  slate: "bg-slate-100 text-slate-600",
  live: "bg-[#DCFCE7] text-[#15803D]",
};

function readSeen() {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]"));
  } catch {
    return new Set();
  }
}
function writeSeen(set) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(set).slice(-300)));
  } catch {
    /* stockage indisponible : la cloche fonctionne sans mémoire */
  }
}

function ago(iso) {
  if (!iso) return "";
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  if (d < 30) return `il y a ${d} j`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

async function getJson(path, token) {
  const res = await fetch(`${API}/${path}`, {
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

export default function SiteNotificationBell() {
  const { user } = useAuthContext();
  const [items, setItems] = useState(null);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(new Set());
  const [fresh, setFresh] = useState(new Set());
  const ref = useRef(null);

  const load = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const since = Date.now() - RECENT_DAYS * 24 * 3600 * 1000;
    const [campaigns, orders, regs] = await Promise.all([
      getJson("campaigns/active"),
      user && token ? getJson("orders?limit=10&orderBy=updated_at&sortedBy=desc", token) : null,
      user && token ? getJson("campaign-registrations/mine", token) : null,
    ]);
    const out = [];
    for (const c of Array.isArray(campaigns) ? campaigns : []) {
      out.push({
        key: `camp-${c.id}`,
        tone: "live",
        live: true,
        title: "Campagne en cours",
        body: `${c.title}${c.cities?.length ? ` · ${c.cities.join(", ")}` : ""}`,
        href: "/campaigns",
        at: c.date_start ? new Date(c.date_start).toISOString() : null,
      });
    }
    for (const o of orders?.data ?? []) {
      const at = o.updated_at || o.created_at;
      if (at && new Date(at).getTime() < since) continue;
      const m = orderMessage(o);
      out.push({
        key: `order-${o.id}-${o.order_status}-${o.payment_status}`,
        tone: m.tone,
        title: m.title,
        body: `${o.tracking_number || `Commande #${o.id}`} · ${fcfa(o.total)}`,
        href: `/orders/${o.id}`,
        at,
      });
    }
    for (const r of Array.isArray(regs) ? regs : regs?.data ?? []) {
      const at = r.picked_up_at || r.created_at;
      if (at && new Date(at).getTime() < since) continue;
      out.push({
        key: `reg-${r.id}-${r.picked_up ? 1 : 0}`,
        tone: r.picked_up ? "green" : "pink",
        title: r.picked_up ? "Kit retiré" : "Inscription confirmée · kit à retirer",
        body: `${r.campaign_title}${r.pickup_center_name ? ` · ${r.pickup_center_name}` : ""}`,
        href: "/orders",
        at,
      });
    }
    out.sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));
    setItems(out);
  }, [user]);

  useEffect(() => {
    setSeen(readSeen());
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const unread = useMemo(() => (items || []).filter((i) => !seen.has(i.key)), [items, seen]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && items) {
      setFresh(new Set(unread.map((i) => i.key)));
      const all = new Set(seen);
      items.forEach((i) => all.add(i.key));
      setSeen(all);
      writeSeen(all);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={unread.length ? `Notifications : ${unread.length} non lue${unread.length > 1 ? "s" : ""}` : "Notifications"}
        aria-expanded={open}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full transition ${
          open ? "bg-[#1F1B16] text-white" : "bg-white text-slate-700 ring-1 ring-[#F3D9E5] shadow-sm"
        }`}
      >
        <BellIcon className="h-[20px] w-[20px]" />
        {unread.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-[#FF6EA9] to-[#C2185B] px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-3 top-[84px] z-[70] overflow-hidden rounded-[26px] border border-[#F3E3EA] bg-[#FFFDFB] shadow-[0_30px_60px_-20px_rgba(15,23,42,0.35)]"
          >
            <div className="flex items-center justify-between border-b border-[#F6E9EF] bg-gradient-to-b from-[#FFF4F8] to-[#FFFDFB] px-5 py-4">
              <div>
                <p className="text-[15px] font-semibold text-slate-900">Notifications</p>
                <p className="text-xs text-slate-500">
                  {user ? "Vos commandes, vos kits et les campagnes en cours" : "Campagnes en cours · connectez-vous pour suivre vos commandes"}
                </p>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
              {!items ? (
                <p className="px-6 py-10 text-center text-sm text-slate-500">Chargement…</p>
              ) : items.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FFE4F0] text-[#C2185B]">
                    <BellIcon className="h-6 w-6" />
                  </span>
                  <p className="mt-3 text-sm font-medium text-slate-800">Aucune notification</p>
                  <p className="mt-1 text-xs text-slate-500">Vous êtes à jour.</p>
                </div>
              ) : (
                <ul className="divide-y divide-[#F7EEF2]">
                  {items.map((i) => (
                    <li key={i.key}>
                      <Link href={i.href} onClick={() => setOpen(false)} className="flex gap-3 px-5 py-3.5 transition active:bg-[#FFF4F8]">
                        <span className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${TONES[i.tone] || TONES.pink}`}>
                          {i.live ? (
                            <span className="relative flex h-3 w-3">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-60" />
                              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#22C55E]" />
                            </span>
                          ) : (
                            <BellIcon className="h-[18px] w-[18px]" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start gap-2">
                            <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-slate-900">{i.title}</span>
                            {fresh.has(i.key) && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#FF6EA9]" aria-label="Nouveau" />}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-slate-500">{i.body}</span>
                          {i.at && <span className="mt-1 block text-[11px] text-slate-400">{ago(i.at)}</span>}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {!user && (
              <div className="border-t border-[#F6E9EF] p-3">
                <Link
                  href="/login"
                  onClick={() => {
                    try {
                      localStorage.setItem("redirect_after_login", window.location.pathname);
                    } catch {}
                    setOpen(false);
                  }}
                  className="block rounded-2xl bg-slate-900 py-3 text-center text-sm font-semibold text-white"
                >
                  Se connecter
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
