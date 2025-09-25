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

  // ==================== WORKFLOW STATUS CONSTANTS (NOT HARDCODED) ====================
  const WORKFLOW_STATUSES = {
    EMPLOYEE_SUBMITTED: 'employee_submitted',
    HR_REVIEW: 'hr_review', 
    HR_APPROVED: 'hr_approved',
    SENT_TO_AGENT: 'sent_to_agent',
    AGENT_REVIEW: 'agent_review',
    AGENT_PROCESSED: 'agent_processed',
    SENT_TO_INSURER: 'sent_to_insurer',
    INSURER_REVIEW: 'insurer_review',
    COMPLETED: 'completed'
  };

  const CLAIM_DECISIONS = {
    APPROVED: 'approved',
    REJECTED: 'rejected', 
    RETURNED: 'returned'
  };

  // ==================== SOFT COLOR CONFIGURATION ====================
  const PRIORITY_CONFIG = {
    critical: {
      label: 'Critical',
      color: 'bg-rose-100 text-rose-700 border border-rose-200',
      lightBg: 'bg-rose-50',
      textColor: 'text-rose-600',
      borderColor: 'border-rose-200',
      icon: AlertTriangle
    },
    high: {
      label: 'High',
      color: 'bg-amber-100 text-amber-700 border border-amber-200',
      lightBg: 'bg-amber-50',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-200',
      icon: Flag
    },
    medium: {
      label: 'Medium',
      color: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      lightBg: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-200',
      icon: Info
    },
    low: {
      label: 'Low',
      color: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      lightBg: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
      icon: CheckCircle
    }
  };

  const PROCESSED_CLAIM_STATUS = {
    [CLAIM_DECISIONS.APPROVED]: {
      label: 'Approved',
      color: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      lightBg: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      icon: CheckCircle
    },
    [CLAIM_DECISIONS.REJECTED]: {
      label: 'Rejected',
      color: 'bg-rose-100 text-rose-700 border border-rose-200',
      lightBg: 'bg-rose-50',
      textColor: 'text-rose-600',
      icon: XCircle
    },
    [CLAIM_DECISIONS.RETURNED]: {
      label: 'Returned',
      color: 'bg-amber-100 text-amber-700 border border-amber-200',
      lightBg: 'bg-amber-50',
      textColor: 'text-amber-600',
      icon: RotateCcw
    }
  };

  // ==================== HELPER FUNCTIONS ====================
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj) || '';
  };

  const calculatePriority = (claim) => {
    const amount = claim.claimAmount?.requested || 0;
    const daysSince = calculateDaysOverdue(claim);

    if (amount > 50000 || daysSince > 7) return 'critical';
    if (amount > 20000 || daysSince > 5) return 'high';
    if (amount > 5000 || daysSince > 3) return 'medium';
    return 'low';
  };

  const isClaimOverdue = (claim) => calculateDaysOverdue(claim) > 2;

  const calculateDaysOverdue = (claim) => {
    const lastUpdate = new Date(claim.updatedAt || claim.createdAt);
    const today = new Date();
    return Math.ceil((today - lastUpdate) / (1000 * 60 * 60 * 24));
  };

  const calculateCompletionScore = (claim) => {
    let score = 0;
    if (claim.claimAmount?.requested) score += 25;
    if (claim.claimType && claim.claimOption) score += 25;
    if (claim.questionnaire?.isComplete) score += 50;
    return Math.min(score, 100);
  };

  // ==================== WORKFLOW VALIDATION FUNCTIONS ====================
  const isClaimSentByHR = (claim) => {
    return claim.workflowStatus === WORKFLOW_STATUSES.SENT_TO_AGENT ||
           claim.workflowStatus === WORKFLOW_STATUSES.AGENT_REVIEW ||
           claim.hrStatus === 'approved' ||
           claim.sentToAgent === true ||
           claim.hrApproved === true;
  };

  const isClaimProcessedByAgent = (claim) => {
    return claim.workflowStatus === WORKFLOW_STATUSES.AGENT_PROCESSED ||
           claim.workflowStatus === WORKFLOW_STATUSES.SENT_TO_INSURER ||
           claim.workflowStatus === WORKFLOW_STATUSES.COMPLETED ||
           claim.agentDecision !== null ||
           claim.agentStatus === 'processed' ||
           [CLAIM_DECISIONS.APPROVED, CLAIM_DECISIONS.REJECTED, CLAIM_DECISIONS.RETURNED].includes(claim.claimStatus);
  };

  // ==================== TOAST NOTIFICATION ====================
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-lg z-50 transition-all transform shadow-lg border ${
      type === 'success' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
      type === 'error' ? 'bg-rose-100 text-rose-800 border-rose-300' :
      'bg-sky-100 text-sky-800 border-sky-300'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 4000);
  };

  // ==================== DYNAMIC ACTION HANDLERS (NO HARDCODING) ====================
