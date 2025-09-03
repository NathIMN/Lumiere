import React from 'react';
import { Home, User, ShoppingCart, Heart, Settings, LogOut } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import StatCard from '../../components/dashboard/ui/StatCard';
import ContentCard from '../../components/dashboard/ui/ContentCard';
import ThemeIndicator from '../../components/dashboard/ui/ThemeIndicator';
import SidebarItem from '../../components/dashboard/layout/SidebarItem';

// User-specific bottom content
const UserBottomContent = () => {
  return (
    <div className="space-y-2">
      <SidebarItem
        icon={LogOut}
        label="Logout"
        onClick={() => console.log('User logout clicked')}
      />
    </div>
  );
};

// User dashboard content
const UserDashboardContent = ({ activeItem, navigationItems }) => {
  // User-specific stats
  const userStatsData = [
    {
      title: 'Orders',
      value: '24',
      icon: ShoppingCart,
      iconColor: 'green',
      trend: '3 this month',
      trendColor: 'green'
    },
    {
      title: 'Wishlist',
      value: '12',
      icon: Heart,
      iconColor: 'red',
      trend: '2 new items',
      trendColor: 'green'
    },
    {
      title: 'Total Spent',
      value: '$1,250',
      icon: ShoppingCart,
      iconColor: 'blue',
      trend: '+$200 this month',
      trendColor: 'green'
    },
    {
      title: 'Rewards Points',
      value: '2,450',
      icon: Heart,
      iconColor: 'purple',
      trend: '+150 this month',
      trendColor: 'green'
    }
  ];

  const activeItemData = navigationItems.find(item => item.id === activeItem);

  return (
    <div className="space-y-6">
      <ThemeIndicator />

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {userStatsData.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content */}
      <ContentCard title={`Welcome to ${activeItemData?.label || 'Your Dashboard'}`}>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to your personal dashboard. Here you can track your orders, manage your profile, and more.
        </p>

        {activeItem === 'orders' && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((order) => (
                <div key={order} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Order #{order}001</p>
                      <p className="text-sm text-gray-500">Placed on Jan {order + 10}, 2024</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Delivered
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeItem === 'wishlist' && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Your Wishlist</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Items you've saved for later will appear here.
            </p>
          </div>
        )}
      </ContentCard>
    </div>
  );
};

const UserDashboard = () => {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: '2' },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: '12' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const user = {
    name: 'Jane Smith',
    avatar: null
  };

  return (
    <DashboardLayout
      title="My Account"
      user={user}
      navigationItems={navigationItems}
      bottomContent={<UserBottomContent />}
      notifications={5}
      onNotificationClick={() => console.log('User notifications clicked')}
      defaultActiveItem="dashboard"
    >
      {({ activeItem, navigationItems }) => (
        <UserDashboardContent 
          activeItem={activeItem} 
          navigationItems={navigationItems} 
        />
      )}
    </DashboardLayout>
  );
};

export default UserDashboard;