"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Copy, Check } from "lucide-react";

export default function GoogleFormDrawer({ isOpen, onClose, formUrl }) {
  const [showGeoModal, setShowGeoModal] = useState(false);
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [copied, setCopied] = useState(null);

  // 📍 récupérer position
  const handleGetLocation = () => {
    if (!navigator.geolocation) return;

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setShowGeoModal(true);
        setLoadingLocation(false);
      },
      () => {
        setLoadingLocation(false);
        alert("Impossible de récupérer la position");
      }
    );
  };

  // 📋 copier.
  const handleCopy = async (value, type) => {
    await navigator.clipboard.writeText(value.toString());
    setCopied(type);

    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <>
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
              className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl lg:rounded-l-2xl flex flex-col"
            >
              {/* Header */}
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

              {/* Bouton position */}
              <div className="p-4">
                <button
                  onClick={handleGetLocation}
                  className="flex items-center gap-2 px-4 py-3 w-full justify-center rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg"
                >
                  <MapPin size={18} />
                  {loadingLocation ? "Chargement..." : "La position du point de retrait"}
                </button>
              </div>

              {/* Google Form */}
              <div className="flex-1 overflow-hidden">
                <iframe
                  src={formUrl}
                  className="w-full h-full border-0"
                  allow="fullscreen"
                  loading="lazy"
                ></iframe>
              </div>

              {/* 📍 BOTTOM coordonnées */}
              {location && (
                <div className="p-4 border-t bg-white sticky bottom-0">
                  <div className="flex flex-col gap-3">

                    {/* Latitude */}
                    <div className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-xl">
                      <span className="text-sm text-gray-600">
                        Latitude
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">
                          {location.lat}
                        </span>

                        <button
                          onClick={() =>
                            handleCopy(location.lat, "lat")
                          }
                          className="p-2 rounded-lg bg-white shadow hover:bg-gray-200 transition"
                        >
                          {copied === "lat" ? (
                            <Check size={16} />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Longitude */}
                    <div className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-xl">
                      <span className="text-sm text-gray-600">
                        Longitude
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">
                          {location.lng}
                        </span>

                        <button
                          onClick={() =>
                            handleCopy(location.lng, "lng")
                          }
                          className="p-2 rounded-lg bg-white shadow hover:bg-gray-200 transition"
                        >
                          {copied === "lng" ? (
                            <Check size={16} />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔥 MODAL GEO (style du tien) */}
      <AnimatePresence>
        {showGeoModal && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowGeoModal(false);
            }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0f172a] text-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/10"
            >
              <div className="text-center">

                <h2 className="text-xl font-bold mb-4">
                  📍 Confirmation de position
                </h2>

                <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                  Vous devez vous assuré que votre position actuelle est celle du point du retrait qui vas servir et être considéré comme le point de retrait officiel.
                  <br /><br />
                  Donc vous devez vous rendre forcement dans ce point de retrait si vous ne l'êtes pas actuel.
                  <br /><br />
                  Sinon confirmez votre position.
                </p>

                <div className="flex gap-4 justify-center">

                  <button
                    onClick={() => {
                      setShowGeoModal(false);
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-semibold"
                  >
                    ✅ Confirmer
                  </button>

                  <button
                    onClick={() => setShowGeoModal(false)}
                    className="px-6 py-3 rounded-xl bg-white/10"
                  >
                    Annuler
                  </button>

                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}