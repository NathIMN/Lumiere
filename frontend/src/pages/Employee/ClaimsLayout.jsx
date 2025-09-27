import { Outlet } from "react-router-dom";
import { Loading } from "../../components/common/Loading";
import { FeaturesGrid } from "../../components/common/Card";
import { DashboardStats } from "../../components/common/card01";
export const ClaimsLayout = () => {
  return (
    <div className="px-4 mb-6">
      {/* This layout just provides structure (no summary here) */}
      <Outlet />
    </div>
  );
};