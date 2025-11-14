"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import DrawerMenu from "./DrawerMenu";
import Image from "next/image";
import Logo from "../public/logo/logo.png";
import CalendarIcon from "../public/icons/calendar.jpg";
import CalendlyDrawer from "./CalendlyDrawer";
export default function FooterLogo() {
  const [openMenu, setOpenMenu] = useState(false);
  const [openCalendly, setOpenCalendly] = useState(false);

  return (
    <>
      {/* --- Drawers --- */}
      <DrawerMenu isOpen={openMenu} onClose={() => setOpenMenu(false)} />
      <CalendlyDrawer isOpen={openCalendly} onClose={() => setOpenCalendly(false)} />

      {/* --- Floating Button Group (bottom-right) --- */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-10">
        {/* --- Calendly Button --- */}
        <motion.button
          onClick={() => setOpenCalendly(true)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className="w-[56px] h-[56px] rounded-full bg-white/80 backdrop-blur-xl shadow-lg border border-white/60 flex items-center justify-center hover:shadow-2xl transition-all"
        >
          <Image
            src={CalendarIcon}
            alt="Calendly"
            className="w-7 h-7 opacity-80 hover:opacity-100 transition-all"
          />
        </motion.button>

        {/* --- E-DOTO FAMILY Button --- */}
        <motion.button
          onClick={() => setOpenMenu(true)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className="w-[56px] h-[56px] rounded-full bg-white/80 backdrop-blur-xl shadow-lg border border-white/60 flex items-center justify-center hover:shadow-2xl transition-all"
        >
          <Image
            src={Logo}
            alt="E-DOTO FAMILY"
            className="w-9 h-9 opacity-80 hover:opacity-100 transition-all"
          />
        </motion.button>
      </div>
    </>
  );
}
