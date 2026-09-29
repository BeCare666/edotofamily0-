"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import logo from "../public/logo/favicon.png"
import { useAuthContext } from "../context/AuthContext";
import GoogleFormDrawer from "./GoogleFormDrawer";
import toast from "react-hot-toast"
import {
  Home, Info, Phone, Target, Flag, FileText, Shield,
  User, LogOut, ShoppingBag, Star, Briefcase, Gift
} from "lucide-react"
import { SiX } from "react-icons/si"; // icône officielle X
import { FaFacebookF, FaLinkedinIn, FaTwitter, FaTiktok, FaInstagram } from "react-icons/fa"
import { useRouter } from "next/navigation"

const links = [
  { label: "Accueil", href: "/", icon: <Home size={18} /> },
  { label: "À propos", href: "/about", icon: <Info size={18} /> },
  { label: "Services", href: "/services", icon: <Briefcase size={18} /> },
  { label: "Contact", href: "/contact", icon: <Phone size={18} /> },
  { label: "Notre mission", href: "/mission", icon: <Target size={18} /> },
  { label: "Nos objectifs", href: "/objectives", icon: <Flag size={18} /> },
  { label: "Termes et conditions", href: "/terms", icon: <FileText size={18} /> },
  { label: "Politique de confidentialité", href: "/privacy", icon: <Shield size={18} /> },
]

