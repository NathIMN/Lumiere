
import { useLocation } from "react-router-dom";
import { Bell, User, Sun, Moon } from "lucide-react";

export const Header = ({ onToggleTheme, isDark , isCollapsed, scrolled}) => {
  const location = useLocation();


  // Get current active tab name from path
  const activeTab = location.pathname.split("/").pop() || "Dashboard";

  return (
        <header
          className={`
            fixed top-4 right-8
            h-20 flex items-center justify-between px-6 z-40
            rounded-2xl shadow-md 
            transition-all duration-300
            ${scrolled
              ? "backdrop-blur-sm bg-white/70 dark:bg-neutral-900/70 shadow-lg"
              : "bg-transparent shadow-none"}
            ${isCollapsed ? "left-32" : "left-75"}
          `}

        >
      {/* Left: Active tab */}
      <h2 className="text-lg font-semibold capitalize text-gray-800 dark:text-gray-100">
        {activeTab}
      </h2>

      {/* Right: actions */}
      <div className="flex items-center space-x-4">
        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          )}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        {/* Profile */}
        <button className="p-1.5 rounded-full bg-gray-300 dark:bg-gray-600">
          <User className="w-5 h-5 text-gray-700 dark:text-gray-100" />
        </button>
      </div>
    </header>
  );
};
