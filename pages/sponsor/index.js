import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import SponsorShell from "../../components/sponsor-dashboard/SponsorShell";
import { CampaignsView, CampaignView, ExportsView, HomeView } from "../../components/sponsor-dashboard/views";
import { api, token } from "../../components/pickup-dashboard/api";

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
        api("sponsor/me")
            .then(setSponsor)
            .catch((e) => {
                if (e.status === 401) router.replace("/login");
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
        return (
            <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6 text-center">
                <div><p className="font-serif text-2xl text-[#1F1B16]">Accès impossible</p><p className="text-[#7A6E62] mt-2">{denied}</p></div>
            </div>
        );
    }
    if (!sponsor) {
        return <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#C2185B]" /></div>;
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
            </SponsorShell>
        </>
    );
}
