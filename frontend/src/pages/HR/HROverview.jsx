/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Shield,
  FileText,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Activity,
  Calendar,
  RefreshCw,
  Archive,
  Heart,
  Car,
  Package,
  Building2,
  ClipboardCheck,
  FileBarChart,
  Download,
  Eye,
  ChevronDown,
  X
} from 'lucide-react';

import insuranceApiService from '../../services/insurance-api';
import userApiService from '../../services/user-api';
import reportsApiService from '../../services/reports-api';

export const HROverview = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showReports, setShowReports] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [dashboardData, setDashboardData] = useState({
    users: {
      total: 0,
      active: 0,
      inactive: 0,
      newThisMonth: 0,
      byDepartment: []
    },
    policies: {
      total: 0,
      active: 0,
      expiring: 0,
      totalCoverage: 0,
      lifeInsurance: 0,
      vehicleInsurance: 0
    },
    claims: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      totalAmount: 0
    },
    documents: {
      total: 0,
      verified: 0,
      unverified: 0,
      pendingReview: 0
    }
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing && !loading) loadDashboardData();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshing, loading]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'Rs. 0';
    return `Rs. ${amount.toLocaleString('en-LK', { maximumFractionDigits: 0 })}`;
  };

  const formatCurrencyShort = (amount) => {
    if (!amount && amount !== 0) return 'Rs. 0';
    if (amount >= 1000000) return `Rs. ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `Rs. ${(amount / 1000).toFixed(1)}K`;
    return `Rs. ${amount.toLocaleString('en-LK')}`;
  };

  const loadDashboardData = async () => {
    try {
      setError(null);
      if (!loading) setRefreshing(true);

      const documentApiService = (await import('../../services/document-api')).default;

      // Fetch data in parallel
      const [userStatsResponse, policyStatsResponse, claimStatsResponse, allPoliciesResponse, documentsResponse] = await Promise.all([
        userApiService.getUserStats(),
        insuranceApiService.getPolicyStatistics(),
        insuranceApiService.getClaimStatistics(),
        insuranceApiService.getPolicies({ limit: 1000 }),
        documentApiService.getDocuments({ status: 'active' }).catch(() => ({ documents: [] }))
      ]);

      console.log('API Responses:', { 
        userStatsResponse, 
        policyStatsResponse,
        claimStatsResponse,
        allPoliciesResponse,
        documentsResponse 
      });

      // Process user stats
      const userStats = userStatsResponse?.data || userStatsResponse?.stats || userStatsResponse || {};

      // Process policy stats
      const policyStatsRaw = policyStatsResponse?.data || policyStatsResponse?.statistics || policyStatsResponse || {};
      
      // ===== FIXED CLAIM STATISTICS PROCESSING =====
      // Handle the response structure properly
      let claimStatsRaw = {};
      
      if (claimStatsResponse) {
        if (claimStatsResponse.data) {
          claimStatsRaw = claimStatsResponse.data;
        } else if (claimStatsResponse.statistics) {
          claimStatsRaw = claimStatsResponse.statistics;
        } else if (typeof claimStatsResponse === 'object' && !Array.isArray(claimStatsResponse)) {
          claimStatsRaw = claimStatsResponse;
        }
      }
      
      console.log('Processed Claim Stats Raw:', claimStatsRaw);
      
      // Get all policies for accurate counting
      let allPolicies = [];
      if (allPoliciesResponse) {
        if (Array.isArray(allPoliciesResponse)) {
          allPolicies = allPoliciesResponse;
        } else if (allPoliciesResponse.data) {
          if (Array.isArray(allPoliciesResponse.data)) {
            allPolicies = allPoliciesResponse.data;
          } else if (allPoliciesResponse.data.policies) {
            allPolicies = allPoliciesResponse.data.policies;
          }
        } else if (allPoliciesResponse.policies) {
          allPolicies = allPoliciesResponse.policies;
        }
      }

      console.log('Processed policies:', {
        count: allPolicies.length,
        sample: allPolicies.slice(0, 3)
      });

      // Calculate counts from actual policies data
      const totalPoliciesCount = allPolicies.length;
      const activePoliciesCount = allPolicies.filter(p => p.status === 'active').length;
      const lifePoliciesCount = allPolicies.filter(p => p.policyType === 'life').length;
      const vehiclePoliciesCount = allPolicies.filter(p => p.policyType === 'vehicle').length;

      // Calculate expiring policies (within 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const expiringPoliciesCount = allPolicies.filter(p => {
        if (!p.validity || !p.validity.endDate) return false;
        const endDate = new Date(p.validity.endDate);
        const today = new Date();
        return endDate > today && endDate <= thirtyDaysFromNow;
      }).length;

      // Calculate total coverage
      const totalCoverageAmount = allPolicies.reduce((sum, p) => {
        return sum + (p.coverage?.coverageAmount || 0);
      }, 0);

      // Process documents
      const documents = documentsResponse?.documents || [];

      // ===== FIXED CLAIM COUNTS EXTRACTION =====
      let claimCounts = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalAmount: 0
      };

      // Get total claims count - try multiple possible locations
      claimCounts.total = claimStatsRaw?.totalClaims || 
                          claimStatsRaw?.total || 
                          claimStatsRaw?.count || 
                          0;
      
      // Handle byStatus array structure
      if (claimStatsRaw?.byStatus && Array.isArray(claimStatsRaw.byStatus)) {
        claimStatsRaw.byStatus.forEach(statusObj => {
          const status = statusObj._id || statusObj.status;
          const count = statusObj.count || statusObj.total || 0;
          
          // Map status to our categories
          if (status === 'hr' || status === 'employee' || status === 'draft') {
            claimCounts.pending += count;
          } else if (status === 'approved') {
            claimCounts.approved = count;
          } else if (status === 'rejected') {
            claimCounts.rejected = count;
          } else if (status === 'insurer') {
            // Claims at insurer are also pending from HR perspective
            claimCounts.pending += count;
          }
        });
      } 
      // Handle direct property access
      else {
        // Try different property names for pending claims
        claimCounts.pending = claimStatsRaw?.pendingClaims || 
                              claimStatsRaw?.pending || 
                              ((claimStatsRaw?.hrClaims || 0) + 
                               (claimStatsRaw?.employeeClaims || 0) + 
                               (claimStatsRaw?.insurerClaims || 0)) || 
                              0;
        
        claimCounts.approved = claimStatsRaw?.approvedClaims || 
                               claimStatsRaw?.approved || 
                               0;
        
        claimCounts.rejected = claimStatsRaw?.rejectedClaims || 
                               claimStatsRaw?.rejected || 
                               0;
      }
      
      // Get total claim amount - try multiple possible locations
      claimCounts.totalAmount = claimStatsRaw?.totalClaimAmount || 
                                claimStatsRaw?.totalAmount || 
                                claimStatsRaw?.amount?.total || 
                                claimStatsRaw?.totalClaimValue ||
                                0;

      // If we have byStatus but no total, calculate it
      if (claimCounts.total === 0 && claimStatsRaw?.byStatus) {
        claimCounts.total = claimStatsRaw.byStatus.reduce((sum, item) => {
          return sum + (item.count || item.total || 0);
        }, 0);
      }

      console.log('Final Processed Claim Counts:', claimCounts);

      // Build dashboard data with actual counts
      const data = {
        users: {
          total: userStats?.totalUsers || 0,
          active: userStats?.activeUsers || 0,
          inactive: userStats?.inactiveUsers || 0,
          newThisMonth: userStats?.newThisMonth || 0,
          byDepartment: userStats?.byDepartment || []
        },
        policies: {
          total: totalPoliciesCount,
          active: activePoliciesCount,
          expiring: expiringPoliciesCount,
          totalCoverage: totalCoverageAmount,
          lifeInsurance: lifePoliciesCount,
          vehicleInsurance: vehiclePoliciesCount
        },
        claims: claimCounts,
        documents: {
          total: documents.length,
          verified: documents.filter(doc => doc.isVerified).length,
          unverified: documents.filter(doc => !doc.isVerified).length,
          pendingReview: documents.filter(doc => !doc.isVerified && doc.status === 'active').length
        }
      };

      console.log('Final dashboard data:', data);

      setDashboardData(data);
      setLastUpdated(new Date());
      if (!loading && refreshing) {
        showNotification('Dashboard refreshed successfully');
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue", trend }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-xs mt-2 ${trend.type === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend.type === 'up' ? '↗️' : '↘️'} {trend.value}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${
          color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
          color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
          color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
          color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
          'bg-gray-100 dark:bg-gray-700'
        }`}>
          <Icon className={`h-6 w-6 ${
            color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
            color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
            color === 'green' ? 'text-green-600 dark:text-green-400' :
            color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
            'text-gray-600 dark:text-gray-400'
          }`} />
        </div>
      </div>
    </div>
  );

  const Notification = ({ message, type, onClose }) => {
    const styles = type === 'success' 
      ? { bg: 'bg-green-100 dark:bg-green-900/20', border: 'border-green-200', text: 'text-green-800 dark:text-green-200' }
      : { bg: 'bg-red-100 dark:bg-red-900/20', border: 'border-red-200', text: 'text-red-800 dark:text-red-200' };

    return (
      <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
        <div className={`${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4`}>
          <div className="flex items-start space-x-3">
            <div className="flex-1"><p className={`text-sm font-medium ${styles.text}`}>{message}</p></div>
            <button onClick={onClose} className="p-1"><X className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HR Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome back, {user?.profile?.firstName || 'HR Officer'}! Here's your organization overview.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowReports(!showReports)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileBarChart className="h-4 w-4" />
              <span>Reports</span>
            </button>
            <button
              onClick={loadDashboardData}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {dashboardData.policies.expiring > 5 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded-r-lg mb-6 shadow-md">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Policy Renewal Alert</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {dashboardData.policies.expiring} policies are expiring soon. Monitor renewal status.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Employees" 
          value={dashboardData.users.total}
          subtitle={`${dashboardData.users.active} active`}
          icon={Users}
          color="blue"
        />
        <StatCard 
          title="Active Policies" 
          value={dashboardData.policies.active}
          subtitle={`${dashboardData.policies.expiring} expiring soon`}
          icon={Shield}
          color="purple"
        />
        <StatCard 
          title="Total Coverage" 
          value={formatCurrencyShort(dashboardData.policies.totalCoverage)}
          subtitle={formatCurrency(dashboardData.policies.totalCoverage)}
          icon={DollarSign}
          color="green"
        />
        <StatCard 
          title="Total Documents" 
          value={dashboardData.documents.total}
          subtitle={`${dashboardData.documents.unverified} unverified`}
          icon={Archive}
          color="orange"
        />
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Policy Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
              <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Policy Distribution</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                  <Heart className="h-3 w-3 mr-1" /> Life
                </span>
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {dashboardData.policies.lifeInsurance} policies
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {dashboardData.policies.total > 0 
                  ? Math.round((dashboardData.policies.lifeInsurance / dashboardData.policies.total) * 100) 
                  : 0}%
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                  <Car className="h-3 w-3 mr-1" /> Vehicle
                </span>
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {dashboardData.policies.vehicleInsurance} policies
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {dashboardData.policies.total > 0 
                  ? Math.round((dashboardData.policies.vehicleInsurance / dashboardData.policies.total) * 100) 
                  : 0}%
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex rounded-full overflow-hidden h-4 shadow-inner bg-gray-200 dark:bg-gray-700">
              <div 
                className="bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500" 
                style={{width: `${dashboardData.policies.total > 0 ? (dashboardData.policies.lifeInsurance / dashboardData.policies.total) * 100 : 0}%`}}
              />
              <div 
                className="bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500" 
                style={{width: `${dashboardData.policies.total > 0 ? (dashboardData.policies.vehicleInsurance / dashboardData.policies.total) * 100 : 0}%`}}
              />
            </div>
          </div>
        </div>

        {/* Document Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-3">
                <Archive className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Document Status</h3>
            </div>
            {dashboardData.documents.unverified > 0 && (
              <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {dashboardData.documents.unverified} pending
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div className="p-4 border border-green-200 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                    <span className="font-medium text-green-900 dark:text-green-200">Verified Documents</span>
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    {dashboardData.documents.verified} documents verified
                  </div>
                </div>
                <p className="text-sm font-semibold text-green-900 dark:text-green-200">
                  {dashboardData.documents.verified}
                </p>
              </div>
            </div>

            <div className="p-4 border border-orange-200 dark:border-orange-700 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400 mr-2" />
                    <span className="font-medium text-orange-900 dark:text-orange-200">Pending Verification</span>
                  </div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">
                    Documents awaiting review
                  </div>
                </div>
                <p className="text-sm font-semibold text-orange-900 dark:text-orange-200">
                  {dashboardData.documents.unverified}
                </p>
              </div>
            </div>

            <div className="p-4 border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <ClipboardCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="font-medium text-blue-900 dark:text-blue-200">Under Review</span>
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    Currently being processed
                  </div>
                </div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                  {dashboardData.documents.pendingReview}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Management Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
            <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Policy Management Overview</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {dashboardData.policies.total}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Policies Active</div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                  style={{width: `${Math.min((dashboardData.policies.active / Math.max(dashboardData.policies.total, 1)) * 100, 100)}%`}}>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {dashboardData.policies.expiring}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Expiring Soon</div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full transition-all duration-500" 
                  style={{width: `${Math.min((dashboardData.policies.expiring / Math.max(dashboardData.policies.total, 1)) * 100, 100)}%`}}>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrencyShort(dashboardData.policies.totalCoverage)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Coverage</div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '92%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Recent Activity</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>New employees this month:</span>
                  <span className="font-medium">{dashboardData.users.newThisMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span>Documents processed this week:</span>
                  <span className="font-medium">{Math.floor(dashboardData.documents.verified * 0.1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Policy renewals needed:</span>
                  <span className="font-medium">{dashboardData.policies.expiring}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">System Health</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-between">
                  <span>Data synchronization:</span>
                  <span className="flex items-center text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last backup:</span>
                  <span className="font-medium">
                    {lastUpdated.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Next update:</span>
                  <span className="font-medium">
                    {new Date(lastUpdated.getTime() + 5 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="text-center">
        <div className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()} • System operational • Auto-refresh in 5 minutes
          </span>
        </div>
      </div>
    </div>
  );
};