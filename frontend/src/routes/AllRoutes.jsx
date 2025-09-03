import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EmployeeDashboard from '../pages/Employee/EmployeeDashboard';
import LumiereLanding from '../pages/LandingPage/LumiereLanding';

const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LumiereLanding />} />
      <Route path="/employee" element={<EmployeeDashboard />} />
      {/* Add other routes as needed */}
    </Routes>
  );
};

export default AllRoutes;