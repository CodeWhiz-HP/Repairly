import {
  getRepairRequests,
  getRepairOrders,
  getDashboardStats,
  getRevenueData,
} from "@/actions/dashboard";

import SellerDashboard from "./seller-dashboard";

export default async function Page() {
  const [
    repairRequests,
    repairOrders,
    dashboardStats,
    revenueData,
  ] = await Promise.all([
    getRepairRequests(),
    getRepairOrders(),
    getDashboardStats(),
    getRevenueData(),
  ]);

  return (
    <SellerDashboard
      repairRequests={repairRequests}
      repairOrders={repairOrders}
      dashboardStats={dashboardStats}
      revenueData={revenueData}
    />
  );
}