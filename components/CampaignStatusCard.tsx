import React, { useEffect, useState } from "react";
import { Calendar, Clock, Hourglass, CheckCircle, Timer, CalendarCheck, Activity } from "lucide-react";

interface CampaignStatusProps {
  title: string;
  date_start: string;
  date_end: string;
  status: "a_venir" | "planifie" | "en_cours";
}

const CampaignStatusCard: React.FC<CampaignStatusProps> = ({
  title,
  date_start,
  date_end,
  status,
}) => {
  const formatDate = (isoDate: string) => {
    if (!isoDate) return "Non définie";

    const date = new Date(isoDate);

    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    return date.toLocaleDateString("fr-FR", options)
      .replace(",", ""); // petit nettoyage
  };

  const [countdown, setCountdown] = useState({
    days: "--",
    hours: "--",
    minutes: "--",
    seconds: "--",
    ended: false,
  });

  useEffect(() => {
    if (!date_end) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(date_end).getTime();

      const distance = end - now;

      if (distance <= 0) {
        setCountdown((c) => ({ ...c, ended: true }));
        clearInterval(interval);
        return;
      }

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)).toString(),
        hours: Math.floor((distance / (1000 * 60 * 60)) % 24).toString(),
        minutes: Math.floor((distance / (1000 * 60)) % 60).toString(),
        seconds: Math.floor((distance / 1000) % 60).toString(),
        ended: false,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [date_end]);

  // --- STYLES DU BADGE SELON STATUT ---
  const safeStatus = (status || "").toLowerCase().replace("-", "_");

  const statusMap: any = {
    a_venir: {
      label: "À venir",
      color: "bg-yellow-100 text-yellow-800",
      icon: <Clock size={16} className="text-yellow-700" />,
    },
    planifie: {
      label: "Planifiée",
      color: "bg-blue-100 text-blue-800",
      icon: <CalendarCheck size={16} className="text-blue-700" />,
    },
    en_cours: {
      label: "En cours",
      color: "bg-green-100 text-green-800",
      icon: <Activity size={16} className="text-green-700 animate-pulse" />,
    },
  };

  const config =
    statusMap[safeStatus] || statusMap["a_venir"];

  return (
    <div className="w-full bg-white/60 backdrop-blur-xl border border-white/30 rounded-[5px] mb-6">

      {/* Title + Badge **/}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>

        <span
          className={`flex items-center gap-2 px-4 py-1 rounded-full text-sm font-semibold ${config.color}`}
        >
          {config.icon}
          {config.label}
        </span>
      </div>

      {/* Dates */}
      <div className="mt-4 space-y-2 text-sm text-slate-700">
        <p className="flex items-center gap-2">
          <Calendar size={16} /> Début : <strong>{formatDate(date_start)}</strong>
        </p>

        <p className="flex items-center gap-2">
          <Clock size={16} /> Fin : <strong>{formatDate(date_end)}</strong>
        </p>
      </div>

      {/* Countdown */}
      {status === "en_cours" && (
        <div className="mt-6 bg-[#FFF0F7] rounded-2xl p-5 border border-pink-100 text-center">

          {!countdown.ended ? (
            <>
              <div className="flex justify-center items-center gap-2 mb-2">
                <Timer size={18} className="text-pink-600" />
                <p className="text-sm text-pink-700 font-medium">La campagne se termine dans</p>
              </div>

              <div className="flex justify-center gap-4 text-slate-900 font-bold text-xl">
                <div className="text-center">
                  <p>{countdown.days}</p>
                  <span className="text-xs text-gray-500">jours</span>
                </div>

                <div className="text-center">
                  <p>{countdown.hours}</p>
                  <span className="text-xs text-gray-500">h</span>
                </div>

                <div className="text-center">
                  <p>{countdown.minutes}</p>
                  <span className="text-xs text-gray-500">min</span>
                </div>

                <div className="text-center">
                  <p>{countdown.seconds}</p>
                  <span className="text-xs text-gray-500">sec</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 text-green-700 font-medium">
              <CheckCircle size={20} /> Campagne terminée
            </div>
          )}
        </div>
      )}

      {/* Si campagne planifiée */}
      {status === "planifie" && (
        <div className="mt-6 flex items-center justify-center gap-2 text-blue-700 bg-blue-50 border border-blue-100 p-4 rounded-2xl">
          <Hourglass size={18} />
          <p>Cette campagne démarre bientôt…</p>
        </div>
      )}

      {/* Si campagne à venir */}
      {status === "a_venir" && (
        <div className="mt-6 flex items-center justify-center gap-2 text-gray-700 bg-gray-100 border border-gray-200 p-4 rounded-2xl">
          <Calendar size={18} />
          <p>Campagne non encore lancée.</p>
        </div>
      )}
    </div>
  );
};

export default CampaignStatusCard;
