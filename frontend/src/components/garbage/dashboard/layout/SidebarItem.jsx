import React from 'react';
import { useSidebar } from '../hooks/useSidebar';
import { useTheme } from '../hooks/useTheme';
import { getThemeClasses } from '../utils/themeUtils';

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  isActive = false, 
  onClick, 
  badge,
  className = '' 
}) => {
  const { isCollapsed } = useSidebar();
  const { isDark } = useTheme();

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center rounded-lg transition-all duration-200 group relative ${
        isActive 
          ? 'bg-blue-500 text-white hover:bg-blue-600' 
          : `${getThemeClasses(isDark, 'text-gray-700 hover:bg-gray-100', 'text-gray-300 hover:bg-gray-700')}`
      } ${isCollapsed ? 'p-3 justify-center' : 'gap-3 px-3 py-2.5'} ${className}`}
    >
      <Icon 
        size={20} 
        className={`flex-shrink-0 transition-colors ${
          isActive ? 'text-white' : getThemeClasses(isDark, 'text-gray-500', 'text-gray-400')
        }`}
      />
      
      {!isCollapsed && (
        <>
          <span className="font-medium truncate">{label}</span>
          {badge && (
            <span className="ml-auto bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </>
      )}

      {isCollapsed && (
        <div className={`absolute left-full ml-2 px-2 py-1 text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 ${
          getThemeClasses(isDark, 'bg-gray-900 text-white', 'bg-gray-100 text-gray-900')
        }`}>
          {label}
          {badge && (
            <span className="ml-2 bg-purple-500 text-white px-1.5 py-0.5 rounded text-xs">
              {badge}
            </span>
          )}
        </div>
      )}
    </button>
  );
};

export default SidebarItem;