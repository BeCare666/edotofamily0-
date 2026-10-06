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
// Pastille de couleur discrète par ton de statut (palette sobre)
const DOT = {
  amber: "bg-[#C08A2B]",
  sky: "bg-[#4F7FA8]",
  violet: "bg-[#6E5A9B]",
  green: "bg-[#3F7A55]",
  slate: "bg-[#A8A29B]",
  red: "bg-[#B4232C]",
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
      const isPaid = data.payment_status === "payment-success";
      const isStopped = ["order-cancelled", "order-refunded", "order-failed"].includes(data.order_status);
      // Paiement en attente : selon le statut de paiement (une commande « en traitement » peut ne pas être payée)
      const isPendingPayment = !isPaid && !isStopped && (data.order_status === "order-pending" || data.payment_status === "payment-pending");
      // 👉 1. Choix du point de retrait : seulement une commande PAYÉE sans point
      // (le point se choisit normalement avant le paiement ; une livraison à domicile a déjà son lieu)
      if (isPaid && !isStopped && !hasPickupPoint && !hasNote && data.delivery_type !== "CUSTOM") {
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
      <main className="min-h-screen bg-[#FAF8F5] px-4 pt-10">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="h-4 w-32 animate-pulse rounded bg-[#EDE8E2]" />
          <div className="h-48 animate-pulse rounded-2xl border border-[#E7E2DC] bg-white" />
          <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
            <div className="h-72 animate-pulse rounded-2xl border border-[#E7E2DC] bg-white" />
            <div className="h-72 animate-pulse rounded-2xl border border-[#E7E2DC] bg-white" />
          </div>
          <p className="flex items-center justify-center gap-2 pt-2 text-sm text-[#8A847D]">
            <Loader2 size={15} className="animate-spin" /> Chargement de la commande…
          </p>
        </div>
      </main>
    );

  if (!order)
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-[#FAF8F5] px-6 text-center">
        <p className="font-brand text-[28px] font-semibold text-[#161412]">Commande introuvable</p>
        <button onClick={() => router.push("/orders")} className="mt-5 rounded-full bg-[#161412] px-6 py-2.5 text-sm font-medium text-white">
          Mes commandes
        </button>
      </main>
    );

  const st = ORDER_STATUS[order.order_status] || { label: order.order_status || "—", tone: "slate", icon: Package };
  const pay = PAYMENT_STATUS[order.payment_status] || { label: order.payment_status || "—", tone: "slate" };
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
  const current = timeline.findIndex((s) => !s.done);
  const canVisit = hasPoint && !withdrawn && order?.pickup_point?.pickup_lat != null && order?.pickup_point?.pickup_lng != null;
  const card = "rounded-2xl border border-[#E7E2DC] bg-white";

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 pb-52 pt-6 sm:px-6 sm:pb-40 sm:pt-10">
      <div className="mx-auto min-w-0 max-w-5xl">
        <button
          onClick={() => router.push("/orders")}
          className="inline-flex items-center gap-2 text-[13px] text-[#5E5953] underline-offset-4 transition hover:text-[#161412] hover:underline"
        >
          <ArrowLeft size={15} strokeWidth={1.8} /> Mes commandes
        </button>

        {/* En-tête de la commande */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${card} mt-5 p-6 sm:p-8`}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[13px] text-[#8A847D]">Commande du {fmtLong(order.created_at)}</p>
              <h1 className="mt-1 break-all font-brand text-[32px] font-semibold leading-tight text-[#161412] sm:text-[40px]">{order.tracking_number}</h1>
              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#5E5953]">
                <span className="inline-flex items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${DOT[st.tone]}`} />{st.label}</span>
                <span className="text-[#D5CFC8]">|</span>
                <span className="inline-flex items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${DOT[pay.tone]}`} />{pay.label}</span>
                <span className="text-[#D5CFC8]">|</span>
                <span>{isCustom ? "Livraison à domicile" : "Retrait en point"}</span>
              </p>
            </div>
            <div className="shrink-0 sm:text-right">
              <p className="text-[13px] text-[#8A847D]">Total</p>
              <p className="mt-1 font-brand text-[36px] font-semibold leading-none tabular-nums text-[#161412] sm:text-[42px]">{fcfa(order.total)}</p>
              <p className="mt-1.5 text-[12px] text-[#8A847D]">{itemsCount} article{itemsCount > 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* Étapes réelles de la commande */}
          {stopped ? (
            <p className="mt-7 flex items-center gap-2 border-t border-[#EDE8E2] pt-5 text-sm text-[#B4232C]">
              <XCircle size={16} strokeWidth={1.8} /> Commande {ORDER_STATUS[order.order_status]?.label.toLowerCase() || "arrêtée"}.
            </p>
          ) : (
            <ol className="mt-8 grid grid-cols-4 border-t border-[#EDE8E2] pt-7">
              {timeline.map((s, i) => {
                const Icon = s.icon;
                const isCurrent = i === current;
                return (
                  <li key={s.key} className="relative flex flex-col items-center text-center">
                    {i > 0 && (
                      <span className="absolute right-1/2 top-[15px] h-px w-full bg-[#E2DCD5]">
                        <motion.span
                          className="block h-full bg-[#161412]"
                          initial={{ width: 0 }}
                          animate={{ width: s.done ? "100%" : "0%" }}
                          transition={{ duration: 0.6, delay: 0.12 * i, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </span>
                    )}
                    <span
                      className={`relative z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full border ${
                        s.done ? "border-[#161412] bg-[#161412] text-white" : isCurrent ? "border-[#D6457F] bg-white text-[#D6457F]" : "border-[#E2DCD5] bg-white text-[#B5AEA6]"
                      }`}
                    >
                      {s.done ? <Check size={14} strokeWidth={2.5} /> : <Icon size={14} strokeWidth={1.8} />}
                    </span>
                    <span className={`mt-2 px-1 text-[11px] leading-tight sm:text-[13px] ${s.done || isCurrent ? "font-medium text-[#161412]" : "text-[#A8A29B]"}`}>{s.label}</span>
                    {s.done && s.date && <span className="mt-0.5 hidden text-[11px] text-[#8A847D] sm:block">{fmtShortTime(s.date)}</span>}
                  </li>
                );
              })}
            </ol>
          )}
        </motion.section>

        <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          {/* Articles et récapitulatif */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }} className={`${card} min-w-0 self-start`}>
            <h2 className="px-6 pt-6 font-brand text-[24px] font-semibold text-[#161412]">Articles</h2>
            {products.length > 0 ? (
              <ul className="mt-2 divide-y divide-[#EDE8E2] px-6">
                {products.map((item, index) => {
                  const unit = item.quantity ? Number(item.subtotal) / Number(item.quantity) : Number(item.price) || 0;
                  return (
                    <li key={index} className="flex items-center gap-4 py-4">
                      {item.image?.[0] ? (
                        <img src={item.image[0]} alt={item.name} className="h-16 w-16 shrink-0 rounded-lg border border-[#EDE8E2] object-cover" />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[#F4F1ED] text-[#A8A29B]">
                          <Package size={20} strokeWidth={1.5} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-medium text-[#161412]">{item.name}</p>
                        <p className="mt-0.5 text-[13px] text-[#8A847D]">{item.quantity} × {fcfa(unit)}</p>
                      </div>
                      <p className="shrink-0 text-[15px] tabular-nums text-[#161412]">{fcfa(item.subtotal)}</p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-6 py-4 text-sm text-[#8A847D]">Aucun produit</p>
            )}
            <dl className="space-y-2.5 border-t border-[#EDE8E2] px-6 py-5 text-[14px]">
              <div className="flex justify-between text-[#5E5953]">
                <dt>Articles</dt>
                <dd className="tabular-nums">{fcfa(itemsTotal)}</dd>
              </div>
              <div className="flex justify-between text-[#5E5953]">
                <dt>{isCustom ? "Livraison à domicile" : "Retrait en point"}</dt>
                <dd className="tabular-nums">{Number(order.delivery_fee) > 0 ? fcfa(order.delivery_fee) : "Offert"}</dd>
              </div>
              {Number(order.sales_tax) > 0 && (
                <div className="flex justify-between text-[#5E5953]">
                  <dt>Taxe</dt>
                  <dd className="tabular-nums">{fcfa(order.sales_tax)}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-[#EDE8E2] pt-3">
                <dt className="font-medium text-[#161412]">Total</dt>
                <dd className="font-brand text-[24px] font-semibold tabular-nums text-[#161412]">{fcfa(order.total)}</dd>
              </div>
            </dl>
          </motion.section>

          <div className="min-w-0 space-y-5">
            {/* Code de retrait (commande payée) */}
            {order.payment_status === "payment-success" && (() => {
              const expiresAt = order.otp_expires_at ? new Date(order.otp_expires_at) : null;
              const expired = !!expiresAt && expiresAt.getTime() < Date.now();
              return (
                <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.08 } }} className={`${card} p-6`}>
                  <h2 className="flex items-center gap-2 font-brand text-[22px] font-semibold text-[#161412]">
                    <KeyRound size={17} strokeWidth={1.6} className="text-[#D6457F]" /> Code de retrait
                  </h2>
                  {withdrawn ? (
                    <p className="mt-3 flex items-center gap-2 text-[14px] text-[#3A3632]">
                      <CheckCircle size={16} strokeWidth={1.8} /> Commande {isCustom ? "livrée" : "retirée"}
                      {order.delivered_at ? ` le ${formatDateTime(new Date(order.delivered_at))}` : ""}.
                    </p>
                  ) : expired ? (
                    <div className="mt-3">
                      <p className="text-[14px] leading-relaxed text-[#5E5953]">
                        Votre code a expiré le {formatDateTime(expiresAt)}. Générez-en un nouveau : il vous sera envoyé par e-mail.
                      </p>
                      <button
                        onClick={regenerateOtp}
                        disabled={regeneratingOtp}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#161412] px-4 py-3 text-sm font-medium text-white transition hover:bg-black disabled:opacity-60"
                      >
                        {regeneratingOtp && <Loader2 size={16} className="animate-spin" />}
                        {regeneratingOtp ? "Envoi…" : "Générer un nouveau code"}
                      </button>
                    </div>
                  ) : (
                    <p className="mt-3 text-[14px] leading-relaxed text-[#5E5953]">
                      Votre code vous a été envoyé par e-mail{expiresAt ? `. Il est valable jusqu'au ${formatDateTime(expiresAt)}` : ""}.{" "}
                      {isCustom ? "Donnez-le au livreur à la remise." : "Présentez-le à votre point de retrait."}
                    </p>
                  )}
                </motion.section>
              );
            })()}

            {/* Retrait ou livraison */}
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.11 } }} className={`${card} p-6`}>
              <h2 className="font-brand text-[22px] font-semibold text-[#161412]">{isCustom ? "Livraison à domicile" : "Retrait"}</h2>
              {isCustom ? (
                order.custom_delivery ? (
                  <div className="mt-3 space-y-3 text-[14px]">
                    <p className="whitespace-pre-line text-[#3A3632]">{order.custom_delivery.description}</p>
                    <dl className="grid grid-cols-2 gap-4 border-t border-[#EDE8E2] pt-3 text-[13px]">
                      <div><dt className="text-[#8A847D]">Téléphone</dt><dd className="text-[#161412]">{order.custom_delivery.phone}</dd></div>
                      <div><dt className="text-[#8A847D]">Distance</dt><dd className="text-[#161412]">{String(order.custom_delivery.distance_km).replace(".", ",")} km</dd></div>
                    </dl>
                    {order.payment_status === "payment-success" && !order.custom_delivery.delivered_at && (
                      <p className="text-[13px] text-[#5E5953]">
                        {order.custom_delivery.courier_assigned
                          ? "Un livreur a été désigné : il vous demandera votre code de retrait à la remise."
                          : "Nous cherchons un livreur pour votre colis."}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[#8A847D]">Lieu de livraison enregistré.</p>
                )
              ) : (
                <div className="mt-3">
                  <p className="text-[15px] font-medium text-[#161412]">
                    {order.pickup_point ? order.pickup_point.name : order.note ? order.note : "Aucun point de retrait"}
                  </p>
                  <p className="mt-0.5 text-[13px] text-[#8A847D]">
                    {order.pickup_point ? "Point de retrait E·Doto" : order.note ? "Lieu personnalisé" : paid ? "Choisissez-le pour recevoir votre commande." : "Disponible après le paiement de la commande."}
                  </p>
                  {canVisit && (
                    <button onClick={() => setOpenMap(true)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#E2DCD5] px-4 py-3 text-sm font-medium text-[#161412] transition hover:border-[#161412]">
                      <Navigation size={15} strokeWidth={1.8} /> Itinéraire vers le point
                    </button>
                  )}
                  {paid && !pointChosen && !stopped && (
                    <button onClick={() => setModalOpen(true)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#161412] px-4 py-3 text-sm font-medium text-white">
                      <MapPin size={15} strokeWidth={1.8} /> Choisir un point de retrait
                    </button>
                  )}
                </div>
              )}
            </motion.section>

            {/* Client et paiement */}
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.14 } }} className={`${card} p-6`}>
              <h2 className="font-brand text-[22px] font-semibold text-[#161412]">Client</h2>
              <p className="mt-3 truncate text-[15px] font-medium text-[#161412]">{order.pickupRowsCustomer?.name || "Non spécifié"}</p>
              {order.customer_contact && <p className="truncate text-[13px] text-[#8A847D]">{order.customer_contact}</p>}
              <div className="mt-4 flex items-center justify-between border-t border-[#EDE8E2] pt-4 text-[13px]">
                <span className="text-[#8A847D]">Paiement</span>
                <span className="inline-flex items-center gap-1.5 text-[#161412]"><span className={`h-1.5 w-1.5 rounded-full ${DOT[pay.tone]}`} />{pay.label}</span>
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
                <div className="w-16 h-16 rounded-full bg-[#161412] flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-9 h-9 text-white"
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
                  className="px-8 py-3 rounded-full bg-[#161412] text-white font-medium transition hover:bg-black"
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
