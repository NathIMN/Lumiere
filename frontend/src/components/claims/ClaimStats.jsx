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
      bgColor: 'bg-amber-50 dark:bg-amber-900/10',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      description: 'Awaiting HR action',
      priority: hrPendingCount > 0 ? 'high' : 'normal',
    },
    {
      title: 'With Insurer',
      value: insurerCount,
      icon: Send,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/10',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      description: 'Processing with insurer',
      priority: 'normal',
    },
    {
      title: 'Returned to Employee',
      value: employeeCount,
      icon: ArrowLeft,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/10',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      description: 'Needs employee action',
      priority: employeeCount > 0 ? 'high' : 'normal',
    }
  ];

  const summaryCards = [
    {
      title: 'Total Claims',
      value: stats.totalClaims || 0,
      icon: FileText,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/10',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
      description: 'All claims in system',
    },
    {
      title: 'Total Value',
      value: formatLKR(totalAmount),
      icon: Coins,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/10',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      description: 'Total requested amount',
    }
  ];

  return (
    <div className="space-y-6">
      {/* Primary Status Cards */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
          HR Claim Status Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bgColor} rounded-lg p-4 transition-all duration-200 hover:shadow-md border border-gray-200 dark:border-gray-700`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      {stat.priority === 'high' && stat.value > 0 && (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
          Financial Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summaryCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bgColor} rounded-lg p-4 transition-all duration-200 hover:shadow-md border border-gray-200 dark:border-gray-700`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className={`p-2 rounded-lg ${stat.iconBg} inline-flex mb-3`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};