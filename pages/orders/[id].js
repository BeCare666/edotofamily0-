"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  MapPin,
  User,
  Loader2,
  Search,
  LocateFixed,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import OrderProgressBar from "../../components/OrderProgressBar";
import PickupPointPicker from "../../components/PickupPointPicker";
import OrderStepsBar from "../../components/OrderStepsBar";
import dynamic from "next/dynamic";
const FeexPayModal = dynamic(() => import("../../components/FeexPayModal"), { ssr: false });
//import PickupMapModal from "../pickupmap/PickupMapModal";
const PickupMapModal = dynamic(
  () => import("../../components/pickupmap/PickupMapModal"),
  { ssr: false }
);

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

  const getStatusIcon = (status) => {
    switch (status) {
      case "order-completed":
        return <CheckCircle className="text-green-500" size={22} />;
      case "order-processing":
        return <Clock className="text-blue-500" size={22} />;
      case "order-out-for-delivery":
        return <Truck className="text-purple-500" size={22} />;
      case "order-cancelled":
        return <XCircle className="text-red-500" size={22} />;
      default:
        return <Package className="text-gray-400" size={22} />;
    }
  };

  if (loading)
    return (
      <main className="flex items-center justify-center h-screen text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Chargement de la commande...
      </main>
    );

  if (!order)
    return (
      <main className="flex flex-col items-center justify-center h-screen text-gray-500">
        <XCircle size={40} className="text-red-400 mb-4" />
        <p>Commande introuvable</p>
      </main>
    );

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-[#fff5f8] to-[#ffe4ef] px-4 pt-10 pb-48 sm:pb-36">
      <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-2xl border border-white/40  p-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-[#FF6EA9] transition"
          >
            <ArrowLeft size={18} className="mr-2" /> Retour
          </button>
          <h1 className="text-2xl font-bold text-[#0F172A]">
            Détails
          </h1>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* INFOS COMMANDE */}
        {/* ------------------------------------------------------------------- */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500">Numéro de suivi</p>
            <p className="font-semibold text-[#0F172A]">{order.tracking_number}</p>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-semibold">
              {new Date(order.created_at).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500">Statut</p>
            {order?.order_status && (
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(order.order_status)}
                <span className="font-semibold capitalize">
                  {order.order_status.replace("order-", "").replace(/-/g, " ")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------------- **/}
        {/* PRODUITS */}
        {/* ------------------------------------------------------------------- */}

        <motion.div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-10">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="text-[#FF6EA9]" /> Produits
          </h2>

          {order.products?.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {order.products.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between py-3 flex-wrap"
                >
                  <div className="flex items-center gap-3">
                    {item.image?.[0] ? (
                      <img
                        src={item.image[0]}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover border"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                        <Package size={20} />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        Qté : {item.quantity} × {item.subtotal.toFixed(2) / item.quantity} FCFA
                      </p>
                    </div>
                  </div>

                  <p className="font-semibold text-[#0F172A]">
                    {item.subtotal.toFixed(2)} FCFA
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Aucun produit</p>
          )}
        </motion.div>

        {/* ------------------------------------------------------------------- */}
        {/* ADRESSES */}
        {/* ------------------------------------------------------------------- */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {order.delivery_type === "CUSTOM" ? (
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Truck className="text-[#FF6EA9]" /> Livraison à domicile
              </h2>
              {order.custom_delivery ? (
                <>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{order.custom_delivery.description}</p>
                  <p className="text-sm text-gray-500 mt-1">Téléphone : {order.custom_delivery.phone}</p>
                  <p className="text-sm text-gray-500">
                    Distance : {String(order.custom_delivery.distance_km).replace(".", ",")} km
                  </p>
                  {order.payment_status === "payment-success" && !order.custom_delivery.delivered_at && (
                    <p className="text-sm mt-2 font-medium text-[#0F172A]">
                      {order.custom_delivery.courier_assigned
                        ? "Un livreur a été désigné : il vous demandera votre code de retrait à la remise."
                        : "Nous cherchons un livreur pour votre colis."}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">Lieu de livraison enregistré.</p>
              )}
            </div>
          ) : (
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MapPin className="text-[#FF6EA9]" /> Adresse de retrait
            </h2>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {order.pickup_point
                ? order.pickup_point.name
                : order.note
                  ? order.note
                  : "Non spécifiée"}
            </p>
          </div>
          )}
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="text-[#FF6EA9]" /> Client
            </h2>
            <p className="text-sm text-gray-700">
              {order.pickupRowsCustomer.name || "Non spécifié"}
            </p>
            <p className="text-sm text-gray-500">{order.customer_contact}</p>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* PAIEMENT */}
        {/* ------------------------------------------------------------------- */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CreditCard className="text-[#FF6EA9]" /> Paiement
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Montant total</p>
              <p className="font-semibold">{order.total?.toFixed(2)} FCFA</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Taxe</p>
              <p className="font-semibold">{order.sales_tax?.toFixed(2)} FCFA</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Frais de livraison</p>
              <p className="font-semibold">
                {order.delivery_fee?.toFixed(2) || "0.00"} FCFA
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Statut</p>
              {order?.payment_status && (
                <p className="font-semibold capitalize">
                  {order.payment_status.replace("payment-", "").replace(/-/g, " ")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* CODE DE RETRAIT */}
        {/* ------------------------------------------------------------------- */}

        {order.payment_status === "payment-success" && (() => {
          const withdrawn = Number(order.otp_used) === 1 || order.order_status === "order-completed" || !!order.delivered_at;
          const expiresAt = order.otp_expires_at ? new Date(order.otp_expires_at) : null;
          const expired = !!expiresAt && expiresAt.getTime() < Date.now();
          const formatDate = (d) => d.toLocaleString("fr-FR", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" });

          return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clock className="text-[#FF6EA9]" /> Code de retrait
              </h2>
              {withdrawn ? (
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle size={18} /> Commande retirée
                  {order.delivered_at ? ` le ${formatDate(new Date(order.delivered_at))}` : ""}.
                </p>
              ) : expired ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-sm text-gray-700">
                    Votre code de retrait a expiré le {formatDate(expiresAt)}. Générez-en un nouveau : il vous sera envoyé par e-mail.
                  </p>
                  <button
                    onClick={regenerateOtp}
                    disabled={regeneratingOtp}
                    className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#FF6EA9] text-white text-sm font-semibold hover:bg-[#ff579d] disabled:opacity-60 transition"
                  >
                    {regeneratingOtp && <Loader2 size={16} className="animate-spin" />}
                    {regeneratingOtp ? "Envoi…" : "Générer un nouveau code"}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-700">
                  Votre code vous a été envoyé par e-mail
                  {expiresAt ? `. Il est valable jusqu'au ${formatDate(expiresAt)}` : ""}.
                  Présentez-le à votre point de retrait.
                </p>
              )}
            </div>
          );
        })()}
      </div>

      <motion.button
        onClick={() => router.back()}
        className="fixed bottom-[150px] sm:bottom-[110px] left-4 z-40 w-12 h-12 rounded-full bg-[#FF6EA9]/20 backdrop-blur-md border border-white/30 
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
