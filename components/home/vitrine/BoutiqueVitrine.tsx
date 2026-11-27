"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Gift } from "lucide-react";
import { useSponsoredProducts } from "../../../lib/sponsored";
import { ALL_PRODUCTS_HREF, categoryHref, categoryIcon, useCategories } from "../../../lib/siteNav";

// « La boutique » sur la vitrine (26/11/2026) : vraies catégories et vrais produits (API /products/corridor,
// les plus récents, comme la boutique), avec les images des produits eux-mêmes : aucune photo du site répétée.
// Badge « Offert par … » si un sponsor finance le produit (0 FCFA pour le public ciblé, sur la fiche).
const MDiv = motion.div as unknown as React.FC<any>;
const ease = [0.22, 1, 0.36, 1];
const API = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;

type Row = { id: number; slug: string; name: string; price: number | null; sale: number | null; img: string | null };

const fcfa = (n: number | null) => (n === null ? "" : `${Math.round(n).toLocaleString("fr-FR")} FCFA`);

function firstImage(field: any): string | null {
    let v: any = field;
    if (typeof v === "string") {
        try { v = JSON.parse(v); } catch { return v.includes(",") ? v.split(",")[0].trim() : v || null; }
    }
    const first = Array.isArray(v) ? v[0] : v;
    if (!first) return null;
    if (typeof first === "string") return first;
    return first.url || first.original || first.thumbnail || null;
}

export default function BoutiqueVitrine() {
    const categories = useCategories() as { id: number; name: string; slug: string }[];
    const sponsored = useSponsoredProducts() as Record<number, { offered_by: string }>;
    const [rows, setRows] = useState<Row[] | null>(null);

    useEffect(() => {
        const ctrl = new AbortController();
        const qs = new URLSearchParams({ limit: "8", offset: "0", orderBy: "created_at", sortedBy: "desc" });
        fetch(`${API}/products/corridor?${qs}`, { signal: ctrl.signal })
            .then((r) => (r.ok ? r.json() : { data: [] }))
            .then((j) => setRows((j?.data ?? []).map((r: any) => ({
                id: Number(r.id),
                slug: r.slug,
                name: r.name,
                price: r.price !== null && r.price !== undefined ? Number(r.price) : null,
                sale: r.sale_price !== null && r.sale_price !== undefined ? Number(r.sale_price) : null,
                img: firstImage(r.image),
            }))))
            .catch(() => setRows([]));
        return () => ctrl.abort();
    }, []);

    if (rows !== null && rows.length === 0) return null;

    return (
        <section className="bg-[#FCFAF8]" aria-labelledby="boutique-title">
            <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
                <MDiv initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease }}
                    className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
                    <div>
                        <p className="text-[14px] text-[#8A827A]">La boutique</p>
                        <h2 id="boutique-title" className="mt-3 text-[44px] font-normal leading-[1.02] tracking-[-0.04em] text-[#161412] sm:text-[60px]">
                            Commandez en toute discrétion
                        </h2>
                    </div>
                    <p className="text-[16px] leading-[1.8] text-[#6B645D]">
                        Des produits sans avis médical, à retirer avec un code dans le point de retrait de votre choix, ou livrés chez vous. Un sponsor peut aussi vous en offrir certains.
                    </p>
                </MDiv>

                {categories.length > 0 && (
                    <div className="mt-10 flex flex-wrap gap-2.5">
                        {categories.map((c) => {
                            const Icon = categoryIcon(c.slug);
                            return (
                                <Link key={c.id} href={categoryHref(c.id)}
                                    className="inline-flex items-center gap-2 rounded-full border border-[#E7DFD8] bg-white py-2 pl-2 pr-4 text-[14px] text-[#161412] transition-colors hover:border-[#C2185B] hover:text-[#C2185B]">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FBEEF3] text-[#C2185B]"><Icon size={15} /></span>
                                    {c.name}
                                </Link>
                            );
                        })}
                    </div>
                )}

                <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
                    {(rows ?? Array.from({ length: 4 }, () => null)).map((p, i) => (
                        <MDiv key={p ? p.id : `s${i}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.8, delay: (i % 4) * 0.06, ease }}>
                            {p ? (
                                <Link href={`/product/${p.slug}`} className="group block">
                                    <div className="relative aspect-square overflow-hidden rounded-[24px] bg-[#F1ECE6]">
                                        {p.img && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={p.img} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.05]" />
                                        )}
                                        {sponsored[p.id] && (
                                            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#C2185B]">
                                                <Gift size={13} /> Offert par un sponsor
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="mt-4 line-clamp-2 text-[16px] leading-snug text-[#161412] transition-colors group-hover:text-[#C2185B]">{p.name}</h3>
                                    <p className="mt-1.5 flex items-baseline gap-2 text-[15px] text-[#161412]">
                                        <span className="tabular-nums">{fcfa(p.sale ?? p.price)}</span>
                                        {p.sale !== null && p.price !== null && p.sale < p.price && <span className="text-[13px] text-[#A8A29B] line-through tabular-nums">{fcfa(p.price)}</span>}
                                    </p>
                                </Link>
                            ) : (
                                <div aria-hidden className="aspect-square animate-pulse rounded-[24px] bg-[#F1ECE6]" />
                            )}
                        </MDiv>
                    ))}
                </div>

                <Link href={ALL_PRODUCTS_HREF}
                    className="group mt-14 inline-flex items-center gap-2 rounded-full bg-[#1A1814] px-7 py-4 text-[15px] font-medium text-white transition-colors hover:bg-[#C2185B]">
                    Voir toute la boutique <ArrowUpRight size={16} className="transition-transform group-hover:rotate-45" />
                </Link>
            </div>
        </section>
    );
}
