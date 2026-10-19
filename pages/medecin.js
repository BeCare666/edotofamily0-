import { useEffect, useState } from "react";
import Head from "next/head";
import { CalendarClock, CalendarDays, LayoutDashboard, Loader2, Search } from "lucide-react";
import SpaceShell from "../components/teleconsultation/SpaceShell";
import useSpaceAccess from "../components/teleconsultation/useSpaceAccess";
import AccessDenied from "../components/dashboard-ui/AccessDenied";
import { AppointmentDetail, AppointmentsView, ScheduleView, TodayView } from "../components/teleconsultation/DoctorViews";

// Espace médecin (19/10/2026) : agenda du jour, rendez-vous, comptes rendus, disponibilités.
const MENU = [
    { key: "today", label: "Aujourd’hui", icon: LayoutDashboard },
    { key: "appointments", label: "Rendez-vous", icon: CalendarClock },
    { key: "schedule", label: "Disponibilités", icon: CalendarDays },
];

export default function MedecinPage() {
    const { me, denied } = useSpaceAccess("doctor", "/medecin", "Cet espace est réservé aux médecins de E.doto family.");
    const [view, setView] = useState("today");
    const [openId, setOpenId] = useState(null);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const h = window.location.hash.replace("#", "");
        if (MENU.some((m) => m.key === h)) setView(h);
        const m = /^rdv-(\d+)$/.exec(h);
        if (m) { setOpenId(Number(m[1])); setView("appointment"); }
    }, []);
    useEffect(() => {
        const t = setTimeout(() => {
            const q = searchInput.trim();
            setSearch(q);
            if (q && view !== "appointments") setView("appointments");
        }, 400);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    const changeView = (v) => {
        setView(v);
        window.history.replaceState(null, "", `#${v}`);
        window.scrollTo({ top: 0 });
    };
    const open = (id) => {
        setOpenId(id);
        setView("appointment");
        window.history.replaceState(null, "", `#rdv-${id}`);
        window.scrollTo({ top: 0 });
    };

    if (denied) return <AccessDenied message={denied} here="/medecin" />;
    if (!me) return <div className="flex min-h-screen items-center justify-center bg-[#F9F8F6]"><Loader2 className="h-8 w-8 animate-spin text-[#C2185B]" /></div>;

    return (
        <>
            <Head><title>Espace médecin · E.doto family</title></Head>
            <SpaceShell
                space="Espace médecin"
                roleLabel="Médecin"
                identity={{ name: me.name, detail: me.email }}
                menu={MENU}
                view={view === "appointment" ? "appointments" : view}
                viewKey={view === "appointment" ? `rdv-${openId}` : view}
                onView={changeView}
                storageKey="edoto:doctor-sidebar"
                showProfile={false}
                search={
                    <div className="relative min-w-0 max-w-xl flex-1">
                        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A837A]" aria-hidden="true" />
                        <input type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Patient, référence ou téléphone…" aria-label="Rechercher un rendez-vous"
                            className="w-full rounded-2xl border border-transparent bg-[#F3F1EE] py-3 pl-11 pr-4 text-sm text-[#1A1814] placeholder:text-[#8A837A] transition focus:border-[#E0DBD4] focus:bg-white focus:outline-none" />
                    </div>
                }
            >
                {view === "today" && <TodayView onOpen={open} onSchedule={() => changeView("schedule")} />}
                {view === "appointments" && <AppointmentsView onOpen={open} search={search} />}
                {view === "appointment" && openId && <AppointmentDetail id={openId} onBack={() => changeView("appointments")} />}
                {view === "schedule" && <ScheduleView />}
            </SpaceShell>
        </>
    );
}
