/* eslint-disable no-unused-vars */
import React from 'react';
import { 
  Clock, 
  Send,
  ArrowLeft,
  FileText,
  AlertTriangle,
  Coins
} from 'lucide-react';

export const ClaimStats = ({ stats }) => {
  // Find specific status counts
  const getStatusCount = (status) => {
    const statusStat = stats.statusStats?.find(s => s._id === status);
    return statusStat ? statusStat.count : 0;
  };

  const getStatusAmount = (status, field = 'totalRequested') => {
    const statusStat = stats.statusStats?.find(s => s._id === status);
    return statusStat ? statusStat[field] : 0;
  };

  // Format amount in LKR
  const formatLKR = (amount) => {
    return `Rs. ${amount.toLocaleString('en-LK')}`;
  };

  const hrPendingCount = getStatusCount('hr');
  const insurerCount = getStatusCount('insurer');
  const employeeCount = getStatusCount('employee');
  const totalAmount = stats.statusStats?.reduce((sum, stat) => sum + (stat.totalRequested || 0), 0) || 0;

  // HR-relevant status cards (removed approved/rejected)
  const statsCards = [
    {
      title: 'Pending HR Review',
      value: hrPendingCount,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-800/20',
      borderColor: 'border-amber-200 dark:border-amber-700',
      description: 'Awaiting HR action',
      priority: hrPendingCount > 0 ? 'high' : 'normal',
      glowColor: 'shadow-amber-200/50'
    },
    {
      title: 'With Insurer',
      value: insurerCount,
      icon: Send,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-800/20',
      borderColor: 'border-blue-200 dark:border-blue-700',
      description: 'Processing with insurer',
      priority: 'normal',
      glowColor: 'shadow-blue-200/50'
    },
    {
      title: 'Returned to Employee',
      value: employeeCount,
      icon: ArrowLeft,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-800/20',
      borderColor: 'border-orange-200 dark:border-orange-700',
      description: 'Needs employee action',
      priority: employeeCount > 0 ? 'high' : 'normal',
      glowColor: 'shadow-orange-200/50'
    }
  ];

  const summaryCards = [
    {
      title: 'Total Claims',
      value: stats.totalClaims || 0,
      icon: FileText,
      color: 'text-indigo-600',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900/20 dark:to-purple-800/20',
      borderColor: 'border-indigo-200 dark:border-indigo-700',
      description: 'All claims in system',
      glowColor: 'shadow-indigo-200/50'
    },
    {
      title: 'Total Value',
      value: formatLKR(totalAmount),
      icon: Coins,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20',
      borderColor: 'border-green-200 dark:border-green-700',
      description: 'Total requested amount',
      glowColor: 'shadow-green-200/50'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Primary Status Cards */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-3"></div>
          HR Claim Status Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bgColor} ${stat.borderColor} border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50 hover:scale-105 transform cursor-pointer hover:border-opacity-70`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 shadow-sm ring-1 ring-white/20`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  {stat.priority === 'high' && stat.value > 0 && (
                    <div className="flex items-center space-x-1">
                      <AlertTriangle className="h-4 w-4 text-amber-500 animate-pulse" />
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                        Action Required
                      </span>
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full mr-3"></div>
          Financial Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {summaryCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bgColor} ${stat.borderColor} border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50 hover:-translate-y-1 transform`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 shadow-sm`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};