export default function DrawerMenu({ isOpen, onClose }) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [openForm, setOpenForm] = useState(false);
  const [openShop, setOpenShop] = useState(false)
  const router = useRouter()
  // const [user, setUser] = useState(false)
  const { user, logout } = useAuthContext();
  //console.log("User in DrawerMenu:", user);
  // Charger le user depuis localStorage
  // useEffect(() => {
  //   const storedUser = localStorage.getItem("token")
  //   if (storedUser) {
  //     setUser(true)
  //   }
  // }, [])
  const categories = [
    { id: 1, name: "Fertilité", slug: "fertilite", icon: "https://img.icons8.com/fluency/48/product.png" },
    { id: 2, name: "Grossesse", slug: "grossesse", icon: "https://img.icons8.com/?size=48&id=s3Jrlqy6yqSl&format=png" },
    { id: 3, name: "Intimité", slug: "intimite", icon: "https://img.icons8.com/fluency/48/car.png" },
    { id: 5, name: "Bien-être", slug: "bien-etre", icon: "https://img.icons8.com/fluency/48/factory.png" }
  ];
  const toggleUserMenu = () => setShowUserMenu((p) => !p)
  const HandleGotoShop = (id) => {
    router.push(`/category/categories_id=${id}`)
    onClose() // ferme le drawer après clic
  }
  const HandleGotoCampagnes = () => {
    router.push(`/campaigns`)
    onClose() // ferme le drawer après clic
  }
  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Déconnexion réussie 👋")
    } catch (error) {
      toast.error("Une erreur est survenue lors de la déconnexion")
    }
  }
  const socialLinks = [
    { icon: <FaInstagram />, color: "#E4405F", url: "https://www.instagram.com/toncompte" },
    { icon: <FaFacebookF />, color: "#1877F2", url: "https://www.facebook.com/toncompte" },
    { icon: <FaLinkedinIn />, color: "#0077B5", url: "https://www.linkedin.com/in/toncompte" },
    { icon: <SiX />, color: "#000000", url: "https://x.com/toncompte" }, // Remplacement Twitter -> X
    { icon: <FaTiktok />, color: "#000000", url: "https://www.tiktok.com/@toncompte" },
  ];
  const handleFinalize = () => {
    router.push("/devenir-point-de-retrait");
  };
  return (
    <>
      {/* BACKDROP */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-[3px] transition-all ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      />

      {/* DRAWER */}
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="fixed right-0 top-0 h-full w-[350px] max-w-[90vw] z-40 bg-white backdrop-blur-2xl border-l border-white/40 shadow-[0_8px_40px_rgba(255,110,169,0.15)] flex flex-col p-6 lg:rounded-l-[2rem]"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <div
            className="flex-shrink-0 flex items-center cursor-pointer gap-2"
          >
            <div className="relative w-12 p-3 h-12  overflow-hidden  ring-1 ring-white">
              <Image src={logo} alt="E·Doto" fill className="object-cover" />
            </div>

            <h1 className="text-2xl font-bold text-[#0F172A] mt-2 text-center">
              <span className="text-[#FF6EA9]">E·Doto</span> Family
            </h1>
          </div>

          {/* AVATAR UTILISATEUR */}
          <div className="relative">
            <button
              onClick={toggleUserMenu}
              className="w-10 h-10 rounded-full overflow-hidden border border-[#ffb3d9]/40 shadow-sm hover:ring-2 hover:ring-[#FF6EA9]/30 transition-all"
            >
              <Image
                src={user?.avatar || "/images/avatar.avif"}
                alt="user avatar"
                width={40}
                height={40}
                className="object-cover"
              />
            </button>

            {/* DROPDOWN UTILISATEUR */}
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-3 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-[#ffd6e8]/40 overflow-hidden z-50"
              >
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b border-[#ffe0ee]/60">
                      <p className="text-sm font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-[#fff5fa] transition" onClick={() => setShowUserMenu(false)}>
                      <User size={16} /> Profil
                    </Link>
                    <Link href="/orders" className="flex items-center gap-2 px-4 py-2 hover:bg-[#fff5fa] transition" onClick={() => setShowUserMenu(false)}>
                      <ShoppingBag size={16} /> Commandes
                    </Link>
                    {/* <Link href="/partner" className="hidden flex items-center gap-2 px-4 py-2 hover:bg-[#fff5fa] transition" onClick={() => setShowUserMenu(false)}>
                      <Star size={16} /> Devenir un centre
                    </Link>*/}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-[#ff4d8d] hover:bg-[#fff0f5] transition"
                    >
                      <LogOut size={16} /> Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-4 py-2 hover:bg-[#fff5fa] transition" onClick={() => setShowUserMenu(false)}>
                      Connexion
                    </Link>
                    <Link href="/register" className="block px-4 py-2 hover:bg-[#fff5fa] transition" onClick={() => setShowUserMenu(false)}>
                      Créer un compte
                    </Link>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* LIENS DE NAVIGATION */}
        <nav className="flex-1 overflow-y-auto scrollbar-none">
          <ul className="space-y-3">
            <li className="w-full">
              <button
                onClick={() => setOpenShop((prev) => !prev)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all
              ${openShop
                    ? "bg-pink-50 text-pink-600 ring-1 ring-pink-200"
                    : "text-gray-800 bg-white/40 hover:bg-[#FF6EA9]/10"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag size={18} color="#FF6EA9" />
                  Boutique
                </div>
                <span className="text-xs">{openShop ? "▲" : "▼"}</span>
              </button>

              {/* CATÉGORIES */}
              {openShop && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="mt-2 ml-4 space-y-1"
                >
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => HandleGotoShop(cat.id)}
                      className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 transition"
                    >
                      <img src={cat.icon} className="w-5 h-5" alt={cat.name} />
                      {cat.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </li>
            <li className="w-full">
              <button
                onClick={HandleGotoCampagnes}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all
              ${openShop
                    ? "bg-pink-50 text-pink-600 ring-1 ring-pink-200"
                    : "text-gray-800 bg-white/40 hover:bg-[#FF6EA9]/10"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Gift size={18} color="#FF6EA9" />
                  Campagnes
                </div>
              </button>
            </li>
            {links.map((link) => (
              <li key={link.href}
                onClick={onClose}>
                <Link
                  href={link.href}
                  className="group flex items-center gap-3 px-4 py-3 rounded-xl text-gray-800 bg-white/40 hover:bg-[#FF6EA9]/10 backdrop-blur-sm transition-all hover:shadow-sm"
                >
                  <div className="text-[#FF6EA9] group-hover:scale-110 transition-transform">
                    {link.icon}
                  </div>
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              </li>
            ))}
            {user?.role === "super_pickuppoint" ? (
              <p onClick={router.push("/pickup-dashboard")} className="hidden cursor-pointer">Dashboard</p>
            ) : (<p onClick={handleFinalize} className="hidden cursor-pointer">💼 Devenir Point de Retrait</p>)}

          </ul>
        </nav>
        <GoogleFormDrawer
          isOpen={openForm}
          onClose={() => setOpenForm(false)}
          formUrl="https://docs.google.com/forms/d/e/1FAIpQLScY-R5SkFwByPEDyzW7AxVmEoEc2NSTI4RYYtvlp0w0jhEIjg/viewform?usp=publish-editor"
        />
        {/* FOOTER / RESEAUX SOCIAUX */}
        <div className="mt-10 border-t border-[#ffd6e8]/50 pt-5 text-center">
          <p className="text-xs text-gray-500 mb-3 uppercase tracking-widest">
            Suivez-nous
          </p>
          <div className="flex justify-center gap-4 text-gray-600">
            {socialLinks.map((social, i) => (
              <motion.a
                key={i}
                href={social.url} // lien réel
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="p-2 rounded-full bg-white/70 shadow-md hover:shadow-lg transition"
                style={{ color: social.color }}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
          <p className="text-[11px] mt-6 text-gray-400">
            © {new Date().getFullYear()} E·Doto Family — Le bien-être de la jeunesse.
          </p>
        </div>
      </motion.aside >
    </>
  )
}
