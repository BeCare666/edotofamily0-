"use client";

import { Tabs } from "./ui";

// Filtre jour / mois / année (dates réelles des retraits, heure du Bénin)
export default function PeriodFilter({ period, date, onChange }) {
    const input = "px-3 py-2 rounded-xl border border-[#E4DBCE] bg-white text-sm text-[#1F1B16] focus:outline-none focus:ring-2 focus:ring-[#FF6EA9]/30";
    const setPeriod = (p) => {
        // On garde la même date de référence, au bon format
        const ref = date.length >= 10 ? date : date.length === 7 ? `${date}-01` : `${date}-01-01`;
        onChange(p, p === "day" ? ref.slice(0, 10) : p === "month" ? ref.slice(0, 7) : ref.slice(0, 4));
    };
    return (
        <div className="flex flex-wrap items-center gap-2">
            <Tabs
                value={period}
                onChange={setPeriod}
                items={[
                    { key: "day", label: "Jour" },
                    { key: "month", label: "Mois" },
                    { key: "year", label: "Année" },
                ]}
            />
            {period === "day" && (
                <input type="date" aria-label="Jour" className={input} value={date} onChange={(e) => e.target.value && onChange("day", e.target.value)} />
            )}
            {period === "month" && (
                <input type="month" aria-label="Mois" className={input} value={date} onChange={(e) => e.target.value && onChange("month", e.target.value)} />
            )}
            {period === "year" && (
                <input
                    type="number" min={2020} max={2100} aria-label="Année" className={`${input} w-28`} value={date}
                    onChange={(e) => /^\d{4}$/.test(e.target.value) && onChange("year", e.target.value)}
                />
            )}
        </div>
    );
}
