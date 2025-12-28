"use client";

import { motion } from "framer-motion";
import {
    ShoppingCart,
    CreditCard,
    KeyRound,
    MapPin,
    PackageCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

const STEPS = [
    { key: "order", label: "Commande", icon: ShoppingCart },
    { key: "payment", label: "Paiement", icon: CreditCard },
    { key: "otp", label: "OTP", icon: KeyRound },
    { key: "pickup", label: "Point", icon: MapPin },
    { key: "done", label: "Retrait", icon: PackageCheck },
];

export default function OrderProgressBar() {
    const [currentStep, setCurrentStep] = useState(null);

    useEffect(() => {
        const step = localStorage.getItem("order_step");
        if (step) setCurrentStep(step);
    }, []);

    // 👉 Afficher uniquement si l'étape est "order"
    if (currentStep !== "order") return null;

    const currentIndex = STEPS.findIndex(s => s.key === currentStep);

    return (
        <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] px-4 py-3"
        >
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
                {STEPS.map((step, index) => {
                    const Icon = step.icon;

                    const isDone = index < currentIndex;
                    const isActive = index === currentIndex;

                    return (
                        <div
                            key={step.key}
                            className="flex-1 flex flex-col items-center text-center relative"
                        >
                            {/* Ligne gauche */}
                            {index !== 0 && (
                                <div
                                    className={`absolute left-0 top-5 w-1/2 h-[2px] ${isDone ? "bg-emerald-400" : "bg-slate-200"
                                        }`}
                                />
                            )}

                            {/* Ligne droite */}
                            {index !== STEPS.length - 1 && (
                                <div
                                    className={`absolute right-0 top-5 w-1/2 h-[2px] ${index < currentIndex
                                        ? "bg-emerald-400"
                                        : "bg-slate-200"
                                        }`}
                                />
                            )}

                            {/* Icon */}
                            <motion.div
                                layout
                                animate={{ scale: isActive ? 1.15 : 1 }}
                                transition={{ type: "spring", stiffness: 260 }}
                                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 mb-1
                                    ${isDone
                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                        : isActive
                                            ? "bg-pink-500 border-pink-500 text-white"
                                            : "bg-white border-slate-300 text-slate-400"
                                    }`}
                            >
                                <Icon size={18} />
                            </motion.div>

                            {/* Label */}
                            <span
                                className={`text-xs font-medium transition ${isActive
                                    ? "text-pink-600"
                                    : isDone
                                        ? "text-emerald-600"
                                        : "text-slate-400"
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
