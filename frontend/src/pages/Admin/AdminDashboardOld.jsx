import React, { createContext, useContext, useState } from 'react';
import { Home, Users, Settings, BarChart3, FileText, LogOut, HelpCircle, Menu, Bell, Sun, Moon } from 'lucide-react';

// Theme Context
const ThemeContext = createContext();

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Sidebar Context
const SidebarContext = createContext();

const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Theme-aware styling helper
const getThemeClasses = (isDark, lightClasses, darkClasses) => {
  return isDark ? darkClasses : lightClasses;
};

// TopBar Component
const TopBar = ({ title = 'Dashboard', user = { name: 'User', avatar: null } }) => {
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

        <button className={`p-2 rounded-lg transition-colors relative ${
          getThemeClasses(isDark, 'hover:bg-gray-100', 'hover:bg-gray-700')
        }`}>
          <Bell 
            size={20} 
            className={getThemeClasses(isDark, 'text-gray-600', 'text-gray-400')} 
          />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            3
          </span>
        </button>

        <div className={`flex items-center gap-2 p-1 rounded-lg transition-colors cursor-pointer ${
          getThemeClasses(isDark, 'hover:bg-gray-100', 'hover:bg-gray-700')
        }`}>
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
            {user.name.charAt(0).toUpperCase()}
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

// Sidebar Component
const Sidebar = ({ children, bottomContent }) => {
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
            <span className="text-white font-bold text-sm">D</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className={`font-bold text-xl ${
              getThemeClasses(isDark, 'text-gray-900', 'text-white')
            }`}>
              Dashboard
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {children}
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

// SidebarItem Component
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

// DashboardLayout Component
const DashboardLayout = ({ children, sidebarItems, bottomContent, title, user }) => {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <MainLayout>
          <Sidebar bottomContent={bottomContent}>
            {sidebarItems}
          </Sidebar>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar title={title} user={user} />
            
            <main className="flex-1 overflow-auto p-6">
              {children}
            </main>
          </div>
        </MainLayout>
      </SidebarProvider>
    </ThemeProvider>
  );
};

// Main Layout wrapper
const MainLayout = ({ children }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`h-screen flex ${
      getThemeClasses(isDark, 'bg-gray-50', 'bg-gray-900')
    }`}>
      {children}
    </div>
  );
};

// AdminBottomContent Component
const AdminBottomContent = () => {
  const { isCollapsed } = useSidebar();
  const { isDark } = useTheme();

  return (
    <div className="space-y-2">
      <SidebarItem
        icon={HelpCircle}
        label="Help & Support"
        onClick={() => console.log('Help clicked')}
      />
      <SidebarItem
        icon={LogOut}
        label="Logout"
        onClick={() => console.log('Logout clicked')}
        className={getThemeClasses(isDark, 'text-red-600 hover:bg-red-50', 'text-red-400 hover:bg-red-900')}
      />
      
      {!isCollapsed && (
        <div className={`mt-4 p-3 rounded-lg ${
          getThemeClasses(isDark, 'bg-gray-50', 'bg-gray-700')
        }`}>
          <p className={`text-xs ${
            getThemeClasses(isDark, 'text-gray-600', 'text-gray-400')
          }`}>
            Admin Panel v2.1.0
          </p>
        </div>
      )}
    </div>
  );
};

// Main AdminDashboard Component
const AdminDashboard = () => {
  const [activeItem, setActiveItem] = useState('dashboard');

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'Users', icon: Users, badge: '12' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'fgetgrerg', label: 'thergerg', icon: Settings },
  ];

  const sidebarItems = navigationItems.map((item) => (
    <SidebarItem
      key={item.id}
      icon={item.icon}
      label={item.label}
      badge={item.badge}
      isActive={activeItem === item.id}
      onClick={() => setActiveItem(item.id)}
    />
  ));

  const user = {
    name: 'John Dqefwgefw',
    avatar: null
  };

  return (
    <DashboardLayout
      title="Admin Grass"
      user={user}
      sidebarItems={sidebarItems}
      bottomContent={<AdminBottomContent />}
    >
      <DashboardContent activeItem={activeItem} navigationItems={navigationItems} />
    </DashboardLayout>
  );
};

// Dashboard Content Component
const DashboardContent = ({ activeItem, navigationItems }) => {
  const { isDark } = useTheme();

  const cardBgClass = getThemeClasses(isDark, 'bg-white border-gray-200', 'bg-gray-800 border-gray-700');
  const textPrimaryClass = getThemeClasses(isDark, 'text-gray-900', 'text-white');
  const textSecondaryClass = getThemeClasses(isDark, 'text-gray-600', 'text-gray-400');

  return (
    <div className="space-y-6">
      {/* Theme indicator */}
      <div className={`p-4 rounded-lg ${
        getThemeClasses(isDark, 'bg-blue-100 text-blue-800', 'bg-blue-900 text-blue-200')
      }`}>
        <p className="text-sm">
          Current theme: <strong>{isDark ? 'Dark' : 'Light'} Mode</strong>
          {isDark ? ' 🌙' : ' ☀️'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-lg shadow-sm border ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${textSecondaryClass}`}>Total Users</p>
              <p className={`text-2xl font-bold ${textPrimaryClass}`}>1,234</p>
            </div>
            <div className={`p-3 rounded-lg ${
              getThemeClasses(isDark, 'bg-blue-100', 'bg-blue-900')
            }`}>
              <Users className={`${
                getThemeClasses(isDark, 'text-blue-600', 'text-blue-400')
              }`} size={24} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-sm border ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${textSecondaryClass}`}>Revenue</p>
              <p className={`text-2xl font-bold ${textPrimaryClass}`}>$45,678</p>
            </div>
            <div className={`p-3 rounded-lg ${
              getThemeClasses(isDark, 'bg-green-100', 'bg-green-900')
            }`}>
              <BarChart3 className={`${
                getThemeClasses(isDark, 'text-green-600', 'text-green-400')
              }`} size={24} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-sm border ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${textSecondaryClass}`}>Orders</p>
              <p className={`text-2xl font-bold ${textPrimaryClass}`}>890</p>
            </div>
            <div className={`p-3 rounded-lg ${
              getThemeClasses(isDark, 'bg-purple-100', 'bg-purple-900')
            }`}>
              <FileText className={`${
                getThemeClasses(isDark, 'text-purple-600', 'text-purple-400')
              }`} size={24} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-sm border ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${textSecondaryClass}`}>Growth</p>
              <p className={`text-2xl font-bold ${textPrimaryClass}`}>+23%</p>
            </div>
            <div className={`p-3 rounded-lg ${
              getThemeClasses(isDark, 'bg-orange-100', 'bg-orange-900')
            }`}>
              <BarChart3 className={`${
                getThemeClasses(isDark, 'text-orange-600', 'text-orange-400')
              }`} size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-lg shadow-sm border ${cardBgClass}`}>
        <h2 className={`text-xl font-semibold mb-4 ${textPrimaryClass}`}>
          {navigationItems.find(item => item.id === activeItem)?.label || 'Dashboard'}
        </h2>
        <p className={textSecondaryClass}>
          This is the {activeItem} section. The theme toggle is working properly now! 
          Try switching between light and dark modes using the sun/moon button in the top right.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;