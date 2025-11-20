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

  // 🟣 Pickup points
  const [pickupPoints, setPickupPoints] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [customNote, setCustomNote] = useState("");

  useEffect(() => {
    if (id) fetchOrderDetails(id);
  }, [id]);

const fetchOrderDetails = async (id) => {
  try {
    setLoading(true);

    const token = localStorage.getItem("token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/orders/${id}`,
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
        price: Number(p.price || 0),
        quantity: Number(p.quantity || 0),
      })),
    });

    // ⚠️ C’est bien data.status (et pas data.order_status)
    if (data.pickup_point_id === null) {
      setShopModalButton(true)
      fetchPickupPoints();
      setTimeout(() => setModalOpen(true), 400);
    }

  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    setLoading(false);
  }
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

const setCashselectpickuppointF = async ( )=>{
  setCashselectpickuppoint(false)
}
const setCashselectpickuppointFF = async ( )=>{
  setCashselectpickuppoint(true)
}
  // 🟣 UPDATE pickup point
  const selectPickupPoint = async (pickupPointId) => {
    const token = localStorage.getItem("token");
    console.log('les id', pickupPointId, id)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", 
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pickup_point_id: pickupPointId,
          note: customNote || null,
        }),
      });

      setModalOpen(false);
      fetchOrderDetails(id);
    } catch (e) {
      console.error("Erreur:", e);
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
                        Qté : {item.quantity} × {item.price.toFixed(2)} FCFA
                      </p>
                    </div>
                  </div>

                  <p className="font-semibold text-[#0F172A]">
                    {(item.price * item.quantity).toFixed(2)} FCFA
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
              className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg"
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
      </AnimatePresence>
    </main>
  );
}
