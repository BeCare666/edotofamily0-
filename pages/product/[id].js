"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Truck, CheckCircle, Shield, ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import OrderProgressBar from "../../components/OrderProgressBar";
import DeliveryChoiceStep from "../../components/DeliveryChoiceStep";
const FeexPayModal = dynamic(() => import("../../components/FeexPayModal"), { ssr: false });
// pour feexpay
//import("@feexpay/react-sdk").then(console.log);
export default function ProductDetails() {
    const router = useRouter();
    const { id } = router.query;

    const [product, setProduct] = useState(null);
    const [selectedImg, setSelectedImg] = useState(0);
    const [zoom, setZoom] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
    const [loading, setLoading] = useState(true);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [passOrder, setPassOrder] = useState(false);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [orderStep, setOrderStep] = useState("quantity"); // quantity | delivery
    const handleMouseMove = (e) => {
        if (!zoom) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPosition({ x, y });
    };

    useEffect(() => {
        if (!id) return;
        const API_BASE_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/products/${id}`);
                console.log("✅ Produit chargé pour paiement:", `${API_BASE_URL}/products/${id}`, res);
                const data = await res.json();
                const images =
                    typeof data.image === "string"
                        ? tryParseImages(data.image)
                        : data.image?.urls || [];
                setProduct({ ...data, images });
            } catch (e) {
                console.error("Erreur chargement produit:", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const tryParseImages = (field) => {
        try {
            const parsed = JSON.parse(field);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
            if (field.includes(",")) return field.split(",").map((x) => x.trim());
            return [field];
        }
    };

    const formatPrice = (p) => {
        if (p == null) return "—";
        return Math.round(p).toLocaleString("fr-FR");
    };
    const openOrderModal = () => {
        if (!product) return;
        setQuantity(1);
        setOrderStep("quantity");
        setIsOrderModalOpen(true);
    };
    // Le lieu (point de retrait ou livraison à domicile) est choisi avant le paiement :
    // le serveur ajoute les frais de livraison au total, un seul paiement.
    const handleOrder = async (quantity, delivery) => {
        if (!product || quantity < 1 || !delivery) return;
        setPassOrder(true);

        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
            const token = localStorage.getItem("token");

            if (!token) {
                if (typeof window !== "undefined") {
                    localStorage.setItem("redirect_after_login", window.location.pathname);
                }
                router.push("/login");
                return;
            }

            const totalAmount = product.sale_price * quantity;

            const res = await fetch(`${API_BASE_URL}/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    products: [
                        {
                            product_id: product.id,
                            order_quantity: quantity,
                            unit_price: product.sale_price,
                            subtotal: totalAmount,
                        },
                    ],
                    total: totalAmount,
                    payment_gateway: "FEEXPAY",
                    delivery,
                }),
            });

            const order = await res.json().catch(() => ({}));

            if (!res.ok || !order?.tracking_number)
                throw new Error(order?.message || "Erreur création commande");

            setPaymentData({
                orderId: order.id,
                publicKey: process.env.NEXT_PUBLIC_FEEXPAY_PUBLIC_KEY,
                reference: order.tracking_number,
                amount: order.total,
                currency: "XOF",
            });

            setIsOrderModalOpen(false);
            setIsPaymentOpen(true);
        } catch (err) {
            console.error("Erreur commande/paiement:", err);
            alert(err?.message || "Une erreur est survenue lors de la commande.");
        } finally {
            setPassOrder(false);
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400 text-lg">
                Chargement du produit…
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400">
                Produit introuvable
            </div>
        );
    }

    const imgList = product.image || [];
    const imgLists = product.gallery || [];

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-[#fbf8fc] py-10 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => router.back()}
                    className="hidden mb-6 text-sm text-gray-500 hover:text-[#FF6EA9] inline-flex items-center gap-2"
                >
                    <ArrowLeft size={16} /> Retour
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                    {/* Left — Images */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center"
                    >
                        <div
                            className="relative w-full aspect-square bg-white overflow-hidden group cursor-zoom-in"
                            onMouseEnter={() => setZoom(true)}
                            onMouseLeave={() => setZoom(false)}
                            onMouseMove={handleMouseMove}
                        >
                            <img
                                src={imgLists[selectedImg]?.url || imgList.url}
                                alt={product.name}
                                className="object-cover w-full h-full transition-transform duration-500"
                                style={{
                                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                    transform: zoom ? "scale(2)" : "scale(1)",
                                    cursor: zoom ? "zoom-out" : "zoom-in",
                                }}
                            />

                            <div className="flex gap-3 mt-3 items-center justify-center absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm rounded-xl px-2 py-1 shadow-sm">
                                {imgLists.slice(0, 4).map((src, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImg(i)}
                                        className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition ${selectedImg === i
                                            ? "border-[#FF6EA9]"
                                            : "border-transparent hover:border-gray-200"
                                            }`}
                                    >
                                        <img
                                            src={src.url}
                                            alt={`Preview ${i}`}
                                            className="object-cover w-full h-full"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right — Infos */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col gap-6"
                    >
                        <div>
                            <h1 className="text-2xl font-semibold text-[#0F172A] mb-2">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-2 text-[#FF6EA9] hidden">
                                {[...Array(4)].map((_, i) => (
                                    <Star key={i} size={16} fill="#FF6EA9" stroke="none" />
                                ))}
                                <Star size={16} stroke="#FF6EA9" />
                                <span className="text-sm text-gray-400 ml-2">
                                    4.0 (128 avis)
                                </span>
                            </div>
                        </div>

                        <div>
                            <p
                                className="text-gray-600 text-sm leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html:
                                        product.description || "Aucune description disponible.",
                                }}
                            ></p>
                        </div>

                        <div className="flex items-baseline gap-3">
                            {product.sale_price && (
                                <span className="text-gray-400 line-through text-sm">
                                    {formatPrice(product.price)} FCFA
                                </span>
                            )}
                            <span className="text-3xl font-bold text-[#FF6EA9]">
                                {formatPrice(product.sale_price)} FCFA
                            </span>
                        </div>

                        {/* ✅ Boutons */}
                        <div className="flex flex-wrap gap-4 mt-2">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border border-[#FF6EA9] text-[#FF6EA9] hover:bg-[#FF6EA9] hover:text-white transition-all"
                            >
                                Retour
                            </button>
                            <button
                                onClick={openOrderModal}
                                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-[#FF6EA9] to-[#4AB3F4] text-white shadow-md hover:shadow-lg hover:opacity-90 transition-all"
                            >
                                {passOrder ? "Commande en cours ..." : "💳 Passer la commande"}
                            </button>
                        </div>

                        <div className="mt-6 border-t border-gray-100 pt-4 flex flex-wrap gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Truck size={16} /> Livraison rapide
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} /> Paiement sécurisé
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield size={16} /> Garantie qualité
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
            {/*  <OrderProgressBar />*/}
            {/* Bouton retour flottant */}
            <motion.button
                onClick={() => router.back()}
                className="!hidden fixed bottom-8 left-8 z-[9999] w-14 h-14 rounded-full bg-[#FF6EA9]/20 backdrop-blur-md border border-white/30 
                         flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 transition-all"
                whileHover={{ rotate: -5 }}
                whileTap={{ scale: 0.9 }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="#FF6EA9"
                    className="w-7 h-7"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                </svg>
            </motion.button>

            {/* ✅ Modal Feexpay */}
            {isPaymentOpen && (
                <FeexPayModal payment={paymentData} onClose={() => setIsPaymentOpen(false)} />
            )}
            {isOrderModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
                    <div className={`bg-white w-full ${orderStep === "delivery" ? "max-w-2xl" : "max-w-md"} max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl p-6 relative`}>

                        <button
                            onClick={() => setIsOrderModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>

                        {orderStep === "delivery" ? (
                            <DeliveryChoiceStep
                                productsTotal={product.sale_price * quantity}
                                onBack={() => setOrderStep("quantity")}
                                submitting={passOrder}
                                onConfirm={(delivery) => handleOrder(quantity, delivery)}
                            />
                        ) : (
                            <>
                                <h3 className="text-lg font-semibold mb-4">
                                    Choisir la quantité
                                </h3>

                                {/* Quantity Selector */}
                                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-6">
                                    <button
                                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow hover:bg-pink-50 transition"
                                    >
                                        -
                                    </button>

                                    <span className="text-xl font-semibold">
                                        {quantity}
                                    </span>

                                    <button
                                        onClick={() => setQuantity((prev) => prev + 1)}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow hover:bg-pink-50 transition"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Total */}
                                <div className="flex justify-between mb-6">
                                    <span>Total produits :</span>
                                    <span className="font-bold text-pink-600">
                                        {product.sale_price * quantity} XOF
                                    </span>
                                </div>

                                {/* Étape suivante : choix du lieu */}
                                <button
                                    onClick={() => {
                                        if (!localStorage.getItem("token")) {
                                            localStorage.setItem("redirect_after_login", window.location.pathname);
                                            router.push("/login");
                                            return;
                                        }
                                        setOrderStep("delivery");
                                    }}
                                    className="w-full bg-pink-600 text-white py-3 rounded-xl font-medium hover:bg-pink-700 transition"
                                >
                                    Continuer
                                </button>
                            </>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}
