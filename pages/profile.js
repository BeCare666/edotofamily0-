"use client"

import { useAuthContext } from "../context/AuthContext"
import { motion } from "framer-motion"
import {
    User,
    Mail,
    ShieldCheck,
    Calendar,
    CheckCircle2,
    XCircle,
    LogOut,
    KeyRound,
    Trash2,
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useState } from "react"
import { apiRequest } from "../lib/api" // ✅ On réutilise ton helper existant

export default function ProfilePage() {
    const { user, logout } = useAuthContext()
    const router = useRouter()
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [loadingDelete, setLoadingDelete] = useState(false)
    const [passwords, setPasswords] = useState({
        old_password: "",
        new_password: "",
        confirm_password: "",
    })
    const [loadingPwd, setLoadingPwd] = useState(false)

    if (!user) {
        return (
            <main className="flex h-screen items-center justify-center text-gray-500">
                <p>Chargement du profil...</p>
            </main>
        )
    }

    // --- Déconnexion
    const handleLogout = async () => {
        await logout()
        toast.success("Déconnexion réussie 👋")
        router.push("/login")
    }

    // --- Changement de mot de passe
    const handlePasswordChange = async (e) => {
        e.preventDefault()

        if (passwords.new_password !== passwords.confirm_password) {
            toast.error("Les mots de passe ne correspondent pas ⚠️")
            return
        }

        try {
            setLoadingPwd(true)
            await apiRequest("/change-password", {
                method: "POST",
                body: JSON.stringify({
                    old_password: passwords.old_password,
                    new_password: passwords.new_password,
                }),
            })
            toast.success("Mot de passe modifié avec succès ✅")
            setShowPasswordModal(false)
            setPasswords({ old_password: "", new_password: "", confirm_password: "" })
        } catch (err) {
            toast.error(err.message || "Erreur lors du changement de mot de passe")
        } finally {
            setLoadingPwd(false)
        }
    }

    // --- Suppression du compte
    const handleDeleteAccount = async () => {
        const confirmDelete = confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")
        if (!confirmDelete) return

        try {
            setLoadingDelete(true)
            await apiRequest(`/users/${user.id}`, { method: "DELETE" })
            toast.success("Compte supprimé avec succès 🗑️")
            await logout()
            router.push("/login")
        } catch (err) {
            toast.error("Erreur lors de la suppression du compte")
        } finally {
            setLoadingDelete(false)
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-white via-[#fff5f8] to-[#ffe4ef] px-4 py-16 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-white/80 backdrop-blur-2xl border border-white/40 p-8 w-full max-w-2xl relative"
            >
                {/* --- Avatar --- */}
                <div className="flex flex-col items-center text-center">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#FF6EA9]/50 shadow-md">
                            {user?.profile?.avatar ? (
                                <Image
                                    src={user.profile.avatar}
                                    alt={user.name}
                                    width={120}
                                    height={120}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div className="bg-gradient-to-br from-[#FF6EA9]/70 to-[#ffb3cc] w-full h-full flex items-center justify-center text-white text-4xl font-semibold">
                                    {user.name?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>

                        <span className="absolute bottom-1 right-1 bg-green-500 border-2 border-white rounded-full w-5 h-5" />
                    </div>

                    <h1 className="text-2xl font-bold mt-4 text-[#0F172A]">{user.name}</h1>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                        <ShieldCheck size={15} className="text-[#FF6EA9]" /> {user.role || "Utilisateur"}
                    </p>
                </div>

                {/* --- Informations --- */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
                    <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3 p-4 rounded-2xl bg-white/70 border border-gray-100 shadow-sm">
                        <Mail size={20} className="text-[#FF6EA9]" />
                        <div>
                            <p className="text-xs text-gray-500">Adresse e-mail</p>
                            <p className="font-medium">{user.email}</p>
                        </div>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3 p-4 rounded-2xl bg-white/70 border border-gray-100 shadow-sm">
                        <Calendar size={20} className="text-[#FF6EA9]" />
                        <div>
                            <p className="text-xs text-gray-500">Inscrit le</p>
                            <p className="font-medium">
                                {new Date(user.created_at).toLocaleDateString("fr-FR", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3 p-4 rounded-2xl bg-white/70 border border-gray-100 shadow-sm">
                        <User size={20} className="text-[#FF6EA9]" />
                        <div>
                            <p className="text-xs text-gray-500">Compte</p>
                            <p className="font-medium capitalize">{user.is_active ? "Actif" : "Inactif"}</p>
                        </div>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3 p-4 rounded-2xl bg-white/70 border border-gray-100 shadow-sm">
                        {user.is_verified ? (
                            <CheckCircle2 size={20} className="text-green-500" />
                        ) : (
                            <XCircle size={20} className="text-red-400" />
                        )}
                        <div>
                            <p className="text-xs text-gray-500">Email vérifié</p>
                            <p className="font-medium">{user.is_verified ? "Oui" : "Non"}</p>
                        </div>
                    </motion.div>
                </div>

                {/* --- Actions en liste --- */}
                <div className="mt-12 space-y-3 max-w-xl mx-auto w-full">
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">

                        {/* Modifier mon profil */}
                        <motion.button
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toast("Fonctionnalité à venir 🚧")}
                            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#fff5f9] transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-[#FF6EA9]/10 text-[#FF6EA9]">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold text-[#0F172A]">Modifier mon profil</p>
                                    <p className="text-sm text-gray-500">Mettez à jour vos informations personnelles</p>
                                </div>
                            </div>
                            <span className="text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </motion.button>

                        {/* Changer mon mot de passe */}
                        <motion.button
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#fff5f9] transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-[#FF6EA9]/10 text-[#FF6EA9]">
                                    <KeyRound size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold text-[#0F172A]">Changer mon mot de passe</p>
                                    <p className="text-sm text-gray-500">Sécurisez à nouveau votre compte</p>
                                </div>
                            </div>
                            <span className="text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </motion.button>

                        {/* Supprimer mon compte */}
                        <motion.button
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loadingDelete}
                            onClick={handleDeleteAccount}
                            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-red-50 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-red-100 text-red-500">
                                    <Trash2 size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold text-red-600">
                                        {loadingDelete ? "Suppression..." : "Supprimer mon compte"}
                                    </p>
                                    <p className="text-sm text-gray-500">Action irréversible – soyez prudent</p>
                                </div>
                            </div>
                            <span className="text-red-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </motion.button>

                        {/* Déconnexion */}
                        <motion.button
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleLogout}
                            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#f9f9f9] transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-gray-100 text-[#FF6EA9]">
                                    <LogOut size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold text-[#0F172A]">Se déconnecter</p>
                                    <p className="text-sm text-gray-500">Quitter votre session actuelle</p>
                                </div>
                            </div>
                            <span className="text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </motion.button>
                    </div>
                </div>


                {/* --- Decorative blob --- */}
                <motion.div
                    className="absolute -z-10 top-0 right-0 w-64 h-64 bg-[#FF6EA9]/20 rounded-full blur-3xl"
                    animate={{ y: [0, 20, 0], opacity: [0.4, 0.6, 0.4] }}
                    transition={{ duration: 6, repeat: Infinity }}
                />
            </motion.div>

            {/* --- Modal changement mot de passe --- */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
                    >
                        <h2 className="text-xl font-bold mb-4 text-center text-[#0F172A]">
                            🔐 Changer mon mot de passe
                        </h2>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Ancien mot de passe</label>
                                <input
                                    type="password"
                                    required
                                    value={passwords.old_password}
                                    onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
                                    className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#FF6EA9]/40"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Nouveau mot de passe</label>
                                <input
                                    type="password"
                                    required
                                    value={passwords.new_password}
                                    onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                                    className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#FF6EA9]/40"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Confirmer le mot de passe</label>
                                <input
                                    type="password"
                                    required
                                    value={passwords.confirm_password}
                                    onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                                    className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#FF6EA9]/40"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={loadingPwd}
                                    className="px-4 py-2 rounded-lg bg-[#FF6EA9] text-white font-semibold hover:bg-[#ff579d] disabled:opacity-50"
                                >
                                    {loadingPwd ? "En cours..." : "Valider"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </main>
    )
}
