import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, User, Sun, Moon } from "lucide-react";

export const Header = ({ onToggleTheme, isDark }) => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for backdrop effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get current active tab name from path
  const activeTab = location.pathname.split("/").pop() || "Dashboard";

  return (
    <header
      className={`
        sticky top-0 right-0 left-auto
        h-16 flex items-center justify-between px-6 z-40
        transition-all duration-300
        border border-indigo-600 bg-transparent
        transition-all duration-300 ease-in-out
        ${scrolled
            ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50'
            : 'bg-transparent'}
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
