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
  Receipt,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function OrderDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchOrderDetails(id);
  }, [id]);

  const fetchOrderDetails = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/orders/${id}`);
      const data = await res.json();
      setOrder({
        ...data,
        products: (data.products || []).map(p => ({
          ...p,
          price: Number(p.price || 0),
          quantity: Number(p.quantity || 0)
        }))
      });

    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
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
    <main className="min-h-screen bg-gradient-to-br from-white via-[#fff5f8] to-[#ffe4ef] px-4 py-10">
      <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-2xl border border-white/40  p-6">
        {/* HEADER */}
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

        {/* INFOS COMMANDE */}
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
            <div className="flex items-center gap-2 mt-1">
              {getStatusIcon(order.order_status)}
              <span className="font-semibold capitalize">
                {order.order_status.replace("order-", "").replace(/-/g, " ")}
              </span>
            </div>
          </div>
        </div>

        {/* PRODUITS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-10"
        >
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
                        Qté : {item.quantity} × {Number(item.price || 0).toFixed(2)} FCFA
                      </p>
                    </div>
                  </div>

                  <p className="font-semibold text-[#0F172A]">
                    {(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)} FCFA
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Aucun produit</p>
          )}
        </motion.div>

        {/* ADRESSES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MapPin className="text-[#FF6EA9]" /> Adresse de livraison
            </h2>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {order.shipping_address
                ? JSON.stringify(order.shipping_address, null, 2)
                : "Non spécifiée"}
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="text-[#FF6EA9]" /> Client
            </h2>
            <p className="text-sm text-gray-700">
              {order.customer_name || "Non spécifié"}
            </p>
            <p className="text-sm text-gray-500">{order.customer_contact}</p>
          </div>
        </div>

        {/* PAIEMENT */}
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
              <p className="font-semibold capitalize">
                {order.payment_status.replace("payment-", "").replace(/-/g, " ")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
