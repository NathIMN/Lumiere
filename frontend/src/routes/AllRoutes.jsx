import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import UserAuthApp from "../pages/Common/UserAuthApp";
import { Navigate } from "react-router-dom";

import { LumiereLanding } from "../pages/LandingPage/LumiereLanding";


import {
  AdminDashboard,
  AdminOverview,
  AdminPolicies,
  AdminHrOfficers,
  AdminInsuranceAgents,
} from "../pages/Admin";

import { 
  HRDashboard, 
  HROverview, 
  Registration, 
  HRMessaging, 
  HRPolicyUser,
  HRClaimReview,
  HRDocumentPool} from "../pages/HR";

import { AgentDashboard } from "../pages/Agent/AgentDashboard";

import {
  EmployeeDashboard,
  EmployeeOverview,
  EmployeeClaims,
} from "../pages/Employee";


const Logout = () => {
  const { logout } = useAuth();
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    logout();
    setDone(true);
  }, [logout]);

  if (done) {
    return <Navigate to="/auth" replace />;
  }

  return null;
};

export const AllRoutes = () => {
  const { user } = useAuth();

  return (
    <Router>
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

          <Route path="overview" element={<AdminOverview />} />
          <Route path="manage-policies" element={<AdminPolicies />} />
          <Route path="hr-officers" element={<AdminHrOfficers />} />
          <Route
            path="insurance-agents"
            element={<AdminInsuranceAgents />}
          />
          <Route path="messaging" element={<div>messaging</div>} />
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

          <Route path="overview" element={<HROverview />} />
          <Route path="reg" element={<Registration/>} />
          <Route path="messaging" element={<HRMessaging/>} />
          <Route path="policies" element={<HRPolicyUser/>} />
          <Route path="claims" element={<HRClaimReview/>} />
          <Route path="document" element={<HRDocumentPool/>} />
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
              <AgentDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<div>Agent Overview</div>} />
          <Route path="clients" element={<div>Manage Clients</div>} />
          <Route path="reports" element={<div>Agent Reports</div>} />
        </Route>

      </Routes>
    </Router>
  );
};
