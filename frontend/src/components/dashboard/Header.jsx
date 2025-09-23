import { useLocation } from "react-router-dom";
import { Bell, User, Sun, Moon, Menu } from "lucide-react";

export const Header = ({ onToggleTheme, isDark, isCollapsed, scrolled, onToggleSidebar }) => {
  const location = useLocation();
  const activeTab = location.pathname.split("/").pop() || "Dashboard";

  const getPageTitle = () => {
    switch(activeTab) {
      case 'overview': return 'Agent Portal';
      case 'claims-review': return 'Claims Review';
      case 'questionnaires': return 'Questionnaires';
      default: return activeTab;
    }
  };

  return (
    <header className="w-full px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Page Title + Mobile Menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {getPageTitle()}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {activeTab === 'overview' && 'Overview & Analytics'}
              {activeTab === 'claims-review' && 'Review & Process Claims'}
              {activeTab === 'questionnaires' && 'Complete Forms'}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile */}
          <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
              Agent
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
