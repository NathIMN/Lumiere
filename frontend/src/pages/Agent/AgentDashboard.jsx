import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, FileText, HelpCircle, ClipboardCheck, CheckCircle, TrendingUp } from 'lucide-react';
import { Header } from '../../components/dashboard/Header';
import { SideBar } from '../../components/dashboard/SideBar';

export const AgentDashboard = () => {
  const agentLinks = [
    { path: '/agent/overview', label: 'Agent Portal', icon: LayoutDashboard },
    { path: '/agent/claims-review', label: 'Claims Review', icon: FileText },
    { path: '/agent/questionnaires', label: 'Questionnaires', icon: HelpCircle },
  ];

 const color = "#ff7a66";

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
      <div className="employee-dashboard flex bg-white dark:bg-neutral-800 h-screen">

         {/* Sidebar */}
         <SideBar links={agentLinks} toggleSidebar={toggleSidebar} isCollapsed={isCollapsed} color={color}/>

         {/* Main Content */}
         <div className="flex-1 flex flex-col ">

            {/* Common Header */}
            <Header onToggleTheme={toggleTheme} isDark={isDark} isCollapsed={isCollapsed} scrolled={scrolled} />

            {/* Scrollable Content */}
            <main
               className={`flex-1 overflow-y-auto pt-25 transition-all duration-300 pr-4
         ${isCollapsed ? "ml-32" : "ml-75"}`}
               onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 10)}>
               <Outlet />
            </main>

         </div>
      </div>
   )
}

