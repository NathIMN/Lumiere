/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  MoreVertical, 
  Eye, 
  UserPlus, 
  UserMinus, 
  AlertTriangle,
  BarChart3, 
  Shield, 
  Clock, 
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  User,
  Phone,
  Mail,
  X,
  ChevronDown,
  Download,
  FileText,
  Printer,
  Heart,
  Car,
  FileBarChart
} from 'lucide-react';

import insuranceApiService from '../../services/insurance-api';
import reportsApiService  from '../../services/reports-api';
import { PolicyUsersList } from '../../components/policy/PolicyUsersList';
import { BeneficiaryManagementModal } from '../../components/policy/BeneficiaryManagementModal';
import { PolicyDetailsModal } from '../../components/policy/PolicyDetailsModal';
import { EnhancedGridActionBar } from '../../components/policy/EnhancedActionBars';

// Format currency
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'N/A';
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR'
  }).format(amount);
};

// Format date
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format expiry status
const formatExpiryStatus = (endDate) => {
  if (!endDate) return { text: 'N/A', color: 'text-gray-500' };
  
  const today = new Date();
  const expiry = new Date(endDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { text: `Expired ${Math.abs(diffDays)} days ago`, color: 'text-red-600' };
  if (diffDays <= 30) return { text: `Expires in ${diffDays} days`, color: 'text-yellow-600' };
  return { text: `Expires in ${diffDays} days`, color: 'text-green-600' };
};

// Inline Notification Component
const Notification = ({ message, type = 'success', onClose }) => {
  const getNotificationStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-100 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-800 dark:text-green-200',
          iconColor: 'text-green-500'
        };
      case 'error':
        return {
          bg: 'bg-red-100 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-200',
          iconColor: 'text-red-500'
        };
      default:
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-200',
          iconColor: 'text-blue-500'
        };
    }
  };

  const styles = getNotificationStyles();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out`}>
        <div className="flex items-start space-x-3">
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${styles.text}`}>
              {message}
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.text}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced PolicyStats Component with better data handling
const PolicyStats = ({ stats, loading, policies }) => {
  console.log('Stats data received:', stats);
  console.log('Policies data received:', policies);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Calculate statistics from policies if stats API doesn't provide detailed breakdown
  const calculateStatsFromPolicies = () => {
    if (!policies || !Array.isArray(policies)) {
      return {
        totalCount: 0,
        activeCount: 0,
        lifeCount: 0,
        vehicleCount: 0
      };
    }

    return {
      totalCount: policies.length,
      activeCount: policies.filter(p => p.status === 'active').length,
      lifeCount: policies.filter(p => p.policyType === 'life').length,
      vehicleCount: policies.filter(p => p.policyType === 'vehicle').length
    };
  };

  const calculatedStats = calculateStatsFromPolicies();

  // Use stats from API if available, otherwise fall back to calculated stats
  const totalPolicies = stats?.totalCount || stats?.totalPolicies || calculatedStats.totalCount;
  const activePolicies = stats?.byStatus?.find(s => s._id === 'active')?.count || 
                        stats?.activePolicies || 
                        calculatedStats.activeCount;
  const lifePolicies = stats?.byType?.find(s => s._id === 'life')?.count || 
                       stats?.typeStats?.find(s => s._id === 'life')?.count ||
                       calculatedStats.lifeCount;
  const vehiclePolicies = stats?.byType?.find(s => s._id === 'vehicle')?.count || 
                          stats?.typeStats?.find(s => s._id === 'vehicle')?.count ||
                          calculatedStats.vehicleCount;

  const statCards = [
    {
      title: 'Total Policies',
      value: totalPolicies,
      icon: Shield,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-700 dark:text-blue-300',
      borderColor: 'border-l-4 border-blue-500'
    },
    {
      title: 'Active Policies',
      value: activePolicies,
      icon: TrendingUp,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-700 dark:text-green-300',
      borderColor: 'border-l-4 border-green-500'
    },
    {
      title: 'Life Policies',
      value: lifePolicies,
      icon: Heart,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      textColor: 'text-red-700 dark:text-red-300',
      borderColor: 'border-l-4 border-red-500'
    },
    {
      title: 'Vehicle Policies',
      value: vehiclePolicies,
      icon: Car,
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      textColor: 'text-purple-700 dark:text-purple-300',
      borderColor: 'border-l-4 border-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div key={stat.title} className={`bg-white dark:bg-gray-800 ${stat.bgColor} p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${stat.borderColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.title}
                </p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>
                  {stat.value || 0}
                </p>
                {stat.title === 'Active Policies' && totalPolicies > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Math.round((activePolicies / totalPolicies) * 100)}% of total
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor.replace('50', '100').replace('900/20', '800/30')}`}>
                <IconComponent className={`h-8 w-8 ${stat.iconColor}`} />
              </div>
            </div>
            {/* Progress bar for visual appeal */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${stat.iconColor.replace('text-', 'bg-')}`}
                  style={{ 
                    width: stat.title === 'Total Policies' ? '100%' : 
                           totalPolicies > 0 ? `${Math.min((stat.value / totalPolicies) * 100, 100)}%` : '0%'
                  }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Reports Panel Component
const ReportsPanel = ({ filters, onClose, showNotification }) => {
  const [reportLoading, setReportLoading] = useState(null);
  const [showDateRange, setShowDateRange] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const reportTypes = [
    {
      id: 'policies',
      title: 'Policies Report',
      description: 'Comprehensive report of all policies with details, coverage, premiums, beneficiaries, and status information',
      icon: Shield,
      color: 'blue'
    }
  ];

  const handleGenerateReport = async (reportType) => {
    try {
      setReportLoading(reportType);
      
      // Prepare report filters including current filters and date range
      const reportFilters = {
        ...filters,
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate })
      };

      // Remove empty filters
      Object.keys(reportFilters).forEach(key => {
        if (reportFilters[key] === '' || reportFilters[key] === null || reportFilters[key] === undefined) {
          delete reportFilters[key];
        }
      });

      // Generate policies report
      const blob = await reportsApiService.generatePoliciesReport(reportFilters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showNotification(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully`);

    } catch (error) {
      console.error(`Error generating ${reportType} report:`, error);
      showNotification(`Failed to generate ${reportType} report: ${error.message}`, 'error');
    } finally {
      setReportLoading(null);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'text-blue-600 dark:text-blue-400',
        button: 'bg-blue-600 hover:bg-blue-700 text-white'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileBarChart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generate Reports</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Date Range Filter */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date Range (Optional)
          </label>
          <button
            onClick={() => setShowDateRange(!showDateRange)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700"
          >
            {showDateRange ? 'Hide' : 'Show'} Date Filter
          </button>
        </div>
        
        {showDateRange && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 gap-4">
        {reportTypes.map((report) => {
          const IconComponent = report.icon;
          const colors = getColorClasses(report.color);
          const isLoading = reportLoading === report.id;

          return (
            <div
              key={report.id}
              className={`${colors.bg} border ${colors.border} rounded-lg p-6 transition-all hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${colors.bg.replace('50', '100').replace('900/20', '800/30')}`}>
                    <IconComponent className={`h-8 w-8 ${colors.icon}`} />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{report.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {report.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleGenerateReport(report.id)}
                  disabled={isLoading}
                  className={`flex items-center justify-center gap-2 px-6 py-3 ${colors.button} rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Enhanced PolicyFilters Component
const PolicyFilters = ({ filters, updateFilter, clearFilters, onClose }) => {
  const policyTypeOptions = [
    { value: '', label: 'All Policy Types' },
    { value: 'life', label: 'Life Insurance' },
    { value: 'vehicle', label: 'Vehicle Insurance' }
  ];

  const policyCategoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'individual', label: 'Individual Policy' },
    { value: 'group', label: 'Group Policy' }
  ];

  const policyStatusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'expired', label: 'Expired' },
    { value: 'pending', label: 'Pending' }
  ];

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Policy Filters</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Policy Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Policy Type
          </label>
          <select
            value={filters.policyType || ''}
            onChange={(e) => updateFilter('policyType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {policyTypeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Policy Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Policy Category
          </label>
          <select
            value={filters.policyCategory || ''}
            onChange={(e) => updateFilter('policyCategory', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {policyCategoryOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          >
            {policyStatusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// PolicyTable Component with Add/Remove Beneficiary Actions
const PolicyTable = ({ policies, loading, onViewPolicy, onAddBeneficiary, onRemoveBeneficiary }) => {
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border">
        <div className="p-6 animate-pulse space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!policies || policies.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border p-12 text-center">
        <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No policies found</h3>
        <p className="text-gray-500">No policies match your current filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type & Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coverage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premium</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beneficiaries</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {policies.map((policy) => {
              const expiryStatus = formatExpiryStatus(policy.validity?.endDate);
              
              return (
                <tr key={policy._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{policy.policyNumber || policy.policyId}</div>
                      <div className="text-sm text-gray-500 capitalize">{policy.policyCategory} Policy</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800">
                        {policy.policyType === 'life' ? 'Life' : 'Vehicle'}
                      </span>
                      <br />
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(policy.status)}`}>
                        {policy.status ? policy.status.charAt(0).toUpperCase() + policy.status.slice(1) : 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(policy.coverage?.coverageAmount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Deductible: {formatCurrency(policy.coverage?.deductible)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(policy.premium?.amount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {policy.premium?.frequency}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(policy.validity?.startDate)} - {formatDate(policy.validity?.endDate)}
                      </div>
                      <div className={`text-xs ${expiryStatus.color}`}>
                        {expiryStatus.text}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {policy.beneficiaries?.length || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {policy.insuranceAgent?.firstName} {policy.insuranceAgent?.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {policy.insuranceAgent?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative">
                      <button
                        onClick={() => setDropdownOpen(dropdownOpen === policy._id ? null : policy._id)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      
                      {dropdownOpen === policy._id && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 border">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                onViewPolicy(policy._id);
                                setDropdownOpen(null);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 w-full text-left"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                onAddBeneficiary(policy._id);
                                setDropdownOpen(null);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 w-full text-left"
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Add Beneficiary
                            </button>
                            <button
                              onClick={() => {
                                onRemoveBeneficiary(policy._id);
                                setDropdownOpen(null);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 w-full text-left"
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Remove Beneficiary
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main HRPolicyUser Component
export const HRPolicyUser = () => {
  // States
  const [viewMode, setViewMode] = useState('table');
  const [showFilters, setShowFilters] = useState(true);
  const [showReports, setShowReports] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    policyType: '',
    policyCategory: '',
    status: ''
  });
  const [totalPolicies, setTotalPolicies] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState(null);
  
  // Modal states
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);
  const [beneficiaryModalMode, setBeneficiaryModalMode] = useState('add'); // 'add' or 'remove'

  // Notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch policies
  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    try {
      const params = { 
        ...filters, 
        search: searchTerm, 
        page: currentPage,
        limit: 10
      };
      
      // Remove empty values
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      console.log('Fetching policies with params:', params);
      const response = await insuranceApiService.getPolicies(params);
      console.log('Policies response:', response);
      
      if (response && response.success !== false) {
        // Handle different response structures
        let policiesData = [];
        let totalCount = 0;
        
        if (response.data) {
          if (Array.isArray(response.data)) {
            policiesData = response.data;
            totalCount = response.totalCount || response.data.length;
          } else if (response.data.policies) {
            policiesData = response.data.policies;
            totalCount = response.data.totalCount || response.data.policies.length;
          }
        } else if (Array.isArray(response)) {
          policiesData = response;
          totalCount = response.length;
        } else if (response.policies) {
          policiesData = response.policies;
          totalCount = response.totalCount || response.policies.length;
        }
        
        setPolicies(policiesData);
        setTotalPolicies(totalCount);
        setTotalPages(Math.ceil(totalCount / 10));
      } else {
        setPolicies([]);
        setTotalPolicies(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
      showNotification('Failed to fetch policies: ' + error.message, 'error');
      setPolicies([]);
      setTotalPolicies(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm, currentPage]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await insuranceApiService.getPolicyStatistics();
      console.log('Stats response:', response);
      
      if (response && response.success !== false) {
        if (response.data) {
          setStats(response.data);
        } else if (response.statistics) {
          setStats(response.statistics);
        } else {
          setStats(response);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Don't show error notification for stats as it's not critical
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Enhanced handlers
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ policyType: '', policyCategory: '', status: '' });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleViewPolicy = async (policyData) => {
    try {
      let policy = null;
      
      if (typeof policyData === 'string') {
        const response = await insuranceApiService.getPolicyById(policyData);
        policy = response.data || response;
      } else if (policyData && (policyData._id || policyData.id)) {
        policy = policyData;
      } else {
        throw new Error('Invalid policy data provided');
      }

      setSelectedPolicy(policy);
      setShowPolicyModal(true);
      
    } catch (error) {
      console.error('Error viewing policy:', error);
      showNotification('Failed to load policy details: ' + error.message, 'error');
    }
  };

  const handleAddBeneficiary = async (policyId) => {
    try {
      // Find the policy from current policies list
      const policy = policies.find(p => (p._id || p.id) === policyId);
      
      if (!policy) {
        // If not found, fetch it
        const response = await insuranceApiService.getPolicyById(policyId);
        setSelectedPolicy(response.data || response);
      } else {
        setSelectedPolicy(policy);
      }
      
      setBeneficiaryModalMode('add');
      setShowBeneficiaryModal(true);
      
    } catch (error) {
      console.error('Error preparing to add beneficiary:', error);
      showNotification('Failed to load policy for beneficiary management: ' + error.message, 'error');
    }
  };

  const handleRemoveBeneficiary = async (policyId) => {
    try {
      // Find the policy from current policies list
      const policy = policies.find(p => (p._id || p.id) === policyId);
      
      if (!policy) {
        // If not found, fetch it
        const response = await insuranceApiService.getPolicyById(policyId);
        setSelectedPolicy(response.data || response);
      } else {
        setSelectedPolicy(policy);
      }
      
      setBeneficiaryModalMode('remove');
      setShowBeneficiaryModal(true);
      
    } catch (error) {
      console.error('Error preparing to remove beneficiary:', error);
      showNotification('Failed to load policy for beneficiary management: ' + error.message, 'error');
    }
  };

  // Enhanced beneficiary management functions for the modal
  const handleModalAddBeneficiary = async (policyId, beneficiaryId) => {
    const response = await insuranceApiService.addPolicyBeneficiary(policyId, beneficiaryId);
    
    if (response && response.success !== false) {
      return response;
    } else {
      throw new Error(response?.message || 'Failed to add beneficiary');
    }
  };

  const handleModalRemoveBeneficiary = async (policyId, beneficiaryId) => {
    const response = await insuranceApiService.removePolicyBeneficiary(policyId, beneficiaryId);
    
    if (response && response.success !== false) {
      return response;
    } else {
      throw new Error(response?.message || 'Failed to remove beneficiary');
    }
  };

  const handleBeneficiaryModalClose = () => {
    setShowBeneficiaryModal(false);
    setSelectedPolicy(null);
    // Refresh policies to show updated beneficiary counts
    fetchPolicies();
    fetchStats();
    showNotification(
      beneficiaryModalMode === 'add' 
        ? 'Beneficiaries updated successfully' 
        : 'Beneficiaries removed successfully'
    );
  };

  const handleRefresh = () => {
    fetchPolicies();
    fetchStats();
    showNotification('Data refreshed successfully');
  };

  // Get filter description for display
  const getFilterDescription = () => {
    let description = [];
    
    if (filters.policyType) {
      description.push(`${filters.policyType === 'life' ? 'Life' : 'Vehicle'} Insurance`);
    }
    
    if (filters.policyCategory) {
      description.push(`${filters.policyCategory === 'individual' ? 'Individual' : 'Group'} Policy`);
    }
    
    if (filters.status) {
      description.push(`Status: ${filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}`);
    }
    
    return description.length > 0 ? description.join(' • ') : 'All Policies';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Policy Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {getFilterDescription()} • {totalPolicies} policies found
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Statistics - Pass policies as prop for calculation fallback */}
        <PolicyStats stats={stats} loading={statsLoading} policies={policies} />
      </div>

      {/* Search and Controls */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Reports Button */}
            <button
              onClick={() => setShowReports(!showReports)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                showReports
                  ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
              }`}
            >
              <FileBarChart className="h-4 w-4" />
              Reports
            </button>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <List className="h-4 w-4" />
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Grid className="h-4 w-4" />
                Grid
              </button>
            </div>
          </div>
        </div>

        {/* Reports Panel */}
        {showReports && (
          <div className="mt-4">
            <ReportsPanel
              filters={filters}
              onClose={() => setShowReports(false)}
              showNotification={showNotification}
            />
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="mt-4">
            <PolicyFilters
              filters={filters}
              updateFilter={updateFilter}
              clearFilters={clearFilters}
              onClose={() => setShowFilters(false)}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-6">
        {viewMode === 'table' ? (
          <PolicyTable
            policies={policies}
            loading={loading}
            onViewPolicy={handleViewPolicy}
            onAddBeneficiary={handleAddBeneficiary}
            onRemoveBeneficiary={handleRemoveBeneficiary}
          />
        ) : (
          <PolicyUsersList
            policies={policies}
            loading={loading}
            view="grid"
            onViewDetails={handleViewPolicy}
            onAddBeneficiary={handleAddBeneficiary}
            onRemoveBeneficiary={handleRemoveBeneficiary}
            onRefresh={handleRefresh}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {policies.length} of {totalPolicies} policies
            {(filters.policyType || filters.policyCategory || filters.status) && (
              <span className="text-blue-600 dark:text-blue-400">
                {' '}• Filtered by:{' '}
                {filters.policyType && (
                  <span>{filters.policyType === 'life' ? 'Life' : 'Vehicle'} Insurance</span>
                )}
                {filters.policyCategory && (
                  <span> → {filters.policyCategory === 'individual' ? 'Individual' : 'Group'} Policy</span>
                )}
                {filters.status && (
                  <span> → {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}</span>
                )}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
              className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Policy Details Modal */}
      {showPolicyModal && selectedPolicy && (
        <PolicyDetailsModal
          policy={selectedPolicy}
          isOpen={showPolicyModal}
          onClose={() => {
            setShowPolicyModal(false);
            setSelectedPolicy(null);
          }}
        />
      )}

      {/* Beneficiary Management Modal */}
      {showBeneficiaryModal && selectedPolicy && (
        <BeneficiaryManagementModal
          isOpen={showBeneficiaryModal}
          onClose={handleBeneficiaryModalClose}
          policy={selectedPolicy}
          onAddBeneficiary={handleModalAddBeneficiary}
          onRemoveBeneficiary={handleModalRemoveBeneficiary}
          mode={beneficiaryModalMode}
        />
      )}
    </div>
  );
};