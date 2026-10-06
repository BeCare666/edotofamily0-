"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  MapPin,
  User,
  Loader2,
  Check,
  Wallet,
  KeyRound,
  Navigation,
  PackageCheck,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import OrderProgressBar from "../../components/OrderProgressBar";
import PickupPointPicker from "../../components/PickupPointPicker";
import OrderStepsBar, { orderSteps } from "../../components/OrderStepsBar";
import dynamic from "next/dynamic";
const FeexPayModal = dynamic(() => import("../../components/FeexPayModal"), { ssr: false });
//import PickupMapModal from "../pickupmap/PickupMapModal";
const PickupMapModal = dynamic(
  () => import("../../components/pickupmap/PickupMapModal"),
  { ssr: false }
);

// Libellés identiques à « Mes commandes » (pages/orders.js)
const ORDER_STATUS = {
  "order-pending": { label: "En attente", tone: "amber", icon: Clock },
  "order-processing": { label: "En traitement", tone: "sky", icon: RotateCcw },
  "order-at-local-facility": { label: "Au point de retrait", tone: "violet", icon: MapPin },
  "order-out-for-delivery": { label: "En livraison", tone: "violet", icon: Truck },
  "order-completed": { label: "Retirée / livrée", tone: "green", icon: CheckCircle2 },
  "order-cancelled": { label: "Annulée", tone: "slate", icon: XCircle },
  "order-refunded": { label: "Remboursée", tone: "slate", icon: RotateCcw },
  "order-failed": { label: "Échouée", tone: "red", icon: XCircle },
};
const PAYMENT_STATUS = {
  "payment-success": { label: "Payée", tone: "green" },
  "payment-pending": { label: "Paiement en attente", tone: "amber" },
  "payment-processing": { label: "Paiement en cours", tone: "sky" },
  "payment-failed": { label: "Paiement échoué", tone: "red" },
  "payment-cash-on-delivery": { label: "Paiement à la livraison", tone: "slate" },
  "payment-cash": { label: "Espèces", tone: "slate" },
  "payment-wallet": { label: "Portefeuille", tone: "slate" },
  "payment-awaiting-for-approval": { label: "En attente de validation", tone: "amber" },
};
const TONE = {
  amber: "bg-amber-50 text-amber-700 ring-amber-200/70",
  sky: "bg-sky-50 text-sky-700 ring-sky-200/70",
  violet: "bg-violet-50 text-violet-700 ring-violet-200/70",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  slate: "bg-slate-100 text-slate-600 ring-slate-200/70",
  red: "bg-rose-50 text-rose-700 ring-rose-200/70",
};
// Mêmes tons sur fond sombre (carte principale)
const DARK_TONE = {
  amber: "bg-amber-400/15 text-amber-200 ring-amber-300/25",
  sky: "bg-sky-400/15 text-sky-200 ring-sky-300/25",
  violet: "bg-violet-400/15 text-violet-200 ring-violet-300/25",
  green: "bg-emerald-400/15 text-emerald-200 ring-emerald-300/25",
  slate: "bg-white/10 text-white/75 ring-white/15",
  red: "bg-rose-400/15 text-rose-200 ring-rose-300/25",
};
const fcfa = (n) => `${Math.round(Number(n) || 0).toLocaleString("fr-FR")} FCFA`;
const fmtLong = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const fmtShortTime = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
const formatDateTime = (d) => d.toLocaleString("fr-FR", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" });

export default function OrderDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shopModalButton, setShopModalButton] = useState(false);
  // 🔥 Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenConfirm, setmodalOpenConfirm] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isShowEndOrders, setIsShowEndOrders] = useState(false);
  const [isSetData, setIsSetData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openMap, setOpenMap] = useState(false);
  const [mapCoords, setMapCoords] = useState(null);
  const [regeneratingOtp, setRegeneratingOtp] = useState(false);
  useEffect(() => {
    if (id) fetchOrderDetails(id);
  }, [id]);
  useEffect(() => {
    if (!isSetData || !order) return;

    setPaymentData({
      orderId: order.id,
      publicKey: process.env.NEXT_PUBLIC_FEEXPAY_PUBLIC_KEY,
      reference: order.tracking_number,
      amount: order.total,
      currency: "XOF",
    });

    setIsPaymentOpen(true);
  }, [isSetData, order]);

  const fetchOrderDetails = async (id) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vous devez être connecté pour voir les détails de la commande.");
        router.push("/login");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/orders/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      //console.log("viens vois", data)

      setOrder({
        ...data,
        products: (data.products || []).map((p) => ({
          ...p,
          subtotal: Number(p.subtotal || 0),
          quantity: Number(p.quantity || 0),
        })),
      });

      // ⚠️ C’est bien data.status (et pas data.order_status)
      const hasPickupPoint = Boolean(data.pickup_point_id);
      const hasNote = Boolean(data.note && data.note.trim() !== "");
      const isProcessing = data.order_status === "order-processing";
      const isPendingPayment = data.order_status === "order-pending";
      console.log("voici data", data.order_status)
      // 👉 1. Choix du point de retrait
      // (une livraison à domicile a déjà son lieu, choisi et payé avant le paiement)
      if (!hasPickupPoint && isProcessing && !hasNote && data.delivery_type !== "CUSTOM") {
        setShopModalButton(true);
        setModalOpen(true);
        return;
      }

      // 👉 2. Paiement
      if (isPendingPayment) {
        setShopModalButton(true);
        setIsShowEndOrders(true);
      }

      // 👉 3. Rien à afficher
      setModalOpen(false);
      setShopModalButton(false);


    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  // Nouveau code de retrait : l'API revérifie que le code a expiré et que le retrait n'a pas eu lieu
  const regenerateOtp = async () => {
    if (regeneratingOtp) return;
    setRegeneratingOtp(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/orders/${id}/regenerate-otp`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.message || "Impossible de générer un nouveau code.");
        return;
      }
      toast.success(data.message || "Un nouveau code vous a été envoyé par e-mail.");
      fetchOrderDetails(id);
    } catch (e) {
      toast.error("Erreur réseau. Veuillez réessayer.");
    } finally {
      setRegeneratingOtp(false);
    }
  };

  const handleFinalize = () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setIsSetData(true);
  };

  // 🟣 UPDATE pickup point
  const selectPickupPoint = async (pickupPointId) => {
    const token = localStorage.getItem("token");
    console.log('les id', pickupPointId, id)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/orders/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pickup_point_id: pickupPointId,
            note: null,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      // ❌ Erreur serveur
      if (!response.ok) {
        toast.error(data?.message || "Impossible de mettre à jour le point de retrait.");
        return;
      }

      // ✔️ Succès
      //toast.success("Point de retrait sélectionné avec succès !");
      setmodalOpenConfirm(true)
      setModalOpen(false);
      //console.log(modalOpen)
      fetchOrderDetails(id);
      console.log("voici les datats", order)
    } catch (e) {
      console.error("Erreur:", e);

      // ❌ Erreur réseau ou crash côté client
      toast.error("Erreur réseau. Veuillez réessayer.");
    }
  };

  if (loading)
    return (
      <main className="min-h-screen bg-[radial-gradient(1200px_500px_at_10%_-10%,#FFE4F0_0%,transparent_60%),radial-gradient(900px_400px_at_100%_0%,#E0F2FE_0%,transparent_55%)] px-4 pt-8">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="h-5 w-40 animate-pulse rounded-full bg-white/80" />
          <div className="h-56 animate-pulse rounded-[32px] bg-slate-200/70" />
          <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
            <div className="h-72 animate-pulse rounded-[28px] bg-white/80" />
            <div className="h-72 animate-pulse rounded-[28px] bg-white/80" />
          </div>
          <p className="flex items-center justify-center gap-2 pt-2 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" /> Chargement de la commande…
          </p>
        </div>
      </main>
    );

  if (!order)
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-500">
          <XCircle size={30} strokeWidth={1.6} />
        </span>
        <p className="mt-4 text-[15px] font-semibold text-slate-800">Commande introuvable</p>
        <button onClick={() => router.push("/orders")} className="mt-5 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">
          Mes commandes
        </button>
      </main>
    );

  const st = ORDER_STATUS[order.order_status] || { label: order.order_status || "—", tone: "slate", icon: Package };
  const pay = PAYMENT_STATUS[order.payment_status] || { label: order.payment_status || "—", tone: "slate" };
  const StIcon = st.icon;
  const isCustom = order.delivery_type === "CUSTOM";
  const products = order.products || [];
  const itemsTotal = products.reduce((s, p) => s + (Number(p.subtotal) || 0), 0);
  const itemsCount = products.reduce((s, p) => s + (Number(p.quantity) || 0), 0);
  const { paid, hasPoint, pointChosen, withdrawn } = orderSteps(order);
  const stopped = ["order-cancelled", "order-refunded", "order-failed"].includes(order.order_status);
  const timeline = [
    { key: "created", label: "Commandée", icon: Package, done: true, date: order.created_at },
    { key: "paid", label: "Payée", icon: CreditCard, done: paid },
    { key: "point", label: isCustom ? "Lieu de livraison" : "Point de retrait", icon: isCustom ? Truck : MapPin, done: pointChosen },
    { key: "out", label: isCustom ? "Livrée" : "Retirée", icon: PackageCheck, done: withdrawn, date: order.delivered_at || order.custom_delivery?.delivered_at },
  ];
  const lastDone = timeline.reduce((acc, s, i) => (s.done ? i : acc), 0);
  const canVisit = hasPoint && !withdrawn && order?.pickup_point?.pickup_lat != null && order?.pickup_point?.pickup_lng != null;

  return (
    <main className="min-h-screen bg-[radial-gradient(1200px_500px_at_10%_-10%,#FFE4F0_0%,transparent_60%),radial-gradient(900px_400px_at_100%_0%,#E0F2FE_0%,transparent_55%)] px-4 pb-52 pt-6 sm:px-6 sm:pb-40 sm:pt-10">
      <div className="mx-auto max-w-5xl">
        {/* Fil */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex items-center justify-between">
          <button
            onClick={() => router.push("/orders")}
            className="group inline-flex items-center gap-2 rounded-full bg-white/80 py-2 pl-2.5 pr-4 text-[13px] font-medium text-slate-700 ring-1 ring-slate-200/80 backdrop-blur transition hover:text-[#C2185B]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 transition group-hover:bg-[#FFE4F0]">
              <ArrowLeft size={15} />
            </span>
            Mes commandes
          </button>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E0457F]">Détail de la commande</p>
        </motion.div>

        {/* Carte principale */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[32px] bg-slate-950 p-6 text-white shadow-[0_40px_80px_-40px_rgba(15,23,42,0.75)] sm:p-8"
        >
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#FF6EA9]/30 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-sky-400/15 blur-[90px]" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">Commande</p>
              <h1 className="mt-1.5 break-all text-[26px] font-semibold leading-tight tracking-tight sm:text-[32px]">{order.tracking_number}</h1>
              <p className="mt-1 text-[13px] text-white/55">
                Passée le {fmtLong(order.created_at)} · {itemsCount} article{itemsCount > 1 ? "s" : ""}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ${DARK_TONE[st.tone]}`}>
                  <StIcon size={12} /> {st.label}
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ${DARK_TONE[pay.tone]}`}>
                  <Wallet size={12} /> {pay.label}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80 ring-1 ring-white/15">
                  {isCustom ? <Truck size={12} /> : <MapPin size={12} />} {isCustom ? "Livraison à domicile" : "Point de retrait"}
                </span>
              </div>
            </div>
            <div className="shrink-0 sm:text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">Total</p>
              <p className="mt-1 text-[34px] font-semibold leading-none tabular-nums sm:text-[40px]">{fcfa(order.total)}</p>
              {Number(order.delivery_fee) > 0 && <p className="mt-1.5 text-[12px] text-white/50">dont livraison {fcfa(order.delivery_fee)}</p>}
            </div>
          </div>

          {/* Étapes réelles de la commande */}
          {stopped ? (
            <p className="relative mt-7 flex items-center gap-2 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200 ring-1 ring-rose-400/20">
              <XCircle size={17} /> Commande {ORDER_STATUS[order.order_status]?.label.toLowerCase() || "arrêtée"}.
            </p>
          ) : (
            <ol className="relative mt-8 grid grid-cols-4">
              {timeline.map((s, i) => {
                const Icon = s.icon;
                const current = !s.done && i === lastDone + 1;
                return (
                  <li key={s.key} className="relative flex flex-col items-center text-center">
                    {i > 0 && (
                      <span className="absolute right-1/2 top-[19px] h-[3px] w-full overflow-hidden rounded-full bg-white/10">
                        <motion.span
                          className="block h-full rounded-full bg-gradient-to-r from-[#FF9CC6] to-[#FF6EA9]"
                          initial={{ width: 0 }}
                          animate={{ width: s.done ? "100%" : "0%" }}
                          transition={{ duration: 0.7, delay: 0.15 * i, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </span>
                    )}
                    <span
                      className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                        s.done
                          ? "border-transparent bg-gradient-to-br from-[#FF9CC6] to-[#C2185B] text-white shadow-[0_8px_20px_-6px_rgba(255,110,169,0.7)]"
                          : current
                            ? "border-[#FF6EA9] bg-slate-950 text-[#FF9CC6] shadow-[0_0_0_5px_rgba(255,110,169,0.15)]"
                            : "border-white/15 bg-slate-950 text-white/35"
                      }`}
                    >
                      {s.done ? <Check size={17} strokeWidth={3} /> : <Icon size={16} />}
                    </span>
                    <span className={`mt-2 px-1 text-[11px] font-semibold leading-tight sm:text-[12px] ${s.done ? "text-white" : current ? "text-[#FFB8D5]" : "text-white/40"}`}>{s.label}</span>
                    {s.done && s.date && <span className="mt-0.5 hidden text-[10px] text-white/45 sm:block">{fmtShortTime(s.date)}</span>}
                  </li>
                );
              })}
            </ol>
          )}
        </motion.section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.55fr_1fr]">
          {/* Colonne principale */}
          <div className="space-y-5">
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }} className="overflow-hidden rounded-[28px] bg-white/90 ring-1 ring-slate-100 shadow-[0_18px_44px_-30px_rgba(15,23,42,0.45)] backdrop-blur">
              <div className="flex items-center justify-between px-5 pb-2 pt-5 sm:px-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Articles</p>
                <span className="text-[12px] text-slate-400">{products.length} produit{products.length > 1 ? "s" : ""}</span>
              </div>
              {products.length > 0 ? (
                <ul className="divide-y divide-slate-100/80 px-5 sm:px-6">
                  {products.map((item, index) => {
                    const unit = item.quantity ? Number(item.subtotal) / Number(item.quantity) : Number(item.price) || 0;
                    return (
                      <li key={index} className="flex items-center gap-4 py-4">
                        {item.image?.[0] ? (
                          <img src={item.image[0]} alt={item.name} className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-1 ring-slate-100" />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFE4F0] to-[#FFF6FA] text-[#E0457F]">
                            <Package size={22} strokeWidth={1.6} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-semibold text-slate-900">{item.name}</p>
                          <p className="mt-0.5 text-[12px] text-slate-500">
                            {item.quantity} × {fcfa(unit)}
                          </p>
                        </div>
                        <p className="shrink-0 text-[15px] font-semibold tabular-nums text-slate-900">{fcfa(item.subtotal)}</p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="px-6 pb-6 text-sm text-slate-500">Aucun produit</p>
              )}
              {/* Récapitulatif */}
              <dl className="space-y-2.5 border-t border-slate-100 bg-gradient-to-b from-slate-50/70 to-white px-5 py-5 text-[14px] sm:px-6">
                <div className="flex justify-between text-slate-600">
                  <dt>Articles</dt>
                  <dd className="tabular-nums">{fcfa(itemsTotal)}</dd>
                </div>
                <div className="flex justify-between text-slate-600">
                  <dt>{isCustom ? "Livraison à domicile" : "Retrait au point"}</dt>
                  <dd className="tabular-nums">{Number(order.delivery_fee) > 0 ? fcfa(order.delivery_fee) : "Offert"}</dd>
                </div>
                {Number(order.sales_tax) > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <dt>Taxe</dt>
                    <dd className="tabular-nums">{fcfa(order.sales_tax)}</dd>
                  </div>
                )}
                <div className="flex items-baseline justify-between border-t border-dashed border-slate-200 pt-3">
                  <dt className="text-[15px] font-semibold text-slate-900">Total</dt>
                  <dd className="text-[20px] font-semibold tabular-nums text-slate-900">{fcfa(order.total)}</dd>
                </div>
              </dl>
            </motion.section>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-5">
            {/* Code de retrait */}
            {order.payment_status === "payment-success" && (() => {
              const expiresAt = order.otp_expires_at ? new Date(order.otp_expires_at) : null;
              const expired = !!expiresAt && expiresAt.getTime() < Date.now();
              return (
                <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.08 } }} className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FF6EA9] to-[#C2185B] p-5 text-white shadow-[0_24px_50px_-28px_rgba(194,24,91,0.8)] sm:p-6">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
                  <p className="relative flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
                    <KeyRound size={14} /> Code de retrait
                  </p>
                  {withdrawn ? (
                    <p className="relative mt-3 flex items-center gap-2 text-[15px] font-semibold">
                      <CheckCircle size={19} /> Commande {isCustom ? "livrée" : "retirée"}
                      {order.delivered_at ? ` le ${formatDateTime(new Date(order.delivered_at))}` : ""}.
                    </p>
                  ) : expired ? (
                    <div className="relative mt-3">
                      <p className="text-[14px] leading-relaxed text-white/90">
                        Votre code a expiré le {formatDateTime(expiresAt)}. Générez-en un nouveau : il vous sera envoyé par e-mail.
                      </p>
                      <button
                        onClick={regenerateOtp}
                        disabled={regeneratingOtp}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#C2185B] transition hover:bg-white/90 disabled:opacity-60"
                      >
                        {regeneratingOtp && <Loader2 size={16} className="animate-spin" />}
                        {regeneratingOtp ? "Envoi…" : "Générer un nouveau code"}
                      </button>
                    </div>
                  ) : (
                    <p className="relative mt-3 text-[14px] leading-relaxed text-white/90">
                      Votre code vous a été envoyé par e-mail{expiresAt ? `. Il est valable jusqu'au ${formatDateTime(expiresAt)}` : ""}.{" "}
                      {isCustom ? "Donnez-le au livreur à la remise." : "Présentez-le à votre point de retrait."}
                    </p>
                  )}
                </motion.section>
              );
            })()}

            {/* Retrait ou livraison */}
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.11 } }} className="rounded-[28px] bg-white/90 p-5 ring-1 ring-slate-100 shadow-[0_18px_44px_-30px_rgba(15,23,42,0.45)] backdrop-blur sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{isCustom ? "Livraison à domicile" : "Retrait"}</p>
              {isCustom ? (
                order.custom_delivery ? (
                  <div className="mt-3 space-y-3">
                    <div className="flex gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-violet-50 text-violet-600"><Truck size={18} /></span>
                      <p className="whitespace-pre-line text-[14px] text-slate-700">{order.custom_delivery.description}</p>
                    </div>
                    <dl className="grid grid-cols-2 gap-2 text-[13px]">
                      <div className="rounded-2xl bg-slate-50 p-3"><dt className="text-slate-400">Téléphone</dt><dd className="font-medium text-slate-800">{order.custom_delivery.phone}</dd></div>
                      <div className="rounded-2xl bg-slate-50 p-3"><dt className="text-slate-400">Distance</dt><dd className="font-medium text-slate-800">{String(order.custom_delivery.distance_km).replace(".", ",")} km</dd></div>
                    </dl>
                    {order.payment_status === "payment-success" && !order.custom_delivery.delivered_at && (
                      <p className="rounded-2xl bg-violet-50/70 p-3 text-[13px] font-medium text-violet-800">
                        {order.custom_delivery.courier_assigned
                          ? "Un livreur a été désigné : il vous demandera votre code de retrait à la remise."
                          : "Nous cherchons un livreur pour votre colis."}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">Lieu de livraison enregistré.</p>
                )
              ) : (
                <div className="mt-3">
                  <div className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFE4F0] to-[#FFF6FA] text-[#E0457F]"><MapPin size={18} /></span>
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-slate-900">
                        {order.pickup_point ? order.pickup_point.name : order.note ? order.note : "Point de retrait à choisir"}
                      </p>
                      <p className="text-[12px] text-slate-500">{order.pickup_point ? "Point de retrait E·Doto" : order.note ? "Lieu personnalisé" : "Choisissez-le pour recevoir votre commande."}</p>
                    </div>
                  </div>
                  {canVisit && (
                    <button onClick={() => setOpenMap(true)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                      <Navigation size={16} /> Itinéraire vers le point
                    </button>
                  )}
                  {paid && !pointChosen && (
                    <button onClick={() => setModalOpen(true)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6EA9] to-[#C2185B] px-4 py-3 text-sm font-semibold text-white">
                      <MapPin size={16} /> Choisir un point de retrait
                    </button>
                  )}
                </div>
              )}
            </motion.section>

            {/* Client et paiement */}
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.14 } }} className="rounded-[28px] bg-white/90 p-5 ring-1 ring-slate-100 shadow-[0_18px_44px_-30px_rgba(15,23,42,0.45)] backdrop-blur sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Client et paiement</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-sky-50 text-sky-600"><User size={18} /></span>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-slate-900">{order.pickupRowsCustomer?.name || "Non spécifié"}</p>
                  {order.customer_contact && <p className="truncate text-[12px] text-slate-500">{order.customer_contact}</p>}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 p-3.5">
                <span className="flex items-center gap-2 text-[13px] text-slate-600"><CreditCard size={16} className="text-slate-400" /> Paiement</span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${TONE[pay.tone]}`}>{pay.label}</span>
              </div>
            </motion.section>
          </div>
        </div>
      </div>

      <motion.button
        onClick={() => router.back()}
        className="!hidden fixed bottom-[150px] sm:bottom-[110px] left-4 z-40 w-12 h-12 rounded-full bg-[#FF6EA9]/20 backdrop-blur-md border border-white/30 
             flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 transition-all"
        whileHover={{ rotate: -5 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#FF6EA9" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </motion.button>
      {/* --------------------------------------------------------------------- */}
      {/* MODAL PICKUP */}
      {/* --------------------------------------------------------------------- */}

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white shadow-2xl rounded-3xl p-5 sm:p-6 w-full max-w-2xl max-h-[92vh] overflow-y-auto mx-3"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Choisir un point de retrait</h2>
                <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-pink-500">
                  <XCircle size={26} />
                </button>
              </div>
              {/* Commande déjà payée : seul un point de retrait peut être choisi ici
                  (la livraison à domicile se choisit et se paie avant le paiement) */}
              <PickupPointPicker
                selectedId={order?.pickup_point_id}
                onSelect={(p) => selectPickupPoint(p.id)}
              />

            </motion.div>
          </motion.div>
        )}
        {modalOpenConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center"
            >
              {/* ICON */}
              <div className="flex justify-center mb-5">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-12 h-12 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4"
                    />
                  </svg>
                </div>
              </div>

              {/* TITRE */}
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                Point de retrait confirmé
              </h2>

              {/* MESSAGE */}
              <p className="text-slate-600 leading-relaxed text-sm">
                Votre point de retrait{" "}
                <span className="font-semibold text-slate-800">
                </span>{" "}
                a été choisi avec succès.
                <br />
                <br />
                Vous pourrez retirer votre colis à cet endroit en présentant votre
                <span className="font-semibold text-slate-800"> code OTP</span>.
              </p>

              {/* ACTION */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="
            px-6 py-3 rounded-full
            bg-gradient-to-r from-pink-500 to-pink-600
            text-white font-semibold
            shadow-[0_10px_25px_rgba(236,72,153,0.35)]
            hover:shadow-[0_16px_40px_rgba(236,72,153,0.45)]
            transition
          "
                >
                  Continuer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
      {/* ✅ Modal Feexpay */}
      {isPaymentOpen && (
        <FeexPayModal payment={paymentData} onClose={() => setIsPaymentOpen(false)} />
      )}
      {/*  <OrderProgressBar />*/}
      <OrderStepsBar
        order={order}
        canPay={isShowEndOrders}
        onPay={handleFinalize}
        paying={isSubmitting}
        onChoosePoint={() => setModalOpen(true)}
        onVisit={() => setOpenMap(true)}
      />

      <PickupMapModal
        open={openMap}
        onClose={() => setOpenMap(false)}
        pickupLat={order?.pickup_point?.pickup_lat}
        pickupLng={order?.pickup_point?.pickup_lng}
        name={order?.pickup_point?.name}
      />
    </main>
  );
}
