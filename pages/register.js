"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Lock, User, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useApi } from "../lib/api"
import logo from "../public/logo/logo.png"
import { authService } from "../services/authService"
import { useAuthContext } from "../context/AuthContext" // ✅ import du contexte
export default function RegisterPage() {
    //const { apiRequest } = useApi()
    const router = useRouter()

    const [showPassword, setShowPassword] = useState(false)
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState({ type: "", message: "" })

    const handleRegister = async (e) => {
        e.preventDefault()
        setAlert({ type: "", message: "" })
        setLoading(true)

        try {
            const res = await authService.register(name, email, password)
            console.log("Réponse d'inscription :", res)
            setAlert({
                type: "success",
                message: res.message || "Inscription réussie ! Vérifie ton email.",
            })

            // Redirection douce après succès
            setTimeout(() => router.push("/login"), 1800)
        } catch (err) {
            // Gestion fine des erreurs renvoyées par NestJS
            const message =
                err.message?.includes("existe déjà")
                    ? "Cet utilisateur existe déjà. Essaie de te connecter."
                    : err.message || "Une erreur est survenue."

            setAlert({ type: "error", message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff5f8] to-[#ffe4ef] relative overflow-visible px-4 py-12">
            {/* Orbes décoratives */}
            <motion.div
                className="absolute top-[-120px] left-[-100px] bg-[#FF6EA9]/30 rounded-full blur-3xl"
                animate={{ y: [0, 25, 0], opacity: [0.5, 0.8, 0.5] }}
                transition={{ repeat: Infinity, duration: 6 }}
            />
            <motion.div
                className="absolute bottom-[-120px] right-[-100px] bg-[#FF6EA9]/40 rounded-full blur-3xl"
                animate={{ y: [0, -25, 0], opacity: [0.4, 0.7, 0.4] }}
                transition={{ repeat: Infinity, duration: 8 }}
            />

            {/* Carte principale */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative z-10 bg-white/70 backdrop-blur-2xl border border-white/40 mt-7 px-8 pt-20 pb-10 w-full max-w-md mx-auto"
            >
                {/* Logo animé */}
                <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.9 }}
                    animate={{ opacity: 1, y: [0, -8, 0], scale: 1 }}
                    transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }}
                    className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white p-3 rounded-full shadow-lg border border-white/40"
                >
                    <Image src={logo} alt="E-Doto logo" width={70} height={70} className="rounded-full object-cover" />
                </motion.div>

                <h1 className="text-2xl font-bold text-[#0F172A] mt-2 text-center">
                    Rejoignez <span className="text-[#FF6EA9]">E·Doto</span>
                </h1>
                <p className="text-gray-500 mt-2 mb-8 text-sm text-center">
                    Créez votre compte et explorez le bien-être autrement
                </p>

                {/* 🔔 Alertes professionnelles */}
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
                <form onSubmit={handleRegister} className="space-y-6 text-left">
                    <div>
                        <label className="text-sm text-gray-700 font-medium">Nom complet</label>
                        <div className="relative mt-2">
                            <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                required
                                placeholder="Votre nom"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6EA9] text-gray-800 transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-gray-700 font-medium">Adresse e-mail</label>
                        <div className="relative mt-2">
                            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                type="email"
                                required
                                placeholder="exemple@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6EA9] text-gray-800 transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-gray-700 font-medium">Mot de passe</label>
                        <div className="relative mt-2">
                            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6EA9] text-gray-800 transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-[#FF6EA9] transition"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={acceptedTerms}
                            onChange={() => setAcceptedTerms(!acceptedTerms)}
                            className="accent-[#FF6EA9] w-4 h-4"
                        />
                        <label htmlFor="terms" className="cursor-pointer">
                            J’accepte les{" "}
                            <Link href="/terms" className="text-[#FF6EA9] hover:underline">
                                termes et conditions d’utilisation
                            </Link>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={!acceptedTerms || loading}
                        className={`w-full py-3 rounded-xl font-semibold shadow-md transition-all ${acceptedTerms && !loading
                            ? "bg-[#FF6EA9] text-white hover:bg-[#ff579d] hover:shadow-lg"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                    >
                        {loading ? "Création en cours..." : "Créer mon compte"}
                    </button>
                </form>

                <p className="text-gray-500 text-sm mt-6 text-center">
                    Déjà membre ?{" "}
                    <Link href="/login" className="text-[#FF6EA9] font-medium hover:underline">
                        Connectez-vous
                    </Link>
                </p>
            </motion.div>
        </main>
    )
}
