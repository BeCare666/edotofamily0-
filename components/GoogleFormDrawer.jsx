import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function GoogleFormDrawer({ isOpen, onClose, formUrl }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999]"
        >
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl rounded-l-2xl flex flex-col"
          >

            {/* ---- Header ---- */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">
                🔗 Inscription Point de Retrait
              </h2>

              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 transition"
              >
                <X size={22} />
              </button>
            </div>

            {/* ---- Google Form Container ---- */}
            <div className="flex-1 overflow-hidden">
              <iframe
                src={formUrl}
                className="w-full h-full border-0"
                allow="fullscreen"
                loading="lazy"
              ></iframe>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
