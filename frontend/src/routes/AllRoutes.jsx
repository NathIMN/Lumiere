import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import UserAuthApp from "../pages/Common/UserAuthApp";
import { Navigate } from "react-router-dom";

import { LumiereLanding } from "../pages/LandingPage/LumiereLanding";

import AdminDashboard from "../pages/Admin/AdminDashboard";
import { HRDashboard } from "../pages/HR/HRDashboard";
import { AgentDashboard } from "../pages/Agent/AgentDashboard";

import { EmployeeDashboard } from "../pages/Employee/EmployeeDashboard";
import { EmployeeOverview } from "../pages/Employee/EmployeeOverview";
import { EmployeeClaims } from "../pages/Employee/employeeClaims";

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

        {/* ================== EMPLOYEE DASHBOARD ================== */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        >
          
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<EmployeeOverview/>} />
          <Route path="claims" element={<EmployeeClaims/>} />
          <Route path="policies" element={<div>My Profile</div>} />
        </Route>

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