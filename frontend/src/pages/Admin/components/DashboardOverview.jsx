import React, { useState, useEffect } from 'react';
import { Users, Shield, FileText, TrendingUp } from 'lucide-react';
import StatCard from '../../../components/dashboard/ui/StatCard';
import ContentCard from '../../../components/dashboard/ui/ContentCard';
import ThemeIndicator from '../../../components/dashboard/ui/ThemeIndicator';
import LoadingSpinner from '../../../components/dashboard/ui/LoadingSpinner';
import { useTheme } from '../../../components/dashboard/hooks/useTheme';
import ApiService from '../../../services/api';

const DashboardOverview = () => {
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    policies: null,
    users: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [policyStats, userStats] = await Promise.all([
          ApiService.getPolicyStats(),
          ApiService.getUserStats()
        ]);

        setStats({
          policies: policyStats.stats,
          users: userStats,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchStats();
  }, []);

  if (stats.loading) {
    return (
      <div className="space-y-6">
        <ThemeIndicator />
        <div className="flex justify-center py-12">
          <LoadingSpinner size="xl" text="Loading dashboard..." />
        </div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="space-y-6">
        <ThemeIndicator />
        <ContentCard title="Dashboard Overview">
          <div className="text-red-600 p-4 bg-red-50 rounded-lg">
            Error loading dashboard data: {stats.error}
          </div>
        </ContentCard>
      </div>
    );
  }

  const statsData = [
    {
      title: 'Total Policies',
      value: stats.policies?.totalPolicies?.toString() || '0',
      icon: Shield,
      iconColor: 'blue',
      trend: `${stats.policies?.activePolicies || 0} active`,
      trendColor: 'green'
    },
    {
      title: 'Total Users',
      value: stats.users?.totalUsers?.toString() || '0',
      icon: Users,
      iconColor: 'green',
      trend: 'All roles',
      trendColor: 'blue'
    },
    {
      title: 'Expiring Soon',
      value: stats.policies?.expiringPolicies?.toString() || '0',
      icon: FileText,
      iconColor: 'orange',
      trend: 'Next 30 days',
      trendColor: 'orange'
    },
    {
      title: 'Active Policies',
      value: stats.policies?.activePolicies?.toString() || '0',
      icon: TrendingUp,
      iconColor: 'green',
      trend: 'Currently active',
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentCard title="Policy Overview">
          {stats.policies?.typeStats ? (
            <div className="space-y-4">
              {stats.policies.typeStats.map((typeStat) => (
                <div key={typeStat._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium capitalize">{typeStat._id}</span>
                  <span className="text-lg font-bold text-blue-600">{typeStat.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="md" text="Loading policy stats..." />
            </div>
          )}
        </ContentCard>

        <ContentCard title="User Roles">
          {stats.users?.roleStats ? (
            <div className="space-y-4">
              {stats.users.roleStats.map((roleStat) => (
                <div key={roleStat._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium capitalize">{roleStat._id.replace('_', ' ')}</span>
                  <span className="text-lg font-bold text-green-600">{roleStat.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="md" text="Loading user stats..." />
            </div>
          )}
        </ContentCard>
      </div>

      <ContentCard title="System Overview">
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Welcome to the admin dashboard. Here you can monitor your insurance management system's performance and manage various aspects including policies, HR users, and insurance agents.
        </p>
      </ContentCard>
    </div>
  );
};

export default DashboardOverview;