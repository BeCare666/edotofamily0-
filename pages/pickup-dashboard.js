import { useState } from "react";
import DashboardPickupCampaigns from "../components/dashboardpickupcampagns";
import DashboardPickupOrders from "../components/dashboardpickuporders";

export default function PickupDashboard() {

  const [view, setView] = useState("campaigns");

  if (view === "orders") {
    return <DashboardPickupOrders setView={setView} />;
  }

  return <DashboardPickupCampaigns setView={setView} />;

}