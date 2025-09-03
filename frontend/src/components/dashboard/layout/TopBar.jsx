import React from 'react';
import { Menu, Bell, Sun, Moon } from 'lucide-react';
import { useSidebar } from '../hooks/useSidebar';
import { useTheme } from '../hooks/useTheme';
import { getThemeClasses } from '../utils/themeUtils';

const TopBar = ({ 
  title = 'Dashboard', 
  user = { name: 'User', avatar: null },
  notifications = 0,
  onNotificationClick
}) => {
  const { toggleSidebar } = useSidebar();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header 
      className={`border-b px-4 py-3 flex items-center justify-between ${
        getThemeClasses(isDark, 'bg-white border-gray-200', 'bg-gray-800 border-gray-700')
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-lg transition-colors ${
            getThemeClasses(isDark, 'hover:bg-gray-100', 'hover:bg-gray-700')
          }`}
        >
          <Menu 
            size={20} 
            className={getThemeClasses(isDark, 'text-gray-600', 'text-gray-400')} 
          />
        </button>
        <h1 className={`text-xl font-semibold ${
          getThemeClasses(isDark, 'text-gray-900', 'text-white')
        }`}>
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors ${
            getThemeClasses(isDark, 'hover:bg-gray-100', 'hover:bg-gray-700')
          }`}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
        >
          {isDark ? (
            <Sun size={20} className="text-yellow-500" />
          ) : (
            <Moon size={20} className="text-gray-600" />
          )}
        </button>

        {/* Notifications */}
        <button 
          onClick={onNotificationClick}
          className={`p-2 rounded-lg transition-colors relative ${
            getThemeClasses(isDark, 'hover:bg-gray-100', 'hover:bg-gray-700')
          }`}
        >
          <Bell 
            size={20} 
            className={getThemeClasses(isDark, 'text-gray-600', 'text-gray-400')} 
          />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notifications > 99 ? '99+' : notifications}
            </span>
          )}
        </button>

        {/* User Profile */}
        <div className={`flex items-center gap-2 p-1 rounded-lg transition-colors cursor-pointer ${
          getThemeClasses(isDark, 'hover:bg-gray-100', 'hover:bg-gray-700')
        }`}>
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
            {user.avatar || user.name.charAt(0).toUpperCase()}
          </div>
          <span className={`text-sm font-medium hidden sm:block ${
            getThemeClasses(isDark, 'text-gray-700', 'text-gray-300')
          }`}>
            {user.name}
          </span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;