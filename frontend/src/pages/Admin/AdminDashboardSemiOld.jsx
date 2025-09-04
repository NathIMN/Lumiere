import React from 'react';
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

const UsersManagement = () => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      <ThemeIndicator />
      
      <ContentCard title="User Management">
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Here you can manage users, view their profiles, and handle user-related tasks.
        </p>
        
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold">Total Users</h4>
              <p className="text-2xl font-bold text-blue-600">1,234</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold">Active Users</h4>
              <p className="text-2xl font-bold text-green-600">1,089</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold">New This Month</h4>
              <p className="text-2xl font-bold text-purple-600">145</p>
            </div>
          </div>
        </div>
      </ContentCard>
    </div>
  );
};

const Analytics = () => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      <ThemeIndicator />
      
      <ContentCard title="Analytics Overview">
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          View detailed analytics and insights about your application performance.
        </p>
        
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Page Views</h4>
              <div className="h-32 bg-gradient-to-r from-blue-100 to-blue-200 rounded flex items-center justify-center">
                <span className="text-gray-600">Chart Placeholder</span>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">User Engagement</h4>
              <div className="h-32 bg-gradient-to-r from-green-100 to-green-200 rounded flex items-center justify-center">
                <span className="text-gray-600">Chart Placeholder</span>
              </div>
            </div>
          </div>
        </div>
      </ContentCard>
    </div>
  );
};

const Reports = () => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      <ThemeIndicator />
      
      <ContentCard title="Reports Dashboard">
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Generate and view various reports for your business insights.
        </p>
        
        <div className="mt-6">
          <div className="space-y-4">
            <div className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <h4 className="font-semibold">Monthly Revenue Report</h4>
                <p className="text-sm text-gray-500">Generated on January 1, 2024</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Download
              </button>
            </div>
            <div className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <h4 className="font-semibold">User Activity Report</h4>
                <p className="text-sm text-gray-500">Generated on January 1, 2024</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Download
              </button>
            </div>
          </div>
        </div>
      </ContentCard>
    </div>
  );
};

const AdminSettings = () => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      <ThemeIndicator />
      
      <ContentCard title="Application Settings">
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure your application settings and preferences here.
        </p>
        
        <div className="mt-6">
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold">System Configuration</h4>
              <p className="text-sm text-gray-500 mb-4">Manage system-wide settings</p>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  Enable email notifications
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Enable SMS notifications
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  Auto-backup database
                </label>
              </div>
            </div>
          </div>
        </div>
      </ContentCard>
    </div>
  );
};

// Custom DashboardLayout wrapper that handles navigation
const AdminDashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get current active item from URL
  const getCurrentActiveItem = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') return 'dashboard';
    const segments = path.split('/');
    return segments[2] || 'dashboard';
  };

  const activeItem = getCurrentActiveItem();

  // Navigation configuration with proper URLs
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin' },
    { id: 'users', label: 'Users', icon: Users, badge: '12', path: '/admin/users' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/admin/reports' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
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
      title="Admin Dashboard"
      user={user}
      navigationItems={navigationItems.map(item => ({
        ...item,
        isActive: activeItem === item.id
      }))}
      bottomContent={<AdminBottomContent />}
      notifications={3}
      onNotificationClick={handleNotificationClick}
      activeItem={activeItem}
      onItemClick={handleItemClick}
    >
      {children}
    </DashboardLayout>
  );
};

const AdminDashboard = () => {
  return (
    <AdminDashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/users" element={<UsersManagement />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<AdminSettings />} />
      </Routes>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;