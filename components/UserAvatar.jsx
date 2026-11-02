"use client";

import { useEffect, useState } from "react";
import { avatarUrl } from "./profile/ProfilePhoto";

export const initials = (n) => String(n || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";

/**
 * Avatar unique du compte connecté (02/11/2026) : en-tête, menu mobile, barres latérales et menus des dashboards.
 * Photo de profil (GET /me, quelle que soit sa forme) ; sans photo ou si elle ne se charge pas : initiales sur fond encre.
 * user : l'utilisateur (photo + nom) ; name : nom affiché à la place de user.name (sponsor, centre) ; src : photo déjà connue.
 */
export default function UserAvatar({ user, name, src, size = 40, className = "" }) {
    const url = src !== undefined ? src : avatarUrl(user);
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [url]);
    const label = name ?? user?.name;
    const box = { width: size, height: size };

    if (url && !failed) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={url} alt="" style={box} onError={() => setFailed(true)} className={`shrink-0 rounded-full object-cover ${className}`} />;
    }
    return (
        <span style={{ ...box, fontSize: Math.max(11, Math.round(size / 3)) }} title={label || undefined}
            className={`shrink-0 rounded-full bg-[#1A1814] text-white font-semibold flex items-center justify-center ${className}`}>
            {initials(label)}
        </span>
    );
}
