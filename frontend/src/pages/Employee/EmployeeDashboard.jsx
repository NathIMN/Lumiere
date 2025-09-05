import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Settings, BarChart3, FileText, LogOut, HelpCircle } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import StatCard from '../../components/dashboard/ui/StatCard';
import ContentCard from '../../components/dashboard/ui/ContentCard';
import ThemeIndicator from '../../components/dashboard/ui/ThemeIndicator';
import SidebarItem from '../../components/dashboard/layout/SidebarItem';
import { useSidebar } from '../../components/dashboard/hooks/useSidebar';
import { useTheme } from '../../components/dashboard/hooks/useTheme';
import { getThemeClasses } from '../../components/dashboard/utils/themeUtils';

import { Outlet, NavLink } from "react-router-dom";
import { SideBar } from '../../components/dashboardX/SideBar';
import { Header } from '../../components/dashboardX/Header';
import { useState } from "react";
export const EmployeeDashboard = () => {
  
    const adminLinks = [
    { path: "overview", label: "Overview" },
    { path: "users", label: "Manage Users" },
    { path: "reports", label: "Reports" },
  ];

    const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark", !isDark);
  };

  return (
  <div className="employee-dashboard flex bg-neutral-200 dark:bg-neutral-800 h-screen">
    {/* Sidebar */}
    <SideBar links={adminLinks} className="w-64 shrink-0" /> 
    {/* use w-64 or dynamic width for expanded state, w-20 for collapsed */}

    {/* Main Content */}
    <div className="flex-1 flex flex-col">
      {/* Common Header */}
      <Header onToggleTheme={toggleTheme} isDark={isDark} />

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto ">
        <Outlet />
      </main>
    </div>
  </div>
  )
}
