import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";

import { LumiereLanding } from "../pages/LandingPage/LumiereLanding";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import { HRDashboard } from "../pages/HR/HRDashboard";
import { EmployeeDashboard } from "../pages/Employee/EmployeeDashboard";
import { AgentDashboard } from "../pages/Agent/AgentDashboard";
import UserAuthApp from "../pages/Common/UserAuthApp";

const Logout = () => {
  const { logout } = useAuth();
  logout();
};

export const AllRoutes = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LumiereLanding />} />
        
        {/* User Authentication App */}
        <Route path="/auth" element={<UserAuthApp />} />

        <Route path="/logout" element={<Logout />} />
        
        {/* Admin Dashboard with sub-routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* HR Dashboard with sub-routes */}
        <Route
          path="/hr/*"
          element={
            <ProtectedRoute allowedRoles={["hr_officer"]}>
              <HRDashboard />
            </ProtectedRoute>
          }
        />

        {/* Employee Dashboard with sub-routes */}
        <Route
          path="/employee/*"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        {/* Agent Dashboard with sub-routes */}
        <Route
          path="/agent/*"
          element={
            <ProtectedRoute allowedRoles={["insurance_agent"]}>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};