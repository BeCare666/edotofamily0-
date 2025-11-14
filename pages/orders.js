"use client";

import { useEffect, useState } from "react";
import {
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Clock,
    CreditCard,
    RefreshCcw,
    ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast"
import { authService } from "../services/authService";
import { useRouter } from "next/navigation";
export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const router = useRouter()
    const user = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        console.log("first")
        if (!user) {
            router.push("/login")
        }
        console.log("after")
        fetchOrders(page);
    }, [user, page]);

    const fetchOrders = async (page = 1) => {
        setLoading(true);
        try {
            const me = await authService.me();
            console.log("Profil utilisateur connecté :", me);
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/orders?customer_id=${me.id}&page=${page}&limit=5`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            console.log("Réponse des commandes :", res);
            const data = await res.json();
            setOrders(
                (data.data || []).map(o => ({
                    ...o,
                    total: Number(o.total),
                    paid_total: Number(o.paid_total),
                    amount: Number(o.amount)
                }))
            );
            setPagination(data);
        } catch (error) {
            toast.error("Erreur lors du chargement des commandes");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "order-completed":
                return <CheckCircle className="text-green-500" size={22} />;
            case "order-processing":
                return <RefreshCcw className="text-blue-500 animate-spin-slow" size={22} />;
            case "order-out-for-delivery":
                return <Truck className="text-purple-500" size={22} />;
            case "order-pending":
                return <Clock className="text-amber-500" size={22} />;
            case "order-cancelled":
            case "order-failed":
                return <XCircle className="text-red-500" size={22} />;
            default:
                return <Package className="text-gray-400" size={22} />;
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold text-[#0F172A] mb-8">📦 Mes Commandes</h1>

            {loading ? (
                <div className="flex justify-center items-center h-60 text-gray-500">
                    <Clock className="animate-spin-slow mr-2" /> Chargement des commandes...
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Package size={48} className="text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-700">Aucune commande trouvée</p>
                    <p className="text-gray-500 text-sm">Vos commandes s’afficheront ici une fois passées.</p>
                </div>
            ) : (
                <>
                    <div className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-md divide-y divide-gray-100">
                        {orders.map((order) => (
                            <motion.div
                                key={order.id}
                                whileHover={{ scale: 1.01 }}
                                onClick={() => router.push(`/orders/${order.id}`)} // 🔥 redirection ici
                                className="flex items-center cursor-pointer justify-between flex-wrap sm:flex-nowrap p-5 transition-all hover:bg-[#fff5f8] rounded-2xl"
                            >
                                {/* Left */}
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-[#FF6EA9]/10 rounded-xl">
                                        {getStatusIcon(order.order_status)}
                                    </div>

                                    <div>
                                        <p className="font-semibold text-[#0F172A]">
                                            Commande #{order.tracking_number}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Passée le{" "}
                                            {new Date(order.created_at).toLocaleDateString("fr-FR", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Right */}
                                <div className="flex items-center gap-6 mt-4 sm:mt-0">
                                    <div className="text-right">
                                        <p className="text-gray-800 font-semibold">
                                            {Number(order.total || 0).toFixed(2)} €
                                        </p>
                                        <div className="text-sm text-gray-500 flex items-center justify-end gap-1">
                                            <CreditCard size={14} />{" "}
                                            {order.payment_status.replace("payment-", "").replace(/-/g, " ")}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <span
                                            className={`text-sm font-medium capitalize ${order.order_status === "order-completed"
                                                ? "text-green-600"
                                                : order.order_status === "order-processing"
                                                    ? "text-blue-600"
                                                    : order.order_status === "order-pending"
                                                        ? "text-amber-600"
                                                        : order.order_status === "order-cancelled"
                                                            ? "text-red-600"
                                                            : "text-gray-600"
                                                }`}
                                        >
                                            {order.order_status.replace("order-", "").replace(/-/g, " ")}
                                        </span>
                                    </div>

                                    <ChevronRight className="text-gray-300" size={18} />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center mt-8 gap-3">
                        <button
                            onClick={() => page > 1 && setPage(page - 1)}
                            disabled={!pagination.prev_page_url}
                            className={`px-4 py-2 rounded-lg border ${pagination.prev_page_url
                                ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                                : "border-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                        >
                            ← Précédent
                        </button>
                        <button
                            onClick={() => page < pagination.last_page && setPage(page + 1)}
                            disabled={!pagination.next_page_url}
                            className={`px-4 py-2 rounded-lg border ${pagination.next_page_url
                                ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                                : "border-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                        >
                            Suivant →
                        </button>
                    </div>
                </>
            )}
            {/* Bouton retour flottant */}
            <motion.button
                onClick={() => router.back()}
                className="fixed bottom-8 left-8 z-50 w-14 h-14 rounded-full bg-[#FF6EA9]/20 backdrop-blur-md border border-white/30 
             flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 transition-all"
                whileHover={{ rotate: -5 }}
                whileTap={{ scale: 0.9 }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#FF6EA9" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </motion.button>
        </div>
    );
}
