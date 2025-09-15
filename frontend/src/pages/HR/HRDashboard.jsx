
import { Outlet, NavLink } from "react-router-dom";
import { SideBar } from '../../components/dashboard/SideBar';
import { Header } from '../../components/dashboard/Header';
import { useState } from "react";


import {
   SquareKanban,
   MessageCircle,
   UsersRound,
   MountainSnow,
   UserRoundCheck,
   Files
} from "lucide-react";

export const HRDashboard = () => {
  
const hrLinks = [
  { path: "overview", label: "Overview", icon: SquareKanban },
  { path: "messaging", label: "Messaging", icon: MessageCircle },
  { path: "reg", label: "Registration", icon: UsersRound },
  { path: "claims", label: "Claim Review", icon: MountainSnow },
  { path: "policies", label: "Policy Users", icon: UserRoundCheck },
  { path: "document", label: "Document Pool", icon: Files },
];

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
  <div className="hr-dashboard flex bg-neutral-300 dark:bg-neutral-800 h-screen">

    {/* Sidebar */}
    <SideBar links={hrLinks} toggleSidebar={toggleSidebar} isCollapsed={isCollapsed}/> 

    {/* Main Content */}
    <div className="flex-1 flex flex-col ">

      {/* Common Header */}
      <Header onToggleTheme={toggleTheme} isDark={isDark} isCollapsed={isCollapsed} scrolled={scrolled}/>

      {/* Scrollable Content */}
      <main
      className={`flex-1 overflow-y-auto pt-25 transition-all duration-300 pr-4
         ${ isCollapsed ? "ml-32" : "ml-75"}`}
         onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 10)}>
        <Outlet />
      </main>

    </div>
  </div>
  )
}
