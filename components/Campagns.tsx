"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { ViewState } from '../types';
import {
  Calendar,
  MapPin,
  Gift,
  Clock,
  CheckCircle,
  ArrowRight,
  X,
  Search,
  XCircle,
  Layers
} from 'lucide-react';
import { Campaign } from '../types';
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import CampaignStatusCard from './CampaignStatusCard';

// ========= IMPORTANT =========
// This file is a single self-contained React component (TSX) for Next.js
// It expects these environment vars: NEXT_PUBLIC_REST_API_ENDPOINT
// and that your app provides authentication token in localStorage under 'token'.
// Replace API endpoints if needed.
// =============================

interface CampaignsProps {
  changeView: (view: ViewState) => void;
  showNotification: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const ITEMS_PER_PAGE = 5;

export const Campaigns: React.FC<CampaignsProps> = ({ changeView, showNotification }) => {
  const [showForm, setShowForm] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);

  const [selectedPickup, setSelectedPickup] = useState<number | null>(null);
  const [customPickup, setCustomPickup] = useState('');

  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [upcomingCampaigns, setUpcomingCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const [pickupPoints, setPickupPoints] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpenConfirm, setmodalOpenConfirm] = useState(false);
  const router = useRouter();
  const [city, setCity] = useState<string | null>(null);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [showGeoModal, setShowGeoModal] = useState(false);
  const [showGeoModalNoData, setShowGeoModalNoData] = useState(false);
  const [showCityDrawer, setShowCityDrawer] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [citySearch, setCitySearch] = useState("");
  const [activeCount, setActiveCount] = useState<number>(0);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [activeCampaignsCity, setActiveCampaignsCity] = useState<Campaign[]>([]);
  const beninCities = [
    "Abomey",
    "Abomey-Calavi",
    "Adjohoun",
    "Adjarra",
    "Agbangnizoun",
    "Allada",
    "Aplahoué",
    "Avrankou",
    "Banikoara",
    "Bantè",
    "Bassila",
    "Bembèrèkè",
    "Bohicon",
    "Bonou",
    "Boukoumbé",
    "Cotonou",
    "Cobly",
    "Dangbo",
    "Dassa-Zoumè",
    "Dogbo",
    "Djougou",
    "Glazoué",
    "Ifangni",
    "Kalalé",
    "Kandi",
    "Kétou",
    "Klouékanmè",
    "Kouandé",
    "Lalo",
    "Lokossa",
    "Malanville",
    "Matéri",
    "Natitingou",
    "Nikki",
    "Ouèssè",
    "Ouidah",
    "Parakou",
    "Pobè",
    "Porto-Novo",
    "Pèrèrè",
    "Sakété",
    "Savalou",
    "Savè",
    "Sèmè-Kpodji",
    "Sinendé",
    "Tanguiéta",
    "Tchaourou",
    "Toffo",
    "Togba",
    "Toucountouna",
    "Toviklin",
    "Za-Kpota",
    "Zè",
    "Zogbodomey"
  ];
  // -----------------------
  // Fetch campaigns
  // -----------------------
  const fetchCampaigns = async () => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
    try {
      const [activeRes, upcomingRes] = await Promise.all([
        fetch(`${API_BASE_URL}/campaigns/active`),
        fetch(`${API_BASE_URL}/campaigns/upcoming`)
      ]);

      const active = await activeRes.json();
      const upcoming = await upcomingRes.json();
      console.log("les actives", active);
      setActiveCampaignsCity(active);
      setUpcomingCampaigns(Array.isArray(upcoming) ? upcoming : (upcoming.data || []));
    } catch (err) {
      console.error(err);
      toast.error('Impossible de charger les campagnes.');
    } finally {
      setLoading(false);
    }
  };
  // FETCH COUNT
  // -------------------------

  const fetchActiveCount = async () => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
    try {

      const res = await fetch(`${API_BASE_URL}/campaigns/active/count`);
      const data = await res.json();

      setActiveCount(data.total || 0);

    } catch (e) {
      console.error(e);
    }
  };
  // -----------------------
  // Fetch pickup points (super_pickuppoint)
  // -----------------------
  const fetchPickupPoints = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;

      const res = await fetch(
        `${API_BASE_URL}/users?role=super_pickuppoint&limit=100`,
        {
          headers: token
            ? {
              Authorization: `Bearer ${token}`
            }
            : undefined
        }
      );

      const data = await res.json();
      setPickupPoints(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
    } catch (e) {
      console.error('Erreur fetching pickup points:', e);
    }
  };
  const fetchActiveByCity = async (city: string | null) => {

    if (!city) return;

    try {

      const API_BASE_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;

      const res = await fetch(
        `${API_BASE_URL}/campaigns/active/city/${city}`
      );

      const data = await res.json();

      console.log("Campagne active pour la ville sélectionnée:", data?.[0] || null);

      if (Array.isArray(data) && data.length > 0) {

        setActiveCampaign(data[0]);
        //setActiveCampaignsCity(data);
      } else {

        setActiveCampaign(null);
        setShowGeoModalNoData(true);
        //setActiveCampaignsCity([]);
        //alert("Aucune campagne active trouvée pour cette ville.");

      }

    } catch (e) {
      console.error(e);
    }

  };
  const filteredCities = beninCities.filter(city =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );
  useEffect(() => {
    const detectCity = async () => {

      try {

        if (!navigator.geolocation) return;

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true
          });
        });

        const { latitude, longitude } = position.coords;

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&countrycodes=bj&accept-language=fr`,
          {
            headers: {
              "User-Agent": "EdotoFamilyApp"
            }
          }
        );

        const data = await res.json();

        const city =
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          null;

        if (city) {
          setDetectedCity(city);
          setShowGeoModal(true);
        }

      } catch (e) {
        console.error(e);
      }

    }; detectCity()
    fetchCampaigns();
    fetchPickupPoints();
    fetchActiveCount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------
  // Pagination & filter
  // -----------------------
  const filtered = pickupPoints.filter((p) => (p.name || '').toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageData = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // -----------------------
  // Register to campaign
  // Accepts an optional `pickupCenter` parameter (id or custom string).
  // If provided, we send that directly to the API (no race with setState).
  // If not provided, fall back to using state values.
  // -----------------------
  const registerToCampaign = async (pickupCenterParam?: number | string | null) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Vous devez être connecté.');
      if (typeof window !== "undefined") {
        localStorage.setItem("redirect_after_login", window.location.pathname);
      }
      router.push('/login');
      return;
    }

    if (!activeCampaign) {
      toast.error('Campagne introuvable.');
      return;
    }

    // determine value to send: function param wins, otherwise use state
    const pickupCenterValue = typeof pickupCenterParam !== 'undefined'
      ? pickupCenterParam
      : (selectedPickup ?? customPickup);

    // validate
    if (pickupCenterValue === null || pickupCenterValue === '') {
      toast.error('Veuillez sélectionner un point de retrait avant de confirmer.');
      return;
    }

    const payload = {
      campaign_id: activeCampaign.id,
      pickup_center: pickupCenterValue
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/campaigns/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Erreur lors de l\'inscription.');
        return;
      }

      //toast.success('Inscription enregistrée. Votre code de retrait vous a été envoyé par email.');
      setmodalOpenConfirm(true);
      setShowForm(false);
      setShowPickupModal(false);
      // reset selections
      setSelectedPickup(null);
      setCustomPickup('');

    } catch (e) {
      console.error(e);
      toast.error('Erreur réseau.');
    }
  };

  // -----------------------
  // When user submits the first modal we open the pickup modal
  // -----------------------
  const handleSubscribe = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowPickupModal(true);
  };

  // -----------------------
  // Helper: called when a pickup is selected from ModalPickup
  // We will set local state (optional) and immediately trigger registration using the passed value.
  // Important: we call registerToCampaign(...) with the actual value to avoid race conditions.
  // -----------------------
  const onPickupChosen = (id: number | null, custom?: string) => {
    // store for UI (optional)
    setSelectedPickup(id);
    setCustomPickup(custom || '');

    // build effective pickup value:
    const effectivePickup = (custom && custom.trim() !== '') ? custom : id;

    // Close modal first so UI responds fast
    setShowPickupModal(false);

    // Call register with the exact value (no reliance on React setState timing)
    // Slight delay to allow modal exit animation if you want; not required.
    setTimeout(() => {
      registerToCampaign(effectivePickup);
    }, 80);
  };

  // -----------------------
  // Render
  // -----------------------
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-slate-600 text-xl">Chargement des campagnes...</div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO */}
      <div className="bg-slate-900 text-white pt-20 pb-32 relative overflow-hidden">
        <div className="blob bg-pink-600 w-96 h-96   top-0 right-0 mix-blend-overlay filter blur-3xl opacity-40" />
        <div className="blob bg-purple-600 w-96 h-96   bottom-0 left-0 mix-blend-overlay filter blur-3xl opacity-40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-2  rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-pink-300 text-sm font-medium mb-6">
            <Gift size={16} />
            <span>Campagnes Solidaires</span>
          </span>

          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Distributions <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Solidaires</span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">Nous soutenons les femmes avec des kits d’hygiène essentiels.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 z-20 relative">
        {/* ACTIVE */}
        {activeCampaign && (
          <ActiveCampaignCard campaign={activeCampaign} onOpen={() => setShowForm(true)} />
        )}

        {/* UPCOMING */}
        <div className="flex items-center gap-3 mb-8">
          <Calendar className="text-pink-500" size={28} />
          <h2 className="text-3xl font-bold text-slate-900">Prochaines Distributions</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {upcomingCampaigns.map((c) => (
            <EventCard key={c.id} date={new Date(c.date_start).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} location={c.location} title={c.title} status={c.status === 'planifie' ? 'Planifié' : 'À venir'} />
          ))}
        </div>
      </div>

      {/* MODAL: Subscribe (simple: just continue to pickup) */}
      {showForm && (
        <ModalSubscribe onClose={() => setShowForm(false)} onSubmit={handleSubscribe} />
      )}
      {/* MODAL CAMPAGNES */}

      <AnimatePresence>

        {showCampaignModal && (

          <motion.div
            {...{
              className:
                "fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-[200]",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >

            <motion.div
              {...{
                className:
                  "bg-slate-900 text-white w-full max-w-2xl rounded-3xl p-8",
              }}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >

              <div className="flex justify-between items-center mb-6">

                <h2 className="text-2xl font-bold">
                  Campagnes actives
                </h2>

                <button onClick={() => setShowCampaignModal(false)}>
                  <X size={24} />
                </button>

              </div>

              <div className="space-y-4">

                {activeCampaignsCity.map((c) => (

                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveCampaign(c);
                      setShowCampaignModal(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="p-4 bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-700 transition"
                  >

                    <div className="flex justify-between">

                      <h3 className="font-bold">
                        {c.title}
                      </h3>

                      <MapPin size={18} />

                    </div>

                    <p className="text-sm text-slate-400">
                      {c.location}
                    </p>

                  </div>

                ))}

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>
      {/* MODAL: Pickup (choose point OR custom) */}
      <ModalPickup
        visible={showPickupModal}
        close={() => setShowPickupModal(false)}
        search={search}
        setSearch={setSearch}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        pageData={pageData}
        onChoose={onPickupChosen}
      />
      {modalOpenConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center animate-fade-in">

            {/* ICON */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-11 h-11 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                  />
                </svg>
              </div>
            </div>

            {/* TITLE */}
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Demande envoyée avec succès 🎉
            </h2>

            {/* MESSAGE */}
            <p className="text-slate-600 text-sm leading-relaxed">
              Votre demande de <span className="font-semibold text-slate-800">kits gratuits</span> a bien été enregistrée.
              <br /><br />
              Veuillez vérifier votre boîte email afin de récupérer votre
              <span className="font-semibold text-slate-800"> code OTP</span>.
              <br /><br />
              Ce code vous permettra de retirer votre colis au point de retrait
              que vous avez sélectionné.
            </p>

            {/* ACTION */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setmodalOpenConfirm(false)}
                className="
            px-6 py-3 rounded-full
            bg-gradient-to-r from-pink-500 to-pink-600
            text-white font-semibold
            shadow-[0_10px_25px_rgba(236,72,153,0.35)]
            hover:shadow-[0_16px_40px_rgba(236,72,153,0.45)]
            transition
          "
              >
                Merci !
              </button>
            </div>
          </div>
        </div>
      )}
      {showGeoModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 backdrop-blur-xl">

          <div className="bg-[#0f172a] text-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/10">

            <div className="text-center">

              <h2 className="text-2xl font-bold mb-4">
                📍 Ville détectée
              </h2>

              <p className="text-3xl font-bold text-pink-400 mb-8">
                {detectedCity}
              </p>

              <div className="flex gap-4 justify-center">

                <button
                  onClick={() => {
                    setSelectedCity(detectedCity);
                    setShowGeoModal(false);
                    fetchActiveByCity(detectedCity);
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-semibold"
                >
                  ✅ Confirmer
                </button>

                <button
                  onClick={() => {
                    setShowGeoModal(false);
                    setShowCityDrawer(true);
                  }}
                  className="px-6 py-3 rounded-xl bg-white/10"
                >
                  ✏ Modifier
                </button>

              </div>

            </div>

          </div>

        </div>
      )}
      {showGeoModalNoData && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 backdrop-blur-xl">

          <div className="bg-[#0f172a] text-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/10">

            <div className="text-center">

              <h2 className="text-2xl font-bold mb-4">
                📍 Aucune campagne n'est en cours pour la ville choisie. Merci !
              </h2>



              <div className="flex gap-4 justify-center">


                <button
                  onClick={() => {
                    setShowGeoModalNoData(false);

                  }}
                  className="px-6 py-3 rounded-xl bg-white/10"
                >
                  OK
                </button>

              </div>

            </div>

          </div>

        </div>
      )}
      {showCityDrawer && (
        <div className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-xl flex justify-end">

          <div className="w-full max-w-sm bg-[#020617] text-white p-6">

            <h2 className="text-xl font-bold mb-6">
              🌍 Choisir une ville
            </h2>
            <button
              onClick={() => setShowCityDrawer(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl"
            >
              ✕
            </button>
            <input
              placeholder="Rechercher ville..."
              className="w-full p-3 rounded-xl bg-white/5 mb-6"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
            />

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">

              {filteredCities.map(city => (
                <div
                  key={city}
                  onClick={() => {
                    setSelectedCity(city);
                    setShowCityDrawer(false);
                    fetchActiveByCity(city);
                    setShowGeoModal(false);
                  }}
                  className="p-4 rounded-xl bg-white/5 hover:bg-pink-600 cursor-pointer transition"
                >
                  {city}
                </div>
              ))}

            </div>

          </div>

        </div>
      )}

      {/* BOUTON PREMIUM */}
      {activeCount > 0 && (

        <button
          onClick={() => setShowCampaignModal(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl bg-slate-900 text-white shadow-2xl hover:scale-105 transition"
        >
          <Layers size={20} />

          <span className="font-semibold">
            {activeCount} active(s)
          </span>
        </button>

      )}
    </div>
  );
};

export default Campaigns;

// --------------------
// Subcomponents
// --------------------

const ActiveCampaignCard = ({ campaign, onOpen }: any) => (
  <div className="bg-white rounded-[5px]   overflow-hidden mb-20 border border-white/50">
    <div className="grid lg:grid-cols-2">
      <div className="relative h-64 lg:h-auto group overflow-hidden">
        <img src={campaign.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-2 bg-black/40 backdrop-blur-sm w-fit px-3 py-1 rounded-[5px] border border-white/10">
              <Clock size={16} className="text-pink-400" />
              <span className="font-medium text-sm text-pink-100">En cours</span>
            </div>
            <h3 className="text-2xl font-bold">{campaign.title}</h3>
          </div>
        </div>
      </div>

      <div className="p-8 lg:p-12 flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">{campaign.location}</h2>
        <p className="text-slate-600 text-lg mb-8 leading-relaxed">{campaign.description}</p>
        <CampaignStatusCard
          title={campaign.title}
          date_start={campaign.date_start}
          date_end={campaign.date_end}
          status={campaign.status}
        />

        <div className="space-y-4 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-slate-500">Progression</span>
            <span className="text-pink-600 font-bold">{Math.round((campaign.distributed_kits / campaign.objective_kits) * 100)}%</span>
          </div>

          <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full" style={{ width: `${(campaign.distributed_kits / campaign.objective_kits) * 100}%` }} />
          </div>

          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>{campaign.distributed_kits} kits distribués</span>
            <span>Objectif : {campaign.objective_kits}</span>
          </div>
        </div>

        <button onClick={onOpen} className="w-full px-6 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-pink-600 transition-all shadow-lg mb-4">Demander un kit</button>
      </div>
    </div>
  </div>
);

const EventCard = ({ date, location, title, status }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 hover:shadow-xl transition-all cursor-pointer group flex flex-col h-full">
    <div className="flex justify-between items-start mb-4">
      <div className="bg-slate-50 px-3 py-1 rounded-lg text-slate-900 font-bold text-sm border border-slate-200">{date}</div>
      <span className={`text-xs font-bold px-3 py-1 rounded-full ${status === 'À venir' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>{status}</span>
    </div>

    <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-pink-600 transition-colors">{title}</h4>

    <div className="flex items-center gap-2 text-slate-500 text-sm mb-6"><MapPin size={16} /><span>{location}</span></div>

    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><ArrowRight size={20} /></div>
    </div>
  </div>
);

