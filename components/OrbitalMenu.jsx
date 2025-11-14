"use client"
import Image from 'next/image';
import { motion, useAnimation } from "framer-motion"
import { useEffect, useState } from "react"
import CategoryCard from "./CategoryCard"
import { useRouter } from "next/router"
import edotocenter from '../public/icons/edotocenter.gif'
export default function OrbitalMenu({ categories = [], preferredRadius = 220 }) {
  const router = useRouter()
  const controls = useAnimation()
  const [isClient, setIsClient] = useState(false)
  // responsive params
  const [centerSize, setCenterSize] = useState(160)
  const [radius, setRadius] = useState(preferredRadius)
  const [effectiveRadius, setEffectiveRadius] = useState(preferredRadius)
  const [isFallbackList, setIsFallbackList] = useState(false) // small-screen fallback
  // ✅ Hook 1 : détection du rendu client
  useEffect(() => {
    setIsClient(true)
  }, [])
  useEffect(() => {
    if (!isClient) return
    controls.start({
      rotate: 360,
      transition: { duration: 60, ease: "linear", repeat: Infinity },
    })
  }, [controls, isClient])

  useEffect(() => {
    const recompute = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      // taille centrale selon largeur
      if (vw < 380) {
        setCenterSize(80)
        setRadius(Math.round(preferredRadius * 0.35))
      } else if (vw < 640) {
        setCenterSize(90)
        setRadius(Math.round(preferredRadius * 0.45))
      } else if (vw < 1024) {
        setCenterSize(140)
        setRadius(Math.round(preferredRadius * 0.6))
      } else {
        setCenterSize(160)
        setRadius(preferredRadius)
      }

      // calcul de l'espace disponible pour l'anneau (padding 32px)
      const horizontalPadding = 32
      const maxAvail = Math.max(0, vw - horizontalPadding * 2) // largeur dispo réelle

      // l'anneau total occupe centerSize + 2 * radius
      // on s'assure qu'il tienne dans maxAvail ; si non, on réduit radius
      const desiredTotal = centerSize + 2 * (Math.round(preferredRadius))
      // on veut que total <= maxAvail
      const maxAllowedRadius = Math.max(
        20,
        Math.floor((maxAvail - centerSize) / 2)
      )

      // si l'espace disponible est très petit, on active le fallback list
      if (maxAllowedRadius < 40) {
        setIsFallbackList(true)
        setEffectiveRadius(Math.max(20, maxAllowedRadius)) // valeur minimale utile
      } else {
        setIsFallbackList(false)
        // clamp effective radius entre 20 et maxAllowedRadius
        const clamped = Math.max(20, Math.min(radius, maxAllowedRadius))
        setEffectiveRadius(clamped)
      }
    }

    recompute()
    window.addEventListener("resize", recompute)
    window.addEventListener("orientationchange", recompute)
    return () => {
      window.removeEventListener("resize", recompute)
      window.removeEventListener("orientationchange", recompute)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferredRadius])
  if (!isClient) return null
  // Mobile fallback: afficher en colonne pour éviter tout débordement
  if (isFallbackList) {
    return (
      <div className="w-full flex flex-col items-center gap-4 py-6">
        <div
          style={{ width: centerSize, height: centerSize }}
          className="rounded-full bg-white/70 backdrop-blur-md shadow-2xl flex items-center justify-center border border-white/40"
        >
          <div className="text-center select-none">
            <Image
              src={edotocenter}
              alt="E-DOTO"
              fill
              sizes="(max-width: 768px) 100vw"
              className="product-image object-contain"
            />
            <h1 className="hidden text-xl font-bold text-[#FF6EA9]">E-DOTO</h1>
            <p className="hidden text-xs text-gray-600">family </p>
          </div>
        </div>

        <div className="w-full max-w-md px-4">
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => router.push(`/category/categories_id=${cat.id}`)}
                className="w-full"
              >
                <CategoryCard title={cat.title} image={cat.image} id={cat.id} />
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Orbital layout (desktop / tablette)
  return (
    <div className="relative w-full flex items-center justify-center h-[70vh] overflow-hidden">
      {/* halo */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute rounded-full bg-gradient-to-r from-[#FF6EA9]/30 to-[#60A5FA]/30 blur-3xl z-0"
        style={{
          width: `${centerSize * 1.6}px`,
          height: `${centerSize * 1.6}px`,
        }}
      />

      <div className="relative flex items-center justify-center">
        {/* soleil */}
        <div
          style={{ width: centerSize, height: centerSize }}
          className="relative rounded-full overflow-hidden bg-[#FFEAE0] backdrop-blur-md shadow-2xl flex items-center justify-center border border-white/40 z-20"
        >
          {/* Image centrée et ajustée */}
          <Image
            src={edotocenter}
            alt="E-DOTO"
            fill
            sizes="(max-width: 768px) 100vw"
            className="object-contain p-2"
          />

          {/* Texte caché pour accessibilité */}
          <h1 className="sr-only">E-DOTO</h1>
          <p className="sr-only">family</p>
        </div>


        {/* anneau orbital : on centre le conteneur et on s'assure qu'il n'excède pas la largeur dispo */}
        <motion.div
          animate={controls}
          style={{
            position: "absolute",
            width: `${centerSize + effectiveRadius * 2}px`,
            height: `${centerSize + effectiveRadius * 2}px`,
            transformOrigin: "center center",
            transformStyle: "preserve-3d",
            left: "50%",
            top: "50%",
            translate: "-50% -50%",
          }}
          className="pointer-events-none"
        >
          {categories.map((cat, i) => {
            const angle = (2 * Math.PI * i) / categories.length
            // 👇 Nouveau code : orbit dépend de la largeur d'écran
            let orbit
            if (typeof window !== "undefined") {
              const vw = window.innerWidth
              if (vw < 1024) {
                // 📱 Mobile & tablette
                orbit = centerSize / 2 + effectiveRadius * 0.55
              } else {
                // 💻 Desktop
                orbit = centerSize / 2 + effectiveRadius * 0.25
              }
            } else {
              // Fallback côté serveur (Next.js SSR)
              orbit = centerSize / 2 + effectiveRadius * 0.25
            }
            const x = Math.cos(angle) * orbit
            const y = Math.sin(angle) * orbit

            return (
              <motion.div
                key={cat.id}
                className="absolute pointer-events-auto"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                  zIndex: 30,
                  willChange: "transform",
                }}
                whileHover={{
                  scale: 1.12,
                  zIndex: 9999,
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px) translateZ(60px)`,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
              >
                {/* Contre-rotation pour garder les cartes droites */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 60,
                    ease: "linear",
                    repeat: Infinity,
                  }}
                  style={{ willChange: "transform" }}
                >
                  <button
                    onClick={() => router.push(`/category/categories_id=${cat.id}`)}
                    className="cursor-pointer relative block"
                    style={{ zIndex: 9999 }}
                  >
                    <div
                      className="transition-transform"
                      style={{ maxWidth: 96 }}
                    >
                      <CategoryCard title={cat.title} image={cat.image} id={cat.id} />
                    </div>
                  </button>
                </motion.div>
              </motion.div>
            )

          })}
        </motion.div>
      </div>
    </div>
  )
}
