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
import dynamic from "next/dynamic";
const FeexPayModal = dynamic(() => import("../../components/FeexPayModal"), { ssr: false });
//import PickupMapModal from "../pickupmap/PickupMapModal";
const PickupMapModal = dynamic(
  () => import("../../components/pickupmap/PickupMapModal"),
  { ssr: false }
);
// 🟣 CONFIG
const PAGE_SIZE = 6;

export default function OrderDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cashselectpickuppoint, setCashselectpickuppoint] = useState(true);
  const [shopModalButton, setShopModalButton] = useState(false);
  // 🔥 Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenConfirm, setmodalOpenConfirm] = useState(false);
  // 🟣 Pickup points
  const [pickupPoints, setPickupPoints] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [customNote, setCustomNote] = useState("");
  const [paymentData, setPaymentData] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isShowEndOrders, setIsShowEndOrders] = useState(false);
  const [isSetData, setIsSetData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openMap, setOpenMap] = useState(false);
  const [mapCoords, setMapCoords] = useState(null);
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
      console.log("viens vois", data)

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

      // 👉 1. Choix du point de retrait
      if (!hasPickupPoint && isProcessing && !hasNote) {
        setShopModalButton(true);
        fetchPickupPoints();
        setModalOpen(true);
        return;
      }

      // 👉 2. Paiement
      if (isPendingPayment) {
        setShopModalButton(true);
        fetchPickupPoints();
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

  const handleFinalize = () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setIsSetData(true);
  };

  const fetchPickupPoints = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/users?role=super_pickuppoint&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      console.log('data', data)

      setPickupPoints(Array.isArray(data.data) ? data.data : []);;
    } catch (e) {
      console.error("Erreur:", e);
    }
  };

  // function to showOrNo the list pickuppoin

  const setCashselectpickuppointF = async () => {
    setCashselectpickuppoint(false)
  }
  const setCashselectpickuppointFF = async () => {
    setCashselectpickuppoint(true)
  }
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
            note: customNote || null,
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

  const filteredPoints = pickupPoints.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPoints.length / PAGE_SIZE);
  const pageData = filteredPoints.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
    <main className="min-h-screen bg-gradient-to-br from-white via-[#fff5f8] to-[#ffe4ef] px-4 py-10">
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
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* BOUTON FLOTTANT POUR RÉOUVRIR MODAL */}
      {/* --------------------------------------------------------------------- */}
      {shopModalButton && (
        <motion.button
          onClick={() => setModalOpen(true)}
          className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-[#FF6EA9]/20 backdrop-blur-md border border-white/30 
                          flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 transition-all"
          whileHover={{ rotate: -5 }}
          whileTap={{ scale: 0.9 }}
        >
          <LocateFixed className="text-[#FF6EA9]" size={26} />
        </motion.button>
      )}
      <motion.button
        onClick={() => router.back()}
        className="fixed bottom-5 left-4 z-[9999] w-14 h-14 rounded-full bg-[#FF6EA9]/20 backdrop-blur-md border border-white/30 
             flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 transition-all"
        whileHover={{ rotate: -5 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#FF6EA9" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </motion.button>
      {order?.pickup_point?.pickup_lat && (
        <motion.button
          onClick={() => setOpenMap(true)}
          className="fixed bottom-5 right-4 z-[9999] w-14 h-14 rounded-full bg-[#FF6EA9]/20 backdrop-blur-md border border-white/30 
             flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 transition-all"
          whileHover={{ rotate: -5 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF6EA9" className="w-7 h-7">
            <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
          </svg>
        </motion.button>
      )}

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
              className="bg-white  shadow-2xl p-6 w-full max-w-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Choisir un point de retrait</h2>
                <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-pink-500">
                  <XCircle size={26} />
                </button>
              </div>
              {cashselectpickuppoint && (
                <>
                  {/* SEARCH */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Rechercher un point..."
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                    />
                  </div>

                  {/* LISTE */}
                  <div className="max-h-80 overflow-y-auto pr-2">
                    {pageData.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 border rounded-xl mb-3 hover:border-pink-400 cursor-pointer transition"
                        onClick={() => selectPickupPoint(p.id)}
                      >
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-sm text-gray-500">{p.address}</p>
                      </div>
                    ))}

                    {pageData.length === 0 && (
                      <p className="text-center text-gray-500 py-6">Aucun résultat</p>
                    )}
                  </div>

                  {/* PAGINATION */}
                  <div className="flex justify-between mt-4">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-3 py-1 text-sm border rounded-lg disabled:opacity-30"
                    >
                      Précédent
                    </button>

                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-3 py-1 text-sm border rounded-lg disabled:opacity-30"
                    >
                      Suivant
                    </button>
                  </div>
                  <p className="font-medium mb-2 text-center items-center mt-5 cursor-pointer text-[#FF6EA9]"
                    onClick={setCashselectpickuppointF}
                  >Décrire un point personnalisé</p>
                </>
              )}
              {!cashselectpickuppoint && (
                <>
                  {/* NOTE PERSO */}
                  <div className="mt-6">
                    <p className="font-medium mb-2 ">Décrire un point personnalisé</p>
                    <textarea
                      rows={3}
                      className="w-full border rounded-xl p-3 focus:ring-pink-300 focus:ring-2"
                      placeholder="Décrire l’endroit ici…"
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                    ></textarea>

                    <button
                      onClick={() => selectPickupPoint(null)}
                      className="mt-3 w-full bg-[#FF6EA9] text-white py-2 rounded-xl hover:bg-[#ff5599]"
                    >
                      Utiliser ce lieu
                    </button>
                  </div>
                  <p className="font-medium mb-2 text-center items-center text-[#FF6EA9] mt-5 cursor-pointer"
                    onClick={setCashselectpickuppointFF}
                  >Ou sélectionner un point de retrait</p>
                </>
              )}

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
      {isShowEndOrders && (
        <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center">
          <motion.button
            onClick={handleFinalize}
            disabled={isSubmitting}
            className={`
        inline-flex items-center justify-center gap-3
        px-7 py-4
        rounded-full
        bg-gradient-to-r from-pink-500 to-pink-600
        text-white font-semibold whitespace-nowrap
        shadow-[0_12px_30px_rgba(236,72,153,0.35)]
        transition-all
        ${isSubmitting
                ? "opacity-80 cursor-not-allowed"
                : "hover:shadow-[0_18px_40px_rgba(236,72,153,0.45)]"}
      `}
            whileHover={!isSubmitting ? { scale: 1.05 } : undefined}
            whileTap={!isSubmitting ? { scale: 0.95 } : undefined}
          >
            {isSubmitting ? (
              <>
                {/* Spinner */}
                <svg
                  className="w-5 h-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="white"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="white"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>

                <span className="text-base leading-none">
                  Traitement en cours…
                </span>
              </>
            ) : (
              <>
                <span className="text-base leading-none">
                  Finaliser votre commande
                </span>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12l-7.5 7.5M3 12h18"
                  />
                </svg>
              </>
            )}
          </motion.button>
        </div>
      )}

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
