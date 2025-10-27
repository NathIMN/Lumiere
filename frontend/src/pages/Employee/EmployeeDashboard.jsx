
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { SideBar } from '../../components/dashboard/SideBar';
import { Header } from '../../components/dashboard/Header';
import FloatingVoiceAssistant from '../../components/FloatingVoiceAssistant';
import { useState } from "react";

import {
   SquareKanban,
   Trophy,
   LifeBuoy,
   MessageSquareMore
} from "lucide-react";


export const EmployeeDashboard = () => {
   const location = useLocation();

   const employeeLinks = [
      { path: "overview", label: "Overview", icon: SquareKanban },
      { path: "claims", label: "Claims", icon: Trophy },
      { path: "policies", label: "Policies", icon: LifeBuoy },
      { path: "messaging", label: "Messaging", icon: MessageSquareMore },
   ];

   const color = "#1E88E5";

   const [isDark, setIsDark] = useState(false);
   const [isCollapsed, setIsCollapsed] = useState(false);
   const [scrolled, setScrolled] = useState(false);

   // Define pages where voice assistant should be hidden
   const hideVoiceAssistantPaths = ['/employee/messaging', '/employee/claims/form'];
   const shouldShowVoiceAssistant = !hideVoiceAssistantPaths.includes(location.pathname);

   const toggleSidebar = () => {
      setIsCollapsed(!isCollapsed);
   };

   const toggleTheme = () => {
      setIsDark(!isDark);
      document.documentElement.classList.toggle("dark", !isDark);
   };



   return (
      <div className="employee-dashboard flex bg-gray-50 dark:bg-neutral-800 h-screen">

         {/* Sidebar */}
         <SideBar links={employeeLinks} toggleSidebar={toggleSidebar} isCollapsed={isCollapsed} color={color}/>

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
         
         {/* Floating Voice Assistant - Hidden on certain pages */}
         {shouldShowVoiceAssistant && <FloatingVoiceAssistant />}
      </div>
   )
}

