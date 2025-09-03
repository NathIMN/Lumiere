import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/garbage/LandingPage';
import { LumiereLanding } from './pages/LandingPage/LumiereLanding';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
// Import these when you create them
// import { HRDashboard } from './pages/HR/HRDashboard';
// import { AgentDashboard } from './pages/Agent/AgentDashboard';

const getUser = () => {
  // null → logged out
  // or return { role: "Employee" | "HR" | "Admin" | "Agent" }
  return JSON.parse(localStorage.getItem("Employee")) || null;
};

function App() {
  const user = getUser();

  const getDashboard = () => {
    switch (user?.role) {
      case "Employee":
        return <EmployeeDashboard />;
      case "HR":
        // return <HRDashboard />;
        return <div>HR Dashboard - Coming Soon</div>;
      case "Admin":
        return <AdminDashboard />;
      case "Agent":
        // return <AgentDashboard />;
        return <div>Agent Dashboard - Coming Soon</div>;
      default:
        return <Navigate to="/" />;
    }
  };

  return (
    <Router>
      <Routes>
        {/* Landing page route */}
        <Route path="/" element={<LumiereLanding />} />
        
        {/* Dashboard route - shows appropriate dashboard based on user role */}
        <Route path="/dashboard" element={getDashboard()} />
        
        {/* Direct routes for testing (remove in production) */}
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;