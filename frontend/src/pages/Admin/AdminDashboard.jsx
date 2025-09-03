import React from 'react';
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

// Dashboard content component
const DashboardContent = ({ activeItem, navigationItems }) => {
  const { isDark } = useTheme();

  // Stats data
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

  const activeItemData = navigationItems.find(item => item.id === activeItem);

  return (
    <div className="space-y-6">
      {/* Theme indicator */}
      <ThemeIndicator />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Card */}
      <ContentCard title={activeItemData?.label || 'Dashboard'}>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          This is the {activeItem} section. The theme toggle is working properly now! 
          Try switching between light and dark modes using the sun/moon button in the top right.
        </p>
        
        {activeItem === 'users' && (
          <div className="mt-4">
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              User Management
            </h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Here you can manage users, view their profiles, and handle user-related tasks.
            </p>
          </div>
        )}

        {activeItem === 'analytics' && (
          <div className="mt-4">
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Analytics Overview
            </h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              View detailed analytics and insights about your application performance.
            </p>
          </div>
        )}

        {activeItem === 'reports' && (
          <div className="mt-4">
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Reports Dashboard
            </h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Generate and view various reports for your business insights.
            </p>
          </div>
        )}

        {activeItem === 'settings' && (
          <div className="mt-4">
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Application Settings
            </h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Configure your application settings and preferences here.
            </p>
          </div>
        )}
      </ContentCard>
    </div>
  );
};

const AdminDashboard = () => {
  // Navigation configuration
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'Users', icon: Users, badge: '12' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

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
      title="Admin Dashboard"
      user={user}
      navigationItems={navigationItems}
      bottomContent={<AdminBottomContent />}
      notifications={3}
      onNotificationClick={handleNotificationClick}
      defaultActiveItem="dashboard"
    >
      {({ activeItem, navigationItems }) => (
        <DashboardContent 
          activeItem={activeItem} 
          navigationItems={navigationItems} 
        />
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;