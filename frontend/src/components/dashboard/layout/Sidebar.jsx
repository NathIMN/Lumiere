import React from 'react';
import { useSidebar } from '../hooks/useSidebar';
import { useTheme } from '../hooks/useTheme';
import { getThemeClasses } from '../utils/themeUtils';
import SidebarItem from './SidebarItem';

const Sidebar = ({ 
  navigationItems = [], 
  activeItem, 
  onItemClick, 
  bottomContent, 
  logo,
  title = 'Dashboard' 
}) => {
  const { isCollapsed } = useSidebar();
  const { isDark } = useTheme();

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} border-r transition-all duration-300 flex flex-col ${
      getThemeClasses(isDark, 'bg-white border-gray-200', 'bg-gray-800 border-gray-700')
    }`}>
      <div className={`p-4 border-b ${
        getThemeClasses(isDark, 'border-gray-200', 'border-gray-700')
      }`}>
        {isCollapsed ? (
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            {logo || <span className="text-white font-bold text-sm">{title.charAt(0)}</span>}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              {logo || <span className="text-white font-bold text-sm">{title.charAt(0)}</span>}
            </div>
            <span className={`font-bold text-xl ${
              getThemeClasses(isDark, 'text-gray-900', 'text-white')
            }`}>
              {title}
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
            isActive={activeItem === item.id}
            onClick={() => onItemClick?.(item.id)}
          />
        ))}
      </nav>

      {bottomContent && (
        <div className={`p-4 border-t ${
          getThemeClasses(isDark, 'border-gray-200', 'border-gray-700')
        }`}>
          {bottomContent}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;