/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  Shield,
  MessageCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Activity,
  UserCheck,
  Bell,
  Calendar,
  BarChart3,
  PieChart,
  ArrowRight,
  RefreshCw,
  Download,
  Eye,
  Filter,
  Search,
  ChevronRight,
  Heart,
  Car,
  Archive,
  UserPlus,
  FileBarChart
} from 'lucide-react';

import insuranceApiService from '../../services/insurance-api';
import userApiService from '../../services/user-api';
import messagingApiService from '../../services/messaging-api';
import reportsApiService from '../../services/reports-api';

// Quick Action Cards Component
const QuickActions = ({ onNavigate, stats }) => {
  const actions = [
    {
      title: 'Review Claims',
      description: 'Review pending insurance claims',
      icon: FileText,
      color: 'bg-blue-500',
      count: stats?.claimStats?.pendingReview || 0,
      action: () => onNavigate('/hr/claims')
    },
    {
      title: 'Manage Users',
      description: 'View and manage employees',
      icon: Users,
      color: 'bg-green-500',
      count: stats?.userStats?.pendingApprovals || 0,
      action: () => onNavigate('/hr/users')
    },
    {
      title: 'Policy Overview',
      description: 'Monitor insurance policies',
      icon: Shield,
      color: 'bg-purple-500',
      count: stats?.policyStats?.expiringCount || 0,
      action: () => onNavigate('/hr/policies')
    },
    {
      title: 'Messages',
      description: 'Check employee messages',
      icon: MessageCircle,
      color: 'bg-orange-500',
      count: stats?.messageStats?.unreadCount || 0,
      action: () => onNavigate('/hr/messages')
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {actions.map((action, index) => {
        const IconComponent = action.icon;
        return (
          <div
            key={index}
            onClick={action.action}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${action.color} p-3 rounded-lg`}>
                <IconComponent className="h-6 w-6 text-white" />
              </div>
              {action.count > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {action.count}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
              {action.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {action.description}
            </p>
            <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400">
              <span className="text-sm font-medium">Open</span>
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Statistics Grid Component
const StatisticsGrid = ({ stats, loading }) => {
  const statCards = [
    {
      title: 'Total Employees',
      value: stats?.userStats?.totalUsers || 0,
      change: `+${stats?.userStats?.newThisMonth || 0} this month`,
      changeType: 'increase',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Active Claims',
      value: stats?.claimStats?.totalClaims || 0,
      change: `${stats?.claimStats?.pendingReview || 0} pending review`,
      changeType: 'neutral',
      icon: FileText,
      color: 'green'
    },
    {
      title: 'Active Policies',
      value: stats?.policyStats?.activePolicies || 0,
      change: `${stats?.policyStats?.expiringCount || 0} expiring soon`,
      changeType: 'warning',
      icon: Shield,
      color: 'purple'
    },
    {
      title: 'Claim Amount',
      value: stats?.claimStats?.totalAmount 
        ? `Rs. ${(stats.claimStats.totalAmount / 1000000).toFixed(1)}M`
        : 'Rs. 0',
      change: `${stats?.claimStats?.monthlyGrowth > 0 ? '+' : ''}${stats?.claimStats?.monthlyGrowth?.toFixed(1) || 0}% from last month`,
      changeType: stats?.claimStats?.monthlyGrowth > 0 ? 'increase' : 'decrease',
      icon: DollarSign,
      color: 'orange'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        icon: 'bg-blue-500',
        text: 'text-blue-600 dark:text-blue-400'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        icon: 'bg-green-500',
        text: 'text-green-600 dark:text-green-400'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        icon: 'bg-purple-500',
        text: 'text-purple-600 dark:text-purple-400'
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        icon: 'bg-orange-500',
        text: 'text-orange-600 dark:text-orange-400'
      }
    };
    return colors[color];
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        const colorClasses = getColorClasses(stat.color);
        
        return (
          <div
            key={index}
            className={`${colorClasses.bg} rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${colorClasses.icon} p-3 rounded-lg`}>
                <IconComponent className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${colorClasses.text}`}>
                  {stat.value}
                </div>
              </div>
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              {stat.title}
            </h3>
            <div className="flex items-center">
              <span className={`text-sm ${
                stat.changeType === 'increase' ? 'text-green-600' :
                stat.changeType === 'warning' ? 'text-yellow-600' :
                stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stat.change}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Recent Activity Component
const RecentActivity = ({ activities, loading }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'claim': return FileText;
      case 'user': return UserPlus;
      case 'policy': return Shield;
      case 'message': return MessageCircle;
      default: return Activity;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'completed':
      case 'approved': return 'text-green-600 bg-green-100';
      case 'unread': return 'text-blue-600 bg-blue-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
              </div>
              <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => {
            const IconComponent = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                  <IconComponent className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.action || activity.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.user || activity.userName || 'System'}
                    </span>
                    {activity.amount && (
                      <span className="text-sm font-medium text-green-600">
                        Rs. {activity.amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {activity.time || activity.createdAt ? 
                      new Date(activity.time || activity.createdAt).toLocaleString() : 
                      'Recently'
                    }
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No recent activity to display
          </div>
        )}
      </div>
    </div>
  );
};

// Pending Tasks Component
const PendingTasks = ({ tasks, onTaskClick, loading }) => {
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      case 'low': return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-700';
    }
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case 'claim_review': return FileText;
      case 'user_approval': return UserCheck;
      case 'policy_expiring': return AlertTriangle;
      case 'report': return FileBarChart;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="border-l-4 border-gray-300 p-4 rounded-r-lg animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Pending Tasks
        </h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {tasks.length} tasks
        </span>
      </div>
      
      <div className="space-y-3">
        {tasks.length > 0 ? (
          tasks.map((task) => {
            const IconComponent = getTaskIcon(task.type);
            return (
              <div
                key={task.id}
                onClick={() => onTaskClick(task)}
                className={`border-l-4 ${getPriorityColor(task.priority)} p-4 rounded-r-lg cursor-pointer hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {task.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No pending tasks
          </div>
        )}
      </div>
    </div>
  );
};

// Charts Component
const ChartsSection = ({ stats, loading }) => {
  const [selectedChart, setSelectedChart] = useState('claims');

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-8 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-4 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-gray-300 dark:bg-gray-600 h-2 rounded-full" style={{width: `${Math.random() * 100}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Claims Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Claims Overview
          </h3>
          <select className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700">
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
            <span className="text-sm font-medium">{stats?.claimStats?.pendingReview || 0}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
              style={{
                width: `${stats?.claimStats?.pendingReview > 0 && stats?.claimStats?.totalClaims > 0 
                  ? Math.max((stats.claimStats.pendingReview / stats.claimStats.totalClaims * 100), 5)
                  : stats?.claimStats?.pendingReview > 0 ? 100 : 0
                }%`
              }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Approved</span>
            <span className="text-sm font-medium">{stats?.claimStats?.approved || 0}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300" 
              style={{
                width: `${stats?.claimStats?.approved > 0 && stats?.claimStats?.totalClaims > 0 
                  ? Math.max((stats.claimStats.approved / stats.claimStats.totalClaims * 100), 5)
                  : stats?.claimStats?.approved > 0 ? 100 : 0
                }%`
              }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Rejected</span>
            <span className="text-sm font-medium">{stats?.claimStats?.rejected || 0}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-300" 
              style={{
                width: `${stats?.claimStats?.rejected > 0 && stats?.claimStats?.totalClaims > 0 
                  ? Math.max((stats.claimStats.rejected / stats.claimStats.totalClaims * 100), 5)
                  : stats?.claimStats?.rejected > 0 ? 100 : 0
                }%`
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Policy Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Policy Distribution
          </h3>
          <PieChart className="h-5 w-5 text-gray-500" />
        </div>
        
        <div className="space-y-4">
          {stats?.policyStats?.distribution?.map((policy, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {policy.type === 'Life Insurance' ? (
                  <Heart className="h-4 w-4 text-red-500" />
                ) : policy.type === 'Vehicle Insurance' ? (
                  <Car className="h-4 w-4 text-blue-500" />
                ) : (
                  <Shield className="h-4 w-4 text-green-500" />
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">{policy.type}</span>
              </div>
              <span className="text-sm font-medium">
                {policy.count} ({policy.percentage}%)
              </span>
            </div>
          )) || (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Life Insurance</span>
                </div>
                <span className="text-sm font-medium">0 (0%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Car className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Vehicle Insurance</span>
                </div>
                <span className="text-sm font-medium">0 (0%)</span>
              </div>
            </>
          )}
          
          {/* Visual representation */}
          <div className="mt-6">
            <div className="flex rounded-full overflow-hidden h-3">
              {stats?.policyStats?.distribution?.map((policy, index) => (
                <div 
                  key={index}
                  className={index === 0 ? 'bg-red-500' : 'bg-blue-500'}
                  style={{width: `${policy.percentage}%`}}
                ></div>
              )) || (
                <div className="bg-gray-300 w-full"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main HR Overview Component
export const HROverview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock navigation function - replace with your actual navigation logic
  const handleNavigate = (path) => {
    console.log(`Navigating to: ${path}`);
    // Replace with your navigation logic
    // Example: navigate(path) or window.location.href = path
  };

  const handleTaskClick = (task) => {
    console.log(`Clicked task: ${task.title}`);
    // Handle task click based on task type
    switch (task.type) {
      case 'claim_review':
        handleNavigate('/hr/claims');
        break;
      case 'user_approval':
        handleNavigate('/hr/users');
        break;
      case 'policy_expiring':
        handleNavigate('/hr/policies');
        break;
      default:
        console.log('Unknown task type');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      // Fetch basic stats first
      const [
        userStatsResponse,
        claimStatsResponse, 
        policyStatsResponse,
        messageStatsResponse
      ] = await Promise.all([
        userApiService.getUserStats().catch(err => {
          console.warn('getUserStats failed:', err);
          return { totalUsers: 0, newThisMonth: 0, pendingApprovals: 0 };
        }),
        insuranceApiService.getClaimStatistics().catch(err => {
          console.warn('getClaimStatistics failed:', err);
          return { 
            totalClaims: 0, 
            pendingReview: 0, 
            approved: 0, 
            rejected: 0, 
            totalAmount: 0,
            monthlyGrowth: 0 
          };
        }),
        insuranceApiService.getPolicyStatistics().catch(err => {
          console.warn('getPolicyStatistics failed:', err);
          return { 
            activePolicies: 0, 
            expiringCount: 0, 
            distribution: [] 
          };
        }),
        messagingApiService.getUnreadCount().catch(err => {
          console.warn('getUnreadCount failed:', err);
          return { unreadCount: 0 };
        })
      ]);

      // Combine all stats
      const combinedStats = {
        userStats: userStatsResponse,
        claimStats: claimStatsResponse,
        policyStats: policyStatsResponse,
        messageStats: messageStatsResponse
      };

      setStats(combinedStats);

      // Try to fetch additional data if methods exist
      try {
        if (typeof insuranceApiService.getRecentActivity === 'function') {
          const recentActivityResponse = await insuranceApiService.getRecentActivity();
          setRecentActivity(Array.isArray(recentActivityResponse) ? recentActivityResponse : []);
        } else {
          // Create mock recent activity from available data
          const mockActivity = [
            {
              id: 1,
              type: 'claim',
              action: `${claimStatsResponse.pendingReview} claims pending review`,
              user: 'System',
              time: new Date().toISOString(),
              status: 'pending'
            },
            {
              id: 2,
              type: 'user',
              action: `${userStatsResponse.newThisMonth} new employees this month`,
              user: 'HR System',
              time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              status: 'completed'
            },
            {
              id: 3,
              type: 'policy',
              action: `${policyStatsResponse.expiringCount} policies expiring soon`,
              user: 'Policy System',
              time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              status: policyStatsResponse.expiringCount > 0 ? 'pending' : 'completed'
            }
          ].filter(activity => activity.action.match(/\d+/)?.[0] !== '0');
          setRecentActivity(mockActivity);
        }
      } catch (err) {
        console.warn('getRecentActivity failed:', err);
        setRecentActivity([]);
      }

      try {
        if (typeof insuranceApiService.getPendingTasks === 'function') {
          const pendingTasksResponse = await insuranceApiService.getPendingTasks();
          setPendingTasks(Array.isArray(pendingTasksResponse) ? pendingTasksResponse : []);
        } else {
          // Create mock pending tasks from available data
          const mockTasks = [];
          
          if (claimStatsResponse.pendingReview > 0) {
            mockTasks.push({
              id: 1,
              type: 'claim_review',
              title: `Review ${claimStatsResponse.pendingReview} pending claims`,
              priority: claimStatsResponse.pendingReview > 10 ? 'high' : 'medium',
              dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
            });
          }
          
          if (userStatsResponse.pendingApprovals > 0) {
            mockTasks.push({
              id: 2,
              type: 'user_approval',
              title: `Approve ${userStatsResponse.pendingApprovals} employee registrations`,
              priority: 'medium',
              dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
            });
          }
          
          if (policyStatsResponse.expiringCount > 0) {
            mockTasks.push({
              id: 3,
              type: 'policy_expiring',
              title: `Handle ${policyStatsResponse.expiringCount} expiring policies`,
              priority: policyStatsResponse.expiringCount > 5 ? 'high' : 'low',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            });
          }
          
          setPendingTasks(mockTasks);
        }
      } catch (err) {
        console.warn('getPendingTasks failed:', err);
        setPendingTasks([]);
      }

      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleGenerateReport = async () => {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Check if the method exists before calling it
      if (typeof reportsApiService.generateClaimsReport === 'function') {
        const reportBlob = await reportsApiService.generateClaimsReport({
          startDate,
          endDate
        });
        
        // Create download link
        const url = window.URL.createObjectURL(reportBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `HR_Overview_Report_${endDate}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback: Generate a simple text report
        const reportData = `HR Overview Report - ${endDate}
        
=== STATISTICS ===
Total Employees: ${stats.userStats?.totalUsers || 0}
New Employees This Month: ${stats.userStats?.newThisMonth || 0}
Pending User Approvals: ${stats.userStats?.pendingApprovals || 0}

Total Claims: ${stats.claimStats?.totalClaims || 0}
Pending Claims: ${stats.claimStats?.pendingReview || 0}
Approved Claims: ${stats.claimStats?.approved || 0}
Rejected Claims: ${stats.claimStats?.rejected || 0}
Total Claim Amount: Rs. ${stats.claimStats?.totalAmount?.toLocaleString() || 0}

Active Policies: ${stats.policyStats?.activePolicies || 0}
Expiring Policies: ${stats.policyStats?.expiringCount || 0}

Unread Messages: ${stats.messageStats?.unreadCount || 0}

=== PENDING TASKS ===
${pendingTasks.map(task => `- ${task.title} (${task.priority} priority)`).join('\n') || 'No pending tasks'}

Generated on: ${new Date().toLocaleString()}
        `;

        const blob = new Blob([reportData], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `HR_Overview_Report_${endDate}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('Generated text report as fallback');
      }
      
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report. Please try again.');
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing) {
        fetchDashboardData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refreshing]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HR Overview
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                Welcome back! Here's what's happening with your organization.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Last updated: {lastUpdated.toLocaleString()}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleGenerateReport}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
              >
                <Download className="h-4 w-4" />
                <span>Generate Report</span>
              </button>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-r-lg mb-6">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Alert Banner for urgent items */}
          {stats.claimStats?.pendingReview > 10 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 rounded-r-lg mb-6">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-400 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Action Required
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    You have {stats.claimStats.pendingReview} claims pending review. Please review them as soon as possible.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Policy Expiration Warning */}
          {stats.policyStats?.expiringCount > 5 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-400 p-4 rounded-r-lg mb-6">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-orange-400 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Policy Expiration Alert
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                    {stats.policyStats.expiringCount} policies are expiring soon. Consider reaching out to employees for renewal.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Grid */}
        <StatisticsGrid stats={stats} loading={loading} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivity activities={recentActivity} loading={loading} />
          </div>
          
          {/* Pending Tasks */}
          <div>
            <PendingTasks tasks={pendingTasks} onTaskClick={handleTaskClick} loading={loading} />
          </div>
        </div>

        {/* Charts Section */}
        <ChartsSection stats={stats} loading={loading} />

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">This Month</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">New Claims</span>
                <span className="font-medium">{stats.claimStats?.newThisMonth || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">New Employees</span>
                <span className="font-medium">{stats.userStats?.newThisMonth || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Policy Renewals</span>
                <span className="font-medium">{stats.policyStats?.renewalsThisMonth || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Performance</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">vs Last Month</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Claim Processing</span>
                <span className={`font-medium ${stats.claimStats?.processingImprovement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.claimStats?.processingImprovement > 0 ? '+' : ''}{stats.claimStats?.processingImprovement || 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className={`font-medium ${stats.claimStats?.responseTimeImprovement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.claimStats?.responseTimeImprovement > 0 ? '' : '+'}{stats.claimStats?.responseTimeImprovement || 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">User Satisfaction</span>
                <span className={`font-medium ${stats.userStats?.satisfactionImprovement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.userStats?.satisfactionImprovement > 0 ? '+' : ''}{stats.userStats?.satisfactionImprovement || 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">System alerts</p>
              </div>
            </div>
            <div className="space-y-3">
              {stats.policyStats?.expiringCount > 0 && (
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Policy Expiring</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {stats.policyStats.expiringCount} policies expire this month
                    </p>
                  </div>
                </div>
              )}
              
              {stats.userStats?.pendingApprovals > 0 && (
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Pending Approvals</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {stats.userStats.pendingApprovals} employee registrations waiting
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">System Status</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    All systems operational
                  </p>
                </div>
              </div>
              
              {(!stats.policyStats?.expiringCount && !stats.userStats?.pendingApprovals) && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                  No urgent notifications
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Action Bar
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Ready to dive deeper?</h3>
              <p className="text-blue-100">
                Explore detailed reports, manage employees, or review claims in detail.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleNavigate('/hr/reports')}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors backdrop-blur-sm"
              >
                View Reports
              </button>
              <button
                onClick={() => handleNavigate('/hr/analytics')}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Advanced Analytics
              </button>
            </div>
          </div>
        </div> */}

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Data updates every 5 minutes. Last sync: {lastUpdated.toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
};