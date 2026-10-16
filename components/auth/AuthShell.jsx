"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, XCircle, Check, Loader2 } from "lucide-react";
import BrandMark from "../BrandMark";
import { PASSWORD_RULES } from "../../lib/fieldRules";

// Cadre commun des pages de connexion et d'inscription (16/10/2026) : logo de la vitrine
// (BrandMark, à l'identique), carte papier à filet fin, mêmes champs, mêmes boutons partout.
export default function AuthShell({ title, subtitle, children, footer, wide = false }) {
    return (
        <main className="min-h-screen bg-[#F9F8F6] px-4 py-10 sm:py-16 flex flex-col items-center">
            <Link href="/" aria-label="E.doto family, accueil" className="mb-8">
                <BrandMark size="lg" />
            </Link>
            <section className={`w-full ${wide ? "max-w-xl" : "max-w-md"} rounded-2xl border border-[#E9E5DF] bg-white px-6 py-8 sm:px-9 sm:py-10`}>
                {title && <h1 className="text-[22px] sm:text-2xl font-semibold tracking-tight text-[#1A1814] text-center">{title}</h1>}
                {subtitle && <p className="mt-2 text-sm text-[#6B655D] text-center">{subtitle}</p>}
                <div className={title || subtitle ? "mt-7" : ""}>{children}</div>
            </section>
            {footer && <div className="mt-6 w-full max-w-md space-y-2 text-center text-sm text-[#6B655D]">{footer}</div>}
        </main>
    );
}

export function AuthLink({ href, children }) {
    return <Link href={href} className="font-medium text-[#C2185B] hover:underline underline-offset-4">{children}</Link>;
}

export function AuthAlert({ type, message, children }) {
    if (!message) return null;
    const ok = type === "success";
    return (
        <div role={ok ? "status" : "alert"} className={`mb-5 flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm ${ok ? "border-[#CFE3D3] bg-[#EEF6F0] text-[#2F5D3A]" : "border-[#F1CFCB] bg-[#FDF1EF] text-[#9B2C2C]"}`}>
            {ok ? <CheckCircle2 size={18} className="mt-px shrink-0" /> : <XCircle size={18} className="mt-px shrink-0" />}
            <div className="min-w-0">
                <p>{message}</p>
                {children}
            </div>
        </div>
    );
}

const inputBase =
    "w-full h-12 rounded-xl border bg-white text-[15px] text-[#1A1814] placeholder:text-[#A8A29A] transition focus:outline-none focus:ring-2 disabled:bg-[#F9F8F6]";
export const inputClass = (error, withIcon = true, extra = "") =>
    `${inputBase} ${withIcon ? "pl-11" : "pl-4"} pr-4 ${error ? "border-[#D9534F] focus:ring-[#D9534F]/20" : "border-[#E6E2DC] focus:border-[#C2185B] focus:ring-[#C2185B]/15"} ${extra}`;

// Champ avec libellé, icône, message d'erreur (affiché après le premier passage) et aide
export function AuthField({ id, label, icon: Icon, error, hint, right, className = "", ...input }) {
    return (
        <div className={className}>
            <label htmlFor={id} className="block text-sm font-medium text-[#3D3934]">{label}</label>
            <div className="relative mt-2">
                {Icon && <Icon size={18} strokeWidth={1.8} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A29A]" />}
                <input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
                    className={inputClass(error, !!Icon, right ? "pr-11" : "")} {...input} />
                {right}
            </div>
            {error ? (
                <p id={`${id}-error`} className="mt-1.5 text-[13px] text-[#B42318]">{error}</p>
            ) : hint ? (
                <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-[#8A837A]">{hint}</p>
            ) : null}
        </div>
    );
}

// Mot de passe avec bouton « afficher » et, à la création, la liste des règles cochées en direct
export function PasswordField({ id = "password", label = "Mot de passe", icon, value, onChange, error, showRules = false, ...rest }) {
    const [show, setShow] = useState(false);
    return (
        <div>
            <AuthField
                id={id}
                label={label}
                icon={icon}
                type={show ? "text" : "password"}
                value={value}
                onChange={onChange}
                error={error}
                {...rest}
                right={
                    <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#A8A29A] transition hover:text-[#1A1814]">
                        {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                }
            />
            {showRules && <PasswordRules value={value} />}
        </div>
    );
}

// Liste des règles du mot de passe, cochées en direct
export function PasswordRules({ value, className = "mt-2.5" }) {
    return (
        <ul className={`${className} grid grid-cols-2 gap-x-3 gap-y-1.5`} aria-label="Règles du mot de passe">
            {PASSWORD_RULES.map((r) => {
                const ok = r.test(value || "");
                return (
                    <li key={r.key} className={`flex items-center gap-1.5 text-[12.5px] ${ok ? "text-[#2F5D3A]" : "text-[#8A837A]"}`}>
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${ok ? "border-[#2F5D3A] bg-[#2F5D3A] text-white" : "border-[#D6D2CB]"}`}>
                            {ok && <Check size={11} strokeWidth={3} />}
                        </span>
                        {r.label}
                    </li>
                );
            })}
        </ul>
    );
}

// Choix à boutons (sexe…) : boutons radio accessibles
export function ChoiceField({ label, name, options, value, onChange, error }) {
    return (
        <fieldset>
            <legend className="block text-sm font-medium text-[#3D3934]">{label}</legend>
            <div className="mt-2 grid grid-cols-2 gap-2.5" role="radiogroup">
                {options.map((o) => {
                    const on = value === o.value;
                    return (
                        <label key={o.value} className={`flex cursor-pointer flex-col rounded-xl border px-4 py-3 transition ${on ? "border-[#C2185B] bg-[#FBEEF3]" : error ? "border-[#D9534F]" : "border-[#E6E2DC] hover:border-[#C9C3BA]"}`}>
                            <input type="radio" name={name} value={o.value} checked={on} onChange={() => onChange(o.value)} className="sr-only" />
                            <span className={`text-[15px] font-medium ${on ? "text-[#A0124A]" : "text-[#1A1814]"}`}>{o.label}</span>
                            {o.hint && <span className="text-[12.5px] text-[#8A837A]">{o.hint}</span>}
                        </label>
                    );
                })}
            </div>
            {error && <p className="mt-1.5 text-[13px] text-[#B42318]">{error}</p>}
        </fieldset>
    );
}

export function AuthSubmit({ loading, disabled, children, loadingText }) {
    return (
        <button type="submit" disabled={loading || disabled}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1A1814] text-[15px] font-medium text-white transition hover:bg-[#3D3934] disabled:cursor-not-allowed disabled:bg-[#D6D2CB] disabled:text-[#8A837A]">
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? loadingText || children : children}
        </button>
    );
}
