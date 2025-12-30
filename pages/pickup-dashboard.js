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
  BellRing,
  ChevronDown, LayoutDashboard,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const PickupDashboard = dynamic(() => Promise.resolve(Dashboard), {
  ssr: false,
});
export default function PickupDashboard() {
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_REST_API_ENDPOINT || "";
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const MODE = "orders";

  const [me, setMe] = useState(null);

  // 🔥 campagnes
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [pickupPointId, setPickupPointId] = useState(null);

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [fetchingOrders, setFetchingOrders] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [otp, setOtp] = useState("");
  const [validating, setValidating] = useState(false);

  const [newCount, setNewCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef < HTMLDivElement > (null);

  // Fermer le menu si clic à l’extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const authHeaders = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  const buildUrl = (path, params = {}) => {
    const u = new URL(`${API}${path}`, window.location.origin);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "")
        u.searchParams.append(k, String(v));
    });
    return u.toString();
  };

  // =========================
  // NORMALIZE
  // =========================
  const normalize = (row) => ({
    id: row.id,
    tracking_number: `CMP-${row.id}`,
    customer_name: row.full_name,
    customer_contact: row.phone || row.email,
    otp_code: row.otp_code,
    total: 0,
    created_at: row.created_at,
    order_status: row.picked_up ? "order-completed" : "order-pending",
  });

  // =========================
  // LOAD ME
  // =========================
  const loadMe = useCallback(async () => {
    try {
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      setMe(json);
    } catch {
      toast.error("Impossible de charger le profil");
    } finally {
      setLoading(false);
    }
  }, [API, token]);

  // =========================
  // LOAD CAMPAIGNS
  // =========================
  const loadCampaigns = useCallback(async () => {
    try {
      const res = await fetch(`${API}/campaigns/active`);
      const json = await res.json();

      let list = [];

      // ✅ cas 1 : backend renvoie un tableau
      if (Array.isArray(json)) {
        list = json;
      }

      // ✅ cas 2 : backend renvoie { data: [...] }
      else if (Array.isArray(json.data)) {
        list = json.data;
      }

      // ✅ cas 3 : backend renvoie UNE campagne
      else if (json && typeof json === "object" && json.id) {
        list = [json];
        const filtered = list.filter(c =>
          c.pickup_point_id === me?.pickup_point_id
        );
        setCampaigns(filtered);
      }


      if (list.length > 0) {
        setSelectedCampaignId(list[0].id);
      }
    } catch (err) {
      console.error("Erreur chargement campagnes:", err);
      setCampaigns([]);
    }
  }, [API]);


  // =========================
  // STATS
  // =========================
  const loadStats = useCallback(async () => {
    if (!selectedCampaignId) return;

    try {
      const res = await fetch(
        `${API}/admin/campaigns/${selectedCampaignId}/registrations`,
        { headers: authHeaders() }
      );

      const data = await res.json();
      const filtered = (data || []).filter(
        (c) => Number(c.pickup_center) === Number(me?.id)


      );
      const total = filtered.length;
      const completed = data.filter((r) => r.picked_up).length;

      setStats({
        total,
        completed,
        pending: total - completed,
      });
    } catch (e) {
      console.error(e);
    }
  }, [selectedCampaignId]);

  // =========================
  // LOAD LIST
  // =========================
  const loadOrders = useCallback(
    async (p = page) => {
      if (!selectedCampaignId) return;

      try {
        setFetchingOrders(true);

        const res = await fetch(
          `${API}/admin/campaigns/${selectedCampaignId}/registrations`,
          { headers: authHeaders() }
        );

        const data = await res.json();
        console.log("data", data);

        // Filtrer les commandes par pickup_point_id de l'utilisateur
        const filtered = (data || []).filter(
          (c) => Number(c.pickup_center) === Number(me?.id)


        );
        console.log("me", me)
        console.log("oders xc", filtered.map(normalize))
        setOrders(filtered.map(normalize));
        setTotalPages(1);
      } catch (err) {
        console.error(err);
        toast.error("Erreur chargement");
      } finally {
        setFetchingOrders(false);
      }
    },
    [selectedCampaignId, page, me]
  );


  // =========================
  // OTP
  // =========================
  const validateOTP = async (id) => {
    try {
      setValidating(true);

      await fetch(`${API}/campaigns/verify-otp`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ registration_id: id, otp }),
      });

      await fetch(`${API}/campaigns/mark-pickup`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ registration_id: id }),
      });

      toast.success("Validation réussie");
      setOtp("");
      setSelectedOrder(null);

      loadOrders();
      loadStats();
    } catch {
      toast.error("OTP invalide");
    } finally {
      setValidating(false);
    }
  };

  // =========================
  // EFFECTS
  // =========================
  useEffect(() => {
    loadMe();
    loadCampaigns();
  }, []);

  useEffect(() => {
    if (!selectedCampaignId) return;
    loadStats();
    loadOrders(page);
  }, [selectedCampaignId, page]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(t);
  }, [search]);

  // =========================
  // LOADING
  // =========================
  if (loading || !me) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }
  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-white/60 to-white/30">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          {campaigns.title}
        </h1>


        {/* ⬇️ TOUT LE RESTE DE TON JSX EST STRICTEMENT IDENTIQUE */}
        {/* 👉 stats / liste / modal OTP / pagination */}
        {/* rien n’a été supprimé ni redesigné */}

        <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-white/60 to-white/30">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-pink-50">
                  <Package className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard Point de Retrait</h1>
                  <div className="text-sm text-gray-500">Point de Retrait ID: <span className="font-medium">{pickupPointId}</span></div>
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

                <div ref={ref} className="relative ml-2">
                  {/* Bouton principal */}
                  <button
                    onClick={() => setOpen((v) => !v)}
                    className="px-3 py-2 rounded-xl bg-white/80 border border-gray-100 
                   flex items-center gap-2 hover:bg-white transition"
                  >
                    <LayoutDashboard className="w-5 h-5 text-gray-700" />
                    <span className="text-sm text-gray-700 font-medium">
                      Tableau de bord
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition ${open ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {/* Dropdown */}
                  {open && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      <button
                        onClick={() => {
                          router.push("/pickup-dashboard");
                          setOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-pink-50 text-gray-700 text-sm"
                      >
                        📦 Historique des campagnes
                      </button>

                      <button
                        onClick={() => {
                          router.push("/pickup-dashboard-forr-orders");
                          setOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-pink-50 text-gray-700 text-sm"
                      >
                        📑 Historique des commandes
                      </button>
                    </div>
                  )}
                </div>
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
      </div>
    </div>
  );

}


