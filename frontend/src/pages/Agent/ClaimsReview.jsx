import React, { useState, useEffect, useCallback, useMemo } from 'react';
import insuranceApiService from '../../services/insurance-api';
import {
  Search, Filter, Eye, Clock, AlertTriangle, CheckCircle, XCircle, FileText, User, Building2,
  Calendar, DollarSign, ChevronRight, RefreshCw, MoreHorizontal, ArrowRight, ArrowLeft, Star,
  Flag, Download, Upload, MessageSquare, Send, Edit3, Zap, TrendingUp, Activity, Users, PieChart,
  AlertCircle, Info, Target, BarChart3, ThumbsUp, ThumbsDown, RotateCcw, Bookmark, BookmarkCheck,
  Settings, Plus, Minus, Save, X, Check, Grid3X3, List, Maximize2, Minimize2, SortAsc, SortDesc,
  Home, Bell, Menu, ChevronDown, ChevronUp, Layers, Square, CheckSquare, Filter as FilterIcon,
  Layout, Globe, Sliders, ToggleLeft, ToggleRight, Palette, Moon, Sun, ChevronLeft, ChevronsLeft, ChevronsRight
} from 'lucide-react';

const ClaimsReview = () => {
  // ==================== STATE MANAGEMENT ====================
  const [pendingClaims, setPendingClaims] = useState([]);
  const [processedClaims, setProcessedClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Enhanced UI State
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedClaims, setSelectedClaims] = useState(new Set());
  const [expandedCards, setExpandedCards] = useState(new Set());

  // View State for toggling between pending and processed
  const [activeView, setActiveView] = useState('pending');

  // Advanced Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'updatedAt', direction: 'desc' });
  const [quickFiltersVisible, setQuickFiltersVisible] = useState(true);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // View & Layout Options
  const [viewMode, setViewMode] = useState('cards');
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [groupBy, setGroupBy] = useState('none');

  // Real-time Features
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Form States for CRUD operations
  const [approveForm, setApproveForm] = useState({ approvedAmount: '', insurerNotes: '' });
  const [rejectForm, setRejectForm] = useState({ rejectionReason: '', insurerNotes: '' });
  const [returnForm, setReturnForm] = useState({ returnReason: '' });

  // Enhanced Statistics
  const [statistics, setStatistics] = useState({
    totalPending: 0, highPriority: 0, overdueClaims: 0, totalValue: 0,
    averageAmount: 0, approvedToday: 0, rejectedToday: 0, returnedToday: 0,
    processingTime: 0, completionRate: 0
  });

  // ==================== WORKFLOW STATUS CONSTANTS ====================
  const WORKFLOW_STATUSES = {
    EMPLOYEE_SUBMITTED: 'employee',
    HR_REVIEW: 'hr', 
    SENT_TO_AGENT: 'insurer',
    COMPLETED: 'completed'
  };

  const CLAIM_DECISIONS = {
    APPROVED: 'approved',
    REJECTED: 'rejected', 
    RETURNED: 'returned'
  };

  // ==================== UTILITY FUNCTIONS ====================
  
  const calculatePriority = (claim) => {
    const amount = claim.claimAmount || 0;
    const daysSinceSubmission = Math.floor(
      (new Date() - new Date(claim.createdAt)) / (1000 * 60 * 60 * 24)
    );

    if (amount > 100000 || daysSinceSubmission > 7) return 'critical';
    if (amount > 50000 || daysSinceSubmission > 5) return 'high';
    if (amount > 25000 || daysSinceSubmission > 3) return 'medium';
    return 'low';
  };

  const isClaimOverdue = (claim) => {
    const daysSinceSubmission = Math.floor(
      (new Date() - new Date(claim.createdAt)) / (1000 * 60 * 60 * 24)
    );
    return daysSinceSubmission > 3;
  };

  const calculateDaysOverdue = (claim) => {
    const daysSinceSubmission = Math.floor(
      (new Date() - new Date(claim.createdAt)) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, daysSinceSubmission - 3);
  };

  const calculateCompletionScore = (claim) => {
    let score = 50;
    if (claim.questionnaire?.isComplete) score += 30;
    if (claim.documents?.length > 0) score += 20;
    return Math.min(100, score);
  };

  const extractClaimsFromResponse = (response) => {
    if (response.success && response.data) {
      return Array.isArray(response.data) ? response.data : [response.data];
    } else if (response.claims) {
      return Array.isArray(response.claims) ? response.claims : [response.claims];
    } else if (Array.isArray(response)) {
      return response;
    } else if (response.data) {
      return Array.isArray(response.data) ? response.data : [response.data];
    }
    return [];
  };

  const updateStatistics = (pending, processed) => {
    const totalPending = pending.length;
    const totalProcessed = processed.length;
    const highPriority = pending.filter(claim => 
      ['critical', 'high'].includes(calculatePriority(claim))
    ).length;
    const overdueClaims = pending.filter(isClaimOverdue).length;
    const totalValue = pending.reduce((sum, claim) => sum + (claim.claimAmount || 0), 0);
    
    setStatistics({
      totalPending,
      highPriority,
      overdueClaims,
      totalValue,
      averageAmount: totalPending > 0 ? Math.round(totalValue / totalPending) : 0,
      approvedToday: processed.filter(claim => 
        claim.claimStatus === 'approved' && 
        new Date(claim.updatedAt).toDateString() === new Date().toDateString()
      ).length,
      rejectedToday: processed.filter(claim => 
        claim.claimStatus === 'rejected' && 
        new Date(claim.updatedAt).toDateString() === new Date().toDateString()
      ).length,
      returnedToday: processed.filter(claim => 
        claim.claimStatus === 'returned' && 
        new Date(claim.updatedAt).toDateString() === new Date().toDateString()
      ).length,
      processingTime: 0,
      completionRate: totalProcessed > 0 ? Math.round((totalProcessed / (totalPending + totalProcessed)) * 100) : 0
    });
  };

  const getErrorMessage = (error, defaultMessage) => {
    if (error.status === 400 && error.data) {
      return error.data.message || error.data.error || defaultMessage;
    } else if (error.status === 401) {
      return 'Authentication failed. Please login again.';
    } else if (error.status === 403) {
      return 'Permission denied. You must be an insurance agent.';
    } else if (error.message) {
      return error.message;
    }
    return defaultMessage;
  };

  const showToast = (message, type = 'info') => {
    console.log(`Toast: ${type} - ${message}`);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClaim(null);
    setModalType('');
    resetForms();
  };

  const resetForms = () => {
    setApproveForm({ approvedAmount: '', insurerNotes: '' });
    setRejectForm({ rejectionReason: '', insurerNotes: '' });
    setReturnForm({ returnReason: '' });
  };

  // ==================== 🔧 FIXED API CALLS ====================
  
  const loadPendingClaims = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      console.log('Loading pending claims for agent...');
      
      const response = await insuranceApiService.getClaims({
        claimStatus: 'insurer',
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        limit: 100
      });

      console.log('API Response for pending claims:', response);

      let claimsData = [];
      if (response.success && response.data) {
        claimsData = response.data;
      } else if (response.claims) {
        claimsData = response.claims;
      } else if (Array.isArray(response)) {
        claimsData = response;
      } else if (response.data) {
        claimsData = Array.isArray(response.data) ? response.data : [response.data];
      }

      console.log('Parsed claims data:', claimsData);

      const validPendingClaims = claimsData.filter(claim => {
        const isForAgent = claim.claimStatus === 'insurer';
        const hasValidData = claim.claimId && claim.claimAmount;
        
        console.log(`Checking claim ${claim.claimId}:`, {
          claimStatus: claim.claimStatus,
          isForAgent,
          hasValidData
        });

        return isForAgent && hasValidData;
      });

      console.log(`Found ${validPendingClaims.length} valid pending claims`);

      const enhancedClaims = validPendingClaims.map(claim => ({
        ...claim,
        priority: calculatePriority(claim),
        isOverdue: isClaimOverdue(claim),
        daysOverdue: calculateDaysOverdue(claim),
        completionScore: calculateCompletionScore(claim)
      }));

      setPendingClaims(enhancedClaims);
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error loading pending claims:', error);
      setError(`Failed to load pending claims: ${error.message}`);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []); // 🔧 FIXED: Removed dependencies to prevent loop

  const loadProcessedClaims = useCallback(async () => {
    try {
      console.log('Loading processed claims for agent...');

      const [approvedResponse, rejectedResponse] = await Promise.all([
        insuranceApiService.getClaims({ 
          claimStatus: 'approved',
          sortBy: 'updatedAt',
          sortOrder: 'desc',
          limit: 50 
        }),
        insuranceApiService.getClaims({ 
          claimStatus: 'rejected',
          sortBy: 'updatedAt',
          sortOrder: 'desc',
          limit: 50 
        })
      ]);

      let allProcessedClaims = [];

      const approvedClaims = extractClaimsFromResponse(approvedResponse);
      allProcessedClaims.push(...approvedClaims);

      const rejectedClaims = extractClaimsFromResponse(rejectedResponse);
      allProcessedClaims.push(...rejectedClaims);

      try {
        const returnedResponse = await insuranceApiService.getClaims({ 
          claimStatus: 'returned', 
          sortBy: 'updatedAt',
          sortOrder: 'desc',
          limit: 25 
        });
        const returnedClaims = extractClaimsFromResponse(returnedResponse);
        allProcessedClaims.push(...returnedClaims);
      } catch (error) {
        console.log('Returned claims not available or no returned claims found');
      }

      console.log('All processed claims:', allProcessedClaims);

      const validProcessedClaims = allProcessedClaims.filter(claim => {
        const isProcessed = ['approved', 'rejected', 'returned'].includes(claim.claimStatus);
        const hasDecisionData = claim.approvedAmount || claim.rejectionReason || claim.returnReason;
        
        return isProcessed && hasDecisionData;
      });

      validProcessedClaims.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      
      setProcessedClaims(validProcessedClaims);

    } catch (error) {
      console.error('Error loading processed claims:', error);
    }
  }, []); // 🔧 FIXED: Removed dependencies to prevent loop

  // ==================== 🔧 FIXED useEffect ====================
  
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        await loadPendingClaims(false); // Don't show loading for individual calls
        await loadProcessedClaims();
        
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load claims data');
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []); // 🔧 FIXED: Empty dependency array prevents infinite loop

  // Update statistics when claims data changes
  useEffect(() => {
    updateStatistics(pendingClaims, processedClaims);
  }, [pendingClaims, processedClaims]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadPendingClaims(false);
        loadProcessedClaims();
      }, 30000);

      setRefreshInterval(interval);
      return () => clearInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [autoRefresh, loadPendingClaims, loadProcessedClaims]);

  // ==================== ACTION HANDLERS ====================
  
  const handleApprove = async () => {
    if (!selectedClaim || !approveForm.approvedAmount) {
      showToast('Please enter approved amount', 'error');
      return;
    }

    const approvedAmount = parseFloat(approveForm.approvedAmount);
    if (isNaN(approvedAmount) || approvedAmount <= 0) {
      showToast('Please enter a valid approved amount', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const decisionData = {
        status: 'approved',
        approvedAmount: approvedAmount
      };

      if (approveForm.insurerNotes?.trim()) {
        decisionData.insurerNotes = approveForm.insurerNotes.trim();
      }

      const claimId = selectedClaim._id || selectedClaim.id;
      console.log('Approving claim:', { claimId, decisionData });
      
      await insuranceApiService.makeClaimDecision(claimId, decisionData);
      
      setPendingClaims(prev => prev.filter(claim => 
        (claim._id || claim.id) !== claimId
      ));
      
      const updatedClaim = {
        ...selectedClaim,
        claimStatus: 'approved',
        approvedAmount: approvedAmount,
        insurerNotes: decisionData.insurerNotes,
        updatedAt: new Date().toISOString()
      };
      setProcessedClaims(prev => [updatedClaim, ...prev]);
      
      showToast('Claim approved successfully! 🎉', 'success');
      closeModal();

    } catch (error) {
      console.error('Error approving claim:', error);
      showToast(getErrorMessage(error, 'Failed to approve claim'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedClaim || !rejectForm.rejectionReason?.trim()) {
      showToast('Please enter rejection reason', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const decisionData = {
        status: 'rejected',
        rejectionReason: rejectForm.rejectionReason.trim()
      };

      if (rejectForm.insurerNotes?.trim()) {
        decisionData.insurerNotes = rejectForm.insurerNotes.trim();
      }

      const claimId = selectedClaim._id || selectedClaim.id;
      console.log('Rejecting claim:', { claimId, decisionData });
      
      await insuranceApiService.makeClaimDecision(claimId, decisionData);

      setPendingClaims(prev => prev.filter(claim => 
        (claim._id || claim.id) !== claimId
      ));
      
      const updatedClaim = {
        ...selectedClaim,
        claimStatus: 'rejected',
        rejectionReason: decisionData.rejectionReason,
        insurerNotes: decisionData.insurerNotes,
        updatedAt: new Date().toISOString()
      };
      setProcessedClaims(prev => [updatedClaim, ...prev]);

      showToast('Claim rejected successfully', 'success');
      closeModal();

    } catch (error) {
      console.error('Error rejecting claim:', error);
      showToast(getErrorMessage(error, 'Failed to reject claim'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!selectedClaim || !returnForm.returnReason?.trim()) {
      showToast('Please enter return reason', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const claimId = selectedClaim._id || selectedClaim.id;
      console.log('Returning claim:', { claimId, reason: returnForm.returnReason.trim() });
      
      await insuranceApiService.returnClaim(claimId, returnForm.returnReason.trim());

      setPendingClaims(prev => prev.filter(claim => 
        (claim._id || claim.id) !== claimId
      ));
      
      const updatedClaim = {
        ...selectedClaim,
        claimStatus: 'returned',
        returnReason: returnForm.returnReason.trim(),
        updatedAt: new Date().toISOString()
      };
      setProcessedClaims(prev => [updatedClaim, ...prev]);

      showToast('Claim returned successfully', 'success');
      closeModal();

    } catch (error) {
      console.error('Error returning claim:', error);
      showToast(getErrorMessage(error, 'Failed to return claim'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Manual refresh handler
  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPendingClaims(false),
        loadProcessedClaims()
      ]);
    } catch (error) {
      console.error('Error refreshing:', error);
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // ==================== RENDER SECTION ====================
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse mx-auto"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Loading Claims</h3>
            <p className="text-gray-600">Fetching claims data from server...</p>
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-white/90 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Claims Review</h1>
                <p className="text-gray-600">Insurance Agent Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setActiveView('pending')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeView === 'pending' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Pending ({pendingClaims.length})
                </button>
                <button
                  onClick={() => setActiveView('processed')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeView === 'processed' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Processed ({processedClaims.length})
                </button>
              </div>

              {/* Auto-refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  autoRefresh 
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto On' : 'Auto Off'}
              </button>

              {/* Manual Refresh */}
              <button
                onClick={handleManualRefresh}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg"
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
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                High priority: {statistics.highPriority}
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total value: ${statistics.totalValue.toLocaleString()}
              </div>
            </div>

            {error && (
              <div className="text-rose-600 text-sm">
                Error: {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-3xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-200 rounded-xl">
                <Clock className="w-6 h-6 text-blue-700" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{statistics.totalPending}</div>
                <div className="text-sm text-blue-600">Pending Claims</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {statistics.highPriority} high priority
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-6 border border-emerald-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-200 rounded-xl">
                <CheckCircle className="w-6 h-6 text-emerald-700" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{statistics.approvedToday}</div>
                <div className="text-sm text-emerald-600">Approved Today</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {statistics.completionRate}% completion rate
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-3xl p-6 border border-rose-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-rose-200 rounded-xl">
                <XCircle className="w-6 h-6 text-rose-700" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{statistics.rejectedToday}</div>
                <div className="text-sm text-rose-600">Rejected Today</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {statistics.returnedToday} returned today
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-200 rounded-xl">
                <DollarSign className="w-6 h-6 text-amber-700" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">${statistics.averageAmount.toLocaleString()}</div>
                <div className="text-sm text-amber-600">Average Amount</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {statistics.overdueClaims} overdue claims
            </div>
          </div>
        </div>

        {/* Claims Display */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeView === 'pending' ? 'Pending Claims' : 'Processed Claims'}
            </h2>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search claims..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={sortConfig.key}
                onChange={(e) => setSortConfig({ key: e.target.value, direction: sortConfig.direction })}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="updatedAt">Sort by Date</option>
                <option value="claimAmount">Sort by Amount</option>
                <option value="priority">Sort by Priority</option>
              </select>
            </div>
          </div>

          {/* Claims Grid or List */}
          {activeView === 'pending' ? (
            <PendingClaimsView 
              claims={pendingClaims}
              onApprove={(claim) => {
                setSelectedClaim(claim);
                setModalType('approve');
                setShowModal(true);
              }}
              onReject={(claim) => {
                setSelectedClaim(claim);
                setModalType('reject');
                setShowModal(true);
              }}
              onReturn={(claim) => {
                setSelectedClaim(claim);
                setModalType('return');
                setShowModal(true);
              }}
              onViewDetails={(claim) => {
                setSelectedClaim(claim);
                setModalType('details');
                setShowModal(true);
              }}
              searchTerm={searchTerm}
              sortConfig={sortConfig}
            />
          ) : (
            <ProcessedClaimsView 
              claims={processedClaims}
              onViewDetails={(claim) => {
                setSelectedClaim(claim);
                setModalType('details');
                setShowModal(true);
              }}
              searchTerm={searchTerm}
              sortConfig={sortConfig}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && selectedClaim && (
        <ClaimActionModal
          claim={selectedClaim}
          modalType={modalType}
          onClose={closeModal}
          onApprove={handleApprove}
          onReject={handleReject}
          onReturn={handleReturn}
          approveForm={approveForm}
          setApproveForm={setApproveForm}
          rejectForm={rejectForm}
          setRejectForm={setRejectForm}
          returnForm={returnForm}
          setReturnForm={setReturnForm}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
};

// ==================== HELPER COMPONENTS ====================

const PendingClaimsView = ({ claims, onApprove, onReject, onReturn, onViewDetails, searchTerm, sortConfig }) => {
  const filteredClaims = useMemo(() => {
    let filtered = claims.filter(claim => 
      claim.claimId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.claimType?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [claims, searchTerm, sortConfig]);

  if (filteredClaims.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Eye className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Claims</h3>
        <p className="text-gray-600 mb-6">There are no claims waiting for your review at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredClaims.map((claim) => (
        <PendingClaimCard
          key={claim._id || claim.id}
          claim={claim}
          onApprove={() => onApprove(claim)}
          onReject={() => onReject(claim)}
          onReturn={() => onReturn(claim)}
          onViewDetails={() => onViewDetails(claim)}
        />
      ))}
    </div>
  );
};

const PendingClaimCard = ({ claim, onApprove, onReject, onReturn, onViewDetails }) => {
  const priorityConfig = {
    critical: { color: 'bg-rose-100 text-rose-700 border-rose-200', icon: AlertTriangle },
    high: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Flag },
    medium: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Info },
    low: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle }
  };

  const config = priorityConfig[claim.priority] || priorityConfig.low;
  const IconComponent = config.icon;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Priority Header */}
      <div className={`px-6 py-3 border-b ${config.color} border`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconComponent className="w-4 h-4" />
            <span className="text-sm font-medium capitalize">{claim.priority} Priority</span>
          </div>
          {claim.isOverdue && (
            <div className="text-xs text-rose-600 font-medium">
              {claim.daysOverdue}d overdue
            </div>
          )}
        </div>
      </div>

      {/* Claim Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">{claim.claimId}</h3>
          <button
            onClick={onViewDetails}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Employee:</span>
            <span className="font-medium text-gray-900">{claim.employeeName || 'N/A'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Type:</span>
            <span className="font-medium text-gray-900 capitalize">{claim.claimType || 'N/A'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Amount:</span>
            <span className="font-bold text-blue-600">${(claim.claimAmount || 0).toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Submitted:</span>
            <span className="text-gray-900">{new Date(claim.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onApprove}
            className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <CheckCircle className="w-4 h-4 inline mr-2" />
            Approve
          </button>
          
          <button
            onClick={onReject}
            className="flex-1 bg-rose-100 hover:bg-rose-200 text-rose-700 px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <XCircle className="w-4 h-4 inline mr-2" />
            Reject
          </button>
          
          <button
            onClick={onReturn}
            className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-2 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ProcessedClaimsView = ({ claims, onViewDetails, searchTerm, sortConfig }) => {
  const filteredClaims = useMemo(() => {
    let filtered = claims.filter(claim => 
      claim.claimId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.claimType?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [claims, searchTerm, sortConfig]);

  if (filteredClaims.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Processed Claims</h3>
        <p className="text-gray-600">You haven't processed any claims yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredClaims.map((claim) => (
        <ProcessedClaimRow
          key={claim._id || claim.id}
          claim={claim}
          onViewDetails={() => onViewDetails(claim)}
        />
      ))}
    </div>
  );
};

const ProcessedClaimRow = ({ claim, onViewDetails }) => {
  const statusConfig = {
    approved: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
    rejected: { color: 'bg-rose-100 text-rose-700 border-rose-200', icon: XCircle },
    returned: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: RotateCcw }
  };

  const config = statusConfig[claim.claimStatus] || statusConfig.approved;
  const IconComponent = config.icon;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className={`px-3 py-1 rounded-lg border ${config.color}`}>
            <div className="flex items-center gap-2">
              <IconComponent className="w-4 h-4" />
              <span className="text-sm font-medium capitalize">{claim.claimStatus}</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">{claim.claimId}</h3>
            <p className="text-sm text-gray-600">{claim.employeeName || 'N/A'}</p>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              ${(claim.claimAmount || 0).toLocaleString()}
            </div>
            {claim.approvedAmount && claim.claimStatus === 'approved' && (
              <div className="text-sm text-emerald-600">
                Approved: ${claim.approvedAmount.toLocaleString()}
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500">
            {new Date(claim.updatedAt).toLocaleDateString()}
          </div>
        </div>

        <button
          onClick={onViewDetails}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>

      {/* Additional info for rejected/returned claims */}
      {(claim.rejectionReason || claim.returnReason) && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            <span className="font-medium">
              {claim.claimStatus === 'rejected' ? 'Rejection' : 'Return'} Reason:
            </span>
            <span className="ml-2">{claim.rejectionReason || claim.returnReason}</span>
          </p>
        </div>
      )}
    </div>
  );
};

const ClaimActionModal = ({ 
  claim, modalType, onClose, onApprove, onReject, onReturn,
  approveForm, setApproveForm, rejectForm, setRejectForm, returnForm, setReturnForm,
  actionLoading 
}) => {
  if (!claim) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {modalType === 'approve' && 'Approve Claim'}
            {modalType === 'reject' && 'Reject Claim'}
            {modalType === 'return' && 'Return Claim'}
            {modalType === 'details' && 'Claim Details'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Claim Info */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Claim Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-600">Claim ID:</span> <span className="font-medium">{claim.claimId}</span></div>
              <div><span className="text-gray-600">Employee:</span> <span className="font-medium">{claim.employeeName || 'N/A'}</span></div>
              <div><span className="text-gray-600">Type:</span> <span className="font-medium capitalize">{claim.claimType || 'N/A'}</span></div>
              <div><span className="text-gray-600">Amount:</span> <span className="font-bold text-blue-600">${(claim.claimAmount || 0).toLocaleString()}</span></div>
              <div><span className="text-gray-600">Submitted:</span> <span className="font-medium">{new Date(claim.createdAt).toLocaleDateString()}</span></div>
              <div><span className="text-gray-600">Priority:</span> <span className="font-medium capitalize">{claim.priority}</span></div>
            </div>
          </div>

          {/* Action Forms */}
          {modalType === 'approve' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approved Amount *
                </label>
                <input
                  type="number"
                  value={approveForm.approvedAmount}
                  onChange={(e) => setApproveForm({ ...approveForm, approvedAmount: e.target.value })}
                  placeholder="Enter approved amount"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={approveForm.insurerNotes}
                  onChange={(e) => setApproveForm({ ...approveForm, insurerNotes: e.target.value })}
                  placeholder="Add any notes about this approval..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={3}
                />
              </div>
            </div>
          )}

          {modalType === 'reject' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectForm.rejectionReason}
                  onChange={(e) => setRejectForm({ ...rejectForm, rejectionReason: e.target.value })}
                  placeholder="Please provide a detailed reason for rejection..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={rejectForm.insurerNotes}
                  onChange={(e) => setRejectForm({ ...rejectForm, insurerNotes: e.target.value })}
                  placeholder="Add any additional notes..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  rows={3}
                />
              </div>
            </div>
          )}

          {modalType === 'return' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Reason *
              </label>
              <textarea
                value={returnForm.returnReason}
                onChange={(e) => setReturnForm({ ...returnForm, returnReason: e.target.value })}
                placeholder="Please explain why you're returning this claim..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                rows={4}
                required
              />
            </div>
          )}

          {modalType === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Claim Details</h3>
                <div className="space-y-2 text-sm">
                  {claim.claimDescription && (
                    <div><span className="text-gray-600">Description:</span> <span className="ml-2">{claim.claimDescription}</span></div>
                  )}
                  {claim.questionnaire && (
                    <div><span className="text-gray-600">Questionnaire Status:</span> <span className="ml-2">{claim.questionnaire.isComplete ? 'Complete' : 'Incomplete'}</span></div>
                  )}
                  {claim.documents && claim.documents.length > 0 && (
                    <div><span className="text-gray-600">Documents:</span> <span className="ml-2">{claim.documents.length} file(s)</span></div>
                  )}
                </div>
              </div>

              {claim.claimStatus !== 'insurer' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Decision Details</h3>
                  <div className="space-y-2 text-sm">
                    {claim.approvedAmount && (
                      <div><span className="text-gray-600">Approved Amount:</span> <span className="ml-2 font-bold text-emerald-600">${claim.approvedAmount.toLocaleString()}</span></div>
                    )}
                    {claim.rejectionReason && (
                      <div><span className="text-gray-600">Rejection Reason:</span> <span className="ml-2">{claim.rejectionReason}</span></div>
                    )}
                    {claim.returnReason && (
                      <div><span className="text-gray-600">Return Reason:</span> <span className="ml-2">{claim.returnReason}</span></div>
                    )}
                    {claim.insurerNotes && (
                      <div><span className="text-gray-600">Agent Notes:</span> <span className="ml-2">{claim.insurerNotes}</span></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {modalType !== 'details' && (
          <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
              disabled={actionLoading}
            >
              Cancel
            </button>
            
            {modalType === 'approve' && (
              <button
                onClick={onApprove}
                disabled={actionLoading || !approveForm.approvedAmount}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white px-6 py-3 rounded-xl transition-colors font-medium"
              >
                {actionLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                {actionLoading ? 'Approving...' : 'Approve Claim'}
              </button>
            )}
            
            {modalType === 'reject' && (
              <button
                onClick={onReject}
                disabled={actionLoading || !rejectForm.rejectionReason.trim()}
                className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white px-6 py-3 rounded-xl transition-colors font-medium"
              >
                {actionLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                {actionLoading ? 'Rejecting...' : 'Reject Claim'}
              </button>
            )}
            
            {modalType === 'return' && (
              <button
                onClick={onReturn}
                disabled={actionLoading || !returnForm.returnReason.trim()}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white px-6 py-3 rounded-xl transition-colors font-medium"
              >
                {actionLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <RotateCcw className="w-5 h-5" />
                )}
                {actionLoading ? 'Returning...' : 'Return Claim'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimsReview;
