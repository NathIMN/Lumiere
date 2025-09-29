
import React, { useState, useEffect, useCallback } from 'react';
import insuranceApiService from '../../services/insurance-api';
import {
  BarChart3, TrendingUp, Clock, Users, DollarSign, AlertTriangle, CheckCircle,
  XCircle, Target, Activity, Zap, Brain, Bell, Search, Filter, Eye,
  MessageSquare, ThumbsUp, ThumbsDown, Star, Award, Calendar, Globe,
  Smartphone, Shield, Settings, RefreshCw, Download, Upload, Mic,
  Moon, Sun, Layout, Grid3X3, List, MoreHorizontal, ChevronRight,
  PlayCircle, PauseCircle, Volume2, VolumeX, Maximize2, Minimize2,
  Flag, Info, FileText, Home, ArrowUp, ArrowDown
} from 'lucide-react';

const AgentOverview = () => {
  // ==================== STATE MANAGEMENT ====================
  const [dashboardData, setDashboardData] = useState({
    realTimeStats: {},
    claimsData: [],
    statistics: {},
    notifications: [],
    urgentClaims: [],
    workloadData: {}
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Real-time features
  const [isLive, setIsLive] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');

  // ==================== BACKEND API CALLS USING EXISTING ENDPOINTS ====================

  const loadAllClaimsData = useCallback(async () => {
    try {
      // Get all claims with different statuses
      const [allClaims, claimsStats, claimsRequiringAction] = await Promise.all([
        insuranceApiService.getClaims({ limit: 100, sortBy: 'updatedAt', sortOrder: 'desc' }),
        insuranceApiService.getClaimStatistics(),
        insuranceApiService.getClaimsRequiringAction()
      ]);

      console.log("BLAAAAAAA: ", allClaims);

      return { allClaims, claimsStats, claimsRequiringAction };
    } catch (error) {
      console.error('Error loading claims data:', error);
      return { allClaims: [], claimsStats: {}, claimsRequiringAction: [] };
    }
  }, []);

  const processRealTimeStats = useCallback((allClaims, claimsStats) => {
    const claimsArray = Array.isArray(allClaims) ? allClaims :
      allClaims?.claims || allClaims?.data || [];

    const today = new Date().toDateString();

    // Filter claims by today's activity
    const todaysClaims = claimsArray.filter(claim =>
      new Date(claim.updatedAt || claim.createdAt).toDateString() === today
    );

    const approvedToday = claimsArray.filter(claim =>
      claim.claimStatus === 'approved' &&
      new Date(claim.finalizedAt || claim.updatedAt).toDateString() === today
    );

    const rejectedToday = claimsArray.filter(claim =>
      claim.claimStatus === 'rejected' &&
      new Date(claim.finalizedAt || claim.updatedAt).toDateString() === today
    );

    const pendingClaims = claimsArray.filter(claim =>
      ['employee', 'hr', 'insurer'].includes(claim.claimStatus)
    );

    // Calculate critical claims (high amount or old)
    const criticalClaims = pendingClaims.filter(claim => {
      const amount = claim.claimAmount?.requested || 0;
      const daysSinceCreated = Math.floor(
        (new Date() - new Date(claim.createdAt)) / (1000 * 60 * 60 * 24)
      );
      return amount > 50000 || daysSinceCreated > 7;
    });

    // Calculate department tracking
    const departments = new Set();
    claimsArray.forEach(claim => {
      if (claim.employeeId?.employment?.department) {
        departments.add(claim.employeeId.employment.department);
      }
    });

    const totalToday = approvedToday.length + rejectedToday.length;
    const approvalRate = totalToday > 0 ? Math.round((approvedToday.length / totalToday) * 100) : 0;
    const rejectionRate = totalToday > 0 ? Math.round((rejectedToday.length / totalToday) * 100) : 0;

    return {
      totalActions: claimsArray.length,
      actionsLastHour: Math.floor(todaysClaims.length / 24), // Approximate
      approvedToday: approvedToday.length,
      rejectedToday: rejectedToday.length,
      approvalRate,
      rejectionRate,
      pendingClaims: pendingClaims.length,
      criticalClaims: criticalClaims.length,
      departmentsTracked: departments.size
    };
  }, []);

  const processPerformanceMetrics = useCallback((allClaims) => {
    const claimsArray = Array.isArray(allClaims) ? allClaims :
      allClaims?.claims || allClaims?.data || [];

    // Get processed claims only
    const processedClaims = claimsArray.filter(claim =>
      ['approved', 'rejected'].includes(claim.claimStatus)
    );

    const totalClaims = claimsArray.length;
    const processingRate = totalClaims > 0 ?
      Math.round((processedClaims.length / totalClaims) * 100) : 0;

    // Calculate average processing time (simplified)
    const avgProcessingTime = processedClaims.length > 0 ?
      processedClaims.reduce((acc, claim) => {
        const created = new Date(claim.createdAt);
        const updated = new Date(claim.updatedAt);
        return acc + Math.max(0, (updated - created) / (1000 * 60)); // minutes
      }, 0) / processedClaims.length : 0;

    // Simulate accuracy and quality scores based on data patterns
    const accuracyScore = Math.min(95, Math.max(75, processingRate + Math.random() * 10));
    const qualityScore = Math.min(98, Math.max(80, accuracyScore + Math.random() * 5));

    return {
      processingRate,
      accuracyScore: Math.round(accuracyScore),
      qualityScore: Math.round(qualityScore),
      averageTime: Math.round(avgProcessingTime),
      correctDecisions: processedClaims.length,
      feedbackScore: Math.round(qualityScore * 0.9)
    };
  }, []);

  const processUrgentClaims = useCallback((allClaims) => {
    const claimsArray = Array.isArray(allClaims) ? allClaims :
      allClaims?.claims || allClaims?.data || [];

    // Filter for claims requiring agent attention
    const agentClaims = claimsArray.filter(claim =>
      claim.claimStatus === 'insurer'
    );

    // Process urgent claims
    const urgentClaims = agentClaims
      .map(claim => {
        const daysSinceCreated = Math.floor(
          (new Date() - new Date(claim.createdAt)) / (1000 * 60 * 60 * 24)
        );

        const amount = claim.claimAmount?.requested || 0;
        const isUrgent = amount > 25000 || daysSinceCreated > 3;

        return {
          ...claim,
          daysOverdue: Math.max(0, daysSinceCreated - 3),
          isUrgent,
          employeeName: claim.employeeId ?
            `${claim.employeeId.profile?.firstName || claim.employeeId.firstName || 'Unknown'} ${claim.employeeId.profile?.lastName || claim.employeeId.lastName || 'Employee'}` :
            'Unknown Employee',
          priority: amount > 100000 ? 'critical' :
            amount > 50000 ? 'high' :
              daysSinceCreated > 7 ? 'high' : 'medium'
        };
      })
      .filter(claim => claim.isUrgent)
      .sort((a, b) => {
        // Sort by priority then by days overdue
        const priorityOrder = { critical: 3, high: 2, medium: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.daysOverdue - a.daysOverdue;
      })
      .slice(0, 10);

    return urgentClaims;
  }, []);

  const processWorkloadData = useCallback((allClaims) => {
    const claimsArray = Array.isArray(allClaims) ? allClaims :
      allClaims?.claims || allClaims?.data || [];

    const pendingClaims = claimsArray.filter(claim =>
      ['employee', 'hr', 'insurer'].includes(claim.claimStatus)
    );

    const totalClaims = claimsArray.length;
    const currentLoad = totalClaims > 0 ?
      Math.min(100, Math.round((pendingClaims.length / totalClaims) * 100)) : 0;

    // Analyze submission patterns for peak hours
    console.log(claimsArray)
    const hourCounts = {};
    claimsArray.forEach(claim => {
      //console.log("blaaaa: ",hour);
      const hour = new Date(claim.createdAt).getHours();
      
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
    console.log(hourCounts);
    if(hourCounts.length == null)
    hourCounts[0] = 1;

    const peakHour = Object.keys(hourCounts)?.reduce((a, b) =>
      hourCounts[a] > hourCounts[b] ? a : b
    );

    const peakHours = peakHour ? `${peakHour}:00 - ${parseInt(peakHour) + 1}:00` : 'N/A';
    const optimalTime = peakHour ?
      `${(parseInt(peakHour) + 12) % 24}:00 - ${(parseInt(peakHour) + 13) % 24}:00` : 'N/A';

    return {
      currentLoad,
      peakHours,
      optimalTime,
      pendingCount: pendingClaims.length,
      totalClaims
    };
  }, []);

  const generateAIRecommendations = useCallback((allClaims, urgentClaims) => {
    const claimsArray = Array.isArray(allClaims) ? allClaims :
      allClaims?.claims || allClaims?.data || [];

    const recommendations = [];

    // High-value claims recommendation
    const highValueClaims = claimsArray.filter(claim =>
      (claim.claimAmount?.requested || 0) > 50000 && claim.claimStatus === 'insurer'
    );

    if (highValueClaims.length > 3) {
      recommendations.push({
        type: 'efficiency',
        priority: 'high',
        title: 'Focus on High-Value Claims',
        description: `You have ${highValueClaims.length} high-value claims (>$50,000) awaiting your review. Consider prioritizing these to reduce financial exposure.`,
        action: 'Review High-Value Claims',
        metadata: { count: highValueClaims.length }
      });
    }

    // Overdue claims recommendation
    if (urgentClaims.length > 2) {
      recommendations.push({
        type: 'quality',
        priority: 'medium',
        title: 'Review Overdue Claims',
        description: `${urgentClaims.length} claims are overdue. Consider reviewing these to maintain service quality standards.`,
        action: 'View Overdue Claims',
        metadata: { count: urgentClaims.length }
      });
    }

    // Batch processing recommendation
    const insurerClaims = claimsArray.filter(claim => claim.claimStatus === 'insurer');
    if (insurerClaims.length > 10) {
      const claimsByType = {};
      insurerClaims.forEach(claim => {
        const key = `${claim.claimType}-${claim.lifeClaimOption || claim.vehicleClaimOption}`;
        if (!claimsByType[key]) claimsByType[key] = [];
        claimsByType[key].push(claim);
      });

      const similarClaims = Object.values(claimsByType).find(group => group.length >= 3);
      if (similarClaims) {
        recommendations.push({
          type: 'efficiency',
          priority: 'low',
          title: 'Batch Process Similar Claims',
          description: `You have ${similarClaims.length} similar claims that could be processed together for improved efficiency.`,
          action: 'Start Batch Processing',
          metadata: {
            type: `${similarClaims[0].claimType} - ${similarClaims[0].lifeClaimOption || similarClaims[0].vehicleClaimOption}`,
            count: similarClaims.length
          }
        });
      }
    }

    // Performance improvement recommendation
    const processedThisWeek = claimsArray.filter(claim => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return ['approved', 'rejected'].includes(claim.claimStatus) &&
        new Date(claim.updatedAt) >= weekAgo;
    });

    if (processedThisWeek.length < 5 && insurerClaims.length > 0) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        title: 'Increase Processing Rate',
        description: `You've processed ${processedThisWeek.length} claims this week. Consider setting aside dedicated time for claim reviews.`,
        action: 'View Processing Tips',
        metadata: { weeklyCount: processedThisWeek.length }
      });
    }

    return recommendations;
  }, []);

  const processNotifications = useCallback((claimsRequiringAction, urgentClaims) => {
    const notifications = [];

    // Claims requiring action notification
    const actionClaims = Array.isArray(claimsRequiringAction) ? claimsRequiringAction :
      claimsRequiringAction?.claims || [];

    if (actionClaims.length > 0) {
      notifications.push({
        type: 'info',
        title: 'Claims Awaiting Review',
        message: `You have ${actionClaims.length} claims requiring your attention.`,
        time: new Date().toLocaleTimeString(),
        category: 'claims'
      });
    }

    // Critical claims notification
    const criticalClaims = urgentClaims.filter(claim => claim.priority === 'critical');
    if (criticalClaims.length > 0) {
      notifications.push({
        type: 'urgent',
        title: 'Critical Claims Alert',
        message: `${criticalClaims.length} high-value claims require immediate attention.`,
        time: new Date().toLocaleTimeString(),
        category: 'claims'
      });
    }

    // System status notification
    notifications.push({
      type: 'success',
      title: 'System Status',
      message: 'All systems operational. Dashboard data updated successfully.',
      time: new Date().toLocaleTimeString(),
      category: 'system'
    });

    return notifications;
  }, []);

  // ==================== COMPREHENSIVE DATA LOADER ====================
  const loadAllDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const { allClaims, claimsStats, claimsRequiringAction } = await loadAllClaimsData();

      // Process all analytics from the loaded data
      const realTimeStats = processRealTimeStats(allClaims, claimsStats);
      const performanceMetrics = processPerformanceMetrics(allClaims);
      const urgentClaims = processUrgentClaims(allClaims);
      const workloadData = processWorkloadData(allClaims);
      const aiRecommendations = generateAIRecommendations(allClaims, urgentClaims);
      const notifications = processNotifications(claimsRequiringAction, urgentClaims);

      setDashboardData({
        realTimeStats,
        performanceMetrics,
        urgentClaims,
        workloadData,
        aiRecommendations,
        notifications,
        claimsData: allClaims,
        statistics: claimsStats
      });

      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data: ' + error.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [loadAllClaimsData, processRealTimeStats, processPerformanceMetrics,
    processUrgentClaims, processWorkloadData, generateAIRecommendations, processNotifications]);

  // ==================== EFFECTS ====================

  // Real-time updates
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        loadAllDashboardData(false);
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

  // ==================== ACTION HANDLERS ====================

  

  const handleSmartSearch = () => {
    console.log('Opening smart search...');
    // Navigate to claims search page
  };

  const handleExportData = async () => {
    try {
      console.log('Generating dashboard report...');
      // You can use the existing reports endpoint
      const reportData = {
        reportName: 'Agent Dashboard Report',
        reportType: 'claims',
        filters: {
          dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          dateTo: new Date(),
          agent: localStorage.getItem('userId')
        },
        format: 'pdf'
      };

      // This would call your existing reports endpoint
      console.log('Report data prepared:', reportData);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const handleOpenTeamChat = () => {
    console.log('Opening team communication...');
    // Navigate to messages or communications page
  };

  // ==================== UI COMPONENTS ====================

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
        <div className="text-sm text-gray-600 flex items-center gap-1">
          <ArrowUp className="w-4 h-4 text-emerald-500" />
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
        <div className="text-sm text-gray-600 flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
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
        <div className="text-sm text-gray-600 flex items-center gap-1">
          <ArrowDown className="w-4 h-4 text-rose-500" />
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
        <div className="text-sm text-gray-600 flex items-center gap-1">
          <Flag className="w-4 h-4 text-rose-500" />
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
            {Math.round(metrics.averageTime || 0)} min avg time
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
        {urgentClaims.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
            <p>No urgent claims at the moment</p>
            <p className="text-sm">Great job staying on top of your workload!</p>
          </div>
        ) : (
          urgentClaims.slice(0, 5).map((claim, index) => (
            <div key={claim._id || index} className="bg-white rounded-xl p-4 border border-rose-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{claim.claimId}</h4>
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${claim.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        claim.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                          'bg-yellow-100 text-yellow-700'
                      }`}>
                      {claim.priority?.toUpperCase()}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{claim.employeeName}</p>
                  <p className="text-sm text-rose-600 font-medium">
                    ${(claim.claimAmount?.requested || 0).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {claim.claimType} - {claim.lifeClaimOption || claim.vehicleClaimOption}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {claim.daysOverdue || 0}d overdue
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <button
                    onClick={() => {
                      console.log('Navigating to claim:', claim.claimId);
                      // Navigate to claim details
                    }}
                    className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Review Now
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
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
            className={`h-3 rounded-full transition-all duration-1000 ${workloadData.currentLoad > 80 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                workloadData.currentLoad > 60 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                  'bg-gradient-to-r from-emerald-400 to-green-500'
              }`}
            style={{ width: `${Math.min(100, workloadData.currentLoad || 0)}%` }}
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

        <div className="mt-4 p-3 bg-gray-50 rounded-xl">
          <div className="text-sm text-gray-600">
            <strong>{workloadData.pendingCount || 0}</strong> pending claims out of <strong>{workloadData.totalClaims || 0}</strong> total
          </div>
        </div>
      </div>
    </div>
  );

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
        {recommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-3 text-violet-500" />
            <p>No recommendations available</p>
            <p className="text-sm">Your workflow is optimized!</p>
          </div>
        ) : (
          recommendations.slice(0, 3).map((rec, index) => {
            const priorityConfig = {
              high: { color: 'bg-rose-100 text-rose-700 border-rose-200', icon: AlertTriangle },
              medium: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Flag },
              low: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Info }
            };

            const config = priorityConfig[rec.priority] || priorityConfig.low;
            const IconComponent = config.icon;

            return (
              <div key={index} className="bg-white rounded-xl p-4 border border-violet-200 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                    {rec.metadata && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span>Count: {rec.metadata.count}</span>
                        {rec.metadata.type && <span>Type: {rec.metadata.type}</span>}
                      </div>
                    )}
                    {rec.action && (
                      <button
                        onClick={() => {
                          console.log('AI Recommendation action:', rec.action);
                          // Handle recommendation action
                        }}
                        className="mt-2 text-sm text-violet-600 hover:text-violet-700 font-medium"
                      >
                        {rec.action} →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
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
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No notifications</p>
          </div>
        ) : (
          notifications.slice(0, 6).map((notification, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
              <div className={`p-2 rounded-lg ${notification.type === 'urgent' ? 'bg-rose-100 text-rose-600' :
                  notification.type === 'info' ? 'bg-blue-100 text-blue-600' :
                    'bg-emerald-100 text-emerald-600'
                }`}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-gray-500">{notification.time}</div>
                  <div className={`text-xs px-2 py-1 rounded ${notification.category === 'claims' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                    {notification.category}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // ==================== MAIN RENDER ====================

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
              <h3 className="text-2xl font-semibold text-gray-800 mt-6">Loading Agent Overview</h3>
              <p className="text-gray-600 mt-3 text-lg">Analyzing claims data and generating insights...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Main Dashboard Content - Everything scrollable together */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section - Now part of main content */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 mb-6 shadow-sm">
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
              <button
                onClick={() => setIsLive(!isLive)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isLive
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}
              >
                {isLive ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                {isLive ? 'Live' : 'Paused'}
              </button>

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

          {/* Status Bar - Now inside main content */}
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
                Departments tracked: {dashboardData.realTimeStats?.departmentsTracked || 0}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Home className="w-4 h-4" />
              Using existing backend data
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
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

          {/* Quick Action Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Quick Action Cards */}
            

            <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={handleSmartSearch}>
              <div className="text-center">
                <div className="p-4 bg-blue-200 rounded-full inline-block mb-4">
                  <Search className="w-8 h-8 text-blue-700" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Smart Search</h3>
                <p className="text-sm text-gray-600 mb-4">AI-powered claim search</p>
                <div className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 rounded-lg transition-colors text-center">
                  Search Claims
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={handleOpenTeamChat}>
              <div className="text-center">
                <div className="p-4 bg-purple-200 rounded-full inline-block mb-4">
                  <MessageSquare className="w-8 h-8 text-purple-700" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Team Chat</h3>
                <p className="text-sm text-gray-600 mb-4">Collaborate with HR</p>
                <div className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 rounded-lg transition-colors text-center">
                  Open Chat
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={handleExportData}>
              <div className="text-center">
                <div className="p-4 bg-amber-200 rounded-full inline-block mb-4">
                  <Download className="w-8 h-8 text-amber-700" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Export Data</h3>
                <p className="text-sm text-gray-600 mb-4">Download reports</p>
                <div className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 py-2 rounded-lg transition-colors text-center">
                  Generate
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentOverview;
