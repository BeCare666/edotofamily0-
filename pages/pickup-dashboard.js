import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  Archive,
  Loader2,
  Hash,
  User,
  CheckCircle,
  X,
  Clock,
  BellRing
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"
/**
 * PickupDashboard
 * - No external UI libs
 * - Uses lucide-react icons, framer-motion, react-hot-toast
 * - Expects endpoints:
 *   GET  ${API}/me
 *   GET  ${API}/orders/stats?pickup_point_id=...
 *   GET  ${API}/orders?pickup_point_id=...&limit=...&page=...&search=...
 *   PATCH ${API}/orders/:id/archive
 *   POST ${API}/orders/validate_otp  { order_id, otp }
 *
 * Usage: <PickupDashboard />
 */

export default function PickupDashboard() {
    const router = useRouter()
  const API = process.env.NEXT_PUBLIC_REST_API_ENDPOINT || "";
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // user & pickup
  const [me, setMe] = useState(null);
  const [pickupPointId, setPickupPointId] = useState(null);

  // data
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  // UI
  const [loading, setLoading] = useState(true);
  const [fetchingOrders, setFetchingOrders] = useState(false);

  // search (debounced)
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // modal OTP
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [otp, setOtp] = useState("");
  const [validating, setValidating] = useState(false);

  // realtime-ish visual notification badge (polling)
  const [newCount, setNewCount] = useState(0);

  // helper: build URL without undefined params
  const buildUrl = (path, params) => {
    const u = new URL(`${API}${path}`, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") u.searchParams.append(k, String(v));
    });
    return u.toString();
  };

  // headers
  const authHeaders = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  // Debounce search 500ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 500);
    return () => clearTimeout(t);
  }, [search]);

  // Load /me securely
  const loadMe = useCallback(async () => {
    try {
      if (!API) throw new Error("API endpoint not set");
      if (!token) {
        toast.error("Token manquant. Connectez-vous.");
        router.push('/login')
        setLoading(false);
        return;
      }
      const res = await fetch(buildUrl("/me", {}), { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        throw new Error("Impossible de récupérer le profil");
      }
      const json = await res.json();
      setMe(json);
      // prefer explicit pickup_point_id if present, otherwise use user id super_pickuppoint
      const id = json.pickup_point_id ?? json.id;
      //const super_pickuppoint = json.role;
      //if(super_pickuppoint !== "super_pickuppoint"){
      //  router.push('/')
     // }
      setPickupPointId(id);
    } catch (err) {
      console.error("loadMe error:", err);
      toast.error("Impossible de charger le profil");
    } finally {
      setLoading(false);
    }
  }, [API, token]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      if (!pickupPointId) return;
      const url = buildUrl("/orders/stats", { pickup_point_id: pickupPointId });
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) throw new Error("Erreur stats");
      const json = await res.json();
      // support both shapes
      setStats({
        total: json.total ?? json.total_orders ?? 0,
        completed: json.completed ?? json.validated_orders ?? 0,
        pending: json.pending ?? json.pending_orders ?? 0,
      });
    } catch (err) {
      console.error("loadStats error:", err);
      toast.error("Impossible de charger les statistiques");
    }
  }, [pickupPointId]);

  // Load orders with pagination/search
  const loadOrders = useCallback(async (p = page) => {
    try {
      if (!pickupPointId) return;
      setFetchingOrders(true);
      const url = buildUrl("/orders", {
        pickup_point_id: pickupPointId,
        limit,
        page: p,
        search: debouncedSearch || undefined,
      });
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) throw new Error("Erreur commandes");
      const json = await res.json();
      setOrders(json.data || []);
      // pagination: try to use returned last_page or compute
      const last =
  json.last_page ??
  (Math.ceil((json.total || json.count || 0) / limit) || 1);
      setTotalPages(last);
    } catch (err) {
      console.error("loadOrders error:", err);
      toast.error("Impossible de charger les commandes");
    } finally {
      setFetchingOrders(false);
    }
  }, [pickupPointId, limit, debouncedSearch, page, token]);

  // Archive
  const archiveOrder = async (id) => {
    try {
      if (!confirm("Archiver cette commande ?")) return;
      const url = `${API}/orders/${id}/archive`;
      const res = await fetch(url, { method: "PATCH", headers: authHeaders() });
      if (!res.ok) throw new Error("Échec archivage");
      toast.success("Commande archivée");
      await loadOrders();
      await loadStats();
    } catch (err) {
      console.error("archiveOrder error:", err);
      toast.error("Impossible d'archiver la commande");
    }
  };

  // Validate OTP
  const validateOTP = async (orderId) => {
    try {
      if (!otp || otp.trim().length === 0) {
        toast.error("Veuillez saisir le code OTP");
        return;
      }
      setValidating(true);
      const url = `${API}/orders/verify-otp`;
      const res = await fetch(url, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ order_id: orderId, otp_code: otp.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.message || "OTP incorrect";
        console.log("messsage", msg)
        throw new Error(msg);

      }
      toast.success("OTP validé — commande marquée comme livrée");
      setOtp("");
      setSelectedOrder(null);
      await loadOrders();
      await loadStats();
    } catch (err) {
      console.error("validateOTP error:", err);
      toast.error(err.message || "Erreur de validation OTP");
    } finally {
      setValidating(false);
    }
  };

  // Poll for new orders count (simple every 20s)
  useEffect(() => {
    let mounted = true;
    let timer;
    const poll = async () => {
      try {
        if (!pickupPointId) return;
        const url = buildUrl("/orders/new", {}); // endpoint we had earlier 
        const res = await fetch(url, { headers: authHeaders() });
        if (!res.ok) return;
        const json = await res.json();
        if (!mounted) return;
        setNewCount(Array.isArray(json) ? json.length : (json.count || 0));
      } catch (e) {
        // ignore poll errors
      } finally {
        timer = setTimeout(poll, 20000);
      }
    };
    poll();
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [pickupPointId]);

  // Initial load: me -> then stats+orders
  useEffect(() => {
    (async () => {
      await loadMe();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // When pickupPointId or debouncedSearch or page changes, reload orders and stats
  useEffect(() => {
    if (!pickupPointId) return;
    loadStats();
    loadOrders(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupPointId, debouncedSearch, page]);

  // UI render guards
  if (loading || !me) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 mx-auto text-gray-600" />
          <div className="mt-3 text-gray-700 font-medium">Chargement du profil…</div>
        </div>
      </div>
    );
  }

  // ---------- RENDER ----------
  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-white/60 to-white/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-pink-50">
              <Package className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard Point Relais</h1>
              <div className="text-sm text-gray-500">Point relais ID: <span className="font-medium">{pickupPointId}</span></div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher (tracking, OTP, client, contact)..."
                className="w-full pl-11 pr-4 py-2 rounded-2xl border border-gray-200 bg-white/60 backdrop-blur-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
                aria-label="Rechercher commandes"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
            </div>

            <button
              onClick={() => { setPage(1); loadOrders(1); toast.promise(Promise.resolve(), { loading: 'Rafraîchissement', success: 'Rafraîchi', error: 'Erreur' }); }}
              className="px-3 py-2 rounded-xl bg-black text-white text-sm hover:bg-gray-800 transition"
              aria-label="Rafraîchir"
            >
              Rafraîchir
            </button>

            <button
              title="Nouvelles commandes"
              className="ml-2 px-3 py-2 rounded-xl bg-white/80 border border-gray-100 flex items-center gap-2"
              onClick={() => { loadOrders(1); toast.success('Chargement des nouvelles commandes'); }}
            >
              <BellRing className="w-5 h-5 text-gray-700" />
              <span className="text-sm text-gray-700">{newCount}</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-4 rounded-2xl bg-white/70 backdrop-blur border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-2xl font-bold text-slate-900">{stats?.total ?? 0}</div>
              </div>
              <div className="p-3 rounded-lg bg-black text-white">
                <Package className="w-5 h-5" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.06 }} className="p-4 rounded-2xl bg-white/70 backdrop-blur border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Complétées</div>
                <div className="text-2xl font-bold text-slate-900">{stats?.completed ?? 0}</div>
              </div>
              <div className="p-3 rounded-lg bg-green-600 text-white">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.12 }} className="p-4 rounded-2xl bg-white/70 backdrop-blur border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">En attente</div>
                <div className="text-2xl font-bold text-slate-900">{stats?.pending ?? 0}</div>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500 text-white">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Orders list */}
        <div className="space-y-3">
          {fetchingOrders && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="animate-spin w-4 h-4" /> Chargement des commandes...
            </div>
          )}

          {orders.length === 0 && !fetchingOrders && (
            <div className="py-16 text-center text-gray-500">
              Aucune commande trouvée pour ce point relais.
            </div>
          )}

          <div className="grid gap-3">
            {orders.map((order) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur rounded-2xl p-4 md:p-5 border border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-start gap-3" onClick={() => setSelectedOrder(order)} style={{ cursor: "pointer" }}>
                  <div className="p-2 rounded-md bg-pink-50">
                    <Hash className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="font-semibold text-slate-900">#{order.tracking_number}</div>
                      <div className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1 flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /> {order.customer_name || "-"}</div>
                    <div className="text-xs text-gray-400 mt-1">OTP: {order.otp_code ? "Présent" : "Non défini"}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <div className="text-right mr-2">
                    <div className="text-sm text-gray-600">{(Number(order.total) || 0).toLocaleString()} FCFA</div>
                    <div className="text-xs text-gray-500 mt-0.5">{order.payment_status?.replace("payment-", "").replace(/-/g, " ")}</div>
                  </div>

                  <button onClick={(e) => { e.stopPropagation(); archiveOrder(order.id); }} className="hidden px-3 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition">
                    <Archive className=" w-4 h-4 inline-block mr-2" /> Archiver
                  </button>

                  <button onClick={() => setSelectedOrder(order)} className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 transition">
                    Détails
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => { if (page > 1) { setPage(page - 1); } }} disabled={page <= 1} className="px-3 py-1 rounded-md border text-sm disabled:opacity-50">← Précédent</button>
          <div className="text-sm text-gray-600">Page {page} / {totalPages}</div>
          <button onClick={() => { if (page < totalPages) { setPage(page + 1); } }} className="px-3 py-1 rounded-md border text-sm">Suivant →</button>
        </div>
      </div>

      {/* OTP Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-white" onClick={() => { if (!validating) { setSelectedOrder(null); setOtp(""); } }} />

            <motion.div initial={{ y: 20, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0, scale: 0.98 }} className="relative z-10 bg-white/95 rounded-2xl p-6 md:p-8 max-w-xl w-full shadow-2xl">
              <button onClick={() => { if (!validating) { setSelectedOrder(null); setOtp(""); } }} className="absolute right-4 top-4 text-gray-600 hover:text-gray-800"><X className="w-5 h-5" /></button>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-pink-50">
                  <Hash className="w-6 h-6 text-pink-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedOrder.tracking_number}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedOrder.customer_name || "-"}</p>
                  <p className="text-xs text-gray-400 mt-1">Commandé le {new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <div className="text-xs text-gray-500">Montant total</div>
                  <div className="font-semibold">{(Number(selectedOrder.total) || 0).toLocaleString()} FCFA</div>

                  <div className="text-xs text-gray-500 mt-3">Statut</div>
                  <div className="font-medium capitalize">{selectedOrder.order_status?.replace("order-", "").replace(/-/g, " ")}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Contact</div>
                  <div className="font-medium">{selectedOrder.customer_contact || "-"}</div>

                  <div className="text-xs text-gray-500 mt-3">OTP</div>
                  <div className="font-medium">{selectedOrder.otp_code ? "Présent" : "Non défini"}</div>
                </div>
              </div>

              <div className="mt-6">
                <label className="text-sm text-gray-600">Saisissez le code OTP</label>
                <input value={otp} 
                onChange={(e) => {
                const value = e.target.value;
                setOtp(value.slice(0, 6)); // limite à 6 chars max
                }} placeholder="000000" className="mt-2 w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300" />
                <div className="flex gap-2 mt-4">
                  <button disabled={validating} onClick={() => validateOTP(selectedOrder.id)} className={`flex-1 px-4 py-3 rounded-xl text-white ${validating ? "bg-gray-400" : "bg-black hover:bg-gray-800"} transition`}>
                    {validating ? <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin w-4 h-4" /> Validation...</span> : <span className="inline-flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Valider</span>}
                  </button>

                  <button onClick={() => setOtp("")} className="px-4 py-3 rounded-xl border">Effacer</button>
                </div>

                <p className="text-xs text-gray-400 mt-3">Vous ne pouvez valider que les commandes appartenant à votre point retrait.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
