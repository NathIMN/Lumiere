import React from 'react';
import { 
  Users, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Car,
  Heart
} from 'lucide-react';

export const PolicyStatsCards = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'expired': return 'text-red-600 bg-red-100 dark:bg-red-900';
      case 'suspended': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      case 'cancelled': return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
      case 'pending': return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'life': return <Heart className="h-5 w-5" />;
      case 'vehicle': return <Car className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Policies */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Policies</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.totalPolicies || 0}
            </p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {/* Active Policies */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Policies</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.activePolicies || 0}
            </p>
          </div>
          <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {/* Expiring Soon */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiring Soon</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.expiringPolicies || 0}
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400">Next 30 days</p>
          </div>
          <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
            <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>

      {/* Coverage Value */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Coverage</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(
                stats?.typeStats?.reduce((sum, stat) => sum + (stat.totalCoverage || 0), 0)
              )}
            </p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
            <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Policy Type Breakdown */}
      {stats?.typeStats?.map((typeStat) => (
        <div key={typeStat._id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                {getTypeIcon(typeStat._id)}
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {typeStat._id} Insurance
              </h3>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {typeStat.count}
            </span>
          </div>
          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Total Coverage:</span>
              <span className="font-medium">{formatCurrency(typeStat.totalCoverage)}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Premium:</span>
              <span className="font-medium">{formatCurrency(typeStat.avgPremium)}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Status Breakdown */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm md:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Policy Status Distribution
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {stats?.statusStats?.map((statusStat) => (
            <div key={statusStat._id} className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${getStatusColor(statusStat._id)}`}>
                <span className="capitalize">{statusStat._id}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statusStat.count}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {((statusStat.count / (stats?.totalPolicies || 1)) * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Policy Categories
        </h3>
        <div className="space-y-3">
          {stats?.categoryStats?.map((categoryStat) => (
            <div key={categoryStat._id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  categoryStat._id === 'individual' ? 'bg-blue-500' : 'bg-green-500'
                }`}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {categoryStat._id}
                </span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {categoryStat.count}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {((categoryStat.count / (stats?.totalPolicies || 1)) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};