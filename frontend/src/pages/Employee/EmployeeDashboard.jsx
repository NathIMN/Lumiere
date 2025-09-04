import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Settings, BarChart3, FileText, LogOut, HelpCircle } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import StatCard from '../../components/dashboard/ui/StatCard';
import ContentCard from '../../components/dashboard/ui/ContentCard';
import ThemeIndicator from '../../components/dashboard/ui/ThemeIndicator';
import SidebarItem from '../../components/dashboard/layout/SidebarItem';
import { useSidebar } from '../../components/dashboard/hooks/useSidebar';
import { useTheme } from '../../components/dashboard/hooks/useTheme';
import { getThemeClasses } from '../../components/dashboard/utils/themeUtils';


// Bottom content component for admin-specific items
const EmployeeBottomContent = () => {
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

// Dashboard content components for different routes
const DashboardOverview = () => {
  const { isDark } = useTheme();

  const statsData = [
    {
      title: 'Total Users',
      value: '1,234',
      icon: Users,
      iconColor: 'blue',
      trend: '+12% from last month',
      trendColor: 'green'
    },
    {
      title: 'Revenue',
      value: '$45,678',
      icon: BarChart3,
      iconColor: 'green',
      trend: '+8% from last month',
      trendColor: 'green'
    },
    {
      title: 'Orders',
      value: '890',
      icon: FileText,
      iconColor: 'purple',
      trend: '+23% from last month',
      trendColor: 'green'
    },
    {
      title: 'Growth',
      value: '+23%',
      icon: BarChart3,
      iconColor: 'orange',
      trend: 'Steady growth',
      trendColor: 'green'
    }
  ];

  return (
    <div className="space-y-6">
      <ThemeIndicator />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <ContentCard title="Dashboard Overview">
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Welcome to the admin dashboard. Here you can monitor your application's performance and manage various aspects of your system.
        </p>
      </ContentCard>
    </div>
  );
};

// Custom DashboardLayout wrapper that handles navigation
const EmployeeDashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get current active item from URL
  const getCurrentActiveItem = () => {
    const path = location.pathname;
    if (path === '/employee' || path === '/employee/') return 'dashboard';
    const segments = path.split('/');
    return segments[2] || 'dashboard';
  };

  const activeItem = getCurrentActiveItem();

  // Navigation configuration with proper URLs
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/employee' },
    { id: 'claims', label: 'Claims', icon: Users, badge: '12', path: '/employee/claims' },
    { id: 'policy', label: 'Policy', icon: BarChart3, path: '/employee/policy' },
    { id: 'message', label: 'Message', icon: FileText, path: '/employee/message' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/employee/settings' },
  ];

  // Handle navigation
  const handleItemClick = (itemId) => {
    const item = navigationItems.find(nav => nav.id === itemId);
    if (item) {
      navigate(item.path);
    }
  };

  // User configuration
  const user = {
    name: 'John Doe',
    avatar: null
  };

  const handleNotificationClick = () => {
    console.log('Notifications clicked');
  };

  return (
    <DashboardLayout
      title="Employee Dashboard"
      user={user}
      navigationItems={navigationItems.map(item => ({
        ...item,
        isActive: activeItem === item.id
      }))}
      bottomContent={<EmployeeBottomContent />}
      notifications={3}
      onNotificationClick={handleNotificationClick}
      activeItem={activeItem}
      onItemClick={handleItemClick}
    >
      {children}
    </DashboardLayout>
  );
};

export const EmployeeDashboard = () => {
  return (
    <EmployeeDashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/profile" element={<EmployeeProfile />} />
        <Route path="/claims" element={<Claims />} />
        <Route path="/policy" element={<Analytics />} />
        <Route path="/message" element={<Reports />} />
        <Route path="/settings" element={<AdminSettings />} />
      </Routes>
    </EmployeeDashboardLayout>
  )
}
