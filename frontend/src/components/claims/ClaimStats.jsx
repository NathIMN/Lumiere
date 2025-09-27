/* eslint-disable no-unused-vars */
import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  DollarSign, 
  TrendingUp, 
  FileText 
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

  const hrPendingCount = getStatusCount('hr');
  const approvedCount = getStatusCount('approved');
  const rejectedCount = getStatusCount('rejected');
  const totalAmount = stats.statusStats?.reduce((sum, stat) => sum + (stat.totalRequested || 0), 0) || 0;

  const statsCards = [
    {
      title: 'Pending HR Review',
      value: hrPendingCount,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      description: 'Claims awaiting HR review'
    },
    {
      title: 'Total Claims',
      value: stats.totalClaims || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      description: 'All claims in system'
    },
    {
      title: 'Total Claim Value',
      value: `$${totalAmount.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      description: 'Total requested amount'
    },
    {
      title: 'Approved Claims',
      value: approvedCount,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      description: 'Successfully approved'
    },
    {
      title: 'Rejected Claims',
      value: rejectedCount,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      description: 'Claims rejected'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} border rounded-lg p-6 transition-all duration-200 hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.description}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};