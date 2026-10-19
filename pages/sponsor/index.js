import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import SponsorShell from "../../components/sponsor-dashboard/SponsorShell";
import { CampaignsView, CampaignView, ExportsView, HomeView } from "../../components/sponsor-dashboard/views";
import { ActivityView, CitiesView, LiveView, PointsView } from "../../components/sponsor-dashboard/live-views";
import { ProfileView, ProposalsView } from "../../components/sponsor-dashboard/proposals";
import { resetFiltersCache } from "../../components/sponsor-dashboard/filters";
import { api, token } from "../../components/pickup-dashboard/api";
import AccessDenied from "../../components/dashboard-ui/AccessDenied";

const VIEWS = ["home", "live", "campaigns", "activity", "points", "cities", "proposals", "exports", "profile"];

// Espace sponsor : campagnes soutenues uniquement, chiffres et graphiques, export validé par l'admin
export default function SponsorPage() {
    const router = useRouter();
    const [sponsor, setSponsor] = useState(null);
    const [denied, setDenied] = useState(null);
    const [view, setView] = useState("home");
    const [campaignId, setCampaignId] = useState(null);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [notifications, setNotifications] = useState(null);
    const [exportsKey, setExportsKey] = useState(0);

    useEffect(() => {
        if (!token()) {
            try { localStorage.setItem("redirect_after_login", "/sponsor"); } catch { }
            router.replace("/login");
            return;
        }
        // Vue demandée dans l'adresse (?vue=proposals après l'inscription, par exemple)
        const wanted = new URLSearchParams(window.location.search).get("vue");
        if (VIEWS.includes(wanted)) setView(wanted);
        resetFiltersCache();
        api("sponsor/me")
            .then(setSponsor)
            .catch((e) => {
                if (e.status === 401) {
                    // Session expirée : retour ici après reconnexion (19/10/2026)
                    try { localStorage.removeItem("token"); localStorage.setItem("redirect_after_login", "/sponsor"); } catch { }
                    router.replace("/login");
                }
                else setDenied(e.status === 403 ? "Cet espace est réservé aux sponsors d’E.doto family." : e.message);
            });
    }, [router]);

    const loadNotifications = useCallback(async () => {
        try { setNotifications(await api("sponsor/notifications")); } catch { }
    }, []);
    useEffect(() => {
        if (!sponsor) return;
        loadNotifications();
        const t = setInterval(loadNotifications, 60000);
        return () => clearInterval(t);
    }, [sponsor, loadNotifications, exportsKey]);

    // Recherche : 400 ms après la dernière frappe, appliquée à « Mes campagnes »
    useEffect(() => {
        const t = setTimeout(() => {
            const q = searchInput.trim();
            setSearch(q);
            if (q && view !== "campaigns") setView("campaigns");
        }, 400);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    const openCampaign = (id) => {
        setCampaignId(id);
        setView("campaign");
        window.scrollTo({ top: 0 });
    };
    const changeView = (v) => {
        setView(v);
        window.scrollTo({ top: 0 });
    };

    if (denied) {
        return <AccessDenied message={denied} here="/sponsor" />;
    }
    if (!sponsor) {
        return <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#C2185B]" /></div>;
    }

    return (
        <>
            <Head><title>Espace sponsor · E.doto family</title></Head>
            <SponsorShell sponsor={sponsor} view={view} viewKey={view === "campaign" ? `campaign-${campaignId}` : view} onView={changeView} search={searchInput} onSearch={setSearchInput} notifications={notifications}>
                {view === "home" && <HomeView onOpenCampaign={openCampaign} />}
                {view === "campaigns" && <CampaignsView search={search} onOpenCampaign={openCampaign} />}
                {view === "campaign" && campaignId && (
                    <CampaignView id={campaignId} onBack={() => changeView("campaigns")} onExportsChanged={() => setExportsKey((k) => k + 1)} />
                )}
                {view === "exports" && <ExportsView refreshKey={exportsKey} onOpenCampaign={openCampaign} />}
                {view === "live" && <LiveView onOpenCampaign={openCampaign} />}
                {view === "activity" && <ActivityView />}
                {view === "points" && <PointsView />}
                {view === "cities" && <CitiesView />}
                {view === "proposals" && <ProposalsView onOpenCampaign={openCampaign} onChanged={loadNotifications} />}
                {view === "profile" && <ProfileView sponsor={sponsor} onSaved={() => api("sponsor/me").then(setSponsor).catch(() => { })} />}
            </SponsorShell>
        </>
    );
}
