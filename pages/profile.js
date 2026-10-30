"use client"

import { useAuthContext } from "../context/AuthContext"
import {
    User,
    Mail,
    ShieldCheck,
    Calendar,
    LogOut,
    KeyRound,
    Trash2,
    Phone,
    CalendarDays,
    Lock,
    ShoppingBag,
    Gift,
    ChevronRight,
    CheckCircle2,
    Loader2,
    Download,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useEffect, useState } from "react"
import { apiRequest } from "../lib/api" // ✅ On réutilise ton helper existant
import { authService } from "../services/authService"
import ProfilePhoto from "../components/profile/ProfilePhoto"
import { AuthField, ChoiceField, PasswordField, inputClass } from "../components/auth/AuthShell"
import {
    ageOn, birthDateError, birthDateLimits, nameError, nameInput, passwordError, passwordInput,
    phoneError, phoneInput, SEX_OPTIONS,
} from "../lib/fieldRules"

const ROLE_LABEL = {
    customer: "Utilisateur",
    sponsor: "Sponsor",
    super_pickuppoint: "Point de retrait",
    super_admin: "Administration",
    store_owner: "Boutique",
    staff: "Équipe boutique",
}
const SEX_LABEL = { female: "Féminin", male: "Masculin" }
// Droits des personnes (autorisation APDP, point f, 30/10/2026) : mêmes règles que l'API (src/users/my-data.ts)
const SELF_DELETE_ROLES = ["customer"]
const RIGHTS_CONTACT = "contact@edotofamily.com"
const longDate = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })

function Section({ title, subtitle, children, action }) {
    return (
        <section className="rounded-2xl border border-[#E9E5DF] bg-white">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EFECE7] px-5 py-4 sm:px-7">
                <div>
                    <h2 className="text-[15px] font-semibold text-[#1A1814]">{title}</h2>
                    {subtitle && <p className="mt-0.5 text-[13px] text-[#8A837A]">{subtitle}</p>}
                </div>
                {action}
            </header>
            <div className="px-5 py-5 sm:px-7 sm:py-6">{children}</div>
        </section>
    )
}

function Row({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-3.5 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F3F1EE] text-[#57524B]"><Icon size={17} strokeWidth={1.8} /></span>
            <div className="min-w-0">
                <p className="text-[12px] text-[#8A837A]">{label}</p>
                <p className="truncate text-[14.5px] font-medium text-[#1A1814]">{value}</p>
            </div>
        </div>
    )
}

// Profil dans le dashboard de chaque compte (30/10/2026) : la page /profile renvoie vers la vue « Mon profil »
// du dashboard ; embedded = affichage dans le dashboard (sans fond ni marges de page, pas de pied de page).
const PROFILE_IN_DASHBOARD = {
    customer: "/mon-espace#profile",
    super_pickuppoint: "/pickup-dashboard#profile",
    doctor: "/medecin#profile",
    health_center: "/centre#profile",
    sponsor: "/sponsor?vue=profile",
}

