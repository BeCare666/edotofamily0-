// pages/category/[slug].js
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Search,
  ChevronDown,
  SlidersHorizontal as Sliders,
  Eye,
  Truck,
  CheckCircle,
  X,
  Check,
  LayoutGrid,
  ShoppingBag,
} from "lucide-react";
import dynamic from "next/dynamic";
import OrderProgressBar from "../../components/OrderProgressBar";
import DeliveryChoiceStep from "../../components/DeliveryChoiceStep";
const FeexPayModal = dynamic(() => import("../../components/FeexPayModal"), { ssr: false });
/**
 * Category page — JavaScript (no TypeScript)
 * - Appelle: GET /products/corridor avec les query params attendus
 * - Pas de composants externes requis
 * - Responsive, épuré, prêt à coller
 */

const PAGE_SIZE = 12;
// Tris proposés : colonnes réelles (date d'ajout, prix payé, nom)
const SORTS = {
  newest: { label: "Plus récents", params: ["created_at", "desc"] },
  "price-asc": { label: "Prix croissant", params: ["price", "asc"] },
  "price-desc": { label: "Prix décroissant", params: ["price", "desc"] },
  "name-asc": { label: "Nom (A → Z)", params: ["name", "asc"] },
};

function Pill({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-white/60 ${className}`}>
      {children}
    </span>
  );
}

export default function CategoryPage() {
  const router = useRouter();

  // Filtres : uniquement sur des données réelles de la table products
  // (nom, prix payé = prix promo sinon prix, « originaire du pays », date d'ajout).
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [onlyOrigin, setOnlyOrigin] = useState(false);
  const [sortBy, setSortBy] = useState("newest"); // newest | price-asc | price-desc | name-asc
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [product, setProduct] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [passOrder, setPassOrder] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [loadingButton, setLoadingButton] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderStep, setOrderStep] = useState("quantity"); // quantity | delivery
  // Data
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  // Catégories réelles (GET /categories) et nombre de produits publiés de chacune
  const [categories, setCategories] = useState([]);
  const [allCount, setAllCount] = useState(null);

  /* helper: récupère categories_id depuis router (query, asPath, ou segment d'URL) */
  function extractCategoriesId(router) {
    // 1) ?categories_id=3
    if (router.query?.categories_id) {
      const id = Array.isArray(router.query.categories_id)
        ? router.query.categories_id[0]
        : router.query.categories_id;
      return String(id);
    }

    // 2) le segment de l'URL (route [id]) peut être 'categories_id=3'
    const seg = router.query?.id ?? router.query?.slug;
    if (seg) {
      const segStr = Array.isArray(seg) ? seg.join("/") : String(seg);
      const m = segStr.match(/categories_id=([^&/]+)/);
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

  const categoriesId = useMemo(() => {
    if (!router.isReady) return null;
    return extractCategoriesId(router);
  }, [router.isReady, router.query, router.asPath]);
  // « /category/categories_id=all » : tous les produits publiés (la route accepte l'absence de catégorie)
  const isAll = categoriesId === "all";

  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
    if (!API_BASE_URL) return;
    const controller = new AbortController();
    const count = (q) =>
      fetch(`${API_BASE_URL}/products/corridor?${q}limit=1&offset=0`, { signal: controller.signal })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => (j ? Number(j.total ?? 0) : null))
        .catch(() => null);
    (async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/categories?limit=50`, { signal: controller.signal });
        const j = r.ok ? await r.json() : null;
        const rows = (Array.isArray(j) ? j : j?.data ?? []).filter((c) => c && c.id != null && !c.parent);
        const counts = await Promise.all([count(""), ...rows.map((c) => count(`categories_id=${c.id}&`))]);
        if (controller.signal.aborted) return;
        setAllCount(counts[0]);
        setCategories(
          rows
            .map((c, i) => ({ id: String(c.id), name: c.name, count: counts[i + 1] }))
            .sort((a, b) => Number(a.id) - Number(b.id))
        );
      } catch { }
    })();
    return () => controller.abort();
  }, []);

  // Panneau de filtres mobile : Échap pour fermer, page figée derrière
  useEffect(() => {
    if (!filtersOpen) return;
    const onKey = (e) => e.key === "Escape" && setFiltersOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [filtersOpen]);

  // Changement de catégorie : même page, adresse mise à jour sans remonter en haut
  const selectCategory = (id) => {
    const target = `/category/categories_id=${id ?? "all"}`;
    if (String(categoriesId) === String(id ?? "all")) return;
    router.push(target, undefined, { shallow: true, scroll: false });
  };

  // Recherche et prix : appliqués 400 ms après la dernière frappe (avant : une requête par lettre)
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);
  useEffect(() => {
    const t = setTimeout(() => {
      setMinPrice(minPriceInput);
      setMaxPrice(maxPriceInput);
    }, 400);
    return () => clearTimeout(t);
  }, [minPriceInput, maxPriceInput]);

  // Nom de la catégorie (GET /categories/:id), « Boutique » à défaut
  useEffect(() => {
    if (!categoriesId || isAll) return;
    const API_BASE_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/categories/${encodeURIComponent(categoriesId)}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((c) => setCategoryName(c?.name || ""))
      .catch(() => { });
    return () => controller.abort();
  }, [categoriesId, isAll]);

  const buildParams = (offset) => {
    const params = new URLSearchParams();
    if (!isAll) params.set("categories_id", String(categoriesId));
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(offset));
    if (search) params.set("search", search);
    if (minPrice !== "" && Number(minPrice) >= 0) params.set("min_price", String(Number(minPrice)));
    if (maxPrice !== "" && Number(maxPrice) >= 0) params.set("max_price", String(Number(maxPrice)));
    if (onlyOrigin) params.set("is_origin", "true");
    const [orderBy, sortedBy] = SORTS[sortBy].params;
    params.set("orderBy", orderBy);
    params.set("sortedBy", sortedBy);
    return params;
  };

  const parseRows = (rows) =>
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      image: r.image ? tryParseImage(r.image) : null,
      desc: r.description || "",
      raw: r,
    }));

  // Première page : rechargée à chaque changement de catégorie, de recherche, de filtre ou de tri
  useEffect(() => {
    if (!router.isReady || !categoriesId) return;
    const API_BASE_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
    if (!API_BASE_URL) {
      setError("Erreur de configuration : API non définie.");
      return;
    }
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/products/corridor?${buildParams(0).toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Erreur serveur ${res.status}`);
        const json = await res.json();
        const rows = json?.data ?? [];
        setProducts(parseRows(rows));
        setTotal(Number(json?.total ?? rows.length));
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("Impossible de charger les produits.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, categoriesId, search, minPrice, maxPrice, onlyOrigin, sortBy, reloadKey]);

  // Pages suivantes : chargées depuis le serveur (avant : jamais plus de 20 produits)
  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
      const res = await fetch(`${API_BASE_URL}/products/corridor?${buildParams(products.length).toString()}`);
      if (!res.ok) throw new Error(`Erreur serveur ${res.status}`);
      const json = await res.json();
      const rows = json?.data ?? [];
      setProducts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...parseRows(rows).filter((p) => !seen.has(p.id))];
      });
      setTotal(Number(json?.total ?? total));
    } catch (err) {
      console.error(err);
      setError("Impossible de charger plus de produits.");
    } finally {
      setLoadingMore(false);
    }
  };

  const activeFilters = (minPrice !== "" ? 1 : 0) + (maxPrice !== "" ? 1 : 0) + (onlyOrigin ? 1 : 0);
  const hasCriteria = activeFilters > 0 || search !== "";
  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setMinPriceInput("");
    setMaxPriceInput("");
    setMinPrice("");
    setMaxPrice("");
    setOnlyOrigin(false);
    setSortBy("newest");
  };

  // helper to parse an image field that might be JSON string or CSV
  function tryParseImage(imgField) {
    if (typeof imgField === "object") return Array.isArray(imgField) ? imgField : [imgField];
    try {
      const parsed = JSON.parse(imgField);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") return [parsed];
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

  // navigate to product page (or open drawer)
  const openProduct = (p) => {
    // if you have a product page route, push to it, e.g. /product/[id]
    //console.log("Navigating to product:", p);
    router.push(`/product/${p.raw.slug}`);
  };
  const handlePayment = async (p) => {

    const id = p.raw.slug;
    const API_BASE_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`);
      const data = await res.json();
      //console.log("Initiating payment for product:", data);
      setProduct(data);
      if (!data) {
        alert("Produit introuvable.");
        return;
      }
      //await handleOrder(data);
      // 🔥 On ouvre le modal au lieu d'appeler handleOrder
      setSelectedProduct(data);
      setQuantity(1);
      setOrderStep("quantity");
      setIsOrderModalOpen(true);
    } catch (e) {
      console.error("Erreur chargement produit:", e);
    } finally {
      setLoadingButton(null);
    }

  }
  // Le lieu (point de retrait ou livraison à domicile) est choisi avant le paiement :
  // le serveur ajoute les frais de livraison au total, un seul paiement.
  const handleOrder = async (product, quantity, delivery) => {
    //console.log("Creating order for product:", product);
    if (!product || !delivery) return;
    setPassOrder(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
      const token = localStorage.getItem("token")
      if (!token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("redirect_after_login", window.location.pathname);
        }
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
          products: [{ product_id: product.id, order_quantity: quantity, unit_price: product.sale_price, subtotal: product.sale_price * quantity }],
          total: product.sale_price * quantity,
          payment_gateway: "FEEXPAY",
          delivery,
        }),
      });

      const order = await res.json().catch(() => ({}));
      console.log("✅ Commande créée :", order);
      localStorage.setItem("order_step", "order");
      if (!res.ok || !order?.tracking_number) throw new Error(order?.message || "Erreur création commande");

      console.log("Ouverture modal Feexpay pour la commande :", order.id);
      setPaymentData({
        orderId: order.id,
        publicKey: process.env.NEXT_PUBLIC_FEEXPAY_PUBLIC_KEY,
        reference: order.tracking_number,
        amount: order.total,
        currency: "XOF",
      });
      setPassOrder(false);
      setIsOrderModalOpen(false);
      setIsPaymentOpen(true);
    } catch (err) {
      console.error("Erreur commande/paiement:", err);
      setPassOrder(false);
      alert(err?.message || "Une erreur est survenue lors de la commande.");
    }
  };
  const priceChip =
    minPrice !== "" && maxPrice !== ""
      ? `${formatPrice(minPrice)} – ${formatPrice(maxPrice)} FCFA`
      : minPrice !== ""
        ? `Dès ${formatPrice(minPrice)} FCFA`
        : maxPrice !== ""
          ? `Jusqu’à ${formatPrice(maxPrice)} FCFA`
          : null;

  // Panneau de filtres (colonne fixe sur ordinateur, panneau sur mobile) : même contenu, mêmes états
  const renderFilters = (prefix) => (
    <div className="space-y-7">
      <section aria-labelledby={`${prefix}-cat`}>
        <h2 id={`${prefix}-cat`} className="text-[11px] uppercase tracking-[0.22em] text-[#9A8E80] mb-3">Catégories</h2>
        <ul className="space-y-1">
          {[{ id: null, name: "Tous les produits", count: allCount }, ...categories].map((c) => {
            const active = c.id === null ? isAll : String(categoriesId) === c.id;
            return (
              <li key={c.id ?? "all"}>
                <button
                  onClick={() => selectCategory(c.id)}
                  aria-current={active ? "page" : undefined}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm text-left transition-all duration-200 ${active
                    ? "bg-[#1F1B16] text-white shadow-[0_10px_24px_-12px_rgba(31,27,22,0.55)]"
                    : "text-[#3B342D] hover:bg-[#F3EEE7]"
                    }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-[#FF6EA9]" : "bg-[#D8CFC3]"}`} />
                    <span className="truncate">{c.name}</span>
                  </span>
                  {c.count != null && (
                    <span className={`text-xs tabular-nums ${active ? "text-[#D8CFC3]" : "text-[#9A8E80]"}`}>{c.count}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby={`${prefix}-sort`}>
        <h2 id={`${prefix}-sort`} className="text-[11px] uppercase tracking-[0.22em] text-[#9A8E80] mb-3">Trier par</h2>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.entries(SORTS).map(([key, srt]) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              aria-pressed={sortBy === key}
              className={`px-3 py-2 rounded-xl text-xs text-left border transition ${sortBy === key
                ? "border-[#1F1B16] bg-white text-[#1F1B16] font-medium"
                : "border-[#EDE6DC] bg-white/60 text-[#7A6E62] hover:border-[#D8CFC3] hover:text-[#1F1B16]"
                }`}
            >
              {srt.label}
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby={`${prefix}-price`}>
        <h2 id={`${prefix}-price`} className="text-[11px] uppercase tracking-[0.22em] text-[#9A8E80] mb-3">Prix (FCFA)</h2>
        <div className="flex items-center gap-2">
          <input
            type="number" min={0} inputMode="numeric" placeholder="Min" aria-label="Prix minimum"
            value={minPriceInput} onChange={(e) => setMinPriceInput(e.target.value)}
            className="w-full min-w-0 px-3.5 py-2.5 rounded-xl border border-[#EDE6DC] bg-white text-sm text-[#1F1B16] placeholder:text-[#B8AC9E] focus:outline-none focus:border-[#D8CFC3] focus:ring-2 focus:ring-[#FF6EA9]/20"
          />
          <span className="text-[#B8AC9E]">—</span>
          <input
            type="number" min={0} inputMode="numeric" placeholder="Max" aria-label="Prix maximum"
            value={maxPriceInput} onChange={(e) => setMaxPriceInput(e.target.value)}
            className="w-full min-w-0 px-3.5 py-2.5 rounded-xl border border-[#EDE6DC] bg-white text-sm text-[#1F1B16] placeholder:text-[#B8AC9E] focus:outline-none focus:border-[#D8CFC3] focus:ring-2 focus:ring-[#FF6EA9]/20"
          />
        </div>
      </section>

      <section aria-labelledby={`${prefix}-origin`}>
        <h2 id={`${prefix}-origin`} className="text-[11px] uppercase tracking-[0.22em] text-[#9A8E80] mb-3">Origine</h2>
        <button
          role="switch"
          aria-checked={onlyOrigin}
          onClick={() => setOnlyOrigin((v) => !v)}
          className="w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border border-[#EDE6DC] bg-white text-sm text-[#3B342D] hover:border-[#D8CFC3] transition"
        >
          <span className="text-left">Produits originaires du pays</span>
          <span className={`relative w-10 h-6 rounded-full transition-colors duration-200 shrink-0 ${onlyOrigin ? "bg-[#C2185B]" : "bg-[#E4DBCE]"}`}>
            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${onlyOrigin ? "translate-x-4" : ""}`} />
          </span>
        </button>
      </section>

      {hasCriteria && (
        <button onClick={resetFilters} className="w-full px-4 py-2.5 rounded-xl text-sm text-[#7A6E62] border border-dashed border-[#D8CFC3] hover:text-[#C2185B] hover:border-[#FF6EA9] transition">
          Réinitialiser la recherche et les filtres
        </button>
      )}
    </div>
  );

  const searchField = (
    <div className="relative flex-1 min-w-0">
      <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8E80]" aria-hidden="true" />
      <input
        type="search"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Rechercher un produit…"
        aria-label="Rechercher un produit"
        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-[#EDE6DC] text-sm text-[#1F1B16] placeholder:text-[#9A8E80] focus:outline-none focus:border-[#D8CFC3] focus:ring-2 focus:ring-[#FF6EA9]/20 transition"
      />
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-[#FAF7F2]">
        {/* Mobile / tablette : barre collée sous l'en-tête du site (recherche, filtres, catégories) */}
        <div className="lg:hidden sticky top-20 z-30 bg-[#FAF7F2]/90 backdrop-blur-xl border-y border-[#EDE6DC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-3">
            <div className="flex gap-2">
              {searchField}
              <button
                onClick={() => setFiltersOpen(true)}
                aria-expanded={filtersOpen}
                aria-controls="product-filters-sheet"
                aria-label="Filtres"
                className="relative shrink-0 inline-flex items-center gap-2 px-4 rounded-2xl bg-[#1F1B16] text-white text-sm"
              >
                <Sliders size={16} /> <span className="hidden sm:inline">Filtres</span>
                {activeFilters > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-[#FF6EA9] text-white text-[11px] flex items-center justify-center ring-2 ring-[#FAF7F2]">{activeFilters}</span>
                )}
              </button>
            </div>
            <div className="hidden lg:block flex gap-2 overflow-x-auto -mx-4 px-4 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[{ id: null, name: "Tous" }, ...categories].map((c) => {
                const active = c.id === null ? isAll : String(categoriesId) === c.id;
                return (
                  <button
                    key={c.id ?? "all"}
                    onClick={() => selectCategory(c.id)}
                    aria-current={active ? "page" : undefined}
                    className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-sm border transition ${active
                      ? "bg-[#1F1B16] border-[#1F1B16] text-white"
                      : "bg-white border-[#EDE6DC] text-[#3B342D] hover:border-[#D8CFC3]"
                      }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-6 pb-24 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
          {/* Ordinateur : colonne de filtres qui reste visible pendant le défilement */}
          <aside className="hidden lg:block" aria-label="Filtres">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1 [scrollbar-width:thin]">
              <div className="bg-white/80 backdrop-blur rounded-3xl border border-[#EDE6DC] p-6 shadow-[0_1px_2px_rgba(60,40,20,0.04),0_12px_32px_-18px_rgba(60,40,20,0.18)]">
                {renderFilters("desk")}
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            {/* Ordinateur : recherche collée en haut de la liste */}
            <div className="hidden lg:block sticky top-20 z-20 -mx-2 px-2 pt-4 pb-4 bg-[#FAF7F2]/90 backdrop-blur-xl">
              {searchField}
            </div>

            {/* Filtres actifs */}
            {(priceChip || onlyOrigin || search) && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {search && (
                  <button onClick={() => { setSearchInput(""); setSearch(""); }} className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-white border border-[#EDE6DC] text-xs text-[#3B342D] hover:border-[#FF6EA9]" aria-label={`Retirer la recherche ${search}`}>
                    « {search} » <X size={13} />
                  </button>
                )}
                {priceChip && (
                  <button onClick={() => { setMinPriceInput(""); setMaxPriceInput(""); setMinPrice(""); setMaxPrice(""); }} className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-white border border-[#EDE6DC] text-xs text-[#3B342D] hover:border-[#FF6EA9]" aria-label="Retirer le filtre de prix">
                    {priceChip} <X size={13} />
                  </button>
                )}
                {onlyOrigin && (
                  <button onClick={() => setOnlyOrigin(false)} className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-white border border-[#EDE6DC] text-xs text-[#3B342D] hover:border-[#FF6EA9]" aria-label="Retirer le filtre d’origine">
                    Originaires du pays <X size={13} />
                  </button>
                )}
                <button onClick={resetFilters} className="text-xs text-[#9A8E80] hover:text-[#C2185B] underline-offset-4 hover:underline ml-1">Tout effacer</button>
              </div>
            )}

            {/* Erreur */}
            {error && (
              <div className="bg-white rounded-3xl border border-[#F5E4E4] p-8 text-center mb-6">
                <p className="text-[#9B2C2C] mb-4">{error}</p>
                <button onClick={() => setReloadKey((k) => k + 1)} className="px-6 py-2.5 rounded-full bg-[#1F1B16] text-white text-sm">
                  Réessayer
                </button>
              </div>
            )}

            {/* Grille */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" aria-busy="true" aria-label="Chargement des produits">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl border border-[#EDE6DC] overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-[#F1ECE4]" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-[#F1ECE4] rounded w-3/4" />
                      <div className="h-3 bg-[#F1ECE4] rounded w-full" />
                      <div className="h-5 bg-[#F1ECE4] rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !error && products.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#EDE6DC] p-12 text-center">
                <span className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-[#F3EEE7] text-[#9A8E80] flex items-center justify-center"><ShoppingBag size={22} /></span>
                <p className="font-serif text-xl text-[#1F1B16] mb-1">
                  {hasCriteria ? "Aucun produit ne correspond" : "Bientôt disponible"}
                </p>
                <p className="text-sm text-[#7A6E62]">
                  {hasCriteria ? "Essayez d’autres critères de recherche." : "Aucun produit dans cette catégorie pour le moment."}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {hasCriteria && (
                    <button onClick={resetFilters} className="px-5 py-2.5 rounded-full bg-[#1F1B16] text-white text-sm">
                      Réinitialiser la recherche et les filtres
                    </button>
                  )}
                  {!isAll && (
                    <button onClick={() => selectCategory(null)} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-[#D8CFC3] text-[#3B342D] text-sm hover:border-[#1F1B16]">
                      <LayoutGrid size={14} /> Voir tous les produits
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((p) => {
                  const img = p.image?.[0];
                  const imgUrl = img?.url || img?.original || img?.thumbnail || (typeof img === "string" ? img : null);
                  const price = p.raw.price != null ? Number(p.raw.price) : null;
                  const sale = p.raw.sale_price != null ? Number(p.raw.sale_price) : null;
                  const promo = sale != null && price != null && sale < price;
                  return (
                    <article
                      key={p.id}
                      className="group relative bg-white rounded-3xl border border-[#EDE6DC] shadow-[0_1px_2px_rgba(60,40,20,0.04),0_12px_32px_-18px_rgba(60,40,20,0.18)] hover:shadow-[0_24px_48px_-20px_rgba(60,40,20,0.3)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
                    >
                      <button onClick={() => openProduct(p)} className="relative w-full aspect-[4/3] overflow-hidden bg-[#F6F1EA]" aria-label={`Voir ${p.name}`}>
                        {imgUrl ? (
                          <Image
                            src={imgUrl}
                            alt={p.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <span className="flex items-center justify-center w-full h-full text-[#B8AC9E] text-sm">Pas d’image</span>
                        )}
                        {promo && (
                          <span className="absolute top-3 left-3 bg-[#C2185B] text-white text-xs font-medium px-3 py-1 rounded-full shadow">
                            -{Math.round((1 - sale / price) * 100)} %
                          </span>
                        )}
                      </button>

                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-serif text-lg leading-snug text-[#1F1B16] mb-1.5 line-clamp-2 group-hover:text-[#C2185B] transition-colors">
                          {p.name}
                        </h3>
                        <p className="text-sm text-[#7A6E62] mb-4 line-clamp-2" dangerouslySetInnerHTML={{ __html: p.desc }}></p>

                        <div className="flex items-baseline gap-2 mb-4 mt-auto">
                          <span className="text-lg font-semibold text-[#1F1B16] tabular-nums">{formatPrice(sale ?? price)} FCFA</span>
                          {promo && <span className="text-sm text-[#B8AC9E] line-through tabular-nums">{formatPrice(price)} FCFA</span>}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openProduct(p)}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm border border-[#D8CFC3] text-[#3B342D] hover:border-[#1F1B16] hover:text-[#1F1B16] transition-all"
                          >
                            <Eye size={16} /> Détails
                          </button>
                          <button
                            onClick={() => {
                              setLoadingButton(p.id);
                              handlePayment(p);
                            }}
                            disabled={loadingButton === p.id}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm bg-[#1F1B16] text-white hover:bg-[#C2185B] transition-all disabled:opacity-70"
                          >
                            {loadingButton === p.id ? "…" : "Commander"}
                          </button>
                        </div>

                        <div className="mt-4 pt-4 border-t border-[#F1ECE4] flex flex-wrap gap-4 text-xs text-[#9A8E80]">
                          <span className="inline-flex items-center gap-1.5"><Truck size={13} /> Livraison rapide</span>
                          <span className="inline-flex items-center gap-1.5"><CheckCircle size={13} /> Paiement sécurisé</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Charger plus (pages suivantes depuis le serveur) */}
            {!loading && !error && products.length < total && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-7 py-3 rounded-full bg-white border border-[#D8CFC3] text-sm text-[#1F1B16] hover:border-[#1F1B16] transition disabled:opacity-60"
                >
                  {loadingMore ? "Chargement…" : `Charger plus (${total - products.length} restants)`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile : panneau de filtres (glisse depuis le bas) */}
        <div className={`lg:hidden fixed inset-0 z-[90] ${filtersOpen ? "" : "pointer-events-none"}`} aria-hidden={!filtersOpen}>
          <div
            className={`absolute inset-0 bg-[#1F1B16]/40 backdrop-blur-[2px] transition-opacity duration-300 ${filtersOpen ? "opacity-100" : "opacity-0"}`}
            onClick={() => setFiltersOpen(false)}
          />
          <div
            id="product-filters-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Filtres"
            className={`absolute inset-x-0 bottom-0 max-h-[88vh] flex flex-col bg-[#FAF7F2] rounded-t-[28px] shadow-2xl transition-transform duration-300 ease-out ${filtersOpen ? "translate-y-0" : "translate-y-full"}`}
          >
            <div className="pt-3 pb-2 flex justify-center"><span className="w-10 h-1.5 rounded-full bg-[#D8CFC3]" /></div>
            <div className="px-5 pb-3 flex items-center justify-between">
              <p className="font-serif text-xl text-[#1F1B16]">Filtres</p>
              <button onClick={() => setFiltersOpen(false)} className="w-10 h-10 rounded-full bg-white border border-[#EDE6DC] flex items-center justify-center text-[#3B342D]" aria-label="Fermer les filtres"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-4">{renderFilters("sheet")}</div>
            <div className="px-5 pt-3 border-t border-[#EDE6DC] bg-[#FAF7F2]" style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
              <button onClick={() => setFiltersOpen(false)} className="w-full py-3.5 rounded-2xl bg-[#1F1B16] text-white text-sm inline-flex items-center justify-center gap-2">
                <Check size={16} /> {loading ? "Recherche…" : `Voir ${total} produit${total > 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>

        {/* Bouton retour flottant */}
        <motion.button
          onClick={() => router.back()}
          aria-label="Retour"
          className="!hidden fixed bottom-8 left-8 z-40 w-14 h-14 rounded-full bg-[#FF6EA9]/20 backdrop-blur-md border border-white/30
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
      {/* 📊 Barre de progression commande */}
      {/*  <OrderProgressBar />*/}
      {isOrderModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
          <div className={`bg-white w-full ${orderStep === "delivery" ? "max-w-2xl" : "max-w-md"} max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95`}>

            {/* Close */}
            <button
              onClick={() => setIsOrderModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            {orderStep === "delivery" ? (
              <DeliveryChoiceStep
                productsTotal={selectedProduct.sale_price * quantity}
                onBack={() => setOrderStep("quantity")}
                submitting={passOrder}
                onConfirm={(delivery) => handleOrder(selectedProduct, quantity, delivery)}
              />
            ) : (
              <>
                {/* Product Info */}
                <div className="flex items-center gap-4 mb-6">

                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-pink-600 font-bold">
                      {selectedProduct.sale_price} XOF
                    </p>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-6">

                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow hover:bg-pink-50 transition"
                  >
                    -
                  </button>

                  <span className="text-xl font-semibold">
                    {quantity}
                  </span>

                  <button
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow hover:bg-pink-50 transition"
                  >
                    +
                  </button>
                </div>

                {/* Total */}
                <div className="flex justify-between mb-6">
                  <span className="text-gray-600">Total produits :</span>
                  <span className="font-bold text-lg text-pink-600">
                    {selectedProduct.sale_price * quantity} XOF
                  </span>
                </div>

                {/* Étape suivante : choix du lieu */}
                <button
                  onClick={() => {
                    if (!localStorage.getItem("token")) {
                      localStorage.setItem("redirect_after_login", window.location.pathname);
                      router.push("/login");
                      return;
                    }
                    setOrderStep("delivery");
                  }}
                  className="w-full bg-pink-600 text-white py-3 rounded-xl font-medium hover:bg-pink-700 transition"
                >
                  Continuer
                </button>
              </>
            )}

          </div>
        </div>
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
