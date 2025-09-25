/* eslint-disable no-unused-vars */
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import UserAuthApp from "../pages/Common/UserAuthApp";
import { Navigate } from "react-router-dom";

import { LumiereLanding } from "../pages/LandingPage/LumiereLanding";
import DebugPage from "../components/DebugPage";

import {
   AdminDashboard,
   AdminOverview,
   AdminPolicies,
   AdminHrOfficers,
   AdminInsuranceAgents,
   AdminReports,
} from "../pages/Admin";

import {
   HRDashboard,
   HROverview,
   Registration,
   HRMessaging,
   HRPolicyUser,
   HRClaimReview,
   DocumentPool
} from "../pages/HR";


import MessagingPage from "../components/messaging/MessagingPage";

import { AgentDashboard } from "../pages/Agent/AgentDashboard";
import AgentOverview from "../pages/Agent/AgentOverview";
import ClaimsReview from "../pages/Agent/ClaimsReview";
import Questionnaires from "../pages/Agent/Questionnaires";

import {
   EmployeeDashboard,
   EmployeeOverview,
   EmployeeClaims,
   EmployeePolicy,
   ClaimsLayout,
   ClaimForm,
   ClaimDetails,
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
            <Route path="/debug" element={<DebugPage />} />



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
               <Route path="reports" element={<AdminReports />} />
               <Route path="messaging" element={<MessagingPage userRole="admin" />} />
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
          <Route path="registration" element={<Registration/>} />
          <Route path="messaging" element={<MessagingPage userRole="hr_officer" />} />
          <Route path="policies" element={<HRPolicyUser/>} />
          <Route path="claims" element={<HRClaimReview/>} />
          <Route path="document" element={<DocumentPool/>} />
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
               <Route path="claims" element={<ClaimsLayout />}>
                  <Route index element={<EmployeeClaims />} />
                  <Route path="form" element={<ClaimForm />} />
                  <Route path=":id" element={<ClaimDetails />} />
               </Route>
               <Route path="policies" element={<EmployeePolicy />} />
               <Route path="messaging" element={<div>Messaging batchtop</div>} />
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
               <Route path="overview" element={<AgentOverview />} />
               <Route path="claims-review" element={<ClaimsReview />} />
               <Route path="questionnaires" element={<Questionnaires />} />
            </Route>

         </Routes>
      </Router>
   );
};
