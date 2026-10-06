import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import Shell from "../components/pickup-dashboard/Shell";
import OverviewView from "../components/pickup-dashboard/OverviewView";
import OrdersView from "../components/pickup-dashboard/OrdersView";
import KitsView from "../components/pickup-dashboard/KitsView";
import HistoryView from "../components/pickup-dashboard/HistoryView";
import ValidateModal from "../components/pickup-dashboard/ValidateModal";
import { api, todayKeys, token } from "../components/pickup-dashboard/api";

const VIEWS = ["overview", "orders", "kits", "history"];

// Dashboard du point de retrait : vue d'ensemble, commandes, kits, compte & historique
export default function PickupDashboardPage() {
    const router = useRouter();
    const [me, setMe] = useState(null);
    const [denied, setDenied] = useState(null);
    const [view, setView] = useState("overview");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [period, setPeriod] = useState("month");
    const [date, setDate] = useState(() => todayKeys().month);
    const [notifications, setNotifications] = useState(null);
    const [selected, setSelected] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // Accès : point de retrait connecté uniquement
    useEffect(() => {
        if (!token()) {
            try { localStorage.setItem("redirect_after_login", "/pickup-dashboard"); } catch { }
            router.replace("/login");
            return;
        }
        api("me")
            .then((u) => (u.role === "super_pickuppoint" ? setMe(u) : setDenied("Cet espace est réservé aux points de retrait.")))
            .catch((e) => {
                if (e.status === 401) router.replace("/login");
                else setDenied(e.message);
            });
    }, [router]);

    // Vue mémorisée dans l'URL (#commandes…) pour rester sur la même page après actualisation
    useEffect(() => {
        const h = window.location.hash.replace("#", "");
        if (VIEWS.includes(h)) setView(h);
    }, []);
    const changeView = (v) => {
        setView(v);
        window.history.replaceState(null, "", `#${v}`);
        window.scrollTo({ top: 0 });
    };

    // Recherche appliquée 400 ms après la dernière frappe
    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput.trim()), 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const loadNotifications = useCallback(async () => {
        try {
            setNotifications(await api("pickup/dashboard/notifications"));
        } catch { }
    }, []);
    useEffect(() => {
        if (!me) return;
        loadNotifications();
        const t = setInterval(loadNotifications, 60000);
        return () => clearInterval(t);
    }, [me, loadNotifications, refreshKey]);

    const onPeriodChange = (p, d) => {
        setPeriod(p);
        setDate(d);
    };

    if (denied) {
        return (
            <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6 text-center">
                <div>
                    <p className="font-serif text-2xl text-[#1F1B16]">Accès impossible</p>
                    <p className="text-[#7A6E62] mt-2">{denied}</p>
                </div>
            </div>
        );
    }
    if (!me) {
        return (
            <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#C2185B]" />
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Dashboard point de retrait · E.doto</title>
            </Head>
            <Shell
                me={me}
                view={view}
                onView={changeView}
                search={searchInput}
                onSearch={setSearchInput}
                notifications={notifications}
                onPick={setSelected}
            >
                {view === "overview" && (
                    <OverviewView period={period} date={date} onPeriodChange={onPeriodChange} refreshKey={refreshKey} onOpenPending={() => changeView("orders")} />
                )}
                {view === "orders" && <OrdersView search={search} refreshKey={refreshKey} onOpen={setSelected} />}
                {view === "kits" && <KitsView search={search} refreshKey={refreshKey} onOpen={setSelected} />}
                {view === "history" && (
                    <HistoryView period={period} date={date} onPeriodChange={onPeriodChange} search={search} refreshKey={refreshKey} />
                )}
            </Shell>
            {selected && (
                <ValidateModal
                    item={selected}
                    onClose={() => setSelected(null)}
                    onDone={() => {
                        setSelected(null);
                        setRefreshKey((k) => k + 1);
                    }}
                />
            )}
        </>
    );
}
