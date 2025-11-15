// pages/category/[slug].js
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Search,
  Filter,
  ChevronDown,
  Star,
  Heart,
  SlidersHorizontal as Sliders,
  Eye,
  Truck,
  CheckCircle,
} from "lucide-react";
import dynamic from "next/dynamic";

const FeexPayModal = dynamic(() => import("../../components/FeexPayModal"), { ssr: false });
/**
 * Category page — JavaScript (no TypeScript)
 * - Appelle: GET /products/corridor avec les query params attendus
 * - Pas de composants externes requis
 * - Responsive, épuré, prêt à coller
 */

function Pill({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-white/60 ${className}`}>
      {children}
    </span>
  );
}

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;

  // UI
  const [query, setQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("all"); // all|low|mid|high
  const [typeFilter, setTypeFilter] = useState("all"); // all|naturel|pharma|bio
  const [onlyNew, setOnlyNew] = useState(false);
  const [onlyPopular, setOnlyPopular] = useState(false);
  const [sortBy, setSortBy] = useState("relevance"); // relevance|price-asc|price-desc|newest
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [product, setProduct] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [passOrder, setPassOrder] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [loadingButton, setLoadingButton] = useState(null);
  // Data
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  /* helper: récupère categories_id depuis router (query, asPath, ou slug) */
  function extractCategoriesId(router) {
    // 1) ?categories_id=3
    if (router.query?.categories_id) {
      const id = Array.isArray(router.query.categories_id)
        ? router.query.categories_id[0]
        : router.query.categories_id;
      return String(id);
    }

    // 2) router.query.slug peut être 'categories_id=3' ou ['categories_id=3']
    const slug = router.query?.slug;
    if (slug) {
      const slugStr = Array.isArray(slug) ? slug.join("/") : String(slug);
      const m = slugStr.match(/categories_id=([^&/]+)/);
      if (m) return m[1];
    }

    // 3) router.asPath (ex: /category/categories_id=3 ou /category?categories_id=3)
    const as = router.asPath || "";
    let m = as.match(/[?&]categories_id=([^&]+)/);
    if (m) return m[1];
    m = as.match(/categories_id=([^&/]+)/);
    if (m) return m[1];

    return null;
  }

  /* === USE THIS useEffect (robuste) === */
  useEffect(() => {
    // IMPORTANT: router must be in scope (const router = useRouter(); above)

    if (!router) return;

    // Wait for router to be ready (avoids undefined slug on first render)
    if (!router.isReady) {
      console.log("[products] router not ready yet");
      return;
    }

    const categories_id = extractCategoriesId(router);
    console.log("[products] extracted categories_id:", categories_id);

    if (!categories_id) {
      console.warn("[products] pas de categories_id trouvé — abort fetch");
      return;
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
    if (!API_BASE_URL) {
      console.error("[products] NEXT_PUBLIC_REST_API_ENDPOINT non défini !");
      setError("Erreur de configuration: API non définie.");
      return;
    }

    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("categories_id", String(categories_id));
        params.set("limit", "100");
        params.set("offset", "0");

        // `query` ici = ton état de recherche (assure-toi qu'il existe dans le scope)
        if (typeof query === "string" && query.trim()) {
          params.set("search", query.trim());
        }

        params.set(
          "orderBy",
          sortBy === "relevance"
            ? "created_at"
            : sortBy.includes("price")
              ? "price"
              : "created_at"
        );
        params.set(
          "sortedBy",
          sortBy === "price-asc" ? "asc" : sortBy === "price-desc" ? "desc" : "desc"
        );

        const url = `${API_BASE_URL}/products/corridor?${params.toString()}`;
        console.log("[products] fetching URL:", url);

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Erreur serveur ${res.status}`);

        const json = await res.json();
        console.log("[products] API response:", json);

        const rows = json?.data ?? json ?? [];
        setProducts(
          rows.map((r) => ({
            id: r.id,
            name: r.name,
            price: r.price != null ? Number(r.price) : null,
            image:
              r.image && typeof r.image === "string"
                ? tryParseImage(r.image)
                : r.image || null,
            desc: r.description || r.desc || r.short_description || "",
            benefits: r.benefits || [],
            is_new: !!r.is_new,
            popular: !!r.popular,
            type: r.product_type || r.type || "unknown",
            shop: r.shop || null,
            raw: r,
          }))
        );
        setTotal(Number(json?.total ?? json?.count ?? rows.length));
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("[products] fetch aborted");
        } else {
          console.error("[products] erreur chargement produits:", err);
          setError("Impossible de charger les produits pour le moment.");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.asPath, router.query?.slug, query, sortBy]);

  // helper to parse an image field that might be JSON string or CSV
  function tryParseImage(imgField) {
    try {
      const parsed = JSON.parse(imgField);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === "string") return [parsed];
    } catch {
      // not JSON, maybe comma separated or direct url
      if (typeof imgField === "string" && imgField.includes(",")) {
        return imgField.split(",").map((s) => s.trim());
      }
      return [imgField];
    }
    return null;
  }

  // local filters client-side
  const filtered = useMemo(() => {
    let list = products.slice();

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) => p.name?.toLowerCase().includes(q) || p.desc?.toLowerCase().includes(q)
      );
    }

    if (onlyNew) list = list.filter((p) => p.is_new);
    if (onlyPopular) list = list.filter((p) => p.popular);

    if (priceFilter === "low") list = list.filter((p) => (p.price || 0) < 10000);
    if (priceFilter === "mid") list = list.filter((p) => (p.price || 0) >= 10000 && (p.price || 0) < 30000);
    if (priceFilter === "high") list = list.filter((p) => (p.price || 0) >= 30000);

    if (typeFilter !== "all") list = list.filter((p) => p.type === typeFilter);

    if (sortBy === "price-asc") list.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sortBy === "price-desc") list.sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sortBy === "newest") list.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));

    return list;
  }, [products, query, priceFilter, typeFilter, onlyNew, onlyPopular, sortBy]);
  console.log("Filtered products:", filtered);
  filtered.slice(0, visibleCount).map((p, i) => console.log(" Product", i, p.image.url));
  // navigate to product page (or open drawer)
  const openProduct = (p) => {
    // if you have a product page route, push to it, e.g. /product/[id]
    console.log("Navigating to product:", p);
    router.push(`/product/${p.raw.slug}`);
  };
  const handlePayment = async (p) => {

    const id = p.raw.slug;
    const API_BASE_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`);
      const data = await res.json();
      console.log("Initiating payment for product:", data);
      setProduct(data);
      if (!data) {
        alert("Produit introuvable.");
        return;
      }
      await handleOrder(data);
    } catch (e) {
      console.error("Erreur chargement produit:", e);
    } finally {
      setLoading(false);
    }

  }
  const handleOrder = async (product) => {
    setPassOrder(true);
    console.log("Creating order for product:", product);
    if (!product) return;
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
      const token = localStorage.getItem("token")
      if (!token) {
        router.push('/login');
        return;
      }
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          products: [{ product_id: product.id, order_quantity: 1, unit_price: product.price, subtotal: product.price }],
          total: product.price,
          payment_gateway: "FEEXPAY",
        }),
      });

      const order = await res.json();
      console.log("✅ Commande créée :", order);
      if (!order?.tracking_number) throw new Error("Erreur création commande");

      // ✅ Directement ouvrir le modal Feexpay
      setPaymentData({
        publicKey: process.env.NEXT_PUBLIC_FEEXPAY_PUBLIC_KEY,
        reference: order.tracking_number,
        amount: order.total,
        currency: "XOF",
      });
      setPassOrder(false);
      setIsPaymentOpen(true);
    } catch (err) {
      console.error("Erreur commande/paiement:", err);
      alert("Une erreur est survenue lors de la commande.");
    }
  };
  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-white to-[#fbf8fc] py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-sm text-gray-600 hover:text-[#FF6EA9]">← Retour</button>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] capitalize tracking-tight">{slug || "Catégorie"}</h1>
            <div className="ml-2"><Pill><TagIcon /> {slug || "Tous"}</Pill></div>
          </div>

          {/* Search & quick controls */}
          <div className="flex items-center gap-3 mt-3 sm:mt-0">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher produit, ingrédient..."
                className="pl-10 pr-3 py-2 rounded-full border border-gray-200 bg-white/60 shadow-sm w-[220px] sm:w-[360px] focus:outline-none focus:ring-2 focus:ring-[#FF6EA9]/30"
              />
            </div>

            <button
              onClick={() => { setOnlyNew((v) => !v); setOnlyPopular(false); }}
              className={`px-3 py-2 rounded-full text-sm ${onlyNew ? "bg-[#FF6EA9] text-white" : "bg-white text-gray-700 border border-gray-200"}`}
            >
              <Star size={14} /> <span className="ml-2 hidden sm:hidden">Nouveautés</span>
            </button>

            <button
              onClick={() => { setOnlyPopular((v) => !v); setOnlyNew(false); }}
              className={`px-3 py-2 rounded-full text-sm ${onlyPopular ? "bg-[#FF6EA9] text-white" : "bg-white text-gray-700 border border-gray-200"}`}
            >
              <Heart size={14} /> <span className="ml-2 hidden sm:hidden">Populaires</span>
            </button>

            <div className="relative">
              <button onClick={() => setFiltersOpen((s) => !s)} className="px-3 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm inline-flex items-center gap-2">
                <Sliders size={14} /> <span className="hidden sm:inline text-xs">Trier</span> <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters panel (inline responsive) */}
        <div className={`mb-6 transition-all ${filtersOpen ? "max-h-96" : "max-h-0 overflow-hidden"}`}>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-xs text-gray-500 mr-2">Prix</label>
              <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} className="px-3 py-1 rounded-full text-xs bg-white border border-gray-200">
                <option value="all">Tous</option>
                <option value="low">Moins de 10 000</option>
                <option value="mid">10 000 - 30 000</option>
                <option value="high">+ 30 000</option>
              </select>

              <label className="text-xs text-gray-500 ml-4 mr-2">Type</label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-1 rounded-full text-xs bg-white border border-gray-200">
                <option value="all">Tous</option>
                <option value="naturel">Naturel</option>
                <option value="pharma">Pharmaceutique</option>
                <option value="bio">Bio</option>
              </select>

              <label className="text-xs text-gray-500 ml-4 mr-2">Trier</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-1 rounded-full text-xs bg-white border border-gray-200">
                <option value="relevance">Pertinence</option>
                <option value="price-asc">Prix ↑</option>
                <option value="price-desc">Prix ↓</option>
                <option value="newest">Nouveautés</option>
              </select>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <button onClick={() => { setPriceFilter("all"); setTypeFilter("all"); setOnlyNew(false); setOnlyPopular(false); setSortBy("relevance"); }} className="text-sm text-gray-500 hover:underline">Réinitialiser</button>
              <button onClick={() => setFiltersOpen(false)} className="px-3 py-1 rounded-full bg-[#FF6EA9] text-white text-sm">Appliquer</button>
            </div>
          </div>
        </div>

        {/* Results meta */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-500">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</div>
          <div className="text-sm text-gray-400">Affichage {Math.min(visibleCount, filtered.length)} / {filtered.length}</div>
        </div>

        {/* 🌸 Ultra modern Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-20 text-gray-400 text-lg">
              Chargement des produits…
            </div>
          ) : filtered.slice(0, visibleCount).map((p, i) => (
            <article
              key={p.id || i}
              className="group relative bg-white/90 backdrop-blur-xl rounded-t-[5px] shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-300 overflow-hidden"
            >
              {/* Image Section */}
              <div className="relative w-full h-60 overflow-hidden rounded-t-[5px] ">
                {p.image?.url ? (
                  <img
                    src={p.image.url}
                    alt={p.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-50 text-gray-300">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </div>
                )}

                {/* Tag prix promo (optionnel) */}
                {p.oldPrice && (
                  <span className="absolute top-4 left-4 bg-[#FF6EA9]/90 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                    Promo
                  </span>
                )}
              </div>

              {/* Infos produit */}
              <div className="p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[#0F172A] mb-1 truncate group-hover:text-[#FF6EA9] transition-colors">
                    {p.name}
                  </h3>
                  <p
                    className="text-sm text-gray-500 mb-3 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: p.desc }}
                  ></p>
                </div>

                {/* Prix */}
                <div className="flex items-baseline gap-3 mb-3">
                  {p.oldPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(p.oldPrice)} FCFA
                    </span>
                  )}
                  <span className="text-lg font-bold text-[#FF6EA9]">
                    {formatPrice(p.price)} FCFA
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => openProduct(p)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border border-[#FF6EA9] text-[#FF6EA9] hover:bg-[#FF6EA9] hover:text-white transition-all"
                  >
                    <Eye size={16} /> Détails
                  </button>

                  <button
                    onClick={() => {
                      setLoadingButton(p.id);     // p.id = l'identifiant du pass
                      handlePayment(p);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-[#FF6EA9] to-[#4AB3F4] text-white shadow-md hover:shadow-lg hover:opacity-90 transition-all"
                  >
                    {loadingButton === p.id ? "En cours ..." : "💳 Payer"}
                  </button>
                </div>

                {/* Avantages */}
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Truck size={12} /> Livraison rapide
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle size={12} /> Paiement sécurisé
                  </span>
                  {p.benefits?.slice(0, 2).map((b) => (
                    <span key={b} className="inline-flex items-center gap-1">
                      • {b}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>


        {/* Load more */}
        {visibleCount < filtered.length && (
          <div className="mt-8 flex justify-center">
            <button onClick={() => setVisibleCount((v) => v + 9)} className="px-6 py-2 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition">Voir plus</button>
          </div>
        )}
      </div>
      {/* Bouton retour flottant */}
      <motion.button
        onClick={() => router.back()}
        className="fixed bottom-8 left-8 z-50 w-14 h-14 rounded-full bg-[#FF6EA9]/20 backdrop-blur-md border border-white/30 
                         flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 transition-all"
        whileHover={{ rotate: -5 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#FF6EA9" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </motion.button>


    </div>
          {/* ✅ Modal Feexpay */}
      {isPaymentOpen && (
        <FeexPayModal payment={paymentData} onClose={() => setIsPaymentOpen(false)} />
      )}
    </>
  );
}

/* small helpers */
function formatPrice(p) {
  if (p == null) return "—";
  // show integer FCFA
  return Math.round(p).toLocaleString("fr-FR");
}

/* tiny placeholder tag icon to avoid extra imports */
function TagIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ff6ea9" strokeWidth="1.6">
      <path d="M20 10v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9" />
    </svg>
  );
}
