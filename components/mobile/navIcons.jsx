// Icônes de la navigation mobile E.doto : un seul style (24 px, trait 1,6, bouts arrondis).
// « filled » = version active (remplissage doux + trait).
const base = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function HomeNavIcon({ filled, className }) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 10.6 12 3.8l8.5 6.8V19a1.7 1.7 0 0 1-1.7 1.7h-3.6v-5.4a1.2 1.2 0 0 0-1.2-1.2h-4a1.2 1.2 0 0 0-1.2 1.2v5.4H5.2A1.7 1.7 0 0 1 3.5 19z" fill={filled ? "currentColor" : "none"} fillOpacity={filled ? 0.14 : 0} />
      {filled && <path d="M9.8 20.7v-5" />}
    </svg>
  );
}

export function ProductsNavIcon({ filled, className }) {
  return (
    <svg {...base} className={className}>
      <path d="M5.2 8.2h13.6l-1 10.6a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" fill={filled ? "currentColor" : "none"} fillOpacity={filled ? 0.14 : 0} />
      <path d="M8.8 10.5V7a3.2 3.2 0 0 1 6.4 0v3.5" />
    </svg>
  );
}

export function CampaignNavIcon({ filled, className }) {
  return (
    <svg {...base} className={className}>
      <path d="M12 20.3s-7.3-4.3-7.3-10A4.1 4.1 0 0 1 12 7.7a4.1 4.1 0 0 1 7.3 2.6c0 5.7-7.3 10-7.3 10z" fill={filled ? "currentColor" : "none"} fillOpacity={filled ? 0.14 : 0} />
      <path d="M9.4 12.4h1.5l1-2 1.5 4 .9-2h1.3" />
    </svg>
  );
}

export function MenuNavIcon({ filled, className }) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 7.5h15" />
      <path d="M4.5 12h10" />
      <path d="M4.5 16.5h15" />
      {filled && <circle cx="18.5" cy="12" r="1.2" fill="currentColor" stroke="none" />}
    </svg>
  );
}

export function BellIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M6.2 9.2a5.8 5.8 0 1 1 11.6 0c0 6.1 2.6 7.8 2.6 7.8H3.6s2.6-1.7 2.6-7.8" />
      <path d="M10.2 20.2a2 2 0 0 0 3.6 0" />
    </svg>
  );
}

export function UserRoundIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="8.6" r="3.6" />
      <path d="M5 19.6a7 7 0 0 1 14 0" />
    </svg>
  );
}
