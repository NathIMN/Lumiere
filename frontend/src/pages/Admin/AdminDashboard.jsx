import { Outlet, NavLink } from "react-router-dom";
import { SideBar } from "../../components/dashboard/SideBar";
import { Header } from "../../components/dashboard/Header";
import { useState } from "react";

import {
  SquareKanban,
  FileText,
  Users,
  ShieldCheck,
  MessageSquare,
  FileBarChart,
  Mic,
} from "lucide-react";

export const AdminDashboard = () => {
  const adminLinks = [
    { path: "overview", label: "Overview", icon: SquareKanban },
    { path: "manage-policies", label: "Manage Policies", icon: FileText },
    { path: "hr-officers", label: "HR Officers", icon: Users },
    {
      path: "insurance-agents",
      label: "Insurance Agents",
      icon: ShieldCheck,
    },
    { path: "messaging", label: "Messaging", icon: MessageSquare },
    { path: "reports", label: "Reports", icon: FileBarChart },
    { path: "vapi-test", label: "Voice Assistant Test", icon: Mic },
  ];

const color = "#800020";

  const [isDark, setIsDark] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark", !isDark);
  };

  return (
    <div className="employee-dashboard flex employee-dashboard flex bg-gray-50 dark:bg-neutral-800 h-screen">
      {/* Sidebar */}
      <SideBar
        links={adminLinks}
        toggleSidebar={toggleSidebar}
        isCollapsed={isCollapsed}
        color={color}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Common Header */}
        <Header
          onToggleTheme={toggleTheme}
          isDark={isDark}
          isCollapsed={isCollapsed}
          scrolled={scrolled}
        />

        {/* Scrollable Content */}
        <main
          className={`flex-1 overflow-y-auto pt-25 transition-all duration-300 pr-4 
         ${isCollapsed ? "ml-32" : "ml-75"}`}
          onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 10)}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
