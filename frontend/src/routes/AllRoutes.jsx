import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import UserAuthApp from "../pages/Common/UserAuthApp";
import { Navigate } from "react-router-dom";

import { LumiereLanding } from "../pages/LandingPage/LumiereLanding";

import { AdminDashboard } from "../pages/Admin/AdminDashboard";
import { HRDashboard } from "../pages/HR/HRDashboard";
import { AgentDashboard } from "../pages/Agent/AgentDashboard";
import AgentOverview from "../pages/Agent/AgentOverview";
import ClaimsReview from "../pages/Agent/ClaimsReview";
import Questionnaires from "../pages/Agent/Questionnaires";

import { EmployeeDashboard, EmployeeOverview, EmployeeClaims } from "../pages/Employee";

const Logout = () => {
  const { logout } = useAuth();
  
  useEffect(() => {
    logout();
  }, [logout]);
  
  return <Navigate to="/" replace />;
};

export const AllRoutes = ({ 
  isDark, 
  isCollapsed, 
  scrolled, 
  onToggleTheme, 
  onToggleSidebar 
}) => {
  const { user } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
        <Routes>
          <Route path="/" element={<LumiereLanding />} />
          <Route path="/auth" element={<UserAuthApp />} />
          <Route path="/logout" element={<Logout />} />
          
          {/* ================== ADMIN DASHBOARD ================== */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<div>Admin Overview</div>} />
            <Route path="users" element={<div>Manage Users</div>} />
            <Route path="reports" element={<div>Admin Reports</div>} />
          </Route>

          {/* ================== HR DASHBOARD ================== */}
          <Route
            path="/hr"
            element={
              <ProtectedRoute allowedRoles={["hr_officer"]}>
                <HRDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<div>HR Overview</div>} />
            <Route path="employees" element={<div>Manage Employees</div>} />
            <Route path="reports" element={<div>HR Reports</div>} />
          </Route>

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
            <Route path="overview" element={<EmployeeOverview />} />
            <Route path="claims" element={<EmployeeClaims />} />
            <Route path="policies" element={<div>My Profile</div>} />
          </Route>

          {/* ================== AGENT DASHBOARD ================== */}
          <Route 
            path="/agent" 
            element={
              <ProtectedRoute allowedRoles={["insurance_agent"]}>
                <AgentDashboard 
                  isDark={isDark}
                  isCollapsed={isCollapsed}
                  scrolled={scrolled}
                  onToggleTheme={onToggleTheme}
                  onToggleSidebar={onToggleSidebar}
                />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<AgentOverview />} />
            <Route path="claims-review" element={<ClaimsReview />} />
            <Route path="questionnaires" element={<Questionnaires />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};
