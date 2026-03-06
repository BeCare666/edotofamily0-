import React, { useEffect, useState } from 'react';
import { ViewState } from '../types';
import {
    Calendar,
    MapPin,
    Gift,
    Clock,
    ArrowRight,
    X,
    Search,
    XCircle,
    Layers
} from 'lucide-react';
import { Campaign } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import CampaignStatusCard from './CampaignStatusCard'

interface CampaignsProps {
    changeView: (view: ViewState) => void;
    showNotification: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const ITEMS_PER_PAGE = 5;

export const Campaigns: React.FC<CampaignsProps> = ({ changeView, showNotification }) => {

    const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
    const [upcomingCampaigns, setUpcomingCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    const [city, setCity] = useState<string | null>(null);
    const [activeCampaignsCity, setActiveCampaignsCity] = useState<Campaign[]>([]);
    const [activeCount, setActiveCount] = useState<number>(0);

    const [showCampaignModal, setShowCampaignModal] = useState(false);

    const router = useRouter();

    const API_BASE_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;

    // -------------------------
    // GEOLOCATION IPINFO
    // -------------------------

    const detectCity = async () => {
        try {
            const res = await fetch("https://ipinfo.io/json");
            const data = await res.json();
            setCity(data.city);
            return data.city;
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    // -------------------------
    // FETCH ACTIVE BY CITY
    // -------------------------

    const fetchActiveByCity = async (cityName: string) => {
        try {

            const res = await fetch(`${API_BASE_URL}/campaigns/active/city/${cityName}`);
            const data = await res.json();

            if (Array.isArray(data) && data.length > 0) {
                setActiveCampaign(data[0]);
                setActiveCampaignsCity(data);
            } else {
                setActiveCampaign(null);
                setActiveCampaignsCity([]);
            }

        } catch (e) {
            console.error(e);
            toast.error("Impossible de charger la campagne locale.");
        }
    };

    // -------------------------
    // FETCH UPCOMING
    // -------------------------

    const fetchUpcoming = async () => {
        try {

            const res = await fetch(`${API_BASE_URL}/campaigns/upcoming`);
            const upcoming = await res.json();

            setUpcomingCampaigns(Array.isArray(upcoming) ? upcoming : (upcoming.data || []));

        } catch (e) {
            console.error(e);
        }
    };

    // -------------------------
    // FETCH COUNT
    // -------------------------

    const fetchActiveCount = async () => {
        try {

            const res = await fetch(`${API_BASE_URL}/campaigns/active/count`);
            const data = await res.json();

            setActiveCount(data.total || 0);

        } catch (e) {
            console.error(e);
        }
    };

    // -------------------------
    // INIT
    // -------------------------

    useEffect(() => {

        const init = async () => {

            const userCity = await detectCity();

            if (userCity) {
                await fetchActiveByCity(userCity);
            }

            await fetchUpcoming();
            await fetchActiveCount();

            setLoading(false);
        };

        init();

    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl">
                Chargement...
            </div>
        );
    }

    return (

        <div className="min-h-screen bg-slate-50">

            {/* HERO */}

            <div className="bg-slate-900 text-white pt-20 pb-32">

                <div className="max-w-7xl mx-auto text-center">

                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-pink-300 mb-6">
                        <Gift size={16} />
                        Campagnes Solidaires
                    </span>

                    <h1 className="text-5xl font-bold mb-6">
                        Distributions Solidaires
                    </h1>

                    <p className="text-slate-300">
                        Nous soutenons les femmes avec des kits d’hygiène essentiels
                    </p>

                </div>

            </div>

            <div className="max-w-7xl mx-auto -mt-20">

                {/* ACTIVE CAMPAIGN */}

                {activeCampaign && (
                    <ActiveCampaignCard campaign={activeCampaign} />
                )}

                {/* UPCOMING */}

                <div className="flex items-center gap-3 mb-8">

                    <Calendar className="text-pink-500" size={28} />

                    <h2 className="text-3xl font-bold">
                        Prochaines Distributions
                    </h2>

                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-20">

                    {upcomingCampaigns.map((c) => (

                        <EventCard
                            key={c.id}
                            date={new Date(c.date_start).toLocaleDateString('fr-FR')}
                            location={c.location}
                            title={c.title}
                            status={c.status}
                        />

                    ))}

                </div>

            </div>

            {/* BOUTON PREMIUM */}

            {activeCount > 0 && (

                <button
                    onClick={() => setShowCampaignModal(true)}
                    className="fixed bottom-6 left-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl bg-slate-900 text-white shadow-2xl hover:scale-105 transition"
                >

                    <Layers size={20} />

                    <span className="font-semibold">
                        {activeCount} campagnes actives
                    </span>

                </button>

            )}

            {/* MODAL CAMPAGNES */}

            <AnimatePresence>

                {showCampaignModal && (

                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-[200]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >

                        <motion.div
                            className="bg-slate-900 text-white w-full max-w-2xl rounded-3xl p-8"
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

        </div>

    );

};

export default Campaigns;

const ActiveCampaignCard = ({ campaign }: any) => (

    <div className="bg-white rounded-xl overflow-hidden mb-20">

        <img
            src={campaign.image_url}
            className="w-full h-64 object-cover"
        />

        <div className="p-8">

            <h2 className="text-3xl font-bold mb-4">
                {campaign.title}
            </h2>

            <p className="mb-6">
                {campaign.description}
            </p>

            <CampaignStatusCard
                title={campaign.title}
                date_start={campaign.date_start}
                date_end={campaign.date_end}
                status={campaign.status}
            />

        </div>

    </div>

);

const EventCard = ({ date, location, title, status }: any) => (

    <div className="bg-white p-6 rounded-2xl">

        <div className="flex justify-between mb-4">

            <div className="font-bold">
                {date}
            </div>

            <span className="text-sm text-pink-600">
                {status}
            </span>

        </div>

        <h4 className="text-xl font-bold mb-2">
            {title}
        </h4>

        <div className="flex items-center gap-2 text-sm text-gray-500">

            <MapPin size={16} />

            {location}

        </div>

    </div>

);