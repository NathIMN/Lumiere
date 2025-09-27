import { Outlet } from "react-router-dom";

export const ClaimsLayout = () => {
   return (
      <div className="px-4 mb-6">
         {/* This layout just provides structure (no summary here) */}
         <Outlet />
      </div>
   );
};