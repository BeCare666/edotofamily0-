"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import CalendlyFullScreen from "./CalendlyDrawer";
import Conseiller from "../public/icons/calendar.jpg";

export default function SSRAdvisorButton() {
    const [openCalendly, setOpenCalendly] = useState(false);

    return (
        <>
            <div className="fixed bottom-5 right-5 z-30 flex flex-col items-center gap-2">

                {/* Bouton */}
                <motion.button
                    onClick={() => setOpenCalendly(true)}
                    className="w-16 h-16 rounded-full bg-white shadow-lg border border-pink-200
                    flex items-center justify-center overflow-hidden
                    hover:shadow-2xl hover:scale-110 transition-all"
                    whileHover={{ rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <Image
                        src={Conseiller}
                        alt="Conseiller SSR"
                        width={40}
                        height={40}
                        className="object-contain"
                        priority={false}
                    />
                </motion.button>

                {/* Texte */}
                <p className="text-xs text-center text-slate-700 font-medium max-w-[100px]">
                    Conseiller SSR
                </p>
            </div>

            <CalendlyFullScreen
                isOpen={openCalendly}
                onClose={() => setOpenCalendly(false)}
            />
        </>
    );
}