import { NavLink } from "react-router-dom";
import { LayoutDashboard, Menu, LogOut } from "lucide-react";

export const SideBar = ({ links, toggleSidebar, isCollapsed, color }) => {
   return (
      <aside
         className={`
        fixed top-4 left-4 bottom-4 
        h-[calc(100vh-2rem)] 
        bg-white
        border-2
        border-[${color}]
        text-gray-900 shadow-xl
        transition-[width] duration-700 ease-in-out z-50 flex flex-col
        rounded-xl
        ${isCollapsed ? "w-20" : "w-64"}
      `}
      >
         {/* Header */}
         <div className="px-4 py-5 border-b border-gray-200 flex items-center justify-between">
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
               className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
               <Menu
                  className={`w-8 h-8 text-gray-600 transform transition-transform duration-300 ${isCollapsed ? "rotate-90" : "rotate-0"
                     }`}
               />
            </button>
         </div>

         {/* Navigation */}
         <nav className="flex-1 p-4">
            <ul className="space-y-2">
               {links.map((link) => {
                  const IconComponent = link.icon || LayoutDashboard;

                  return (
                     <li key={link.path}>
                        <NavLink
                           to={link.path}
                           className={({ isActive }) =>
                              `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                 ? `p-4 text-dark shadow-sm bg-[${color}66]`
                                 : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                              }`
                           }
                        >
                           <IconComponent
                              className={`w-5 h-5 flex-shrink-0 transition-all duration-500 ${isCollapsed ? "mx-auto" : "mr-3 ml-1"
                                 }`}
                           />

                           {/* Animated label */}
                           <span
                              className={`font-medium whitespace-nowrap transition-all duration-500 overflow-hidden ${isCollapsed
                                    ? "opacity-0 translate-x-[-20px] w-0"
                                    : "opacity-100 translate-x-0 w-auto ml-2"
                                 }`}
                           >
                              {link.label}
                           </span>

                           {/* Tooltip for collapsed state */}
                           {isCollapsed && (
                              <div className="absolute left-20 bg-gray-800 text-white px-2 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                                 {link.label}
                              </div>
                           )}
                        </NavLink>
                     </li>
                  );
               })}
            </ul>
         </nav>


         {/* Footer Section */}
         {!isCollapsed && (
            <div className="p-4 border-t border-gray-200">
               <p className="text-center text-sm text-gray-500">
                  Powered by <span className="font-semibold text-gray-700">Lumiere.inc</span>
               </p>
            </div>
         )}

      </aside>
   );
};
