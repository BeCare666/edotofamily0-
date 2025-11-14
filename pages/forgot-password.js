"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, KeyRound } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import logo from "../public/logo/logo.png"
import { authService } from "../services/authService"

export default function ForgotPassword() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [email, setEmail] = useState("")
    const [token, setToken] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    // 🔹 Étape 1 — Envoi du mail de réinitialisation
    const handleEmailSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await authService.forgetPassword(email)
            toast.success(res?.message || "Un lien / code a été envoyé à votre e-mail 📩")
            setStep(2)
        } catch (err) {
            console.error("Erreur:", err)
            toast.error(err?.response?.data?.message || "Erreur lors de l’envoi du mail ❌")
        } finally {
            setLoading(false)
        }
    }

    // 🔹 Étape 2 — Vérification du token reçu par email
    const handleTokenVerify = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await authService.verifyForgetPasswordToken(email, token)
            toast.success(res?.message || "Code vérifié ✅")
            setStep(3)
        } catch (err) {
            console.error("Erreur:", err)
            toast.error(err?.response?.data?.message || "Code invalide ❌")
        } finally {
            setLoading(false)
        }
    }

    // 🔹 Étape 3 — Réinitialisation du mot de passe
    const handlePasswordReset = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await authService.resetPassword(email, token, newPassword)
            toast.success(res?.message || "Mot de passe réinitialisé avec succès ✅")

            setTimeout(() => {
                router.push("/login")
            }, 600)

            setStep(1)
            setEmail("")
            setToken("")
            setNewPassword("")
        } catch (err) {
            console.error("Erreur:", err)
            toast.error(err?.response?.data?.message || "Impossible de réinitialiser ❌")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff5f8] to-[#ffe4ef] relative overflow-hidden px-4 py-12">
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 bg-white/70 backdrop-blur-2xl border border-white/40 mt-7 px-8 pt-20 pb-10 w-full max-w-md mx-auto"
            >
                {/* Logo animé */}
                <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.9 }}
                    animate={{ opacity: 1, y: [0, -8, 0], scale: 1 }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        repeatDelay: 1.6,
                        ease: "easeInOut",
                    }}
                    className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white p-3 rounded-full shadow-lg border border-white/40"
                >
                    <Image src={logo} alt="E-Doto logo" width={70} height={70} className="rounded-full object-cover" />
                </motion.div>

                <h1 className="text-2xl font-bold text-[#0F172A] text-center">
                    Réinitialiser votre <span className="text-[#FF6EA9]">mot de passe</span>
                </h1>
                <p className="text-gray-500 text-sm mt-2 mb-8 text-center">
                    Suivez les étapes pour récupérer l’accès à votre compte
                </p>

                <AnimatePresence mode="wait">
                    {/* Étape 1 */}
                    {step === 1 && (
                        <motion.form
                            key="step1"
                            onSubmit={handleEmailSubmit}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-6"
                        >
                            <div>
                                <label className="text-sm text-gray-700 font-medium">Adresse e-mail</label>
                                <div className="relative mt-2">
                                    <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="exemple@email.com"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6EA9] text-gray-800"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 rounded-xl font-semibold shadow-md transition-all ${loading ? "bg-gray-300 text-gray-500" : "bg-[#FF6EA9] text-white hover:bg-[#ff579d]"
                                    }`}
                            >
                                {loading ? "Envoi..." : "Envoyer le lien / code"}
                            </button>
                        </motion.form>
                    )}

                    {/* Étape 2 */}
                    {step === 2 && (
                        <motion.form
                            key="step2"
                            onSubmit={handleTokenVerify}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-6"
                        >
                            <div>
                                <label className="text-sm text-gray-700 font-medium">Code de vérification</label>
                                <div className="relative mt-2">
                                    <KeyRound className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        required
                                        placeholder="Entrez le code reçu"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6EA9] text-gray-800"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 rounded-xl font-semibold shadow-md transition-all ${loading ? "bg-gray-300 text-gray-500" : "bg-[#FF6EA9] text-white hover:bg-[#ff579d]"
                                    }`}
                            >
                                {loading ? "Vérification..." : "Vérifier le code"}
                            </button>
                        </motion.form>
                    )}

                    {/* Étape 3 */}
                    {step === 3 && (
                        <motion.form
                            key="step3"
                            onSubmit={handlePasswordReset}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-6"
                        >
                            <div>
                                <label className="text-sm text-gray-700 font-medium">Nouveau mot de passe</label>
                                <div className="relative mt-2">
                                    <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6EA9] text-gray-800"
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

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 rounded-xl font-semibold shadow-md transition-all ${loading ? "bg-gray-300 text-gray-500" : "bg-[#FF6EA9] text-white hover:bg-[#ff579d]"
                                    }`}
                            >
                                {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <p className="text-gray-500 text-sm mt-8 text-center">
                    <Link href="/login" className="text-[#FF6EA9] hover:underline">
                        Retour à la connexion
                    </Link>
                </p>
            </motion.div>
        </main>
    )
}
