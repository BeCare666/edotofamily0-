"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

// Avatar de l'IA : anneau dégradé rose → bleu en rotation lente, cœur blanc.
export default function AIOrb({ size = 36, active = false }) {
    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: "conic-gradient(from 0deg, #FF6EA9, #c084fc, #4AB3F4, #FF6EA9)" }}
                animate={{ rotate: 360 }}
                transition={{ duration: active ? 2.4 : 8, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-[2px] rounded-full bg-white flex items-center justify-center">
                <Sparkles className="text-pink-500" style={{ width: size * 0.45, height: size * 0.45 }} strokeWidth={1.8} />
            </div>
        </div>
    );
}