// ==================================================
// ModalSubscribe — simple, prompts to open pickup
// ==================================================
const ModalSubscribe = ({ onClose, onSubmit }: any) => {
  return (
    <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.2)] border border-white/40 p-8">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/60 hover:bg-white shadow">
          <X size={20} className="text-slate-700" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Inscription</h2>
          <p className="text-slate-600 text-sm mt-1">Sélectionnez votre point de retrait pour finaliser votre demande.</p>
        </div>

        <button onClick={onSubmit} className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-pink-600 transition-all shadow-lg">Sélectionner un point de retrait</button>
      </div>
    </div>
  );
};

// ==================================================
// ModalPickup — choose from list or custom note
// Props: visible, close, search, setSearch, page, setPage, totalPages, pageData, onChoose
// ==================================================
const ModalPickup = ({
  visible,
  close,
  search,
  setSearch,
  page,
  setPage,
  totalPages,
  pageData,
  onChoose,
}: any) => {

  const [customMode, setCustomMode] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [selected, setSelected] = useState<any>(null);

  if (!visible) return null;

  const choosePickup = () => {
    if (!selected && !customNote.trim()) {
      toast.error("Veuillez choisir un point de retrait");
      return;
    }

    if (customMode) {
      onChoose(null, customNote);
    } else {
      onChoose(selected, undefined);
    }
    // closing handled by parent or here:
    // close(); parent will close after registering (we close in parent), but closing here gives immediate UI feedback:
    close();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[300]">

      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Choisir un point de retrait</h2>
          <button onClick={close}><XCircle size={26} /></button>
        </div>

        {!customMode && (
          <>
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full mb-4 p-2 border rounded-xl"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

            <div className="max-h-80 overflow-y-auto pr-2">
              {pageData.map((p: any) => (
                <div
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  className={`p-4 border rounded-xl mb-3 cursor-pointer ${selected === p.id
                    ? 'bg-pink-50 border-pink-500'
                    : 'hover:border-pink-400'
                    }`}
                >
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-gray-500">{p.address}</p>
                </div>
              ))}
            </div>

            <p
              className="text-center text-[#FF6EA9] mt-5 cursor-pointer"
              onClick={() => setCustomMode(true)}
            >
              Décrire un point personnalisé
            </p>
          </>
        )}

        {customMode && (
          <>
            <textarea
              rows={3}
              className="w-full border rounded-xl p-3"
              value={customNote}
              placeholder="Décrire l’endroit..."
              onChange={(e) => setCustomNote(e.target.value)}
            />

            <p
              className="text-center text-[#FF6EA9] mt-5 cursor-pointer"
              onClick={() => setCustomMode(false)}
            >
              Retour
            </p>
          </>
        )}

        {/* Bouton valider */}
        <button
          onClick={choosePickup}
          className="mt-6 w-full bg-slate-900 text-white py-3 rounded-xl"
        >
          Confirmer
        </button>

      </div>
    </div>
  );

};
