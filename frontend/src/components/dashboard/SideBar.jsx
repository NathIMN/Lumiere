import { NavLink } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SideBar = ({ links, toggleSidebar, isCollapsed }) => {
  const { logout } = useAuth();

  return (
    <div className="h-full bg-gray-700 flex flex-col">
      {/* Header with Logo and Menu Button */}
      <div className="p-6 bg-gray-600 rounded-t-2xl">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-2xl font-bold">
              <span className="text-orange-400">Lum</span>
              <span className="text-blue-400">iere</span>
            </h1>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-500 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-3">
          {links.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <li key={index}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-4 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                    }`
                  }
                  title={isCollapsed ? link.label : ''}
                >
                  <IconComponent className="w-6 h-6 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-lg">{link.label}</span>
                  )}
                  {!isCollapsed && link.badge && (
                    <span className="ml-auto bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-lg transition-colors shadow-lg"
        >
          <LogOut className="w-6 h-6 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};
