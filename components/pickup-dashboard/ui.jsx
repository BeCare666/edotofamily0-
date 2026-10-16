"use client";

// Éléments d'interface du dashboard (palette naturelle : ivoire, sable, brun profond ; accent rose E.doto)
export function Card({ className = "", children, ...rest }) {
    return (
        <div className={`bg-white rounded-2xl border border-[#E9E5DF] ${className}`} {...rest}>
            {children}
        </div>
    );
}

export function SectionTitle({ title, subtitle, action }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
                <h1 className="font-serif text-2xl sm:text-3xl text-[#1A1814] tracking-tight">{title}</h1>
                {subtitle && <p className="text-sm text-[#6B655D] mt-1">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

export function StatCard({ label, value, hint, icon: Icon, tone = "rose" }) {
    const tones = {
        rose: "bg-[#FBEEF3] text-[#C2185B]",
        sage: "bg-[#E8EFE6] text-[#3F6B45]",
        sand: "bg-[#F3EBDD] text-[#8A6A3B]",
        ink: "bg-[#ECE9E4] text-[#3D3934]",
    };
    return (
        <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.12em] text-[#8A837A]">{label}</p>
                    <p className="mt-2 text-2xl sm:text-[28px] font-semibold text-[#1A1814] truncate">{value}</p>
                    {hint && <p className="mt-1 text-xs text-[#6B655D]">{hint}</p>}
                </div>
                {Icon && (
                    <span className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center ${tones[tone]}`}>
                        <Icon size={20} />
                    </span>
                )}
            </div>
        </Card>
    );
}

export function Badge({ tone = "ink", children }) {
    const tones = {
        ok: "bg-[#E8EFE6] text-[#3F6B45]",
        wait: "bg-[#FDF1E0] text-[#9A5B13]",
        ink: "bg-[#ECE9E4] text-[#3D3934]",
        rose: "bg-[#FBEEF3] text-[#C2185B]",
        off: "bg-[#F5E4E4] text-[#9B2C2C]",
    };
    return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function Tabs({ value, onChange, items }) {
    return (
        <div className="dash-scroll-x inline-flex max-w-full overflow-x-auto p-1 rounded-2xl bg-[#F3F1EE] border border-[#E9E5DF]" role="tablist">
            {items.map((it) => (
                <button
                    key={it.key}
                    role="tab"
                    aria-selected={value === it.key}
                    onClick={() => onChange(it.key)}
                    className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-xl text-sm transition-all duration-200 ${value === it.key ? "bg-white text-[#1A1814] shadow-sm font-medium" : "text-[#6B655D] hover:text-[#1A1814]"}`}
                >
                    {it.label}
                    {typeof it.count === "number" && <span className="ml-1.5 text-xs text-[#8A837A]">{it.count}</span>}
                </button>
            ))}
        </div>
    );
}

export function Empty({ title, text }) {
    return (
        <div className="py-16 text-center">
            <p className="font-serif text-lg text-[#1A1814]">{title}</p>
            {text && <p className="text-sm text-[#6B655D] mt-1">{text}</p>}
        </div>
    );
}

export function Skeleton({ className = "" }) {
    return <div className={`animate-pulse rounded-2xl bg-[#EFECE7] ${className}`} />;
}

export function ErrorBox({ message, onRetry }) {
    return (
        <Card className="p-6 text-center">
            <p className="text-[#9B2C2C] mb-3">{message}</p>
            {onRetry && (
                <button onClick={onRetry} className="px-5 py-2 rounded-full bg-[#1A1814] text-white text-sm">
                    Réessayer
                </button>
            )}
        </Card>
    );
}