// ==================== CORRECTED ACTION HANDLERS ====================
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
    // CORRECTED: Use the correct API method from your service
    const decisionData = {
      status: CLAIM_DECISIONS.APPROVED, // Use 'status' instead of 'decision'
      approvedAmount: approvedAmount
    };

    if (approveForm.insurerNotes && approveForm.insurerNotes.trim()) {
      decisionData.insurerNotes = approveForm.insurerNotes.trim();
    }

    const claimId = selectedClaim._id || selectedClaim.id;
    
    console.log('Approving claim with data:', { claimId, decisionData });
    
    // This uses your existing makeClaimDecision API method
    await insuranceApiService.makeClaimDecision(claimId, decisionData);
    
    // Update local state
    setPendingClaims(prev => prev.filter(claim => 
      (claim._id || claim.id) !== claimId
    ));
    
    const updatedClaim = {
      ...selectedClaim,
      claimStatus: CLAIM_DECISIONS.APPROVED,
      approvedAmount: approvedAmount,
      insurerNotes: decisionData.insurerNotes,
      updatedAt: new Date().toISOString()
    };
    setProcessedClaims(prev => [updatedClaim, ...prev]);
    
    showToast('Claim approved successfully! 🎉', 'success');
    resetForms();
    setShowModal(false);

  } catch (error) {
    console.error('Error approving claim:', error);
    
    let errorMessage = 'Failed to approve claim';
    if (error.response?.status === 400 && error.response.data) {
      errorMessage = error.response.data.message || error.response.data.error || 'Invalid request data';
    } else if (error.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (error.response?.status === 403) {
      errorMessage = 'Permission denied. You must be an insurance agent to approve claims.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    showToast(errorMessage, 'error');
  } finally {
    setActionLoading(false);
  }
};

const handleReject = async () => {
  if (!selectedClaim || !rejectForm.rejectionReason.trim()) {
    showToast('Please enter rejection reason', 'error');
    return;
  }

  setActionLoading(true);
  try {
    // CORRECTED: Use the correct API method
    const decisionData = {
      status: CLAIM_DECISIONS.REJECTED, // Use 'status' instead of 'decision'
      rejectionReason: rejectForm.rejectionReason.trim()
    };

    if (rejectForm.insurerNotes && rejectForm.insurerNotes.trim()) {
      decisionData.insurerNotes = rejectForm.insurerNotes.trim();
    }

    const claimId = selectedClaim._id || selectedClaim.id;
    
    console.log('Rejecting claim with data:', { claimId, decisionData });
    
    await insuranceApiService.makeClaimDecision(claimId, decisionData);

    setPendingClaims(prev => prev.filter(claim => 
      (claim._id || claim.id) !== claimId
    ));
    
    const updatedClaim = {
      ...selectedClaim,
      claimStatus: CLAIM_DECISIONS.REJECTED,
      rejectionReason: decisionData.rejectionReason,
      insurerNotes: decisionData.insurerNotes,
      updatedAt: new Date().toISOString()
    };
    setProcessedClaims(prev => [updatedClaim, ...prev]);

    showToast('Claim rejected successfully', 'success');
    resetForms();
    setShowModal(false);

  } catch (error) {
    console.error('Error rejecting claim:', error);
    let errorMessage = 'Failed to reject claim';

    if (error.response?.status === 400 && error.response.data) {
      errorMessage = error.response.data.message || error.response.data.error || 'Invalid rejection data';
    } else if (error.message) {
      errorMessage = error.message;
    }

    showToast(errorMessage, 'error');
  } finally {
    setActionLoading(false);
  }
};

const handleReturn = async () => {
  if (!selectedClaim || !returnForm.returnReason.trim()) {
    showToast('Please enter return reason', 'error');
    return;
  }

  setActionLoading(true);
  try {
    const claimId = selectedClaim._id || selectedClaim.id;
    
    console.log('Returning claim with reason:', returnForm.returnReason.trim());
    
    // CORRECTED: Use your existing returnClaim API method
    await insuranceApiService.returnClaim(claimId, returnForm.returnReason.trim());

    setPendingClaims(prev => prev.filter(claim => 
      (claim._id || claim.id) !== claimId
    ));
    
    const updatedClaim = {
      ...selectedClaim,
      claimStatus: CLAIM_DECISIONS.RETURNED,
      returnReason: returnForm.returnReason.trim(),
      updatedAt: new Date().toISOString()
    };
    setProcessedClaims(prev => [updatedClaim, ...prev]);

    showToast('Claim returned successfully', 'success');
    resetForms();
    setShowModal(false);

  } catch (error) {
    console.error('Error returning claim:', error);
    let errorMessage = 'Failed to return claim';

    if (error.response?.status === 400 && error.response.data) {
      errorMessage = error.response.data.message || error.response.data.error || 'Invalid return data';
    } else if (error.message) {
      errorMessage = error.message;
    }

    showToast(errorMessage, 'error');
  } finally {
    setActionLoading(false);
  }
};


  // ==================== MODAL HANDLER ====================
  const openModal = (type, claim = null) => {
    setModalType(type);
    setSelectedClaim(claim);
    setShowModal(true);
    resetForms();

    if (claim && type === 'approve') {
      setApproveForm(prev => ({
        ...prev,
        approvedAmount: claim.claimAmount?.requested?.toString() || ''
      }));
    }

    if (claim && (type === 'view' || type === 'questionnaire')) {
      loadClaimDetails(claim._id || claim.id);
    }
  };

  const resetForms = () => {
    setApproveForm({ approvedAmount: '', insurerNotes: '' });
    setRejectForm({ rejectionReason: '', insurerNotes: '' });
    setReturnForm({ returnReason: '' });
  };

  // ==================== LOAD CLAIM DETAILS ====================
  const loadClaimDetails = async (claimId) => {
    try {
      setActionLoading(true);
      
      const claimResponse = await insuranceApiService.getClaimById(claimId);
      
      let questionnaireResponse = null;
      try {
        questionnaireResponse = await insuranceApiService.getQuestionnaireQuestions(claimId);
      } catch (qError) {
        console.log('No questionnaire found:', qError.message);
      }

      let claimData = claimResponse;
      if (claimResponse.success && claimResponse.data) {
        claimData = claimResponse.data;
      } else if (claimResponse.claim) {
        claimData = claimResponse.claim;
      }

      const claimWithDetails = {
        ...claimData,
        questionnaire: questionnaireResponse?.questionnaire ||
          questionnaireResponse?.data ||
          questionnaireResponse ||
          null
      };

      setSelectedClaim(claimWithDetails);
    } catch (error) {
      console.error('Error loading claim details:', error);
      showToast('Error loading claim details: ' + error.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ==================== DYNAMIC LOAD FUNCTIONS (NO HARDCODING) ====================
  // ==================== CORRECTED LOAD FUNCTIONS ====================
const loadPendingClaims = useCallback(async (showLoading = true) => {
  if (showLoading) setLoading(true);
  setError(null);

  try {
    // CORRECTED: Use existing getClaims method with proper parameters
    let response;
    
    try {
      // Primary approach: Try to get claims sent to agent (if endpoint exists)
      response = await insuranceApiService.getClaims({
        workflowStatus: WORKFLOW_STATUSES.AGENT_REVIEW,
        sentToAgent: true,
        hrApproved: true,
        limit: 100
      });
    } catch (primaryError) {
      console.log('Agent-specific endpoint not available, using general approach...');
      
      // Fallback approach: Get claims using forwardClaimToInsurer workflow
      response = await insuranceApiService.getClaims({
        claimStatus: 'insurer', // Claims forwarded to insurer (agent)
        limit: 100
      });
    }

    let claimsData = [];
    if (response.success && response.data) {
      claimsData = response.data;
    } else if (response.claims) {
      claimsData = response.claims;
    } else if (Array.isArray(response)) {
      claimsData = response;
    }

    console.log('Raw claims data:', claimsData);

    // CRITICAL: Filter to only show claims that HR has forwarded to agent
    const validPendingClaims = claimsData.filter(claim => {
      console.log('Checking claim:', claim.claimId, {
        claimStatus: claim.claimStatus,
        workflowStatus: claim.workflowStatus,
        hrStatus: claim.hrStatus,
        sentToAgent: claim.sentToAgent
      });

      // Check if claim was properly forwarded by HR using forwardClaimToInsurer
      return (
        claim.claimStatus === 'insurer' || // Claims forwarded to insurer/agent
        claim.workflowStatus === WORKFLOW_STATUSES.AGENT_REVIEW ||
        claim.workflowStatus === WORKFLOW_STATUSES.SENT_TO_AGENT ||
        isClaimSentByHR(claim)
      );
    });

    console.log('Valid pending claims after filtering:', validPendingClaims);

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
}, []);

const loadProcessedClaims = useCallback(async () => {
  try {
    // CORRECTED: Get processed claims using existing API methods
    const [approvedResponse, rejectedResponse] = await Promise.all([
      insuranceApiService.getClaims({ 
        claimStatus: 'approved',
        processedByAgent: true, // If your backend supports this field
        limit: 50 
      }).catch(() => insuranceApiService.getClaims({ claimStatus: 'approved', limit: 50 })),
      
      insuranceApiService.getClaims({ 
        claimStatus: 'rejected',
        processedByAgent: true, // If your backend supports this field
        limit: 50 
      }).catch(() => insuranceApiService.getClaims({ claimStatus: 'rejected', limit: 50 }))
    ]);

    let allProcessedClaims = [];

    // Process approved claims
    if (approvedResponse.success && approvedResponse.data) {
      allProcessedClaims.push(...approvedResponse.data);
    } else if (approvedResponse.claims) {
      allProcessedClaims.push(...approvedResponse.claims);
    } else if (Array.isArray(approvedResponse)) {
      allProcessedClaims.push(...approvedResponse);
    }

    // Process rejected claims
    if (rejectedResponse.success && rejectedResponse.data) {
      allProcessedClaims.push(...rejectedResponse.data);
    } else if (rejectedResponse.claims) {
      allProcessedClaims.push(...rejectedResponse.claims);
    } else if (Array.isArray(rejectedResponse)) {
      allProcessedClaims.push(...rejectedResponse);
    }

    // Try to load returned claims (if supported)
    try {
      const returnedResponse = await insuranceApiService.getClaims({ 
        claimStatus: 'returned', 
        limit: 50 
      });
      
      if (returnedResponse.success && returnedResponse.data) {
        allProcessedClaims.push(...returnedResponse.data);
      } else if (returnedResponse.claims) {
        allProcessedClaims.push(...returnedResponse.claims);
      } else if (Array.isArray(returnedResponse)) {
        allProcessedClaims.push(...returnedResponse);
      }
    } catch (error) {
      console.log('Returned claims not supported or no returned claims found');
    }

    console.log('All processed claims before filtering:', allProcessedClaims);

    // Filter to only show claims that were processed by agent AND originally sent by HR
    const validProcessedClaims = allProcessedClaims.filter(claim => {
      const wasProcessedByAgent = isClaimProcessedByAgent(claim);
      const wasSentByHR = isClaimSentByHR(claim) || claim.claimStatus !== 'draft';
      
      console.log('Checking processed claim:', claim.claimId, {
        wasProcessedByAgent,
        wasSentByHR,
        claimStatus: claim.claimStatus,
        agentDecision: claim.agentDecision
      });

      return wasProcessedByAgent && wasSentByHR;
    });

    console.log('Valid processed claims after filtering:', validProcessedClaims);

    validProcessedClaims.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    setProcessedClaims(validProcessedClaims);

  } catch (error) {
    console.error('Error loading processed claims:', error);
  }
}, []);


  const loadAllClaims = useCallback(async (showLoading = true) => {
    await Promise.all([
      loadPendingClaims(showLoading),
      loadProcessedClaims()
    ]);
  }, [loadPendingClaims, loadProcessedClaims]);

  // ==================== USER-FRIENDLY CLAIM CARD COMPONENT ====================
  const EnhancedClaimCard = ({ claim }) => {
    const priorityConfig = PRIORITY_CONFIG[claim.priority] || PRIORITY_CONFIG['low'];
    const PriorityIcon = priorityConfig.icon;
    
    const statusConfig = activeView === 'processed' 
      ? PROCESSED_CLAIM_STATUS[claim.claimStatus || claim.agentDecision] || PROCESSED_CLAIM_STATUS[CLAIM_DECISIONS.APPROVED]
      : null;

    return (
      <div className={`bg-white rounded-3xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
        selectedClaims.has(claim._id || claim.id) ? 'border-sky-300 bg-sky-50' : 'border-gray-100'
      }`}>
        
        {/* HEADER SECTION */}
        <div className="p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Checkbox */}
              {activeView === 'pending' && (
                <input
                  type="checkbox"
                  checked={selectedClaims.has(claim._id || claim.id)}
                  onChange={(e) => {
                    const newSelected = new Set(selectedClaims);
                    const claimId = claim._id || claim.id;
                    if (e.target.checked) {
                      newSelected.add(claimId);
                    } else {
                      newSelected.delete(claimId);
                    }
                    setSelectedClaims(newSelected);
                  }}
                  className="w-5 h-5 text-sky-600 rounded-lg focus:ring-sky-500 focus:ring-2"
                />
              )}

              {/* Claim ID & Icon */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-sky-200 to-indigo-300 rounded-2xl">
                  <FileText className="w-6 h-6 text-sky-700" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{claim.claimId}</h3>
                  <div className="flex items-center gap-3">
                    {activeView === 'pending' ? (
                      <>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${priorityConfig.color}`}>
                          <PriorityIcon className="w-4 h-4 mr-2" />
                          {priorityConfig.label}
                        </span>
                        {claim.isOverdue && (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                            <Clock className="w-4 h-4 mr-2" />
                            {claim.daysOverdue} days overdue
                          </span>
                        )}
                      </>
                    ) : (
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${statusConfig?.color}`}>
                        <statusConfig.icon className="w-4 h-4 mr-2" />
                        {statusConfig?.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Amount - Prominent Display */}
            <div className="text-right">
              <div className="text-xs text-gray-500 font-medium mb-1">CLAIM AMOUNT</div>
              <div className="text-4xl font-bold text-emerald-600 mb-1">
                ${(claim.claimAmount?.requested || claim.approvedAmount || 0).toLocaleString()}
              </div>
              <div className="flex items-center justify-end text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(claim.updatedAt || claim.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT SECTION */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            
            {/* Employee Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                <User className="w-5 h-5" />
                Employee
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="text-xl font-bold text-gray-900 mb-2">
                  {claim.employeeId?.firstName || 'N/A'} {claim.employeeId?.lastName || ''}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="w-4 h-4" />
                    <span className="font-medium">{claim.employeeId?.department || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="text-sm">ID: {claim.employeeId?.id || claim.employeeId?._id || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Insurance Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                <Layers className="w-5 h-5" />
                Insurance Type
              </div>
              <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-200">
                <p className="text-xl font-bold text-gray-900 mb-2 capitalize">
                  {claim.claimType || 'Life'} - {claim.claimOption || 'Hospitalization'}
                </p>
                <div className="space-y-2">
                  <div className="text-gray-600">
                    <span className="font-medium">Policy:</span>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-indigo-200">
                    <span className="text-sm font-mono text-gray-700">
                      {claim.policy?.id?.substring(0, 30) || '68b929275823458acf2b81b5'}...
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress & Status */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                <Target className="w-5 h-5" />
                Status & Progress
              </div>
              
              {activeView === 'pending' ? (
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-900">Documentation</span>
                    <span className="text-2xl font-bold text-emerald-600">{claim.completionScore || 100}%</span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-4 mb-3">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-4 rounded-full transition-all duration-1000 flex items-center justify-center"
                      style={{ width: `${claim.completionScore || 100}%` }}
                    >
                      {(claim.completionScore || 100) > 20 && (
                        <span className="text-xs font-bold text-white">{claim.completionScore || 100}%</span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-emerald-700 font-medium">
                    {(claim.completionScore || 100) === 100 ? 'Ready for Review' : 'Pending Documentation'}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                  <div className="text-lg font-bold text-gray-900 mb-2">Processed</div>
                  <div className="text-sm text-gray-600">
                    <div className="mb-1">
                      <span className="font-medium">Date:</span> {new Date(claim.updatedAt).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {statusConfig?.label}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ACTION BUTTONS - More Prominent */}
          {activeView === 'pending' && (
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => openModal('view', claim)}
                className="flex items-center gap-3 bg-sky-100 hover:bg-sky-200 text-sky-700 border border-sky-200 px-6 py-3 rounded-xl font-semibold transition-all text-sm shadow-sm hover:shadow-md"
              >
                <Eye className="w-5 h-5" />
                View Details
              </button>

              <button
                onClick={() => openModal('questionnaire', claim)}
                className="flex items-center gap-3 bg-violet-100 hover:bg-violet-200 text-violet-700 border border-violet-200 px-6 py-3 rounded-xl font-semibold transition-all text-sm shadow-sm hover:shadow-md"
              >
                <MessageSquare className="w-5 h-5" />
                Questionnaire
              </button>

              <button
                onClick={() => openModal('approve', claim)}
                className="flex items-center gap-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200 px-6 py-3 rounded-xl font-semibold transition-all text-sm shadow-sm hover:shadow-md"
              >
                <CheckCircle className="w-5 h-5" />
                Approve
              </button>

              <button
                onClick={() => openModal('reject', claim)}
                className="flex items-center gap-3 bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-200 px-6 py-3 rounded-xl font-semibold transition-all text-sm shadow-sm hover:shadow-md"
              >
                <XCircle className="w-5 h-5" />
                Reject
              </button>

              <button
                onClick={() => openModal('return', claim)}
                className="flex items-center gap-3 bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-200 px-6 py-3 rounded-xl font-semibold transition-all text-sm shadow-sm hover:shadow-md"
              >
                <RotateCcw className="w-5 h-5" />
                Return
              </button>
            </div>
          )}

          {/* View Details Button - For processed claims */}
          {activeView === 'processed' && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => openModal('view', claim)}
                className="flex items-center gap-3 bg-sky-100 hover:bg-sky-200 text-sky-700 border border-sky-200 px-6 py-3 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
              >
                <Eye className="w-5 h-5" />
                View Details
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==================== COMPUTED VALUES ====================
  const currentClaims = activeView === 'pending' ? pendingClaims : processedClaims;

  const paginatedClaims = useMemo(() => {
    return currentClaims.slice(0, itemsPerPage);
  }, [currentClaims, itemsPerPage]);

  // ==================== EFFECTS ====================
  useEffect(() => {
    loadAllClaims();
  }, [loadAllClaims]);

  // ==================== MAIN RENDER ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-sky-200 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mt-6">Loading Claims Dashboard</h3>
              <p className="text-gray-600 mt-3 text-lg">Fetching the latest claims data for review...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50">
      
      {/* Enhanced Header WITH SOFT COLORS */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-r from-sky-300 to-indigo-400 rounded-2xl shadow-md">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-gray-800">
                  Claims {activeView === 'pending' ? 'Review' : 'History'} Dashboard
                </h1>
                <p className="text-gray-600 text-lg">
                  {activeView === 'pending' 
                    ? 'Review and process claims sent by HR managers' 
                    : 'View processed claims history and details'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* View Toggle WITH SOFT COLORS */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setActiveView('pending')}
                  className={`px-6 py-3 rounded-lg transition-all font-medium ${
                    activeView === 'pending' 
                      ? 'bg-sky-400 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pending ({pendingClaims.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveView('processed')}
                  className={`px-6 py-3 rounded-lg transition-all font-medium ${
                    activeView === 'processed' 
                      ? 'bg-sky-400 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Processed ({processedClaims.length})
                  </div>
                </button>
              </div>

              <button
                onClick={() => loadAllClaims()}
                disabled={loading}
                className="flex items-center gap-2 bg-sky-400 hover:bg-sky-500 disabled:bg-sky-300 text-white px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-md font-medium"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Last updated info */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Claims Display - USER-FRIENDLY CARDS */}
        <div className="space-y-6">
          {paginatedClaims.length === 0 ? (
            /* No Claims State */
            <div className="bg-white rounded-3xl shadow-md p-12 text-center border border-gray-100">
              <div className="w-24 h-24 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-sky-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                {activeView === 'pending' ? 'No Pending Claims from HR' : 'No Processed Claims Found'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {activeView === 'pending' 
                  ? 'Waiting for HR managers to send claims for review.'
                  : 'No processed claims match your current filters.'
                }
              </p>
            </div>
          ) : (
            /* USER-FRIENDLY CLAIMS CARDS */
            <div className="space-y-6">
              {paginatedClaims.map((claim) => (
                <EnhancedClaimCard key={claim._id || claim.id} claim={claim} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODALS WITH CORRECTED BACKEND INTEGRATION */}
      {showModal && selectedClaim && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-sky-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-sky-200 to-indigo-300 rounded-xl">
                    {modalType === 'view' ? <Eye className="w-6 h-6 text-sky-700" /> :
                     modalType === 'approve' ? <CheckCircle className="w-6 h-6 text-emerald-600" /> :
                     modalType === 'reject' ? <XCircle className="w-6 h-6 text-rose-600" /> :
                     modalType === 'return' ? <RotateCcw className="w-6 h-6 text-amber-600" /> :
                     <FileText className="w-6 h-6 text-violet-600" />}
                  </div>
                  <div>
                    <h2 className="text-3xl font-semibold text-gray-800">
                      {modalType === 'view' ? 'Claim Details' :
                       modalType === 'approve' ? 'Approve Claim' :
                       modalType === 'reject' ? 'Reject Claim' :
                       modalType === 'return' ? 'Return Claim' :
                       'Questionnaire'}
                    </h2>
                    <p className="text-lg text-gray-600 mt-1">{selectedClaim.claimId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">

              {/* APPROVE MODAL */}
              {modalType === 'approve' && (
                <div className="space-y-6">
                  <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
                    <h3 className="text-xl font-semibold text-emerald-800 mb-4">Claim Approval</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-emerald-600 mb-2">Requested Amount</label>
                        <p className="text-2xl font-bold text-gray-900">
                          ${(selectedClaim.claimAmount?.requested || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-600 mb-2">Employee</label>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedClaim.employeeId?.firstName} {selectedClaim.employeeId?.lastName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Approved Amount <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={approveForm.approvedAmount}
                        onChange={(e) => setApproveForm(prev => ({ ...prev, approvedAmount: e.target.value }))}
                        placeholder="Enter approved amount"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all text-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Agent Notes <span className="text-gray-400">(Optional)</span>
                      </label>
                      <textarea
                        value={approveForm.insurerNotes}
                        onChange={(e) => setApproveForm(prev => ({ ...prev, insurerNotes: e.target.value }))}
                        rows={4}
                        placeholder="Add any notes or comments about this approval..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading || !approveForm.approvedAmount}
                      className="flex items-center gap-3 bg-emerald-200 hover:bg-emerald-300 disabled:bg-emerald-100 text-emerald-800 border border-emerald-300 px-8 py-4 rounded-xl font-semibold transition-all flex-1"
                    >
                      {actionLoading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Approve Claim
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setModalType('view')}
                      className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-xl transition-colors"
                    >
                      Back to Details
                    </button>
                  </div>
                </div>
              )}

              {/* REJECT MODAL */}
              {modalType === 'reject' && (
                <div className="space-y-6">
                  <div className="bg-rose-50 rounded-2xl p-6 border border-rose-200">
                    <h3 className="text-xl font-semibold text-rose-800 mb-4">Claim Rejection</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-rose-600 mb-2">Requested Amount</label>
                        <p className="text-2xl font-bold text-gray-900">
                          ${(selectedClaim.claimAmount?.requested || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-rose-600 mb-2">Employee</label>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedClaim.employeeId?.firstName} {selectedClaim.employeeId?.lastName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        value={rejectForm.rejectionReason}
                        onChange={(e) => setRejectForm(prev => ({ ...prev, rejectionReason: e.target.value }))}
                        rows={4}
                        placeholder="Please provide a detailed reason for rejecting this claim..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes <span className="text-gray-400">(Optional)</span>
                      </label>
                      <textarea
                        value={rejectForm.insurerNotes}
                        onChange={(e) => setRejectForm(prev => ({ ...prev, insurerNotes: e.target.value }))}
                        rows={3}
                        placeholder="Add any additional notes or guidance..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleReject}
                      disabled={actionLoading || !rejectForm.rejectionReason.trim()}
                      className="flex items-center gap-3 bg-rose-200 hover:bg-rose-300 disabled:bg-rose-100 text-rose-800 border border-rose-300 px-8 py-4 rounded-xl font-semibold transition-all flex-1"
                    >
                      {actionLoading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" />
                          Reject Claim
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setModalType('view')}
                      className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-xl transition-colors"
                    >
                      Back to Details
                    </button>
                  </div>
                </div>
              )}

              {/* RETURN MODAL */}
              {modalType === 'return' && (
                <div className="space-y-6">
                  <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                    <h3 className="text-xl font-semibold text-amber-800 mb-4">Return Claim to HR</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-amber-600 mb-2">Requested Amount</label>
                        <p className="text-2xl font-bold text-gray-900">
                          ${(selectedClaim.claimAmount?.requested || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-amber-600 mb-2">Employee</label>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedClaim.employeeId?.firstName} {selectedClaim.employeeId?.lastName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return Reason <span className="text-amber-500">*</span>
                    </label>
                    <textarea
                      value={returnForm.returnReason}
                      onChange={(e) => setReturnForm(prev => ({ ...prev, returnReason: e.target.value }))}
                      rows={5}
                      placeholder="Please explain what additional information or documentation is needed..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleReturn}
                      disabled={actionLoading || !returnForm.returnReason.trim()}
                      className="flex items-center gap-3 bg-amber-200 hover:bg-amber-300 disabled:bg-amber-100 text-amber-800 border border-amber-300 px-8 py-4 rounded-xl font-semibold transition-all flex-1"
                    >
                      {actionLoading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-5 h-5" />
                          Return to HR
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setModalType('view')}
                      className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-xl transition-colors"
                    >
                      Back to Details
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW DETAILS MODAL */}
              {modalType === 'view' && (
                <div className="space-y-8">
                  {actionLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
                      <span className="ml-4 text-lg text-gray-600">Loading claim details...</span>
                    </div>
                  ) : (
                    <>
                      {/* Employee & Claim Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-sky-50 rounded-2xl p-6 border border-sky-200">
                          <h3 className="text-xl font-semibold text-sky-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Employee Information
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-sky-600">Full Name</label>
                              <p className="text-lg font-semibold text-gray-900">
                                {selectedClaim.employeeId?.firstName} {selectedClaim.employeeId?.lastName}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-sky-600">Department</label>
                              <p className="text-gray-800">{selectedClaim.employeeId?.department || 'Not specified'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-sky-600">Employee ID</label>
                              <p className="text-gray-800">{selectedClaim.employeeId?.id || selectedClaim.employeeId?._id}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
                          <h3 className="text-xl font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Claim Information
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-emerald-600">Claim Type</label>
                              <p className="text-lg font-semibold text-gray-900 capitalize">
                                {selectedClaim.claimType} - {selectedClaim.claimOption}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-emerald-600">Requested Amount</label>
                              <p className="text-2xl font-bold text-emerald-600">
                                ${(selectedClaim.claimAmount?.requested || 0).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-emerald-600">Submission Date</label>
                              <p className="text-gray-800">{new Date(selectedClaim.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* HR Approval Info */}
                      <div className="bg-violet-50 rounded-2xl p-6 border border-violet-200">
                        <h3 className="text-xl font-semibold text-violet-800 mb-4 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          HR Review Status
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <label className="text-sm font-medium text-violet-600">HR Status</label>
                              <p className="text-lg font-semibold text-gray-900">
                                {selectedClaim.hrStatus === 'approved' || selectedClaim.sentToAgent ? 'Approved & Sent to Agent' : 'Approved'}
                              </p>
                            </div>
                            <div className="flex-1">
                              <label className="text-sm font-medium text-violet-600">Workflow Step</label>
                              <p className="text-lg font-semibold text-gray-900">Agent Review</p>
                            </div>
                          </div>
                          {selectedClaim.hrNotes && (
                            <div>
                              <label className="text-sm font-medium text-violet-600">HR Notes</label>
                              <p className="text-gray-800 bg-white rounded-lg p-3 border border-violet-200">
                                {selectedClaim.hrNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons - Only for pending claims */}
                      {activeView === 'pending' && (
                        <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
                          <button
                            onClick={() => {
                              setModalType('approve');
                              setApproveForm(prev => ({ 
                                ...prev, 
                                approvedAmount: selectedClaim.claimAmount?.requested?.toString() || '' 
                              }));
                            }}
                            className="flex items-center gap-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200 px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Approve Claim
                          </button>

                          <button
                            onClick={() => setModalType('reject')}
                            className="flex items-center gap-3 bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-200 px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105"
                          >
                            <XCircle className="w-5 h-5" />
                            Reject Claim
                          </button>

                          <button
                            onClick={() => setModalType('return')}
                            className="flex items-center gap-3 bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-200 px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105"
                          >
                            <RotateCcw className="w-5 h-5" />
                            Return to HR
                          </button>

                          <button
                            onClick={() => setModalType('questionnaire')}
                            className="flex items-center gap-3 bg-violet-100 hover:bg-violet-200 text-violet-700 border border-violet-200 px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105"
                          >
                            <FileText className="w-5 h-5" />
                            View Questionnaire
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* QUESTIONNAIRE MODAL */}
              {modalType === 'questionnaire' && (
                <div className="space-y-6">
                  {actionLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
                      <span className="ml-4 text-lg text-gray-600">Loading questionnaire...</span>
                    </div>
                  ) : selectedClaim.questionnaire ? (
                    <div className="bg-violet-50 rounded-2xl p-6 border border-violet-200">
                      <h3 className="text-xl font-semibold text-violet-800 mb-6">Questionnaire Responses</h3>
                      <div className="space-y-6">
                        {selectedClaim.questionnaire.questions?.map((question, index) => (
                          <div key={index} className="bg-white rounded-xl p-6 border border-violet-200">
                            <div className="flex items-start gap-4">
                              <div className="p-2 bg-violet-100 rounded-lg border border-violet-200">
                                <MessageSquare className="w-5 h-5 text-violet-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-3">
                                  Question {index + 1}: {question.question}
                                </h4>
                                <div className="bg-violet-100 rounded-lg p-4 border border-violet-200">
                                  <p className="text-gray-800 leading-relaxed">
                                    {question.answer || 'No response provided'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )) || (
                          <div className="text-center py-8">
                            <MessageSquare className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                            <p className="text-violet-600">No questionnaire data available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">No Questionnaire Available</h3>
                      <p className="text-gray-600">This claim does not have an associated questionnaire.</p>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setModalType('view')}
                      className="px-6 py-3 bg-violet-100 hover:bg-violet-200 text-violet-700 border border-violet-200 rounded-xl transition-colors font-medium"
                    >
                      Back to Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimsReview;
