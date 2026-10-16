"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
const MAX = 3 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

const initials = (n) => String(n || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";

// Adresse de la photo, quelle que soit la forme renvoyée par GET /me
export function avatarUrl(user) {
    const a = user?.profile?.avatar;
    if (!a) return null;
    if (typeof a === "string") return a;
    return a.url || a.original || a.thumbnail || null;
}

/**
 * Photo de profil (16/10/2026), commune aux utilisateurs, sponsors et points de retrait :
 * aperçu, envoi (JPEG, PNG ou WebP, 3 Mo au plus, vérifiés ici puis par l'API), remplacement, retrait.
 * onChange(url | null) : prévient la page pour mettre à jour l'utilisateur affiché.
 */
export default function ProfilePhoto({ user, size = 112, onChange }) {
    const input = useRef(null);
    const [busy, setBusy] = useState(false);
    const [preview, setPreview] = useState(null);
    const url = preview ?? avatarUrl(user);

    const send = async (file) => {
        if (!file) return;
        if (!TYPES.includes(file.type)) return toast.error("Format non accepté : choisissez une photo JPEG, PNG ou WebP.");
        if (file.size > MAX) return toast.error("Photo trop lourde : 3 Mo au maximum.");
        const local = URL.createObjectURL(file);
        setPreview(local);
        setBusy(true);
        try {
            const form = new FormData();
            form.append("photo", file);
            const res = await fetch(`${API}/me/photo`, {
                method: "POST",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: form,
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(Array.isArray(data?.message) ? data.message[0] : data?.message || "La photo n'a pas pu être enregistrée.");
            setPreview(data.avatar?.url || local);
            onChange?.(data.avatar?.url || null);
            toast.success("Photo de profil mise à jour.");
        } catch (e) {
            setPreview(null);
            toast.error(e.message);
        } finally {
            setBusy(false);
            if (input.current) input.current.value = "";
        }
    };

    const remove = async () => {
        setBusy(true);
        try {
            const res = await fetch(`${API}/me/photo`, { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
            if (!res.ok) throw new Error("La photo n'a pas pu être retirée.");
            setPreview("");
            onChange?.(null);
            toast.success("Photo de profil retirée.");
        } catch (e) {
            toast.error(e.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex items-center gap-5">
            <div className="relative shrink-0" style={{ width: size, height: size }}>
                {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt={user?.name || "Photo de profil"} className="h-full w-full rounded-full object-cover ring-1 ring-[#E9E5DF]" />
                ) : (
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-[#1A1814] font-semibold text-white" style={{ fontSize: size / 3 }}>
                        {initials(user?.name)}
                    </span>
                )}
                {busy && (
                    <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70">
                        <Loader2 size={22} className="animate-spin text-[#1A1814]" />
                    </span>
                )}
                <button type="button" onClick={() => input.current?.click()} disabled={busy} aria-label="Changer la photo de profil"
                    className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#1A1814] text-white transition hover:bg-[#3D3934] disabled:opacity-60">
                    <Camera size={16} />
                </button>
            </div>
            <div className="min-w-0">
                <p className="text-sm font-medium text-[#1A1814]">Photo de profil</p>
                <p className="mt-0.5 text-[12.5px] text-[#8A837A]">JPEG, PNG ou WebP, 3 Mo au maximum.</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                    <button type="button" onClick={() => input.current?.click()} disabled={busy}
                        className="h-9 rounded-lg border border-[#E6E2DC] px-3.5 text-[13px] font-medium text-[#1A1814] transition hover:border-[#1A1814] disabled:opacity-60">
                        {url ? "Changer" : "Ajouter une photo"}
                    </button>
                    {url && (
                        <button type="button" onClick={remove} disabled={busy}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-[#9B2C2C] transition hover:bg-[#FDF1EF] disabled:opacity-60">
                            <Trash2 size={14} /> Retirer
                        </button>
                    )}
                </div>
            </div>
            <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => send(e.target.files?.[0])} />
        </div>
    );
}
