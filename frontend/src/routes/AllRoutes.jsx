import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import { LumiereLanding } from "../pages/LandingPage/LumiereLanding";
import { AdminDashboard } from "../pages/Admin/AdminDashboard";
import { HRDashboard } from "../pages/hr/HRDashboard";
import { EmployeeDashboard } from "../pages/Employee/EmployeeDashboard";
import { AgentDashboard } from "../pages/Agent/AgentDashboard";


export const AllRoutes = ({ user }) => {
       return (
              <Router>
                     <Routes>
                            <Route path="/" element={<LumiereLanding />} />
                            {/* Public Pages 
                            
                            <Route path="/login" element={<Login />} />
                            <Route path="/unauthorized" element={<Unauthorized />} />
                            */}

                            {/* Role-Specific Dashboards */}
                            <Route
                                   path="/admin"
                                   element={
                                          <ProtectedRoute user={user} allowedRoles={["admin"]}>
                                                 <AdminDashboard />
                                          </ProtectedRoute>
                                   }
                            />

                            <Route
                                   path="/hr"
                                   element={
                                          <ProtectedRoute user={user} allowedRoles={["hr"]}>
                                                 <HRDashboard />
                                          </ProtectedRoute>
                                   }
                            />

                            <Route
                                   path="/employee"
                                   element={
                                          <ProtectedRoute user={user} allowedRoles={["employee"]}>
                                                 <EmployeeDashboard />
                                          </ProtectedRoute>
                                   }
                            />

                            <Route
                                   path="/agent"
                                   element={
                                          <ProtectedRoute user={user} allowedRoles={["agent"]}>
                                                 <AgentDashboard />
                                          </ProtectedRoute>
                                   }
                            />
                     </Routes>
              </Router>
       )
}
