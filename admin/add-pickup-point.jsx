"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Lock, User, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { authService } from "@/app/services/authService"
import logo from "@/app/public/logo/logo.png"

export default function AddPickUpPointPage() {
    const router = useRouter()

    const [showPassword, setShowPassword] = useState(false)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState({ type: "", message: "" })

    const handleCreate = async (e) => {
        e.preventDefault()
        setLoading(true)
        setAlert({ type: "", message: "" })

        try {
            const res = await authService.registerPickUpPoint(name, email, password)

            setAlert({
                type: "success",
                message: "Point de retrait créé avec succès ! L’e-mail d’activation a été envoyé.",
            })

            setTimeout(() => router.push("/admin/pickup-points"), 2000)

        } catch (err) {
            const message =
                err.message?.includes("existe déjà")
                    ? "Cet email est déjà utilisé."
                    : err.message || "Une erreur est survenue."

            setAlert({ type: "error", message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff5f8] to-[#ffe4ef] relative overflow-visible px-4 py-10">

            {/* Orbes décoratives */}
            <motion.div
                className="absolute top-[-130px] left-[-100px] bg-[#FF6EA9]/30 rounded-full blur-3xl w-[300px] h-[300px]"
                animate={{ y: [0, 25, 0], opacity: [0.5, 0.8, 0.5] }}
                transition={{ repeat: Infinity, duration: 6 }}
            />
            <motion.div
                className="absolute bottom-[-130px] right-[-100px] bg-[#FF6EA9]/40 rounded-full blur-3xl w-[300px] h-[300px]"
                animate={{ y: [0, -25, 0], opacity: [0.4, 0.7, 0.4] }}
                transition={{ repeat: Infinity, duration: 8 }}
            />

            {/* Carte */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative z-10 bg-white/70 backdrop-blur-2xl border border-white/40 px-8 pt-20 pb-10 w-full max-w-md mx-auto rounded-2xl shadow-xl"
            >

                {/* Logo flottant */}
                <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.9 }}
                    animate={{ opacity: 1, y: [0, -8, 0], scale: 1 }}
                    transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }}
                    className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white p-3 rounded-full shadow-lg border border-white/40"
                >
                    <Image src={logo} alt="E·Doto logo" width={70} height={70} className="rounded-full" />
                </motion.div>

                <h1 className="text-2xl font-bold text-center text-[#0F172A]">
                    Ajouter un <span className="text-[#FF6EA9]">Point de Retrait</span>
                </h1>
                <p className="text-gray-500 mt-2 mb-8 text-sm text-center">
                    Créez un compte partenaire pour gérer les retraits de commandes
                </p>

                {/* Alertes */}
                {alert.message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center gap-2 p-3 mb-5 rounded-xl text-sm font-medium ${alert.type === "success"
                                ? "bg-green-100 text-green-700 border border-green-300"
                                : "bg-red-100 text-red-700 border border-red-300"
                            }`}
                    >
                        {alert.type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                        {alert.message}
                    </motion.div>
                )}

                {/* Formulaire */}
                <form onSubmit={handleCreate} className="space-y-6">

                    {/* Nom */}
                    <div>
                        <label className="text-sm text-gray-700 font-medium">Nom du point de retrait</label>
                        <div className="relative mt-2">
                            <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type="text"
                                required
                                placeholder="Nom complet du responsable"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6EA9]"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-sm text-gray-700 font-medium">Adresse e-mail</label>
                        <div className="relative mt-2">
                            <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type="email"
                                required
                                placeholder="email@pointderetrait.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6EA9]"
                            />
                        </div>
                    </div>

                    {/* Mot de passe */}
                    <div>
                        <label className="text-sm text-gray-700 font-medium">Mot de passe</label>
                        <div className="relative mt-2">
                            <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6EA9]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-[#FF6EA9]"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Bouton */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-xl font-semibold shadow-md transition-all ${!loading
                                ? "bg-[#FF6EA9] text-white hover:bg-[#ff579d]"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                    >
                        {loading ? "Création..." : "Créer le point de retrait"}
                    </button>

                </form>

            </motion.div>
        </main>
    )
}
