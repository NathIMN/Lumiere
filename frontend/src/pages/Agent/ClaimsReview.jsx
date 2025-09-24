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
  const [activeView, setActiveView] = useState('pending'); // 'pending' or 'processed'

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

  // Enhanced Statistics - MOVED HERE TO BE DECLARED BEFORE USE
  const [statistics, setStatistics] = useState({
    totalPending: 0, highPriority: 0, overdueClaims: 0, totalValue: 0,
    averageAmount: 0, approvedToday: 0, rejectedToday: 0, returnedToday: 0,
    processingTime: 0, completionRate: 0
  });

  // ==================== CONFIGURATION ====================
  const PRIORITY_CONFIG = {
    critical: {
      label: 'Critical', color: 'bg-red-500 text-white', lightBg: 'bg-red-50',
      textColor: 'text-red-700', borderColor: 'border-red-300', icon: AlertTriangle
    },
    high: {
      label: 'High', color: 'bg-orange-500 text-white', lightBg: 'bg-orange-50',
      textColor: 'text-orange-700', borderColor: 'border-orange-300', icon: Flag
    },
    medium: {
      label: 'Medium', color: 'bg-yellow-500 text-white', lightBg: 'bg-yellow-50',
      textColor: 'text-yellow-700', borderColor: 'border-yellow-300', icon: Info
    },
    low: {
      label: 'Low', color: 'bg-green-500 text-white', lightBg: 'bg-green-50',
      textColor: 'text-green-700', borderColor: 'border-green-300', icon: CheckCircle
    }
  };

  const PROCESSED_CLAIM_STATUS = {
    approved: { 
      label: 'Approved', 
      color: 'bg-green-500 text-white', 
      lightBg: 'bg-green-50',
      textColor: 'text-green-700',
      icon: CheckCircle 
    },
    rejected: { 
      label: 'Rejected', 
      color: 'bg-red-500 text-white', 
      lightBg: 'bg-red-50',
      textColor: 'text-red-700',
      icon: XCircle 
    },
    returned: { 
      label: 'Returned', 
      color: 'bg-orange-500 text-white', 
      lightBg: 'bg-orange-50',
      textColor: 'text-orange-700',
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

  const isToday = (date) => {
    const today = new Date();
    const compareDate = new Date(date);
    return today.toDateString() === compareDate.toDateString();
  };

  const isThisWeek = (date) => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return new Date(date) >= weekAgo;
  };

  const isThisMonth = (date) => {
    const today = new Date();
    const compareDate = new Date(date);
    return today.getMonth() === compareDate.getMonth() && today.getFullYear() === compareDate.getFullYear();
  };

  const updateStatistics = (pendingData, processedData) => {
    const stats = {
      totalPending: pendingData.length,
      highPriority: pendingData.filter(c => c.priority === 'high' || c.priority === 'critical').length,
      overdueClaims: pendingData.filter(c => c.isOverdue).length,
      totalValue: pendingData.reduce((sum, c) => sum + (c.claimAmount?.requested || 0), 0),
      averageAmount: pendingData.length > 0
        ? pendingData.reduce((sum, c) => sum + (c.claimAmount?.requested || 0), 0) / pendingData.length
        : 0,
      approvedToday: processedData.filter(c => c.claimStatus === 'approved' && isToday(c.updatedAt)).length,
      rejectedToday: processedData.filter(c => c.claimStatus === 'rejected' && isToday(c.updatedAt)).length,
      returnedToday: processedData.filter(c => c.claimStatus === 'returned' && isToday(c.updatedAt)).length,
      processingTime: 2.5,
      completionRate: 85
    };
    setStatistics(stats);
  };

  // ==================== COMPUTED VALUES ====================
  const currentClaims = activeView === 'pending' ? pendingClaims : processedClaims;

  const sortedAndFilteredClaims = useMemo(() => {
    let result = [...currentClaims];

    // Apply filters
    result = result.filter(claim => {
      const matchesSearch = !searchTerm ||
        claim.claimId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${claim.employeeId?.firstName} ${claim.employeeId?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.employeeId?.department?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPriority = priorityFilter === 'all' || claim.priority === priorityFilter;
      
      // For processed claims, filter by actual claim status
      const matchesStatus = statusFilter === 'all' || 
        (activeView === 'pending' ? claim.claimStatus === 'insurer' : claim.claimStatus === statusFilter);

      const amount = claim.claimAmount?.requested || 0;
      const matchesAmount = amountFilter === 'all' ||
        (amountFilter === 'large' && amount > 20000) ||
        (amountFilter === 'medium' && amount > 5000 && amount <= 20000) ||
        (amountFilter === 'small' && amount <= 5000);

      const matchesDate = dateFilter === 'all' ||
        (dateFilter === 'today' && isToday(claim.updatedAt)) ||
        (dateFilter === 'week' && isThisWeek(claim.updatedAt)) ||
        (dateFilter === 'month' && isThisMonth(claim.updatedAt));

      return matchesSearch && matchesPriority && matchesStatus && matchesAmount && matchesDate;
    });

    // Apply sorting
    result.sort((a, b) => {
      const aVal = getNestedValue(a, sortConfig.key);
      const bVal = getNestedValue(b, sortConfig.key);

      if (sortConfig.direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  }, [currentClaims, searchTerm, priorityFilter, statusFilter, amountFilter, dateFilter, sortConfig, activeView]);

  const paginatedClaims = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAndFilteredClaims.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAndFilteredClaims, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedAndFilteredClaims.length / itemsPerPage);

  const groupedClaims = useMemo(() => {
    if (groupBy === 'none') return { 'All Claims': paginatedClaims };

    return paginatedClaims.reduce((groups, claim) => {
      let key = 'Other';

      switch (groupBy) {
        case 'priority':
          key = PRIORITY_CONFIG[claim.priority]?.label || 'Unknown';
          break;
        case 'department':
          key = claim.employeeId?.department || 'No Department';
          break;
        case 'type':
          key = claim.claimType || 'No Type';
          break;
        case 'status':
          if (activeView === 'processed') {
            key = PROCESSED_CLAIM_STATUS[claim.claimStatus]?.label || 'Unknown Status';
          } else {
            key = 'Pending Review';
          }
          break;
        default:
          key = 'All Claims';
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(claim);
      return groups;
    }, {});
  }, [paginatedClaims, groupBy, activeView]);

  // ==================== API CALLS ====================
  const loadPendingClaims = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const response = await insuranceApiService.getClaims({
        claimStatus: 'insurer', // Only pending claims for insurer review
        limit: 100
      });

      let claimsData = [];
      if (response.success && response.data) {
        claimsData = response.data;
      } else if (response.claims) {
        claimsData = response.claims;
      } else if (Array.isArray(response)) {
        claimsData = response;
      }

      const enhancedClaims = claimsData.map(claim => ({
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
      setError(error.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const loadProcessedClaims = useCallback(async () => {
    try {
      // Load approved claims
      const approvedResponse = await insuranceApiService.getClaims({
        claimStatus: 'approved',
        limit: 50
      });

      // Load rejected claims
      const rejectedResponse = await insuranceApiService.getClaims({
        claimStatus: 'rejected',
        limit: 50
      });

      // Load returned claims (if your API supports this status)
      let returnedResponse = { data: [], claims: [] };
      try {
        returnedResponse = await insuranceApiService.getClaims({
          claimStatus: 'returned',
          limit: 50
        });
      } catch (error) {
        // If returned status is not supported, just use empty array
        console.log('Returned claims not supported or available');
      }

      // Combine all processed claims
      let allProcessedClaims = [];

      // Handle approved claims
      if (approvedResponse.success && approvedResponse.data) {
        allProcessedClaims.push(...approvedResponse.data);
      } else if (approvedResponse.claims) {
        allProcessedClaims.push(...approvedResponse.claims);
      } else if (Array.isArray(approvedResponse)) {
        allProcessedClaims.push(...approvedResponse);
      }

      // Handle rejected claims
      if (rejectedResponse.success && rejectedResponse.data) {
        allProcessedClaims.push(...rejectedResponse.data);
      } else if (rejectedResponse.claims) {
        allProcessedClaims.push(...rejectedResponse.claims);
      } else if (Array.isArray(rejectedResponse)) {
        allProcessedClaims.push(...rejectedResponse);
      }

      // Handle returned claims
      if (returnedResponse.success && returnedResponse.data) {
        allProcessedClaims.push(...returnedResponse.data);
      } else if (returnedResponse.claims) {
        allProcessedClaims.push(...returnedResponse.claims);
      } else if (Array.isArray(returnedResponse)) {
        allProcessedClaims.push(...returnedResponse);
      }

      // Sort by most recent first
      allProcessedClaims.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      setProcessedClaims(allProcessedClaims);

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

      if (approveForm.insurerNotes && approveForm.insurerNotes.trim()) {
        decisionData.insurerNotes = approveForm.insurerNotes.trim();
      }

      await insuranceApiService.makeClaimDecision(selectedClaim._id, decisionData);
      
      // Remove from pending claims
      setPendingClaims(prev => prev.filter(claim => claim._id !== selectedClaim._id));
      
      // Add to processed claims with updated status
      const updatedClaim = {
        ...selectedClaim,
        claimStatus: 'approved',
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
      if (error.status === 400 && error.data) {
        errorMessage = error.data.message || error.data.error || 'Invalid request data';
      } else if (error.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.status === 403) {
        errorMessage = 'Permission denied. You must be an insurance agent to approve claims.';
      } else if (error.message !== 'API request failed') {
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
      const decisionData = {
        status: 'rejected',
        rejectionReason: rejectForm.rejectionReason.trim()
      };

      if (rejectForm.insurerNotes && rejectForm.insurerNotes.trim()) {
        decisionData.insurerNotes = rejectForm.insurerNotes.trim();
      }

      await insuranceApiService.makeClaimDecision(selectedClaim._id, decisionData);

      // Remove from pending claims
      setPendingClaims(prev => prev.filter(claim => claim._id !== selectedClaim._id));
      
      // Add to processed claims with updated status
      const updatedClaim = {
        ...selectedClaim,
        claimStatus: 'rejected',
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

      if (error.status === 400 && error.data) {
        errorMessage = error.data.message || error.data.error || 'Invalid rejection data';
      } else if (error.message !== 'API request failed') {
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
      await insuranceApiService.returnClaim(
        selectedClaim._id,
        returnForm.returnReason.trim()
      );

      // Remove from pending claims
      setPendingClaims(prev => prev.filter(claim => claim._id !== selectedClaim._id));
      
      // Add to processed claims with returned status
      const updatedClaim = {
        ...selectedClaim,
        claimStatus: 'returned',
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

      if (error.status === 400 && error.data) {
        errorMessage = error.data.message || error.data.error || 'Invalid return data';
      } else if (error.message !== 'API request failed') {
        errorMessage = error.message;
      }

      showToast(errorMessage, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedClaims.size === 0) {
      showToast('Please select claims first', 'error');
      return;
    }

    const claimIds = Array.from(selectedClaims);
    setActionLoading(true);

    try {
      let successCount = 0;
      let errorCount = 0;
      const updatedClaims = [];

      for (const claimId of claimIds) {
        try {
          const claim = pendingClaims.find(c => c._id === claimId);
          if (!claim) continue;

          switch (action) {
            case 'bulk-approve':
              await insuranceApiService.makeClaimDecision(claimId, {
                status: 'approved',
                approvedAmount: claim?.claimAmount?.requested || 0,
                insurerNotes: 'Bulk approval'
              });
              
              updatedClaims.push({
                ...claim,
                claimStatus: 'approved',
                approvedAmount: claim?.claimAmount?.requested || 0,
                insurerNotes: 'Bulk approval',
                updatedAt: new Date().toISOString()
              });
              break;

            case 'bulk-return':
              const reason = prompt('Enter return reason for selected claims:');
              if (!reason) return;

              await insuranceApiService.returnClaim(claimId, reason);
              
              updatedClaims.push({
                ...claim,
                claimStatus: 'returned',
                returnReason: reason,
                updatedAt: new Date().toISOString()
              });
              break;
          }
          successCount++;
        } catch (error) {
          console.error(`Error processing claim ${claimId}:`, error);
          errorCount++;
        }
      }

      // Remove processed claims from pending
      setPendingClaims(prev => 
        prev.filter(claim => !claimIds.includes(claim._id))
      );
      
      // Add to processed claims
      setProcessedClaims(prev => [...updatedClaims, ...prev]);

      showToast(`Processed ${successCount} claims successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`, 'success');
      setSelectedClaims(new Set());

    } catch (error) {
      showToast('Error processing bulk action: ' + error.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const resetForms = () => {
    setApproveForm({ approvedAmount: '', insurerNotes: '' });
    setRejectForm({ rejectionReason: '', insurerNotes: '' });
    setReturnForm({ returnReason: '' });
  };

  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-lg z-50 transition-all transform shadow-lg ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 4000);
  };

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
      loadClaimDetails(claim._id);
    }
  };

  const handleQuickFilter = (filterKey) => {
    switch (filterKey) {
      case 'all':
        setPriorityFilter('all');
        setStatusFilter('all');
        setAmountFilter('all');
        setDateFilter('all');
        break;
      case 'high-priority':
        setPriorityFilter('high');
        break;
      case 'overdue':
        setStatusFilter('all');
        break;
      case 'large-amount':
        setAmountFilter('large');
        break;
      case 'recent':
        setDateFilter('week');
        break;
    }
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    loadAllClaims();
  }, [loadAllClaims]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => loadAllClaims(false), 30000);
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [autoRefresh, loadAllClaims]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priorityFilter, statusFilter, amountFilter, dateFilter, activeView]);

  useEffect(() => {
    updateStatistics(pendingClaims, processedClaims);
  }, [pendingClaims, processedClaims]);

  // ==================== RENDER COMPONENTS ====================

  // Enhanced Claim Card Component
  const EnhancedClaimCard = ({ claim }) => {
    const priorityConfig = PRIORITY_CONFIG[claim.priority] || PRIORITY_CONFIG['low'];
    const PriorityIcon = priorityConfig.icon;
    const isExpanded = expandedCards.has(claim._id);
    
    // For processed claims, show status instead of priority
    const statusConfig = activeView === 'processed' 
      ? PROCESSED_CLAIM_STATUS[claim.claimStatus] || PROCESSED_CLAIM_STATUS['approved']
      : null;

    return (
      <div className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
        selectedClaims.has(claim._id) ? 'border-blue-400 bg-blue-50' : 'border-gray-100'
      }`}>

        {/* Card Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {activeView === 'pending' && (
                  <input
                    type="checkbox"
                    checked={selectedClaims.has(claim._id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedClaims);
                      if (e.target.checked) {
                        newSelected.add(claim._id);
                      } else {
                        newSelected.delete(claim._id);
                      }
                      setSelectedClaims(newSelected);
                    }}
                    className="w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 focus:ring-2"
                  />
                )}

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{claim.claimId}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {activeView === 'pending' ? (
                        <>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${priorityConfig.color}`}>
                            <PriorityIcon className="w-3 h-3 mr-1" />
                            {priorityConfig.label}
                          </span>
                          {claim.isOverdue && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse">
                              <Clock className="w-3 h-3 mr-1" />
                              {claim.daysOverdue}d overdue
                            </span>
                          )}
                        </>
                      ) : (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusConfig?.color}`}>
                          <statusConfig.icon className="w-3 h-3 mr-1" />
                          {statusConfig?.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const newExpanded = new Set(expandedCards);
                  if (newExpanded.has(claim._id)) {
                    newExpanded.delete(claim._id);
                  } else {
                    newExpanded.add(claim._id);
                  }
                  setExpandedCards(newExpanded);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <User className="w-4 h-4" />
                EMPLOYEE
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900">
                  {claim.employeeId?.firstName} {claim.employeeId?.lastName}
                </p>
                <p className="text-gray-600 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {claim.employeeId?.department}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Layers className="w-4 h-4" />
                INSURANCE TYPE
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900 capitalize">
                  {claim.claimType} - {claim.claimOption}
                </p>
                <p className="text-gray-600 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Policy: {claim.policy?.id || 'N/A'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <DollarSign className="w-4 h-4" />
                FINANCIAL
              </div>
              <div>
                <p className="font-bold text-3xl text-green-600">
                  ${(claim.claimAmount?.requested || claim.approvedAmount || 0).toLocaleString()}
                </p>
                {activeView === 'processed' && claim.approvedAmount && claim.approvedAmount !== claim.claimAmount?.requested && (
                  <p className="text-sm text-gray-500">
                    Original: ${(claim.claimAmount?.requested || 0).toLocaleString()}
                  </p>
                )}
                <p className="text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(claim.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar - Only for pending claims */}
          {activeView === 'pending' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Documentation Progress</span>
                <span className="text-sm font-bold text-gray-900">{claim.completionScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    claim.completionScore >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                    claim.completionScore >= 70 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                    claim.completionScore >= 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                    'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                  style={{ width: `${claim.completionScore}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Processed Claim Details */}
          {activeView === 'processed' && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              {claim.claimStatus === 'approved' && (
                <div>
                  <h5 className="font-semibold text-green-800 mb-2">Approval Details</h5>
                  <p className="text-sm text-gray-600">
                    Approved Amount: <span className="font-bold text-green-600">${(claim.approvedAmount || 0).toLocaleString()}</span>
                  </p>
                  {claim.insurerNotes && (
                    <p className="text-sm text-gray-600 mt-1">
                      Notes: {claim.insurerNotes}
                    </p>
                  )}
                </div>
              )}
              
              {claim.claimStatus === 'rejected' && (
                <div>
                  <h5 className="font-semibold text-red-800 mb-2">Rejection Details</h5>
                  <p className="text-sm text-gray-600">
                    Reason: {claim.rejectionReason}
                  </p>
                  {claim.insurerNotes && (
                    <p className="text-sm text-gray-600 mt-1">
                      Notes: {claim.insurerNotes}
                    </p>
                  )}
                </div>
              )}
              
              {claim.claimStatus === 'returned' && (
                <div>
                  <h5 className="font-semibold text-orange-800 mb-2">Return Details</h5>
                  <p className="text-sm text-gray-600">
                    Reason: {claim.returnReason}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Expanded Content */}
          {isExpanded && (
            <div className="border-t border-gray-100 pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">Timeline</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{new Date(claim.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Update:</span>
                      <span className="font-medium">{new Date(claim.updatedAt).toLocaleDateString()}</span>
                    </div>
                    {activeView === 'pending' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processing Time:</span>
                        <span className="font-medium">{claim.daysOverdue + 2} days</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">
                    {activeView === 'pending' ? 'Risk Assessment' : 'Processing Summary'}
                  </h5>
                  <div className="space-y-2 text-sm">
                    {activeView === 'pending' ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Priority Level:</span>
                          <span className={`font-medium ${priorityConfig.textColor}`}>
                            {priorityConfig.label}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Completion:</span>
                          <span className="font-medium">{claim.completionScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-medium text-blue-600">Ready for Review</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Final Status:</span>
                          <span className={`font-medium ${statusConfig?.textColor}`}>
                            {statusConfig?.label}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Processed:</span>
                          <span className="font-medium">{new Date(claim.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons - Only for pending claims */}
          {activeView === 'pending' && (
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => openModal('view', claim)}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all transform hover:scale-105 shadow-sm"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>

              <button
                onClick={() => openModal('questionnaire', claim)}
                className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all transform hover:scale-105 shadow-sm"
              >
                <FileText className="w-4 h-4" />
                Questionnaire
              </button>

              <button
                onClick={() => openModal('approve', claim)}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all transform hover:scale-105 shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>

              <button
                onClick={() => openModal('reject', claim)}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all transform hover:scale-105 shadow-sm"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>

              <button
                onClick={() => openModal('return', claim)}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all transform hover:scale-105 shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Return
              </button>
            </div>
          )}

          {/* View Details Button - For processed claims */}
          {activeView === 'processed' && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => openModal('view', claim)}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all transform hover:scale-105 shadow-sm"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Main render with loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mt-6">Loading Claims Dashboard</h3>
              <p className="text-gray-600 mt-3 text-lg">Fetching the latest claims data for review...</p>
              <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                This may take a moment
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">

      {/* Enhanced Header */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Claims {activeView === 'pending' ? 'Review' : 'History'} Dashboard
                </h1>
                <p className="text-gray-600 text-lg">
                  {activeView === 'pending' 
                    ? 'Review and process pending insurance claims' 
                    : 'View processed claims history and details'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setActiveView('pending')}
                  className={`px-6 py-3 rounded-lg transition-all font-medium ${
                    activeView === 'pending' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pending ({statistics.totalPending})
                  </div>
                </button>
                <button
                  onClick={() => setActiveView('processed')}
                  className={`px-6 py-3 rounded-lg transition-all font-medium ${
                    activeView === 'processed' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Processed ({processedClaims.length})
                  </div>
                </button>
              </div>

              {/* Auto-refresh toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                    autoRefresh
                      ? 'bg-green-100 text-green-700 border-2 border-green-300'
                      : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                  }`}
                >
                  {autoRefresh ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  Auto-refresh
                </button>

                <button
                  onClick={() => loadAllClaims()}
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Last updated info */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              {autoRefresh && (
                <div className="flex items-center gap-1 text-green-600">
                  <Activity className="w-4 h-4" />
                  Auto-refreshing every 30s
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">View:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'cards' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Group by:</span>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="none">None</option>
                  <option value="priority">Priority</option>
                  <option value="department">Department</option>
                  <option value="type">Type</option>
                  {activeView === 'processed' && <option value="status">Status</option>}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Statistics Cards - FIXED VERSION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
          {(activeView === 'pending' ? [
            { label: 'Pending Claims', value: statistics.totalPending, icon: Clock, bgColor: 'bg-blue-100', iconColor: 'text-blue-600', change: '+5%' },
            { label: 'High Priority', value: statistics.highPriority, icon: AlertTriangle, bgColor: 'bg-red-100', iconColor: 'text-red-600', change: '-2%' },
            { label: 'Overdue', value: statistics.overdueClaims, icon: Clock, bgColor: 'bg-orange-100', iconColor: 'text-orange-600', change: '+3%' },
            { label: 'Total Value', value: `$${Math.round(statistics.totalValue / 1000)}K`, icon: DollarSign, bgColor: 'bg-green-100', iconColor: 'text-green-600', change: '+12%' },
            { label: 'Avg Amount', value: `$${Math.round(statistics.averageAmount / 1000)}K`, icon: TrendingUp, bgColor: 'bg-purple-100', iconColor: 'text-purple-600', change: '+8%' },
            { label: 'Completion Rate', value: `${statistics.completionRate}%`, icon: Target, bgColor: 'bg-indigo-100', iconColor: 'text-indigo-600', change: '+2%' }
          ] : [
            { label: 'Total Processed', value: processedClaims.length, icon: CheckCircle, bgColor: 'bg-green-100', iconColor: 'text-green-600', change: `+${processedClaims.length}` },
            { label: 'Approved Today', value: statistics.approvedToday, icon: ThumbsUp, bgColor: 'bg-blue-100', iconColor: 'text-blue-600', change: `+${statistics.approvedToday}` },
            { label: 'Rejected Today', value: statistics.rejectedToday, icon: ThumbsDown, bgColor: 'bg-red-100', iconColor: 'text-red-600', change: `+${statistics.rejectedToday}` },
            { label: 'Returned Today', value: statistics.returnedToday, icon: RotateCcw, bgColor: 'bg-orange-100', iconColor: 'text-orange-600', change: `+${statistics.returnedToday}` },
            { label: 'Approved Total', value: processedClaims.filter(c => c.claimStatus === 'approved').length, icon: CheckCircle, bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600', change: '+15%' },
            { label: 'Success Rate', value: `${Math.round((processedClaims.filter(c => c.claimStatus === 'approved').length / Math.max(processedClaims.length, 1)) * 100)}%`, icon: Target, bgColor: 'bg-purple-100', iconColor: 'text-purple-600', change: '+5%' }
          ]).map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <IconComponent className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    stat.change.startsWith('+') ? 'bg-green-100 text-green-600' :
                    stat.change.startsWith('-') && stat.change.includes('%') ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            );
          })}
                </div>

        {/* Quick Filters - Only show for pending claims */}
        {activeView === 'pending' && quickFiltersVisible && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900">Quick Filters</h3>
                <span className="text-sm text-gray-500">({sortedAndFilteredClaims.length} results)</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Sliders className="w-4 h-4" />
                  Advanced Filters
                  {filtersExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setQuickFiltersVisible(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                { key: 'all', label: 'All Claims', icon: FileText, color: 'bg-blue-100 text-blue-700' },
                { key: 'high-priority', label: 'High Priority', icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
                { key: 'overdue', label: 'Overdue', icon: Clock, color: 'bg-orange-100 text-orange-700' },
                { key: 'large-amount', label: 'Large Amount', icon: DollarSign, color: 'bg-green-100 text-green-700' },
                { key: 'recent', label: 'Recent', icon: Calendar, color: 'bg-purple-100 text-purple-700' }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => handleQuickFilter(filter.key)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-medium transition-all hover:scale-105 ${
                    filter.key === 'all' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <filter.icon className="w-4 h-4" />
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Basic Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search claims, employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={amountFilter}
                onChange={(e) => setAmountFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="all">All Amounts</option>
                <option value="large">Large (&gt;$20K)</option>
                <option value="medium">Medium ($5K-$20K)</option>
                <option value="small">Small (&lt;$5K)</option>
              </select>

              <select
                value={sortConfig.key}
                onChange={(e) => setSortConfig(prev => ({ ...prev, key: e.target.value }))}
                className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="updatedAt">Sort by Date</option>
                <option value="claimAmount.requested">Sort by Amount</option>
                <option value="priority">Sort by Priority</option>
                <option value="employeeId.department">Sort by Department</option>
              </select>
            </div>
          </div>
        )}

        {/* Claims Display */}
        <div className="space-y-8">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {Object.keys(groupedClaims).length > 1 ? 'Grouped Results' : `${sortedAndFilteredClaims.length} ${activeView === 'pending' ? 'Pending' : 'Processed'} Claims Found`}
              </h2>
              <p className="text-gray-600 mt-1">
                Showing {paginatedClaims.length} of {sortedAndFilteredClaims.length} claims
              </p>
            </div>
          </div>

          {/* Claims Grid/List */}
          {sortedAndFilteredClaims.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                {activeView === 'pending' ? (
                  <Clock className="w-12 h-12 text-gray-400" />
                ) : (
                  <CheckCircle className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No {activeView === 'pending' ? 'Pending' : 'Processed'} Claims Found
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                {searchTerm || priorityFilter !== 'all' || statusFilter !== 'all' || amountFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting search criteria or filters to see more results'
                  : activeView === 'pending' 
                    ? 'No claims are currently awaiting review' 
                    : 'No processed claims found'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Display grouped claims */}
              {Object.entries(groupedClaims).map(([groupName, groupClaims]) => (
                <div key={groupName} className="space-y-6">
                  {Object.keys(groupedClaims).length > 1 && (
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-gray-900">{groupName}</h3>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                        {groupClaims.length} claims
                      </span>
                    </div>
                  )}

                  <div className={`grid gap-6 ${
                    viewMode === 'cards' 
                      ? 'grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}>
                    {groupClaims.map((claim) => (
                      <EnhancedClaimCard key={claim._id} claim={claim} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

            {/* Enhanced Modals with Backend Integration */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    modalType === 'view' ? 'bg-blue-500' :
                    modalType === 'approve' ? 'bg-green-500' :
                    modalType === 'reject' ? 'bg-red-500' :
                    modalType === 'return' ? 'bg-orange-500' :
                    'bg-purple-500'
                  }`}>
                    {modalType === 'view' && <Eye className="w-6 h-6 text-white" />}
                    {modalType === 'approve' && <CheckCircle className="w-6 h-6 text-white" />}
                    {modalType === 'reject' && <XCircle className="w-6 h-6 text-white" />}
                    {modalType === 'return' && <RotateCcw className="w-6 h-6 text-white" />}
                    {modalType === 'questionnaire' && <FileText className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {modalType === 'view' && 'Claim Details'}
                      {modalType === 'approve' && 'Approve Claim'}
                      {modalType === 'reject' && 'Reject Claim'}
                      {modalType === 'return' && 'Return Claim'}
                      {modalType === 'questionnaire' && 'Questionnaire Review'}
                    </h3>
                    {selectedClaim && (
                      <p className="text-gray-600 mt-1">
                        Claim ID: {selectedClaim.claimId}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedClaim(null);
                    resetForms();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              
              {/* VIEW DETAILS MODAL */}
              {modalType === 'view' && selectedClaim && (
                <div className="space-y-6">
                  {/* Claim Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center gap-3 mb-4">
                        <User className="w-6 h-6 text-blue-600" />
                        <h4 className="text-lg font-bold text-blue-900">Employee Information</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <dt className="text-sm font-medium text-blue-700">Name</dt>
                          <dd className="font-bold text-blue-900 text-lg">
                            {selectedClaim.employeeId?.firstName} {selectedClaim.employeeId?.lastName}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-blue-700">Department</dt>
                          <dd className="font-semibold text-blue-800">
                            {selectedClaim.employeeId?.department}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-blue-700">Email</dt>
                          <dd className="text-blue-800">
                            {selectedClaim.employeeId?.email}
                          </dd>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center gap-3 mb-4">
                        <Layers className="w-6 h-6 text-purple-600" />
                        <h4 className="text-lg font-bold text-purple-900">Claim Information</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <dt className="text-sm font-medium text-purple-700">Type</dt>
                          <dd className="font-bold text-purple-900 capitalize text-lg">
                            {selectedClaim.claimType}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-purple-700">Category</dt>
                          <dd className="font-bold text-purple-900 capitalize">
                            {selectedClaim.claimOption}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-purple-700">Status</dt>
                          <dd>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-500 text-white">
                              Awaiting Review
                            </span>
                          </dd>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center gap-3 mb-4">
                        <DollarSign className="w-6 h-6 text-green-600" />
                        <h4 className="text-lg font-bold text-green-900">Financial Details</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <dt className="text-sm font-medium text-green-700">Requested Amount</dt>
                          <dd className="text-3xl font-bold text-green-600">
                            ${(selectedClaim.claimAmount?.requested || 0).toLocaleString()}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-green-700">Submitted</dt>
                          <dd className="font-semibold text-green-800">
                            {new Date(selectedClaim.createdAt).toLocaleDateString()}
                          </dd>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setModalType('approve');
                        setApproveForm(prev => ({
                          ...prev,
                          approvedAmount: selectedClaim.claimAmount?.requested?.toString() || ''
                        }));
                      }}
                      className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve Claim
                    </button>

                    <button
                      onClick={() => setModalType('reject')}
                      className="flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Claim
                    </button>

                    <button
                      onClick={() => setModalType('return')}
                      className="flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Return Claim
                    </button>

                    <button
                      onClick={() => setModalType('questionnaire')}
                      className="flex items-center gap-3 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105"
                    >
                      <FileText className="w-5 h-5" />
                      View Questionnaire
                    </button>
                  </div>
                </div>
              )}

              {/* APPROVE CLAIM MODAL */}
              {modalType === 'approve' && selectedClaim && (
                <div className="space-y-6">
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <h4 className="text-xl font-bold text-green-900">Approve Claim: {selectedClaim.claimId}</h4>
                        <p className="text-green-700">Set the approved amount and add notes if needed</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-white rounded-xl p-4">
                        <h5 className="font-semibold text-gray-900 mb-2">Claim Summary</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Employee:</span>
                            <span className="font-medium">{selectedClaim.employeeId?.firstName} {selectedClaim.employeeId?.lastName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Type:</span>
                            <span className="font-medium capitalize">{selectedClaim.claimType} - {selectedClaim.claimOption}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Requested:</span>
                            <span className="font-medium text-green-600">${(selectedClaim.claimAmount?.requested || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-4">
                        <h5 className="font-semibold text-gray-900 mb-2">Processing Info</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Priority:</span>
                            <span className={`font-medium ${PRIORITY_CONFIG[selectedClaim.priority]?.textColor || 'text-gray-700'}`}>
                              {PRIORITY_CONFIG[selectedClaim.priority]?.label || 'Unknown'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Days Pending:</span>
                            <span className="font-medium">{selectedClaim.daysOverdue || 0} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className="font-medium text-blue-600">Ready for Review</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-green-800 mb-3">
                          Approved Amount * <span className="text-red-500">Required</span>
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
                          <input
                            type="number"
                            value={approveForm.approvedAmount}
                            onChange={(e) => setApproveForm(prev => ({
                              ...prev,
                              approvedAmount: e.target.value
                            }))}
                            placeholder="Enter approved amount"
                            className="w-full pl-12 pr-4 py-4 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-semibold"
                          />
                        </div>
                        <p className="text-sm text-green-600 mt-2">
                          Original request: ${(selectedClaim.claimAmount?.requested || 0).toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-green-800 mb-3">
                          Approval Notes <span className="text-gray-500 font-normal">(Optional)</span>
                        </label>
                        <textarea
                          value={approveForm.insurerNotes}
                          onChange={(e) => setApproveForm(prev => ({
                            ...prev,
                            insurerNotes: e.target.value
                          }))}
                          placeholder="Add any notes about the approval decision..."
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button
                        onClick={handleApprove}
                        disabled={actionLoading || !approveForm.approvedAmount}
                        className="flex items-center gap-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                      >
                        {actionLoading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                        {actionLoading ? 'Processing...' : 'Approve Claim'}
                      </button>

                      <button
                        onClick={() => setModalType('view')}
                        className="px-8 py-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                      >
                        Back to Details
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* REJECT CLAIM MODAL */}
              {modalType === 'reject' && selectedClaim && (
                <div className="space-y-6">
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <XCircle className="w-8 h-8 text-red-600" />
                      <div>
                        <h4 className="text-xl font-bold text-red-900">Reject Claim: {selectedClaim.claimId}</h4>
                        <p className="text-red-700">Please provide a clear reason for rejection</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 mb-6">
                      <h5 className="font-semibold text-gray-900 mb-3">Claim Details</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Employee:</span>
                          <span className="ml-2 font-medium">{selectedClaim.employeeId?.firstName} {selectedClaim.employeeId?.lastName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Amount:</span>
                          <span className="ml-2 font-medium text-red-600">${(selectedClaim.claimAmount?.requested || 0).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Type:</span>
                          <span className="ml-2 font-medium capitalize">{selectedClaim.claimType} - {selectedClaim.claimOption}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Submitted:</span>
                          <span className="ml-2 font-medium">{new Date(selectedClaim.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-red-800 mb-3">
                          Rejection Reason * <span className="text-red-500">Required</span>
                        </label>
                        <textarea
                          value={rejectForm.rejectionReason}
                          onChange={(e) => setRejectForm(prev => ({
                            ...prev,
                            rejectionReason: e.target.value
                          }))}
                          placeholder="Please provide a clear and detailed reason for rejection..."
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-red-800 mb-3">
                          Additional Notes <span className="text-gray-500 font-normal">(Optional)</span>
                        </label>
                        <textarea
                          value={rejectForm.insurerNotes}
                          onChange={(e) => setRejectForm(prev => ({
                            ...prev,
                            insurerNotes: e.target.value
                          }))}
                          placeholder="Add any additional context or recommendations..."
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button
                        onClick={handleReject}
                        disabled={actionLoading || !rejectForm.rejectionReason.trim()}
                        className="flex items-center gap-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                      >
                        {actionLoading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                        {actionLoading ? 'Processing...' : 'Reject Claim'}
                      </button>

                      <button
                        onClick={() => setModalType('view')}
                        className="px-8 py-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                      >
                        Back to Details
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* RETURN CLAIM MODAL */}
              {modalType === 'return' && selectedClaim && (
                <div className="space-y-6">
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <RotateCcw className="w-8 h-8 text-orange-600" />
                      <div>
                        <h4 className="text-xl font-bold text-orange-900">Return Claim: {selectedClaim.claimId}</h4>
                        <p className="text-orange-700">Specify what additional information is needed</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 mb-6">
                      <h5 className="font-semibold text-gray-900 mb-3">Current Status</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Submitted:</span>
                          <span className="ml-2 font-medium">{new Date(selectedClaim.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Updated:</span>
                          <span className="ml-2 font-medium">{new Date(selectedClaim.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Processing Time:</span>
                          <span className="ml-2 font-medium">{selectedClaim.daysOverdue || 0} days</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Amount:</span>
                          <span className="ml-2 font-medium">${(selectedClaim.claimAmount?.requested || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-orange-800 mb-3">
                          Return Reason * <span className="text-red-500">Required</span>
                        </label>
                        <textarea
                          value={returnForm.returnReason}
                          onChange={(e) => setReturnForm(prev => ({
                            ...prev,
                            returnReason: e.target.value
                          }))}
                          placeholder="Please specify what additional information, documentation, or clarification is needed..."
                          rows={5}
                          className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </div>

                    <div className="bg-orange-100 border border-orange-200 rounded-xl p-4 mt-4">
                      <h6 className="font-semibold text-orange-800 mb-2">Next Steps:</h6>
                      <ul className="text-sm text-orange-700 space-y-1">
                        <li>• The claim will be returned to the employee/HR for additional information</li>
                        <li>• They will receive specific feedback about what's needed</li>
                        <li>• The claim will return to the queue once updated</li>
                      </ul>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button
                        onClick={handleReturn}
                        disabled={actionLoading || !returnForm.returnReason.trim()}
                        className="flex items-center gap-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                      >
                        {actionLoading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-5 h-5" />
                        )}
                        {actionLoading ? 'Processing...' : 'Return Claim'}
                      </button>

                      <button
                        onClick={() => setModalType('view')}
                        className="px-8 py-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                      >
                        Back to Details
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* QUESTIONNAIRE MODAL */}
              {modalType === 'questionnaire' && selectedClaim && (
                <div className="space-y-6">
                  {actionLoading ? (
                    <div className="text-center py-12">
                      <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-500" />
                      <p className="text-lg text-gray-600">Loading questionnaire data...</p>
                    </div>
                  ) : (
                    <div>
                      <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <FileText className="w-8 h-8 text-purple-600" />
                          <div>
                            <h4 className="text-xl font-bold text-purple-900">
                              Questionnaire Review: {selectedClaim.claimId}
                            </h4>
                            <p className="text-purple-700">Employee responses and documentation</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-white rounded-xl p-4">
                          <div>
                            <div className="text-sm text-purple-700 font-medium">Completion Status</div>
                            <div className="font-bold text-purple-900 text-lg">
                              {selectedClaim.questionnaire?.isComplete ? 'Complete ✓' : 'In Progress'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-purple-700 font-medium">Last Updated</div>
                            <div className="font-bold text-purple-900">
                              {new Date(selectedClaim.questionnaire?.updatedAt || selectedClaim.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-purple-200 shadow-sm">
                        {selectedClaim.questionnaire && selectedClaim.questionnaire.questions && selectedClaim.questionnaire.questions.length > 0 ? (
                          <div className="p-6">
                            <h5 className="text-lg font-bold text-gray-900 mb-6">Employee Responses</h5>
                            <div className="space-y-6">
                              {selectedClaim.questionnaire.questions.map((question, index) => (
                                <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
                                  <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                      <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                      <h6 className="font-semibold text-gray-900 mb-3 text-base">
                                        {question.question || question.text || 'Question not available'}
                                      </h6>
                                      <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-gray-800 leading-relaxed">
                                          {question.answer || question.response || 'No response provided'}
                                        </p>
                                      </div>
                                      {question.type && (
                                        <div className="mt-2">
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                            {question.type}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h5 className="text-xl font-bold text-gray-900 mb-2">No Questionnaire Data</h5>
                            <p className="text-gray-600 mb-6">
                              {selectedClaim.questionnaire 
                                ? 'The questionnaire exists but contains no questions.' 
                                : 'No questionnaire has been submitted for this claim yet.'
                              }
                            </p>
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mx-auto max-w-md">
                              <p className="text-sm text-orange-700">
                                <strong>Action Required:</strong> Employee may need to complete additional documentation before processing.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4 mt-8">
                        <button
                          onClick={() => setModalType('view')}
                          className="px-8 py-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                        >
                          Back to Details
                        </button>
                        
                        {selectedClaim.questionnaire?.isComplete && (
                          <>
                            <button
                              onClick={() => {
                                setModalType('approve');
                                setApproveForm(prev => ({
                                  ...prev,
                                  approvedAmount: selectedClaim.claimAmount?.requested?.toString() || ''
                                }));
                              }}
                              className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg"
                            >
                              <CheckCircle className="w-5 h-5" />
                              Approve Claim
                            </button>

                            <button
                              onClick={() => setModalType('reject')}
                              className="flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg"
                            >
                              <XCircle className="w-5 h-5" />
                              Reject Claim
                            </button>
                          </>
                        )}

                        {!selectedClaim.questionnaire?.isComplete && (
                          <button
                            onClick={() => setModalType('return')}
                            className="flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg"
                          >
                            <RotateCcw className="w-5 h-5" />
                            Request More Info
                          </button>
                        )}
                      </div>
                    </div>
                  )}
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

