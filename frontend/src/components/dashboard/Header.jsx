import { useLocation } from "react-router-dom";
import { Bell, User, Sun, Moon, Menu } from "lucide-react";
import { useNotifications } from "../../contexts/NotificationContext";
import NotificationBell from "../common/NotificationBell";

export const Header = ({ onToggleTheme, isDark, isCollapsed, scrolled }) => {
  const location = useLocation();
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
      <div className="flex flex-col gap-2">
        {/* Breadcrumbs (small text) */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
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
        <button className="p-1.5 rounded-full bg-gray-300 dark:bg-gray-600">
          <User className="w-5 h-5 text-gray-700 dark:text-gray-100" />
        </button>
      </div>
    </header>
  );
};
