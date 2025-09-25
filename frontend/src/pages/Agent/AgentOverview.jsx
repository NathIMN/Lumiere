import React, { useState, useEffect, useCallback, useMemo } from 'react';
import insuranceApiService from '../../services/insurance-api';
import {
  BarChart3, TrendingUp, Clock, Users, DollarSign, AlertTriangle, CheckCircle, 
  XCircle, Target, Activity, Zap, Brain, Bell, Search, Filter, Eye, 
  MessageSquare, ThumbsUp, ThumbsDown, Star, Award, Calendar, Globe,
  Smartphone, Shield, Settings, RefreshCw, Download, Upload, Mic, 
  Moon, Sun, Layout, Grid3X3, List, MoreHorizontal, ChevronRight,
  PlayCircle, PauseCircle, Volume2, VolumeX, Maximize2, Minimize2
} from 'lucide-react';

const AdvancedAgentDashboard = () => {
  // ==================== DYNAMIC STATE MANAGEMENT ====================
  const [dashboardData, setDashboardData] = useState({
    realTimeStats: {},
    performanceMetrics: {},
    claimsData: [],
    notifications: [],
    workloadData: {},
    aiRecommendations: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Real-time features
  const [isLive, setIsLive] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // UI preferences
  const [theme, setTheme] = useState('light');
  const [layout, setLayout] = useState('grid');
  const [timeRange, setTimeRange] = useState('24h');
  const [focusMode, setFocusMode] = useState(false);

  // Personalization
  const [userPreferences, setUserPreferences] = useState({
    dashboardLayout: [],
    notifications: {},
    workingHours: {},
    goals: {}
  });

  // Performance tracking
  const [sessionStats, setSessionStats] = useState({
    startTime: new Date(),
    claimsProcessed: 0,
    averageProcessingTime: 0,
    accuracyScore: 0
  });

  // ==================== DYNAMIC API CALLS (NO HARDCODING) ====================
  
  // Get real-time dashboard analytics
  const loadRealTimeStats = useCallback(async () => {
    try {
      const response = await insuranceApiService.request('/analytics/agent/realtime', {
        method: 'GET'
      });
      return response.data || response;
    } catch (error) {
      console.error('Error loading real-time stats:', error);
      return {};
    }
  }, []);

  // Get agent performance metrics
  const loadPerformanceMetrics = useCallback(async (timeRange = '24h') => {
    try {
      const response = await insuranceApiService.request(`/analytics/agent/performance?timeRange=${timeRange}`, {
        method: 'GET'
      });
      return response.data || response;
    } catch (error) {
      console.error('Error loading performance metrics:', error);
      return {};
    }
  }, []);

  // Get AI-powered recommendations
  const loadAIRecommendations = useCallback(async () => {
    try {
      const response = await insuranceApiService.request('/ai/agent/recommendations', {
        method: 'GET'
      });
      return response.data || response;
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
      return [];
    }
  }, []);

  // Get agent workload analysis
  const loadWorkloadAnalysis = useCallback(async () => {
    try {
      const response = await insuranceApiService.request('/analytics/agent/workload', {
        method: 'GET'
      });
      return response.data || response;
    } catch (error) {
      console.error('Error loading workload analysis:', error);
      return {};
    }
  }, []);

  // Get real-time notifications
  const loadNotifications = useCallback(async () => {
    try {
      const response = await insuranceApiService.request('/notifications/agent/active', {
        method: 'GET'
      });
      return response.data || response;
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }, []);

  // Get agent efficiency insights
  const loadEfficiencyInsights = useCallback(async (timeRange = '7d') => {
    try {
      const response = await insuranceApiService.request(`/analytics/agent/efficiency?timeRange=${timeRange}`, {
        method: 'GET'
      });
      return response.data || response;
    } catch (error) {
      console.error('Error loading efficiency insights:', error);
      return {};
    }
  }, []);

  // Get claims requiring urgent attention
  const loadUrgentClaims = useCallback(async () => {
    try {
      const response = await insuranceApiService.request('/claims/agent/urgent', {
        method: 'GET'
      });
      return response.data || response;
    } catch (error) {
      console.error('Error loading urgent claims:', error);
      return [];
    }
  }, []);

  // Get predictive analytics
  const loadPredictiveAnalytics = useCallback(async () => {
    try {
      const response = await insuranceApiService.request('/analytics/agent/predictions', {
        method: 'GET'
      });
      return response.data || response;
    } catch (error) {
      console.error('Error loading predictive analytics:', error);
      return {};
    }
  }, []);

  // ==================== COMPREHENSIVE DATA LOADER ====================
  const loadAllDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      // Parallel loading for better performance
      const [
        realTimeStats,
        performanceMetrics,
        aiRecommendations,
        workloadData,
        notifications,
        urgentClaims,
        efficiencyInsights,
        predictiveData
      ] = await Promise.all([
        loadRealTimeStats(),
        loadPerformanceMetrics(timeRange),
        loadAIRecommendations(),
        loadWorkloadAnalysis(),
        loadNotifications(),
        loadUrgentClaims(),
        loadEfficiencyInsights(timeRange),
        loadPredictiveAnalytics()
      ]);

      setDashboardData({
        realTimeStats: realTimeStats || {},
        performanceMetrics: performanceMetrics || {},
        aiRecommendations: aiRecommendations || [],
        workloadData: workloadData || {},
        notifications: notifications || [],
        urgentClaims: urgentClaims || [],
        efficiencyInsights: efficiencyInsights || {},
        predictiveData: predictiveData || {}
      });

      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [timeRange, loadRealTimeStats, loadPerformanceMetrics, loadAIRecommendations, 
      loadWorkloadAnalysis, loadNotifications, loadUrgentClaims, loadEfficiencyInsights, loadPredictiveAnalytics]);

  // ==================== REAL-TIME FEATURES ====================
  
  // Set up real-time updates
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        loadAllDashboardData(false); // Don't show loading on auto-refresh
      }, 30000); // Refresh every 30 seconds

      setRefreshInterval(interval);
      return () => clearInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [isLive, loadAllDashboardData]);

  // Initial data load
  useEffect(() => {
    loadAllDashboardData();
  }, [loadAllDashboardData]);

  // ==================== AI-POWERED COMPONENTS ====================
  
  const AIRecommendationWidget = ({ recommendations = [] }) => (
    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-6 border border-violet-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-violet-200 rounded-xl">
          <Brain className="w-6 h-6 text-violet-700" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">AI Assistant</h3>
          <p className="text-violet-600">Smart recommendations for you</p>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.slice(0, 3).map((rec, index) => (
          <div key={index} className="bg-white rounded-xl p-4 border border-violet-200">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                rec.priority === 'high' ? 'bg-rose-100 text-rose-600' :
                rec.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                'bg-emerald-100 text-emerald-600'
              }`}>
                {rec.type === 'efficiency' ? <Zap className="w-4 h-4" /> :
                 rec.type === 'quality' ? <Star className="w-4 h-4" /> :
                 <Target className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                {rec.action && (
                  <button className="mt-2 text-sm text-violet-600 hover:text-violet-700 font-medium">
                    {rec.action} →
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const RealTimeStatsGrid = ({ stats = {} }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-3xl p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-200 rounded-xl">
            <Activity className="w-6 h-6 text-blue-700" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{stats.totalActions || 0}</div>
            <div className="text-sm text-blue-600">Total Actions</div>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {stats.actionsLastHour || 0} in last hour
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-6 border border-emerald-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-emerald-200 rounded-xl">
            <CheckCircle className="w-6 h-6 text-emerald-700" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{stats.approvedToday || 0}</div>
            <div className="text-sm text-emerald-600">Approved Today</div>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {stats.approvalRate || 0}% approval rate
        </div>
      </div>

      <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-3xl p-6 border border-rose-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-rose-200 rounded-xl">
            <XCircle className="w-6 h-6 text-rose-700" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{stats.rejectedToday || 0}</div>
            <div className="text-sm text-rose-600">Rejected Today</div>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {stats.rejectionRate || 0}% rejection rate
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-3xl p-6 border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-200 rounded-xl">
            <Clock className="w-6 h-6 text-purple-700" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{stats.pendingClaims || 0}</div>
            <div className="text-sm text-purple-600">Pending Claims</div>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {stats.criticalClaims || 0} critical priority
        </div>
      </div>
    </div>
  );

  const PerformanceAnalytics = ({ metrics = {} }) => (
    <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-200 to-purple-300 rounded-xl">
            <BarChart3 className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Performance Analytics</h3>
            <p className="text-gray-600">Your efficiency insights</p>
          </div>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-emerald-800">Processing Rate</span>
          </div>
          <div className="text-3xl font-bold text-emerald-600 mb-2">
            {metrics.processingRate || 0}%
          </div>
          <div className="text-sm text-emerald-600">
            {metrics.averageTime || 0} min avg time
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-800">Accuracy Score</span>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {metrics.accuracyScore || 0}%
          </div>
          <div className="text-sm text-blue-600">
            {metrics.correctDecisions || 0} correct decisions
          </div>
        </div>

        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-800">Quality Score</span>
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {metrics.qualityScore || 0}%
          </div>
          <div className="text-sm text-purple-600">
            {metrics.feedbackScore || 0} feedback score
          </div>
        </div>
      </div>
    </div>
  );

  const UrgentClaimsWidget = ({ urgentClaims = [] }) => (
    <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-3xl p-6 border border-rose-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-rose-200 rounded-xl">
          <AlertTriangle className="w-6 h-6 text-rose-700" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Urgent Claims</h3>
          <p className="text-rose-600">Requires immediate attention</p>
        </div>
      </div>

      <div className="space-y-4">
        {urgentClaims.slice(0, 5).map((claim, index) => (
          <div key={claim._id || index} className="bg-white rounded-xl p-4 border border-rose-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{claim.claimId}</h4>
                <p className="text-sm text-gray-600">{claim.employeeName}</p>
                <p className="text-sm text-rose-600 font-medium">
                  ${(claim.claimAmount || 0).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">{claim.daysOverdue}d overdue</div>
                <button className="mt-2 px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-sm font-medium transition-colors">
                  Review Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const WorkloadVisualization = ({ workloadData = {} }) => (
    <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-amber-200 to-orange-300 rounded-xl">
          <Activity className="w-6 h-6 text-amber-700" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Workload Analysis</h3>
          <p className="text-gray-600">Current capacity and distribution</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Current Workload</span>
          <span className="text-sm text-gray-500">{workloadData.currentLoad || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full transition-all duration-1000"
            style={{ width: `${workloadData.currentLoad || 0}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <div className="text-sm text-amber-600 font-medium">Peak Hours</div>
            <div className="text-lg font-bold text-gray-900">{workloadData.peakHours || 'N/A'}</div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            <div className="text-sm text-emerald-600 font-medium">Optimal Time</div>
            <div className="text-lg font-bold text-gray-900">{workloadData.optimalTime || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const NotificationCenter = ({ notifications = [] }) => (
    <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-200 to-indigo-300 rounded-xl">
            <Bell className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Notifications</h3>
            <p className="text-gray-600">{notifications.length} active alerts</p>
          </div>
        </div>
        <button
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          className={`p-2 rounded-lg transition-colors ${
            notificationsEnabled ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      <div className="space-y-3">
        {notifications.slice(0, 6).map((notification, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className={`p-2 rounded-lg ${
              notification.type === 'urgent' ? 'bg-rose-100 text-rose-600' :
              notification.type === 'info' ? 'bg-blue-100 text-blue-600' :
              'bg-emerald-100 text-emerald-600'
            }`}>
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
              <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
              <div className="text-xs text-gray-500 mt-2">{notification.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ==================== MAIN DASHBOARD RENDER ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg p-12 border border-gray-100">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mt-6">Loading Advanced Dashboard</h3>
              <p className="text-gray-600 mt-3 text-lg">Fetching real-time analytics and insights...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      
      {/* Enhanced Header */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-md">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Live Agent Overview</h1>
                <p className="text-gray-600 text-lg">Real-time claims processing analytics</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Live Status Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLive(!isLive)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    isLive 
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}
                >
                  {isLive ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                  {isLive ? 'Live' : 'Paused'}
                </button>
              </div>

              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={() => loadAllDashboardData()}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-md font-medium"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              {isLive && (
                <div className="flex items-center gap-2 text-emerald-600">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  Auto-refreshing every 30s
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Departments tracked: {dashboardData.realTimeStats.departmentsTracked || 0}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {/* Layout Toggle */}
              <button
                onClick={() => setLayout(layout === 'grid' ? 'list' : 'grid')}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                {layout === 'grid' ? <Grid3X3 className="w-5 h-5" /> : <List className="w-5 h-5" />}
              </button>

              {/* Focus Mode */}
              <button
                onClick={() => setFocusMode(!focusMode)}
                className={`p-2 rounded-lg transition-colors ${
                  focusMode ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Target className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="bg-rose-100 border border-rose-300 text-rose-700 px-6 py-4 rounded-2xl mb-8">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">Error Loading Dashboard</h3>
                <p className="mt-1">{error}</p>
                <button
                  onClick={() => loadAllDashboardData()}
                  className="mt-3 px-4 py-2 bg-rose-200 hover:bg-rose-300 text-rose-800 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Real-time Statistics */}
          <RealTimeStatsGrid stats={dashboardData.realTimeStats} />

          {/* Main Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Performance Analytics - Spans 2 columns */}
            <div className="lg:col-span-2">
              <PerformanceAnalytics metrics={dashboardData.performanceMetrics} />
            </div>

            {/* AI Recommendations */}
            <div>
              <AIRecommendationWidget recommendations={dashboardData.aiRecommendations} />
            </div>
          </div>

          {/* Secondary Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Urgent Claims */}
            <UrgentClaimsWidget urgentClaims={dashboardData.urgentClaims} />

            {/* Workload Analysis */}
            <WorkloadVisualization workloadData={dashboardData.workloadData} />
          </div>

          {/* Notifications Center */}
          <NotificationCenter notifications={dashboardData.notifications} />

          {/* Additional Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Quick Action Cards */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
              <div className="text-center">
                <div className="p-4 bg-emerald-200 rounded-full inline-block mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-700" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Quick Approve</h3>
                <p className="text-sm text-gray-600 mb-4">Bulk approve similar claims</p>
                <button className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 py-2 rounded-lg transition-colors">
                  Start Batch
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-6 border border-blue-200">
              <div className="text-center">
                <div className="p-4 bg-blue-200 rounded-full inline-block mb-4">
                  <Search className="w-8 h-8 text-blue-700" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Smart Search</h3>
                <p className="text-sm text-gray-600 mb-4">AI-powered claim search</p>
                <button className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 rounded-lg transition-colors">
                  Search Claims
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200">
              <div className="text-center">
                <div className="p-4 bg-purple-200 rounded-full inline-block mb-4">
                  <MessageSquare className="w-8 h-8 text-purple-700" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Team Chat</h3>
                <p className="text-sm text-gray-600 mb-4">Collaborate with HR</p>
                <button className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 rounded-lg transition-colors">
                  Open Chat
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
              <div className="text-center">
                <div className="p-4 bg-amber-200 rounded-full inline-block mb-4">
                  <Download className="w-8 h-8 text-amber-700" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Export Data</h3>
                <p className="text-sm text-gray-600 mb-4">Download reports</p>
                <button className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 py-2 rounded-lg transition-colors">
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAgentDashboard;