export default function ProfilePage({ embedded = false }) {
    const { user, setUser, logout, loading } = useAuthContext() || {}
    const router = useRouter()
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({ name: "", phone: "", birth_date: "", sex: "" })
    const [touched, setTouched] = useState(false)
    const [saving, setSaving] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [loadingDelete, setLoadingDelete] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deletePassword, setDeletePassword] = useState("")
    const [loadingExport, setLoadingExport] = useState(false)
    const [passwords, setPasswords] = useState({ old_password: "", new_password: "", confirm_password: "" })
    const [pwdTouched, setPwdTouched] = useState(false)
    const [loadingPwd, setLoadingPwd] = useState(false)

    useEffect(() => {
        if (!loading && !user) router.push("/login")
        else if (!embedded && user && PROFILE_IN_DASHBOARD[user.role]) router.replace(PROFILE_IN_DASHBOARD[user.role])
    }, [loading, user, router, embedded])

    const startEdit = () => {
        setForm({ name: user.name || "", phone: user.profile?.contact || "", birth_date: user.birth_date || "", sex: user.sex || "" })
        setTouched(false)
        setEditing(true)
    }

    if (!user) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center gap-2 text-[#8A837A]">
                <Loader2 size={18} className="animate-spin" /> <p>Chargement du profil...</p>
            </main>
        )
    }

    const isPerson = !["sponsor", "super_pickuppoint"].includes(user.role)
    const birthLocked = !!user.birth_date
    const sexLocked = !!user.sex
    const limits = birthDateLimits()
    const errors = {
        name: nameError(form.name, "Le nom complet"),
        phone: phoneError(form.phone, { required: false }),
        birth_date: !isPerson || birthLocked || !form.birth_date ? "" : birthDateError(form.birth_date),
    }
    const pwdErrors = {
        old: passwords.old_password ? "" : "Indiquez votre mot de passe actuel.",
        new: passwordError(passwords.new_password),
        confirm: passwords.confirm_password === passwords.new_password ? "" : "Les mots de passe ne correspondent pas.",
    }

    const refreshUser = async () => {
        try { setUser?.(await authService.me()) } catch { }
    }

    // --- Déconnexion
    const handleLogout = async () => {
        await logout()
        toast.success("Déconnexion réussie 👋")
        router.push("/login")
    }

    // --- Modification du profil (nom, téléphone ; date de naissance et sexe s'ils manquent)
    const handleSave = async (e) => {
        e.preventDefault()
        setTouched(true)
        if (Object.values(errors).some(Boolean)) return
        setSaving(true)
        try {
            const body = { name: form.name.trim().replace(/\s+/g, " "), phone: form.phone }
            if (isPerson && !birthLocked && form.birth_date) body.birth_date = form.birth_date
            if (isPerson && !sexLocked && form.sex) body.sex = form.sex
            await apiRequest("/me/profile", { method: "PATCH", body: JSON.stringify(body) })
            await refreshUser()
            toast.success("Profil mis à jour ✅")
            setEditing(false)
        } catch (err) {
            toast.error(err.message || "Le profil n'a pas pu être mis à jour.")
        } finally {
            setSaving(false)
        }
    }

    // --- Changement de mot de passe
    const handlePasswordChange = async (e) => {
        e.preventDefault()
        setPwdTouched(true)
        if (Object.values(pwdErrors).some(Boolean)) return

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
            setPwdTouched(false)
            setPasswords({ old_password: "", new_password: "", confirm_password: "" })
        } catch (err) {
            toast.error(err.message || "Erreur lors du changement de mot de passe")
        } finally {
            setLoadingPwd(false)
        }
    }

    // --- Télécharger mes données (fichier JSON de tout le compte)
    const handleExport = async () => {
        try {
            setLoadingExport(true)
            const data = await apiRequest("/me/data-export")
            const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }))
            const a = document.createElement("a")
            a.href = url
            a.download = `mes-donnees-edoto-family-${new Date().toISOString().slice(0, 10)}.json`
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
            toast.success("Vos données sont téléchargées.")
        } catch (err) {
            toast.error(err.message || "Le fichier n'a pas pu être préparé.")
        } finally {
            setLoadingExport(false)
        }
    }

    // --- Suppression du compte : mot de passe redemandé ; identité effacée, commandes et paiements gardés sans identité
    const handleDeleteAccount = async (e) => {
        e.preventDefault()
        if (!deletePassword) return toast.error("Indiquez votre mot de passe.")
        try {
            setLoadingDelete(true)
            const res = await apiRequest("/me/delete-account", { method: "POST", body: JSON.stringify({ password: deletePassword }) })
            toast.success(res?.message || "Votre compte est supprimé.")
            setShowDeleteModal(false)
            await logout()
            router.push("/")
        } catch (err) {
            toast.error(err.message || "Le compte n'a pas pu être supprimé.")
        } finally {
            setLoadingDelete(false)
            setDeletePassword("")
        }
    }

    const age = user.birth_date ? ageOn(user.birth_date) : null

    return (
        <main className={embedded ? "" : "min-h-screen bg-[#F9F8F6] px-4 pb-16 pt-8 sm:pt-12"}>
            <div className={embedded ? "max-w-4xl space-y-6" : "mx-auto max-w-4xl space-y-6"}>
                {/* --- En-tête : photo, nom, rôle --- */}
                <section className="rounded-2xl border border-[#E9E5DF] bg-white px-5 py-6 sm:px-8 sm:py-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <ProfilePhoto user={user} onChange={refreshUser} />
                        <div className="sm:text-right">
                            <h1 className="text-2xl font-semibold tracking-tight text-[#1A1814]">{user.name}</h1>
                            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-[#6B655D]">
                                <ShieldCheck size={15} className="text-[#C2185B]" /> {ROLE_LABEL[user.role] || "Utilisateur"}
                            </p>
                            {user.created_at && <p className="mt-1 text-[13px] text-[#8A837A]">Inscrit le {longDate(user.created_at)}</p>}
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                    {/* --- Informations personnelles --- */}
                    <Section
                        title="Informations personnelles"
                        subtitle="Mettez à jour vos informations personnelles"
                        action={!editing && (
                            <button type="button" onClick={startEdit} className="h-9 rounded-lg border border-[#E6E2DC] px-3.5 text-[13px] font-medium text-[#1A1814] transition hover:border-[#1A1814]">
                                Modifier mon profil
                            </button>
                        )}
                    >
                        {editing ? (
                            <form onSubmit={handleSave} noValidate className="space-y-5">
                                <AuthField id="p-name" label="Nom complet" icon={User} value={form.name} autoComplete="name"
                                    onChange={(e) => setForm({ ...form, name: nameInput(e.target.value) })} error={touched ? errors.name : ""} />
                                <AuthField id="p-phone" label="Téléphone" icon={Phone} value={form.phone} inputMode="tel" autoComplete="tel" placeholder="0197000000"
                                    onChange={(e) => setForm({ ...form, phone: phoneInput(e.target.value) })} error={touched ? errors.phone : ""}
                                    hint="Chiffres uniquement, 8 à 15 chiffres." />
                                {isPerson && (
                                    birthLocked ? (
                                        <div>
                                            <p className="text-sm font-medium text-[#3D3934]">Date de naissance</p>
                                            <div className="relative mt-2">
                                                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A29A]" />
                                                <input disabled value={longDate(`${user.birth_date}T00:00:00`)} className={inputClass(false, true)} />
                                            </div>
                                            <p className="mt-1.5 text-[13px] text-[#8A837A]">Pour la corriger, contactez E.doto family.</p>
                                        </div>
                                    ) : (
                                        <AuthField id="p-birth" label="Date de naissance" icon={CalendarDays} type="date" min={limits.min} max={limits.max}
                                            value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} error={touched ? errors.birth_date : ""} />
                                    )
                                )}
                                {isPerson && (
                                    sexLocked ? (
                                        <div>
                                            <p className="text-sm font-medium text-[#3D3934]">Sexe</p>
                                            <div className="relative mt-2">
                                                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A29A]" />
                                                <input disabled value={SEX_LABEL[user.sex] || user.sex} className={inputClass(false, true)} />
                                            </div>
                                        </div>
                                    ) : (
                                        <ChoiceField label="Sexe" name="p-sex" options={SEX_OPTIONS} value={form.sex} onChange={(v) => setForm({ ...form, sex: v })} />
                                    )
                                )}
                                <div className="flex flex-wrap justify-end gap-2 pt-1">
                                    <button type="button" onClick={() => setEditing(false)} className="h-11 rounded-xl px-5 text-sm font-medium text-[#57524B] hover:bg-[#F3F1EE]">Annuler</button>
                                    <button type="submit" disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1A1814] px-6 text-sm font-medium text-white transition hover:bg-[#3D3934] disabled:opacity-60">
                                        {saving && <Loader2 size={16} className="animate-spin" />} Enregistrer
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="divide-y divide-[#F1EFEB]">
                                <Row icon={User} label="Nom complet" value={user.name} />
                                <Row icon={Mail} label="Adresse e-mail" value={user.email} />
                                <Row icon={Phone} label="Téléphone" value={user.profile?.contact || "Non renseigné"} />
                                {isPerson && <Row icon={CalendarDays} label="Date de naissance" value={user.birth_date ? `${longDate(`${user.birth_date}T00:00:00`)} (${age} ans)` : "Non renseignée"} />}
                                {isPerson && <Row icon={User} label="Sexe" value={SEX_LABEL[user.sex] || "Non renseigné"} />}
                                <Row icon={Calendar} label="Inscrit le" value={user.created_at ? longDate(user.created_at) : "Non renseigné"} />
                            </div>
                        )}
                    </Section>

                    <div className="space-y-6">
                        {/* --- Compte --- */}
                        <Section title="Compte">
                            <div className="divide-y divide-[#F1EFEB]">
                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-sm text-[#57524B]">Compte</span>
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${user.is_active ? "bg-[#EEF6F0] text-[#2F5D3A]" : "bg-[#FDF1EF] text-[#9B2C2C]"}`}>
                                        {user.is_active ? "Actif" : "Inactif"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-sm text-[#57524B]">Compte vérifié</span>
                                    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1A1814]">
                                        {Number(user.email_verified) === 1 || user.is_verified ? <><CheckCircle2 size={15} className="text-[#2F5D3A]" /> Oui</> : "Non"}
                                    </span>
                                </div>
                            </div>
                        </Section>

                        {/* --- Raccourcis --- */}
                        {user.role === "customer" && (
                            <nav className="overflow-hidden rounded-2xl border border-[#E9E5DF] bg-white" aria-label="Raccourcis">
                                {[
                                    ["/orders", ShoppingBag, "Mes commandes", "Suivi, codes de retrait et factures"],
                                    ["/campaigns", Gift, "Campagnes", "Demander un kit gratuit"],
                                ].map(([href, Icon, label, text]) => (
                                    <Link key={href} href={href} className="flex items-center gap-4 border-b border-[#F1EFEB] px-5 py-4 transition last:border-0 hover:bg-[#FBFAF8]">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FBEEF3] text-[#C2185B]"><Icon size={17} strokeWidth={1.8} /></span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-medium text-[#1A1814]">{label}</span>
                                            <span className="block text-[12.5px] text-[#8A837A]">{text}</span>
                                        </span>
                                        <ChevronRight size={16} className="text-[#A8A29A]" />
                                    </Link>
                                ))}
                            </nav>
                        )}

                        {/* --- Sécurité et session --- */}
                        <div className="overflow-hidden rounded-2xl border border-[#E9E5DF] bg-white">
                            <button type="button" onClick={() => setShowPasswordModal(true)} className="flex w-full items-center gap-4 border-b border-[#F1EFEB] px-5 py-4 text-left transition hover:bg-[#FBFAF8]">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3F1EE] text-[#57524B]"><KeyRound size={17} strokeWidth={1.8} /></span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-medium text-[#1A1814]">Changer mon mot de passe</span>
                                    <span className="block text-[12.5px] text-[#8A837A]">Sécurisez à nouveau votre compte</span>
                                </span>
                                <ChevronRight size={16} className="text-[#A8A29A]" />
                            </button>
                            <button type="button" onClick={handleLogout} className="flex w-full items-center gap-4 border-b border-[#F1EFEB] px-5 py-4 text-left transition hover:bg-[#FBFAF8]">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3F1EE] text-[#57524B]"><LogOut size={17} strokeWidth={1.8} /></span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-medium text-[#1A1814]">Se déconnecter</span>
                                    <span className="block text-[12.5px] text-[#8A837A]">Quitter votre session actuelle</span>
                                </span>
                                <ChevronRight size={16} className="text-[#A8A29A]" />
                            </button>
                            <button type="button" onClick={handleExport} disabled={loadingExport} className="flex w-full items-center gap-4 border-b border-[#F1EFEB] px-5 py-4 text-left transition hover:bg-[#FBFAF8] disabled:opacity-60">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3F1EE] text-[#57524B]">{loadingExport ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} strokeWidth={1.8} />}</span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-medium text-[#1A1814]">{loadingExport ? "Préparation..." : "Télécharger mes données"}</span>
                                    <span className="block text-[12.5px] text-[#8A837A]">Un fichier avec tout ce que nous gardons sur votre compte</span>
                                </span>
                                <ChevronRight size={16} className="text-[#A8A29A]" />
                            </button>
                            {SELF_DELETE_ROLES.includes(user.role) ? (
                                <button type="button" onClick={() => setShowDeleteModal(true)} disabled={loadingDelete} className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[#FDF1EF]">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FDF1EF] text-[#9B2C2C]"><Trash2 size={17} strokeWidth={1.8} /></span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-medium text-[#9B2C2C]">Supprimer mon compte</span>
                                        <span className="block text-[12.5px] text-[#8A837A]">Action irréversible : soyez prudent</span>
                                    </span>
                                    <ChevronRight size={16} className="text-[#D6B4B0]" />
                                </button>
                            ) : (
                                <a href={`mailto:${RIGHTS_CONTACT}?subject=Suppression de mon compte`} className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[#FDF1EF]">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FDF1EF] text-[#9B2C2C]"><Trash2 size={17} strokeWidth={1.8} /></span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-medium text-[#9B2C2C]">Supprimer mon compte</span>
                                        <span className="block text-[12.5px] text-[#8A837A]">Écrivez à {RIGHTS_CONTACT} : nous réglons d&apos;abord ce qui est en cours</span>
                                    </span>
                                    <ChevronRight size={16} className="text-[#D6B4B0]" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Fenêtre : suppression du compte --- */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#1A1814]/40 p-0 sm:items-center sm:p-4" onClick={() => setShowDeleteModal(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-2xl border border-[#E9E5DF] bg-white p-6 sm:rounded-2xl sm:p-7">
                        <h2 className="mb-2 text-lg font-semibold text-[#1A1814]">Supprimer mon compte</h2>
                        <p className="mb-5 text-[13.5px] leading-relaxed text-[#57524B]">
                            Votre nom, vos coordonnées et votre profil seront effacés et vous ne pourrez plus vous connecter.
                            Les commandes et paiements restent gardés pour la durée imposée par la loi, sans votre identité.
                            Pensez à télécharger vos données avant.
                        </p>
                        <form onSubmit={handleDeleteAccount} noValidate className="space-y-4">
                            <PasswordField id="delete_password" label="Votre mot de passe" icon={Lock} value={deletePassword} autoComplete="current-password"
                                onChange={(e) => setDeletePassword(e.target.value)} />
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowDeleteModal(false)} className="h-11 rounded-xl px-5 text-sm font-medium text-[#57524B] hover:bg-[#F3F1EE]">
                                    Annuler
                                </button>
                                <button type="submit" disabled={loadingDelete} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#9B2C2C] px-6 text-sm font-medium text-white hover:bg-[#7F2323] disabled:opacity-60">
                                    {loadingDelete && <Loader2 size={16} className="animate-spin" />} {loadingDelete ? "Suppression..." : "Supprimer définitivement"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- Fenêtre : changement de mot de passe --- */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#1A1814]/40 p-0 sm:items-center sm:p-4" onClick={() => setShowPasswordModal(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-2xl border border-[#E9E5DF] bg-white p-6 sm:rounded-2xl sm:p-7">
                        <h2 className="mb-5 text-lg font-semibold text-[#1A1814]">Changer mon mot de passe</h2>
                        <form onSubmit={handlePasswordChange} noValidate className="space-y-4">
                            <PasswordField id="old_password" label="Ancien mot de passe" icon={Lock} value={passwords.old_password} autoComplete="current-password"
                                onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })} error={pwdTouched ? pwdErrors.old : ""} />
                            <PasswordField id="new_password" label="Nouveau mot de passe" icon={Lock} value={passwords.new_password} autoComplete="new-password" showRules
                                onChange={(e) => setPasswords({ ...passwords, new_password: passwordInput(e.target.value) })} error={pwdTouched ? pwdErrors.new : ""} />
                            <PasswordField id="confirm_password" label="Confirmer le mot de passe" icon={Lock} value={passwords.confirm_password} autoComplete="new-password"
                                onChange={(e) => setPasswords({ ...passwords, confirm_password: passwordInput(e.target.value) })}
                                error={pwdTouched || passwords.confirm_password ? pwdErrors.confirm : ""} />
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="h-11 rounded-xl px-5 text-sm font-medium text-[#57524B] hover:bg-[#F3F1EE]">
                                    Annuler
                                </button>
                                <button type="submit" disabled={loadingPwd} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1A1814] px-6 text-sm font-medium text-white hover:bg-[#3D3934] disabled:opacity-60">
                                    {loadingPwd && <Loader2 size={16} className="animate-spin" />} {loadingPwd ? "En cours..." : "Valider"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}
