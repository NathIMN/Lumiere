import { NavLink } from "react-router-dom";
import { LayoutDashboard, Menu, LogOut } from "lucide-react";

export const SideBar = ({ links, toggleSidebar, isCollapsed, color }) => {
   return (
      <aside
         style={{ borderColor: color}}
         className={`
            fixed top-4 left-4 bottom-4 
            h-[calc(100vh-2rem)] 
            bg-white dark:bg-neutral-900
            border-2
            text-[#002B5C] dark:text-gray-100 shadow-xl dark:shadow-black/20
            transition-[width] duration-700 ease-in-out z-50 flex flex-col
            rounded-xl
            ${isCollapsed ? "w-20" : "w-64"}
         `}
      >

         {/* Header */}
         <div className="px-4 py-5 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between">
            {!isCollapsed && (
               <img
                  src="/lum2.png"
                  alt="Lumiere Logo"
                  className="h-18 w-auto"
               />
            )}

            {/* Collapse toggle button */}
            <button
               onClick={toggleSidebar}
               className="p-1 rounded-lg hover:bg-white dark:hover:bg-neutral-800 transition-colors"
            >
               <Menu
                  className={`w-8 h-8 text-[#002B5C] hover:text-black dark:text-gray-400 transform transition-transform duration-300 ${
                     isCollapsed ? "rotate-90" : "rotate-0"
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
                           className={({ isActive }) => {
                              const activeStyles = isActive
                                 ? "p-4 text-white dark:text-white shadow-sm dark:shadow-black/10"
                                 : " dark:text-gray400 hover:bg-[#1E88E530] dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-gray-200";

                              return `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${activeStyles}`;
                           }}
                           style={({ isActive }) => ({
                              backgroundColor: isActive ? color + "" : undefined,
                              borderColor: isActive ? color : undefined,
                           })}
                        >
                           <IconComponent
                              className={`w-5 h-5 flex-shrink-0 transition-all duration-500 ${
                                 isCollapsed ? "mx-auto" : "mr-3 ml-1"
                              }`}
                           />

                           {/* Animated label */}
                           <span
                              className={`font-semibold uppercase whitespace-nowrap transition-all duration-500 overflow-hidden ${
                                 isCollapsed
                                    ? "opacity-0 translate-x-[-20px] w-0"
                                    : "opacity-100 translate-x-0 w-auto ml-2"
                              }`}
                           >
                              {link.label}
                           </span>

                           {/* Tooltip for collapsed state */}
                           {isCollapsed && (
                              <div className="absolute left-20 bg-gray-800 dark:bg-neutral-700 text-white dark:text-gray-200 px-2 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 shadow-lg dark:shadow-black/30">
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
            <div className="p-4 border-t border-gray-200 dark:border-neutral-700">
               <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Powered by <span className="font-semibold text-[#0A2342] dark:text-gray-300">Lumiere.inc</span>
               </p>
            </div>
         )}

      </aside>
   );
};