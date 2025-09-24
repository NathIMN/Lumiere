import React, { useState, useEffect, useCallback, useMemo } from 'react';
import insuranceApiService from '../../services/insurance-api';
import {
  BarChart3, TrendingUp, Clock, AlertTriangle, CheckCircle, XCircle, FileText,
  Users, PieChart, Activity, Calendar, DollarSign, Eye, RefreshCw, Filter,
  Search, Download, Bell, Settings, Home, Grid3X3, List, ChevronRight,
  AlertCircle, Info, Target, Star, Flag, Bookmark, MessageSquare, Plus,
  ArrowUp, ArrowDown, Minus, MoreHorizontal, ExternalLink, Zap,
  Sun, Moon, Maximize2, Minimize2, ToggleLeft, ToggleRight, Layers,
  Building2, User, Shield, Award, Briefcase, CreditCard, Phone, Mail,
  MapPin, Globe, Edit3, Save, Upload, Image as ImageIcon, Hash,
  ThumbsUp, ThumbsDown, Send, Archive, Trash2, Copy, Share2
} from 'lucide-react';

const AgentOverview = () => {
  // ==================== STATE MANAGEMENT ====================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  
  // Dashboard Data
  const [dashboardStats, setDashboardStats] = useState({
    claimsStats: null,
    policiesStats: null,
    agentPolicies: null,
    expiringPolicies: null,
    recentActivity: []
  });
  
  // Quick Actions
  const [pendingClaims, setPendingClaims] = useState([]);
  const [urgentTasks, setUrgentTasks] = useState([]);
  
  // Filters and Views
  const [selectedTimeRange, setSelectedTimeRange] = useState('30days');
  const [selectedView, setSelectedView] = useState('overview'); // overview, claims, policies, activity
  const [compactMode, setCompactMode] = useState(false);
  
  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Performance Metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    approvalRate: 0,
    avgProcessingTime: 0,
    claimsProcessedThisMonth: 0,
    customerSatisfactionScore: 0
  });

  // ==================== UTILITY FUNCTIONS ====================
  const showToast = (message, type = 'info') => {
    // Simple toast notification (you can replace with your toast library)
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const getStatusColor = (status) => {
    const colors = {
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      insurer: 'bg-blue-100 text-blue-800 border-blue-200',
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      expired: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status?.toLowerCase()] || colors.pending;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600 bg-red-50',
      medium: 'text-yellow-600 bg-yellow-50',
      low: 'text-green-600 bg-green-50',
      critical: 'text-purple-600 bg-purple-50'
    };
    return colors[priority?.toLowerCase()] || colors.medium;
  };

  // ==================== API CALLS ====================
  const loadDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      console.log('Loading agent dashboard data...');

      // Check authentication
      if (!insuranceApiService.isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      // Load all dashboard data in parallel
      const [
        claimsStatsResponse,
        policiesStatsResponse,
        agentPoliciesResponse,
        expiringPoliciesResponse,
        pendingClaimsResponse
      ] = await Promise.allSettled([
        insuranceApiService.getClaimStatistics(),
        insuranceApiService.getPolicyStatistics(),
        insuranceApiService.getAgentPolicies({ limit: 10 }),
        insuranceApiService.getExpiringPolicies(30),
        insuranceApiService.getClaims({ claimStatus: 'insurer', limit: 5 })
      ]);

      console.log('Dashboard API responses:', {
        claimsStats: claimsStatsResponse,
        policiesStats: policiesStatsResponse,
        agentPolicies: agentPoliciesResponse,
        expiringPolicies: expiringPoliciesResponse,
        pendingClaims: pendingClaimsResponse
      });

      // Process responses
      const dashboardData = {
        claimsStats: claimsStatsResponse.status === 'fulfilled' ? claimsStatsResponse.value : null,
        policiesStats: policiesStatsResponse.status === 'fulfilled' ? policiesStatsResponse.value : null,
        agentPolicies: agentPoliciesResponse.status === 'fulfilled' ? agentPoliciesResponse.value : null,
        expiringPolicies: expiringPoliciesResponse.status === 'fulfilled' ? expiringPoliciesResponse.value : null,
        recentActivity: []
      };

      setDashboardStats(dashboardData);

      // Set pending claims
      if (pendingClaimsResponse.status === 'fulfilled') {
        const claimsData = pendingClaimsResponse.value?.data || pendingClaimsResponse.value?.claims || [];
        setPendingClaims(Array.isArray(claimsData) ? claimsData.slice(0, 5) : []);
      }

      // Generate performance metrics
      setPerformanceMetrics({
        approvalRate: Math.floor(Math.random() * 20) + 75, // Mock data
        avgProcessingTime: Math.floor(Math.random() * 5) + 2,
        claimsProcessedThisMonth: Math.floor(Math.random() * 50) + 25,
        customerSatisfactionScore: Math.floor(Math.random() * 10) + 85
      });

      // Generate notifications
      setNotifications([
        { id: 1, type: 'urgent', message: '3 claims require immediate attention', time: '5 mins ago' },
        { id: 2, type: 'info', message: 'Monthly report is ready for download', time: '1 hour ago' },
        { id: 3, type: 'warning', message: '2 policies expiring this week', time: '2 hours ago' }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error.message);
      
      // Set empty state
      setDashboardStats({
        claimsStats: null,
        policiesStats: null,
        agentPolicies: null,
        expiringPolicies: null,
        recentActivity: []
      });
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData(false);
    setRefreshing(false);
    showToast('Dashboard refreshed successfully', 'success');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        handleRefresh();
      }
    }, 5 * 60 * 1000); // Auto refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  // ==================== QUICK STATS COMPONENTS ====================
  const StatCard = ({ title, value, change, icon: Icon, color = 'blue', trend = 'up' }) => (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'} rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl bg-${color}-100`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
          <div>
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{title}</p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          </div>
        </div>
        {change && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>
    </div>
  );

  // ==================== RENDER QUICK STATS ====================
  const renderQuickStats = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 border animate-pulse`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    const stats = [
      {
        title: 'Total Claims',
        value: dashboardStats.claimsStats?.totalClaims || 0,
        change: '+12%',
        icon: FileText,
        color: 'blue',
        trend: 'up'
      },
      {
        title: 'Pending Review',
        value: pendingClaims.length || 0,
        change: '-8%',
        icon: Clock,
        color: 'orange',
        trend: 'down'
      },
      {
        title: 'Active Policies',
        value: dashboardStats.agentPolicies?.data?.length || 0,
        change: '+5%',
        icon: Shield,
        color: 'green',
        trend: 'up'
      },
      {
        title: 'Approval Rate',
        value: `${performanceMetrics.approvalRate}%`,
        change: '+2%',
        icon: CheckCircle,
        color: 'purple',
        trend: 'up'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    );
  };

  // ==================== RENDER RECENT CLAIMS ====================
  const renderRecentClaims = () => (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-sm`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Recent Claims Requiring Review
          </h3>
          <button
            onClick={() => window.location.href = '/agent/claims-review'}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
          >
            View All
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {pendingClaims.length === 0 ? (
          <div className="text-center py-12">
            <FileText className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
              No Pending Claims
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              All claims are up to date! Great work.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingClaims.map((claim, index) => (
              <div
                key={claim._id || index}
                className={`flex items-center justify-between p-4 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-xl transition-colors cursor-pointer`}
                onClick={() => window.location.href = `/agent/claims-review?claim=${claim._id}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${darkMode ? 'bg-blue-600' : 'bg-blue-100'} rounded-xl flex items-center justify-center`}>
                    <FileText className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {claim.claimId || `Claim #${index + 1}`}
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {claim.employeeId?.firstName} {claim.employeeId?.lastName} • {claim.claimType}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.claimStatus)}`}>
                    {claim.claimStatus?.replace('_', ' ').toUpperCase() || 'PENDING'}
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    {formatCurrency(claim.claimAmount?.requested || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ==================== RENDER PERFORMANCE METRICS ====================
  const renderPerformanceMetrics = () => (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-sm`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Performance Metrics
        </h3>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
          Your performance this month
        </p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Approval Rate
              </span>
              <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {performanceMetrics.approvalRate}%
              </span>
            </div>
            <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${performanceMetrics.approvalRate}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Avg Processing Time
              </span>
              <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {performanceMetrics.avgProcessingTime} days
              </span>
            </div>
            <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(7 - performanceMetrics.avgProcessingTime) * 14.28}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {performanceMetrics.claimsProcessedThisMonth}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Claims Processed
            </p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {performanceMetrics.customerSatisfactionScore}%
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Satisfaction Score
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // ==================== RENDER QUICK ACTIONS ====================
  const renderQuickActions = () => {
    const actions = [
      {
        title: 'Review Claims',
        description: 'Process pending insurance claims',
        icon: FileText,
        color: 'blue',
        count: pendingClaims.length,
        href: '/agent/claims-review'
      },
      {
        title: 'Manage Policies',
        description: 'View and update policy information',
        icon: Shield,
        color: 'green',
        count: dashboardStats.agentPolicies?.data?.length || 0,
        href: '/agent/policies'
      },
      {
        title: 'Generate Reports',
        description: 'Create performance and activity reports',
        icon: BarChart3,
        color: 'purple',
        href: '/agent/reports'
      },
      {
        title: 'Customer Support',
        description: 'Handle customer inquiries and support',
        icon: MessageSquare,
        color: 'orange',
        href: '/agent/support'
      }
    ];

    return (
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-sm`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Quick Actions
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => window.location.href = action.href}
                className={`flex items-center gap-4 p-4 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-900'} rounded-xl transition-all duration-200 text-left group hover:scale-105`}
              >
                <div className={`w-12 h-12 bg-${action.color}-100 rounded-xl flex items-center justify-center group-hover:bg-${action.color}-200 transition-colors`}>
                  <action.icon className={`w-6 h-6 text-${action.color}-600`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{action.title}</h4>
                    {action.count !== undefined && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${action.color}-100 text-${action.color}-600`}>
                        {action.count}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {action.description}
                  </p>
                </div>
                <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'} group-hover:translate-x-1 transition-transform`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ==================== MAIN RENDER ====================
  if (loading) {
    return (
      <div className={`min-h-screen p-6 transition-all duration-300 ${
        darkMode 
          ? 'bg-gray-900 text-white' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Agent Overview
            </h1>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
              Welcome back! Here's what's happening with your claims and policies.
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-3 ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-50 text-gray-900'} rounded-xl border transition-colors relative`}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className={`absolute right-0 mt-2 w-80 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-lg z-50`}>
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} cursor-pointer`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'urgent' ? 'bg-red-500' : 
                            notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {notification.message}
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-3 ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-50 text-gray-900'} rounded-xl border transition-colors`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-3 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50`}
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-400 mr-4 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Dashboard</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => loadDashboardData()}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {renderQuickStats()}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Claims */}
          {renderRecentClaims()}
          
          {/* Performance Metrics */}
          {renderPerformanceMetrics()}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          {renderQuickActions()}
        </div>
      </div>
    </div>
  );
};

export default AgentOverview;
