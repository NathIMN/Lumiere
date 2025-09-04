import React from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Home, Shield, Users, UserCheck, LogOut, HelpCircle } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import SidebarItem from '../../components/dashboard/layout/SidebarItem';
import { useSidebar } from '../../components/dashboard/hooks/useSidebar';
import { useTheme } from '../../components/dashboard/hooks/useTheme';
import { getThemeClasses } from '../../components/dashboard/utils/themeUtils';

// Import new components
import DashboardOverview from './components/DashboardOverview';
import PolicyManagement from './components/PolicyManagement';
import HRManagement from './components/HRManagement';
import InsuranceAgentManagement from './components/InsuranceAgentManagement';

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
    { id: 'policies', label: 'Policy Management', icon: Shield, path: '/admin/policies' },
    { id: 'hr', label: 'HR Management', icon: Users, path: '/admin/hr' },
    { id: 'agents', label: 'Insurance Agents', icon: UserCheck, path: '/admin/agents' },
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
    name: 'Admin User',
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
        <Route path="/policies" element={<PolicyManagement />} />
        <Route path="/hr" element={<HRManagement />} />
        <Route path="/agents" element={<InsuranceAgentManagement />} />
      </Routes>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;