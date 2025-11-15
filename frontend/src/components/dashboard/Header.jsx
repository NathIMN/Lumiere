import { useLocation } from "react-router-dom";
import { Bell, User, Sun, Moon, Menu, LogOut, ChevronDown } from "lucide-react";
import { useNotifications } from "../../contexts/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../common/NotificationBell";
import { useState, useRef, useEffect } from "react";

export const Header = ({ onToggleTheme, isDark, isCollapsed, scrolled }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
  };

  // Get path parts
  const parts = location.pathname
    .split("/")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1));

  const breadcrumbs = parts.join(" > ");
  const lastPart = parts[parts.length - 1] || "Dashboard";

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
      {/* Left: breadcrumbs + big title */}
      <div className="flex flex-col gap-1">
        {/* Breadcrumbs (small text) */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {breadcrumbs || "Dashboard"}
        </p>

        {/* Big title (last part of URL) */}
        <h2 className="text-2xl font-bold capitalize text-gray-800 dark:text-gray-100">
          {lastPart}
        </h2>
      </div>

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
        <NotificationBell
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDeleteNotification={deleteNotification}
          onLoadMore={loadMore}
          hasMore={hasMore}
          loading={loading}
        />

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 p-1.5 rounded-full bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            <User className="w-5 h-5 text-gray-700 dark:text-gray-100" />
            {/* <ChevronDown className={`w-4 h-4 text-gray-700 dark:text-gray-100 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} /> */}
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.profile.firstName} {user?.profile.lastName}
                </p>
                {/* <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p> */}
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>

              {/* Logout Option */}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
