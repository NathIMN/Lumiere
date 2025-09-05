import { NavLink } from "react-router-dom";
import { useState } from "react";

import {
   LayoutDashboard,
   Table,
   CreditCard,
   RotateCcw,
   Bell,
   User,
   LogIn,
   UserPlus,
   ChevronLeft,
   ChevronRight,
   Menu,
   LogOut
} from "lucide-react";

const getIconForPath = (path) => {
   const iconMap = {
      'dashboard': LayoutDashboard,
      'overview': Table,
      'claims': CreditCard,
      'reports': RotateCcw,
      'users': Bell,
      'profile': User,
      'signup': UserPlus,
   };
   return iconMap[path] || LayoutDashboard;
};

export const SideBar = ({ links , toggleSidebar, isCollapsed}) => {


   return (
  <aside
    className={`
      fixed top-4 left-4 bottom-4 
      h-[calc(100vh-2rem)] 
      bg-gradient-to-b from-neutral-800 to-neutral-900
      dark:from-neutral-600 dark:to-neutral-700
      text-white shadow-xl 
      transition-[width] duration-700 ease-in-out z-50 flex flex-col 
      rounded-2xl
      ${isCollapsed ? "w-18" : "w-64"}
    `}
  >
{/* Header */}
<div className="px-4 py-3 border-b border-gray-500 flex items-center justify-between">
  {!isCollapsed && (
    <img
      src="/lumierenew.png"
      alt="Lumiere Logo"
      className="h-10 w-auto"
    />
  )}

  {/* Collapse toggle button */}
  <button
    onClick={toggleSidebar}
    className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
  >
    <Menu
      className={`w-8 h-8 transform transition-transform duration-300 ${
        isCollapsed ? 'rotate-90' : 'rotate-0'
      }`}
    />
  </button>
</div>


         {/* Navigation */}
         <nav className="flex-1 p-4">
            <ul className="space-y-2">
               {links.map((link) => {
                  const IconComponent = getIconForPath(link.path);

                  return (
                     <li key={link.path}>
                        <NavLink
                           to={link.path}
                           className={({ isActive }) =>
                              `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                 ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                                 : 'text-gray-200 hover:bg-gray-600 hover:text-white'
                              }`
                           }
                        >
                           <IconComponent
                              className={`w-5 h-5 flex-shrink-0 transition-all duration-500 ${isCollapsed ? 'mx-auto' : 'mr-3'
                                 }`}
                           />

                           {/* Always render the label, but animate it */}
                           <span
                              className={`font-medium whitespace-nowrap transition-all duration-500 overflow-hidden ${isCollapsed
                                 ? 'opacity-0 translate-x-[-20px] w-0'
                                 : 'opacity-100 translate-x-0 w-auto ml-2'
                                 }`}
                           >
                              {link.label}
                           </span>
                           {/* Tooltip (same as before) */}
                           {isCollapsed && (
                              <div className="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                 {link.label}
                              </div>
                           )}
                        </NavLink>
                     </li>
                  );
               })}
            </ul>
         </nav>

         {/* Upgrade to Pro button (optional) */}
         {!isCollapsed && (
            <div className="p-4 border-t border-gray-700">
               <button className="w-full bg-rose-500 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors duration-200">
                  Logout
               </button>
            </div>
         )}

         {/* Collapsed state upgrade button */}
         {isCollapsed && (
            <div className="p-4 border-t border-gray-700">
               <button className="w-full bg-rose-500 hover:from-blue-600 hover:to-blue-700 text-white p-2.5 rounded-xl transition-all duration-200 group relative shadow-lg shadow-blue-500/25">
                  <LogOut className="w-5 h-6 mx-auto" />
                  <div className="absolute left-16 bg-gray-900/95 backdrop-blur-sm text-white px-3 py-2.5 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-10 shadow-xl border border-gray-700/50">
                     Logout
                  </div>
               </button>
            </div>
         )}
      </aside>
   );
};