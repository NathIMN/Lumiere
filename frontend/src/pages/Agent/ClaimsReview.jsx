import React, { useState, useEffect, useCallback, useMemo } from 'react';
import insuranceApiService from '../../services/insurance-api';
import reportsApiService from '../../services/reports-api';
import { policyService } from '../../services/policyService';
import {
  Search, Filter, Eye, Clock, AlertTriangle, CheckCircle, XCircle, FileText, User, Building2,
  Calendar, DollarSign, ChevronRight, RefreshCw, MoreHorizontal, ArrowRight, ArrowLeft, Star,
  Flag, Download, Upload, MessageSquare, Send, Edit3, Zap, TrendingUp, Activity, Users, PieChart,
  AlertCircle, Info, Target, BarChart3, ThumbsUp, ThumbsDown, RotateCcw, Bookmark, BookmarkCheck,
  Settings, Plus, Minus, Save, X, Check, Grid3X3, List, Maximize2, Minimize2, SortAsc, SortDesc,
  Home, Bell, Menu, ChevronDown, ChevronUp, Layers, Square, CheckSquare, Filter as FilterIcon,
  Layout, Globe, Sliders, ToggleLeft, ToggleRight, Palette, Moon, Sun, ChevronLeft, ChevronsLeft, 
  ChevronsRight, Mail, Shield, Percent, TrendingDown, Calculator
} from 'lucide-react';

// Reports Dropdown Component
const ReportsDropdown = ({ filters, onGenerateReport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { 
      id: 'claims', 
      label: 'Claims Report', 
      description: 'Generate detailed claims report with current filters',
      icon: FileText 
    },
    { 
      id: 'financial', 
      label: 'Financial Report', 
      description: 'Generate financial summary report',
      icon: 'DollarSign' 
    },
  ];

  const handleGenerateReport = async (reportType) => {
    setIsGenerating(true);
    setIsOpen(false);
    
    try {
      await onGenerateReport(reportType);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isGenerating}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 dark:from-blue-700 dark:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Generating...</span>
          </>
        ) : (
          <>
            <BarChart3 className="h-4 w-4" />
            <span>Reports</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 lg:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-10 max-w-[calc(100vw-2rem)]">
          <div className="p-3 lg:p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">Generate Reports</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Export data with current filters applied</p>
          </div>
          
          <div className="p-2">
            {reportTypes.map((report) => {
              return (
                <button
                  key={report.id}
                  onClick={() => handleGenerateReport(report.id)}
                  className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{report.label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 lg:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-b-xl">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Reports will be downloaded as PDF files with current filter settings applied.
            </p>
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

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

  // Coverage analysis state
  const [coverageAnalysis, setCoverageAnalysis] = useState(null);
  const [detailedClaimData, setDetailedClaimData] = useState(null);
  const [policyCoverageData, setPolicyCoverageData] = useState(new Map()); // Map policyId -> coverage data

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
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [searchId, setSearchId] = useState('');


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

  // ==================== COLOR CONFIGURATION ====================
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

  // ==================== **FIXED** HELPER FUNCTIONS ====================
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj) || '';
  };

  // Employee information helper functions
  const getEmployeeName = (claim) => {
    const employee = claim.employeeId;
    if (!employee) return 'Employee Information Not Available';
    
    // Fix: Use correct case for fullName (capital N) and handle incomplete data
    const firstName = employee.firstName || employee.profile?.firstName;
    const lastName = employee.lastName || employee.profile?.lastName;
    const fullName = employee.fullName; // Virtual field from User model (capital N)
    
    // If we have meaningful fullName, use it
    if (fullName && fullName.trim()) return fullName;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    
    // Fallback to userId or email-based name for incomplete data
    if (employee.userId) return `Employee ${employee.userId}`;
    if (employee.email) {
      const emailUsername = employee.email.split('@')[0];
      return `User: ${emailUsername}`;
    }
    
    return 'Employee Name Not Available';
  };

  const getEmployeeEmail = (claim) => {
    const employee = claim.employeeId;
    return employee?.email || employee?.profile?.email || 'Email Not Available';
  };

  const getEmployeeId = (claim) => {
    const employee = claim.employeeId;
    return employee?.employment?.employeeId || 
           employee?.employeeId || 
           employee?.userId || 
           'Employee ID Not Available';
  };

  const getEmployeeDepartment = (claim) => {
    const employee = claim.employeeId;
    
    // Since profile and employment data are undefined, check all possible locations
    const department = employee?.employment?.department || 
                      employee?.department || 
                      employee?.profile?.department ||
                      null;
    
    // If department is found, return it
    if (department) return department;
    
    // Smart fallbacks since we don't have complete employee data
    if (employee?.email) {
      const emailParts = employee.email.split('@')[0].toLowerCase();
      // Check for department indicators in email
      if (emailParts.includes('hr') || emailParts.includes('human')) return 'Human Resources';
      if (emailParts.includes('it') || emailParts.includes('tech')) return 'Information Technology';
      if (emailParts.includes('sales')) return 'Sales';
      if (emailParts.includes('finance') || emailParts.includes('accounting')) return 'Finance';
      if (emailParts.includes('admin')) return 'Administration';
    }
    
    // Check if employee ID has patterns (E00001 = Employee role)
    if (employee?.userId?.startsWith('E')) {
      return 'General Employee';
    }
    
    // User-friendly fallback
    return 'Department Not Available';
  };

  // Coverage amount helper - prioritize HR forwarded amount
  const getClaimAmount = (claim) => {
    // First check for HR forwarded breakdown
    if (claim.hrForwardingDetails?.coverageBreakdown) {
      return claim.hrForwardingDetails.coverageBreakdown.reduce(
        (total, coverage) => total + (coverage.requestedAmount || 0), 0
      );
    }
    // Fallback to original claim amount
    return claim.claimAmount?.requested || claim.approvedAmount || 0;
  };

  // **FIX: Unique ID Generator**
  const getUniqueClaimId = (claim) => {
    return claim._id || claim.id || claim.claimId || `claim-${Math.random().toString(36).substr(2, 9)}`;
  };

  // **FIX: Remove Duplicates Function**
  const removeDuplicateClaims = (claims) => {
    const seen = new Set();
    return claims.filter(claim => {
      const uniqueId = getUniqueClaimId(claim);
      if (seen.has(uniqueId)) {
        console.log(`Removing duplicate claim: ${claim.claimId} (${uniqueId})`);
        return false;
      }
      seen.add(uniqueId);
      return true;
    });
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
    const status = (claim.claimStatus || '').toLowerCase();
    const decision = (claim.agentDecision || '').toLowerCase();

    const hasFinalStatus = ['approved', 'rejected', 'returned'].includes(status);
    const hasAgentDecision = ['approved', 'rejected', 'returned'].includes(decision);
    const processedFlag = claim.processedByAgent === true;
    const processedWorkflow = [
      WORKFLOW_STATUSES.AGENT_PROCESSED,
      WORKFLOW_STATUSES.SENT_TO_INSURER,
      WORKFLOW_STATUSES.COMPLETED
    ].includes(claim.workflowStatus);

    return hasFinalStatus || hasAgentDecision || processedFlag || processedWorkflow;
  };




  // ==================== TOAST NOTIFICATION ====================
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-lg z-50 transition-all transform shadow-lg border ${type === 'success' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
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

  // ==================== REPORT GENERATION HANDLER ====================
  const handleGenerateReport = async (reportType) => {
    try {
      let blob;
      const reportFilters = {
        claimStatus: 'insurer', // For agent page, only include insurer status claims
      };

      // Add any current filters if they exist
      if (searchTerm) reportFilters.searchTerm = searchTerm;
      if (priorityFilter && priorityFilter !== 'all') reportFilters.priority = priorityFilter;
      if (dateRange.from) reportFilters.startDate = dateRange.from;
      if (dateRange.to) reportFilters.endDate = dateRange.to;
      if (amountRange.min) reportFilters.minAmount = amountRange.min;
      if (amountRange.max) reportFilters.maxAmount = amountRange.max;

      // Clean filters - remove empty values
      Object.keys(reportFilters).forEach(key => {
        if (!reportFilters[key]) {
          delete reportFilters[key];
        }
      });

      switch (reportType) {
        case 'claims':
          blob = await reportsApiService.generateClaimsReport(reportFilters);
          break;
        case 'financial':
          blob = await reportsApiService.generateFinancialReport(reportFilters);
          break;
        default:
          throw new Error('Invalid report type');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `agent_${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully`, 'success');
    } catch (error) {
      console.error('Report generation failed:', error);
      showToast(`Failed to generate ${reportType} report: ${error.message}`, 'error');
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

    // Enhanced validation with policy coverage data
    try {
      if (selectedClaim.policy?.policyId && selectedClaim.employeeId) {
        const employeeId = getEmployeeIdFromClaim(selectedClaim);
        if (employeeId) {
          // Always use the custom policyId (like "LG0001") first
          const policyIdentifier = selectedClaim.policy.policyId || selectedClaim.policy._id;
          const coverageData = await loadPolicyCoverageData(policyIdentifier, employeeId);
          
          if (coverageData) {
            const summary = calculateCoverageSummary(coverageData);
            
            if (summary && approvedAmount > summary.totalRemaining) {
              showToast(
                `Approval amount ($${approvedAmount.toLocaleString()}) exceeds remaining coverage ($${summary.totalRemaining.toLocaleString()}). Employee has already claimed $${summary.totalClaimed.toLocaleString()} of their $${summary.totalLimit.toLocaleString()} limit.`,
                'error'
              );
              return;
            }

            // Check specific coverage type if available
            if (selectedClaim.claimOption && summary.coverageBreakdown) {
              const relevantCoverage = summary.coverageBreakdown.find(
                coverage => coverage.coverageType === selectedClaim.claimOption
              );
              
              if (relevantCoverage && approvedAmount > relevantCoverage.remainingAmount) {
                showToast(
                  `Approval amount ($${approvedAmount.toLocaleString()}) exceeds remaining ${selectedClaim.claimOption.replace('_', ' ')} coverage ($${relevantCoverage.remainingAmount.toLocaleString()}).`,
                  'error'
                );
                return;
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn('Could not validate coverage limits:', error);
      // Continue with approval but show warning
      showToast('Warning: Could not validate coverage limits. Proceeding with approval.', 'info');
    }

    // Validate against coverage limits if coverage analysis is available (legacy support)
    if (coverageAnalysis && selectedClaim.hrForwardingDetails?.coverageBreakdown) {
      let hasOverage = false;
      const overageDetails = [];

      for (const coverage of selectedClaim.hrForwardingDetails.coverageBreakdown) {
        const coverageInfo = coverageAnalysis.claimedAmounts.find(c => c.coverageType === coverage.coverageType);
        if (coverageInfo && coverage.requestedAmount > coverageInfo.remainingAmount) {
          hasOverage = true;
          overageDetails.push({
            type: coverage.coverageType,
            requested: coverage.requestedAmount,
            remaining: coverageInfo.remainingAmount,
            overage: coverage.requestedAmount - coverageInfo.remainingAmount
          });
        }
      }

      if (hasOverage) {
        let errorMessage = 'Coverage limits exceeded:\n';
        overageDetails.forEach(detail => {
          errorMessage += `• ${detail.type.replace('_', ' ')}: Requested $${detail.requested.toLocaleString()}, but only $${detail.remaining.toLocaleString()} remaining (Overage: $${detail.overage.toLocaleString()})\n`;
        });
        showToast(errorMessage, 'error');
        return;
      }
    }

    setActionLoading(true);
    try {
      const decisionData = {
        status: CLAIM_DECISIONS.APPROVED,
        approvedAmount: approvedAmount
      };

      if (approveForm.insurerNotes && approveForm.insurerNotes.trim()) {
        decisionData.insurerNotes = approveForm.insurerNotes.trim();
      }

      // Use MongoDB ObjectId for API calls
      const mongoClaimId = selectedClaim._id || selectedClaim.id;
      const customClaimId = selectedClaim.claimId || selectedClaim.claimNumber;

      console.log('Making claim decision with:', { 
        mongoClaimId, 
        customClaimId, 
        decisionData 
      });

      await insuranceApiService.makeClaimDecision(mongoClaimId, decisionData);

      setPendingClaims(prev => prev.filter(claim =>
        (claim.claimId || claim.claimNumber || claim._id || claim.id) !== customClaimId
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
      closeModal();

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
      const decisionData = {
        status: CLAIM_DECISIONS.REJECTED,
        rejectionReason: rejectForm.rejectionReason.trim()
      };

      if (rejectForm.insurerNotes && rejectForm.insurerNotes.trim()) {
        decisionData.insurerNotes = rejectForm.insurerNotes.trim();
      }

      // Use MongoDB ObjectId for API calls
      const mongoClaimId = selectedClaim._id || selectedClaim.id;
      const customClaimId = selectedClaim.claimId || selectedClaim.claimNumber;

      await insuranceApiService.makeClaimDecision(mongoClaimId, decisionData);

      setPendingClaims(prev => prev.filter(claim =>
        (claim.claimId || claim.claimNumber || claim._id || claim.id) !== customClaimId
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
      closeModal();

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
      // Use MongoDB ObjectId for API calls
      const mongoClaimId = selectedClaim._id || selectedClaim.id;
      const customClaimId = selectedClaim.claimId || selectedClaim.claimNumber;

      await insuranceApiService.returnClaim(mongoClaimId, returnForm.returnReason.trim());

      setPendingClaims(prev => prev.filter(claim =>
        (claim.claimId || claim.claimNumber || claim._id || claim.id) !== customClaimId
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
      closeModal();

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
        approvedAmount: getClaimAmount(claim).toString()
      }));
    }

    if (claim && (type === 'view' || type === 'questionnaire')) {
      // Use claimId (custom ID like LC000001) instead of MongoDB _id
      loadClaimDetails(claim.claimId || claim.claimNumber || claim.id);
    }
  };

  const resetForms = () => {
    setApproveForm({ approvedAmount: '', insurerNotes: '' });
    setRejectForm({ rejectionReason: '', insurerNotes: '' });
    setReturnForm({ returnReason: '' });
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClaim(null);
    setModalType('');
    setCoverageAnalysis(null);
    setDetailedClaimData(null);
    resetForms();
  };

  // ==================== COVERAGE ANALYSIS FUNCTIONS ====================
  
  const getEmployeeIdFromClaim = (claim) => {
    // Handle different possible structures for employeeId
    if (!claim.employeeId) return null;
    
    if (typeof claim.employeeId === 'string') {
      return claim.employeeId;
    }
    
    if (typeof claim.employeeId === 'object' && claim.employeeId._id) {
      return claim.employeeId._id;
    }
    
    if (typeof claim.employeeId === 'object' && claim.employeeId.id) {
      return claim.employeeId.id;
    }
    
    return null;
  };
  
  const loadPolicyCoverageData = async (policyId, beneficiaryId) => {
    try {
      if (!policyId || !beneficiaryId) {
        console.warn('Missing policyId or beneficiaryId:', { policyId, beneficiaryId });
        return null;
      }
      
      // Ensure beneficiaryId is a string
      const beneficiaryIdString = typeof beneficiaryId === 'object' 
        ? (beneficiaryId._id || beneficiaryId.id || beneficiaryId.toString())
        : beneficiaryId.toString();
      
      // Check if we already have this data cached
      const cacheKey = `${policyId}-${beneficiaryIdString}`;
      if (policyCoverageData.has(cacheKey)) {
        return policyCoverageData.get(cacheKey);
      }

      console.log('Fetching policy coverage data:', { policyId, beneficiaryId: beneficiaryIdString });
      
      // Fetch policy coverage data
      const coverageResponse = await policyService.getBeneficiaryClaimedAmounts(policyId, beneficiaryIdString);
      
      if (coverageResponse && coverageResponse.claimedAmounts) {
        // Cache the data
        setPolicyCoverageData(prev => new Map(prev.set(cacheKey, coverageResponse)));
        return coverageResponse;
      }
      
      return null;
    } catch (error) {
      console.error('Error loading policy coverage data:', error);
      return null;
    }
  };

  const calculateCoverageSummary = (coverageData) => {
    if (!coverageData || !coverageData.claimedAmounts) return null;

    const totalLimit = coverageData.totalCoverageAmount || 0;
    const totalClaimed = coverageData.claimedAmounts.reduce((sum, coverage) => sum + coverage.claimedAmount, 0);
    const totalRemaining = Math.max(0, totalLimit - totalClaimed);
    const utilizationPercentage = totalLimit > 0 ? Math.round((totalClaimed / totalLimit) * 100) : 0;

    return {
      totalLimit,
      totalClaimed,
      totalRemaining,
      utilizationPercentage,
      coverageBreakdown: coverageData.claimedAmounts
    };
  };

  // ==================== LOAD CLAIM DETAILS ====================
  const loadClaimDetails = async (claimId) => {
    try {
      setActionLoading(true);
      
      // Use the custom claimId (e.g., LC000001) instead of MongoDB ObjectId
      const claimResp = await insuranceApiService.getClaimById(claimId);
      let claimData = claimResp?.data || claimResp?.claim || claimResp;

      // Load coverage analysis if policy is available
      let coverageAnalysis = null;
      if (claimData?.policy?._id && claimData?.employeeId?._id) {
        try {
          const coverageResp = await insuranceApiService.getBeneficiaryClaimedAmounts(
            claimData.policy._id,
            claimData.employeeId._id
          );
          coverageAnalysis = coverageResp;
        } catch (coverageError) {
          console.warn('Could not load coverage analysis:', coverageError);
        }
      }

      let questionnaireResp = null;
      try {
        // Use MongoDB ObjectId for questionnaire API, not custom claimId
        const mongoClaimId = claimData._id;
        questionnaireResp = await insuranceApiService.getQuestionnaireQuestions(mongoClaimId);
      } catch (qError) {
        console.warn('Could not load questionnaire:', qError);
      }

      // Store the detailed claim data and coverage analysis for UI display
      setDetailedClaimData(claimData);
      setCoverageAnalysis(coverageAnalysis);

      const claimWithDetails = {
        ...claimData,
        questionnaire:
          questionnaireResp?.questionnaire ||
          questionnaireResp?.data ||
          questionnaireResp ||
          null,
      };

      setSelectedClaim(claimWithDetails);
      
      // Return for compatibility with existing code
      return { claimData, questionnaireData: questionnaireResp, coverageAnalysis };
    } finally {
      setActionLoading(false);
    }
  };

  // ==================== **FIXED** LOAD FUNCTIONS ====================

  const loadPendingClaims = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      let response;

      try {
        response = await insuranceApiService.getClaims({
          workflowStatus: WORKFLOW_STATUSES.AGENT_REVIEW,
          sentToAgent: true,
          hrApproved: true,
          limit: 100
        });
      } catch (primaryError) {
        console.log('Primary endpoint failed, using fallback...');
        response = await insuranceApiService.getClaims({
          claimStatus: 'insurer',
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

      console.log('Raw pending claims data:', claimsData.length);

      // **FIX 1: Remove duplicates first**
      const uniqueClaimsData = removeDuplicateClaims(claimsData);
      console.log('Unique pending claims after dedup:', uniqueClaimsData.length);

      const validPendingClaims = uniqueClaimsData.filter((claim) => {
        const status = (claim.claimStatus || '').toLowerCase();
        const awaitingAgent =
          status === 'insurer' ||
          claim.workflowStatus === WORKFLOW_STATUSES.SENT_TO_AGENT ||
          claim.workflowStatus === WORKFLOW_STATUSES.AGENT_REVIEW ||
          isClaimSentByHR(claim);

        const notProcessed =
          !isClaimProcessedByAgent(claim) &&
          !['approved', 'rejected', 'returned'].includes(status) &&
          claim.processedByAgent !== true;

        return awaitingAgent && notProcessed;
      });



      console.log('Valid pending claims after filtering:', validPendingClaims.length);

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
      console.log('Loading processed claims...');

      const [approvedResponse, rejectedResponse] = await Promise.all([
        insuranceApiService.getClaims({
          claimStatus: 'approved',
          processedByAgent: true,
          limit: 50
        }).catch(() => insuranceApiService.getClaims({ claimStatus: 'approved', limit: 50 })),

        insuranceApiService.getClaims({
          claimStatus: 'rejected',
          processedByAgent: true,
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

      console.log('All processed claims before deduplication:', allProcessedClaims.length);

      // **FIX 2: Remove duplicates FIRST before filtering**
      const uniqueProcessedClaims = removeDuplicateClaims(allProcessedClaims);
      console.log('Unique processed claims after dedup:', uniqueProcessedClaims.length);

      const validProcessedClaims = uniqueProcessedClaims.filter((claim) => {
        const status = (claim.claimStatus || '').toLowerCase();
        const decision = (claim.agentDecision || '').toLowerCase();
        const isFinalStatus = ['approved', 'rejected', 'returned'].includes(status);
        const isFinalDecision = ['approved', 'rejected', 'returned'].includes(decision);

        return (
          isFinalStatus ||
          isFinalDecision ||
          claim.processedByAgent === true ||
          [
            WORKFLOW_STATUSES.AGENT_PROCESSED,
            WORKFLOW_STATUSES.SENT_TO_INSURER,
            WORKFLOW_STATUSES.COMPLETED
          ].includes(claim.workflowStatus)
        );
      });




      console.log('Valid processed claims after filtering:', validProcessedClaims.length);

      // Sort by most recent
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

  // Use effect to handle deduplication after both states are updated
  useEffect(() => {
    if (pendingClaims.length > 0 && processedClaims.length > 0) {
      setPendingClaims((prevPending) => {
        const processedIds = new Set(
          processedClaims.map((c) => c._id || c.id || c.claimId)
        );
        const filteredPending = prevPending.filter((p) => 
          !processedIds.has(p._id || p.id || p.claimId)
        );
        
        if (filteredPending.length !== prevPending.length) {
          console.log(`Filtered out ${prevPending.length - filteredPending.length} overlapping pending claims`);
        }
        return filteredPending;
      });
    }
  }, [processedClaims]); // Run when processedClaims changes

  // ==================== **FIXED** COMPUTED VALUES ====================

const filteredPendingClaims = useMemo(() => {
  const from = dateRange.from ? new Date(dateRange.from) : null;
  const to   = dateRange.to ? new Date(dateRange.to) : null;
  const minAmt = amountRange.min !== '' ? Number(amountRange.min) : null;
  const maxAmt = amountRange.max !== '' ? Number(amountRange.max) : null;
  const idQuery = searchId.trim().toLowerCase();

  const withinDate = (c) => {
    const d = new Date(c.updatedAt || c.createdAt);
    if (from && d < from) return false;
    if (to) { const end = new Date(to); end.setHours(23,59,59,999); if (d > end) return false; }
    return true;
  };
  const withinAmount = (c) => {
    const amt = Number(c.claimAmount?.requested ?? c.approvedAmount ?? 0);
    if (minAmt !== null && amt < minAmt) return false;
    if (maxAmt !== null && amt > maxAmt) return false;
    return true;
  };
  const matchesPriority = (c) => {
    if (priorityFilter === 'all') return true;
    return (c.priority || 'medium').toLowerCase() === priorityFilter;
  };
  const matchesId = (c) => !idQuery || (c.claimId || '').toLowerCase().includes(idQuery);

  const sorted = [...pendingClaims]
    .filter((c) => matchesId(c) && matchesPriority(c) && withinDate(c) && withinAmount(c))
    .sort((a,b) => {
      if (sortConfig.key === 'amount') {
        const av = Number(a.claimAmount?.requested ?? a.approvedAmount ?? 0);
        const bv = Number(b.claimAmount?.requested ?? b.approvedAmount ?? 0);
        return sortConfig.direction === 'asc' ? av - bv : bv - av;
      }
      const at = new Date(a[sortConfig.key] || a.updatedAt || a.createdAt).getTime();
      const bt = new Date(b[sortConfig.key] || b.updatedAt || b.createdAt).getTime();
      return sortConfig.direction === 'asc' ? at - bt : bt - at;
    });

  return sorted;
}, [pendingClaims, priorityFilter, dateRange, amountRange, sortConfig, searchId]);

const filteredProcessedClaims = useMemo(() => {
  const from = dateRange.from ? new Date(dateRange.from) : null;
  const to   = dateRange.to ? new Date(dateRange.to) : null;
  const minAmt = amountRange.min !== '' ? Number(amountRange.min) : null;
  const maxAmt = amountRange.max !== '' ? Number(amountRange.max) : null;
  const idQuery = searchId.trim().toLowerCase();

  const withinDate = (c) => {
    const d = new Date(c.updatedAt || c.createdAt);
    if (from && d < from) return false;
    if (to) { const end = new Date(to); end.setHours(23,59,59,999); if (d > end) return false; }
    return true;
  };
  const withinAmount = (c) => {
    const amt = Number(c.claimAmount?.requested ?? c.approvedAmount ?? 0);
    if (minAmt !== null && amt < minAmt) return false;
    if (maxAmt !== null && amt > maxAmt) return false;
    return true;
  };
  const matchesStatus = (c) => {
    if (statusFilter === 'all') return true;
    const s = (c.claimStatus || c.agentDecision || '').toLowerCase();
    return s === statusFilter;
  };
  const matchesId = (c) => !idQuery || (c.claimId || '').toLowerCase().includes(idQuery);

  const sorted = [...processedClaims]
    .filter((c) => matchesId(c) && matchesStatus(c) && withinDate(c) && withinAmount(c))
    .sort((a,b) => {
      if (sortConfig.key === 'amount') {
        const av = Number(a.claimAmount?.requested ?? a.approvedAmount ?? 0);
        const bv = Number(b.claimAmount?.requested ?? b.approvedAmount ?? 0);
        return sortConfig.direction === 'asc' ? av - bv : bv - av;
      }
      const at = new Date(a[sortConfig.key] || a.updatedAt || a.createdAt).getTime();
      const bt = new Date(b[sortConfig.key] || b.updatedAt || b.createdAt).getTime();
      return sortConfig.direction === 'asc' ? at - bt : bt - at;
    });

  return sorted;
}, [processedClaims, statusFilter, dateRange, amountRange, sortConfig, searchId]);

const currentClaims = useMemo(() => (
  activeView === 'pending' ? filteredPendingClaims : filteredProcessedClaims
), [activeView, filteredPendingClaims, filteredProcessedClaims]);

const paginatedClaims = useMemo(() => {
  const start = (currentPage - 1) * itemsPerPage;
  return currentClaims.slice(start, start + itemsPerPage);
}, [currentClaims, currentPage, itemsPerPage]);


  // ==================== REAL-TIME VALIDATION COMPONENT ====================
  
  const ApprovalValidation = ({ claim, approvedAmount }) => {
    const [validation, setValidation] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Get stable employee ID reference
    const employeeId = getEmployeeIdFromClaim(claim);

    useEffect(() => {
      const validateAmount = async () => {
        if (!approvedAmount || isNaN(parseFloat(approvedAmount)) || parseFloat(approvedAmount) <= 0) {
          setValidation(null);
          return;
        }

        if (!claim?.policy?.policyId || !employeeId) {
          setValidation({ type: 'warning', message: 'Cannot validate: Policy or employee information missing' });
          return;
        }

        // Always use the custom policyId (like "LG0001") first
        const policyIdentifier = claim.policy.policyId || claim.policy._id;
        if (!policyIdentifier) {
          setValidation({ type: 'warning', message: 'Cannot validate: No policy identifier available' });
          return;
        }

        setLoading(true);
        try {
          const coverageData = await loadPolicyCoverageData(policyIdentifier, employeeId);
          
          if (coverageData) {
            const summary = calculateCoverageSummary(coverageData);
            const amount = parseFloat(approvedAmount);
            
            if (summary) {
              if (amount > summary.totalRemaining) {
                setValidation({
                  type: 'error',
                  message: `Amount exceeds remaining coverage by $${(amount - summary.totalRemaining).toLocaleString()}`
                });
              } else if (amount > summary.totalRemaining * 0.8) {
                setValidation({
                  type: 'warning',
                  message: `High approval amount - ${Math.round((amount / summary.totalLimit) * 100)}% of total coverage used`
                });
              } else {
                setValidation({
                  type: 'success',
                  message: `Valid amount - $${(summary.totalRemaining - amount).toLocaleString()} will remain`
                });
              }
            }
          } else {
            setValidation({ type: 'warning', message: 'Could not load coverage data for validation' });
          }
        } catch (error) {
          setValidation({ type: 'warning', message: 'Validation unavailable - network error' });
        } finally {
          setLoading(false);
        }
      };

      const timeoutId = setTimeout(validateAmount, 500); // Debounce validation
      return () => clearTimeout(timeoutId);
    }, [approvedAmount, claim?.policy?.policyId, employeeId]);

    if (loading) {
      return (
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
          <Calculator className="w-4 h-4 animate-spin" />
          <span>Validating coverage limits...</span>
        </div>
      );
    }

    if (!validation) return null;

    const styles = {
      success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      warning: 'bg-amber-50 border-amber-200 text-amber-700',
      error: 'bg-red-50 border-red-200 text-red-700'
    };

    const icons = {
      success: CheckCircle,
      warning: AlertTriangle,
      error: XCircle
    };

    const Icon = icons[validation.type];

    return (
      <div className={`mt-2 p-3 border rounded-lg ${styles[validation.type]}`}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">{validation.message}</span>
        </div>
      </div>
    );
  };

  // ==================== COVERAGE SUMMARY COMPONENT ====================
  
  const CoverageSummary = ({ claim, isCompact = false }) => {
    const [coverageData, setCoverageData] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Get stable employee ID reference
    const employeeId = getEmployeeIdFromClaim(claim);

    useEffect(() => {
      const loadCoverageInfo = async () => {
        if (!claim?.policy?.policyId || !employeeId) {
          console.warn('Missing policy or employee information:', { 
            policyId: claim?.policy?.policyId,
            policyObjectId: claim?.policy?._id,
            employeeId 
          });
          return;
        }
        
        // Always use the custom policyId (like "LG0001") first
        const policyIdentifier = claim.policy.policyId || claim.policy._id;
        if (!policyIdentifier) {
          console.warn('No policy identifier available');
          return;
        }
        
        setLoading(true);
        try {
          const data = await loadPolicyCoverageData(policyIdentifier, employeeId);
          setCoverageData(data);
        } catch (error) {
          console.error('Failed to load coverage data:', error);
        } finally {
          setLoading(false);
        }
      };

      loadCoverageInfo();
    }, [claim?.policy?.policyId, employeeId]);

    if (loading) {
      return (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-purple-600 animate-pulse" />
            <span className="text-sm font-semibold text-purple-700">Loading Coverage Info...</span>
          </div>
          <div className="h-4 bg-purple-200 rounded animate-pulse"></div>
        </div>
      );
    }

    if (!coverageData) {
      return (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">Coverage data unavailable</span>
          </div>
        </div>
      );
    }

    const summary = calculateCoverageSummary(coverageData);
    if (!summary) return null;

    const getUtilizationColor = (percentage) => {
      if (percentage >= 90) return 'text-red-600 bg-red-50 border-red-200';
      if (percentage >= 70) return 'text-amber-600 bg-amber-50 border-amber-200';
      if (percentage >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    };

    if (isCompact) {
      return (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">Coverage</span>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-semibold border ${getUtilizationColor(summary.utilizationPercentage)}`}>
              {summary.utilizationPercentage}% Used
            </div>
          </div>
          <div className="mt-2 text-xs text-purple-600">
            ${summary.totalRemaining.toLocaleString()} remaining of ${summary.totalLimit.toLocaleString()}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Coverage Summary</span>
        </div>
        
        {/* Overall Coverage Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">${summary.totalLimit.toLocaleString()}</div>
            <div className="text-xs text-gray-500 font-medium">Total Limit</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">${summary.totalClaimed.toLocaleString()}</div>
            <div className="text-xs text-gray-500 font-medium">Already Claimed</div>
          </div>
          {/* <div className="text-center">
            <div className="text-lg font-bold text-emerald-600">${summary.totalRemaining.toLocaleString()}</div>
            <div className="text-xs text-gray-500 font-medium">Remaining</div>
          </div> */}
        </div>

        {/* Utilization Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Coverage Utilized</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getUtilizationColor(summary.utilizationPercentage)}`}>
              {summary.utilizationPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                summary.utilizationPercentage >= 90 ? 'bg-red-500' :
                summary.utilizationPercentage >= 70 ? 'bg-amber-500' :
                summary.utilizationPercentage >= 50 ? 'bg-yellow-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(summary.utilizationPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Coverage Type Breakdown */}
        {summary.coverageBreakdown && summary.coverageBreakdown.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">By Coverage Type</div>
            {summary.coverageBreakdown.map((coverage, index) => (
              <div key={index} className="flex items-center justify-between text-xs bg-white rounded-lg p-2 border">
                <span className="font-medium text-gray-700 capitalize">
                  {coverage.coverageType.replace('_', ' ')}
                </span>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    ${coverage.remainingAmount.toLocaleString()} left
                  </div>
                  <div className="text-gray-500">
                    of ${coverage.coverageLimit.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ==================== USER-FRIENDLY CLAIM CARD COMPONENT ====================
  const EnhancedClaimCard = ({ claim }) => {
    const priorityConfig = PRIORITY_CONFIG[claim.priority] || PRIORITY_CONFIG['low'];
    const PriorityIcon = priorityConfig.icon;

    const statusConfig = activeView === 'processed'
      ? PROCESSED_CLAIM_STATUS[claim.claimStatus || claim.agentDecision] || PROCESSED_CLAIM_STATUS[CLAIM_DECISIONS.APPROVED]
      : null;

    // **FIX 5: Use unique claim ID for React keys**
    const uniqueClaimId = getUniqueClaimId(claim);

    return (
      <div
        className={`bg-white rounded-3xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${selectedClaims.has(uniqueClaimId) ? 'border-sky-300 bg-sky-50' : 'border-gray-100'
          }`}
      >

        {/* HEADER SECTION */}
        <div className="p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Checkbox */}
              {/* {activeView === 'pending' && (
                <input
                  type="checkbox"
                  checked={selectedClaims.has(uniqueClaimId)}
                  onChange={(e) => {
                    const newSelected = new Set(selectedClaims);
                    if (e.target.checked) {
                      newSelected.add(uniqueClaimId);
                    } else {
                      newSelected.delete(uniqueClaimId);
                    }
                    setSelectedClaims(newSelected);
                  }}
                  className="w-5 h-5 text-sky-600 rounded-lg focus:ring-sky-500 focus:ring-2"
                />
              )} */}

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
              <div className="text-xs text-gray-500 font-medium mb-1">HR FORWARDED AMOUNT</div>
              <div className="text-4xl font-bold text-emerald-600 mb-1">
                ${getClaimAmount(claim).toLocaleString()}
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">

            {/* Employee Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                <User className="w-5 h-5" />
                Employee
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="text-xl font-bold text-gray-900 mb-2">
                  {getEmployeeName(claim)}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{getEmployeeEmail(claim)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="text-sm">ID: {getEmployeeId(claim)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="w-4 h-4" />
                    <span className="font-medium">{getEmployeeDepartment(claim)}</span>
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
                    <span className="font-medium">Policy Number:</span>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-indigo-200">
                    <span className="text-sm font-semibold text-gray-700">
                      {claim.policy?.policyId || claim.policy?.policyNumber || 'Policy ID Not Available'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coverage Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                <Shield className="w-5 h-5" />
                Coverage Status
              </div>
              <CoverageSummary claim={claim} isCompact={false} />
            </div>

            {/* Progress & Status or HR Forwarding Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                <Target className="w-5 h-5" />
                {activeView === 'pending' ? 'HR Forwarding' : 'Status & Progress'}
              </div>

              {activeView === 'pending' && claim.hrForwardingDetails ? (
                <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-orange-600" />
                    <span className="text-lg font-bold text-gray-900">HR Review</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-sm font-medium">Officer:</span>
                      <span className="text-sm">
                        {claim.hrForwardingDetails.hrOfficer?.firstName} {claim.hrForwardingDetails.hrOfficer?.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        Forwarded: {new Date(claim.hrForwardingDetails.forwardingDate || claim.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        Amount: ${(claim.hrForwardingDetails.forwardedAmount || getClaimAmount(claim)).toLocaleString()}
                      </span>
                    </div>
                    {claim.hrForwardingDetails.hrNotes && (
                      <div className="mt-2 p-2 bg-white rounded-lg border border-orange-200">
                        <span className="text-xs text-gray-500 font-medium">HR Notes:</span>
                        <p className="text-xs text-gray-700 mt-1">{claim.hrForwardingDetails.hrNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : activeView === 'pending' ? (
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

      {/* **FIXED** Enhanced Header */}
      <div className="backdrop-blur-md bg-white/80 border-b border-gray-200">
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
              <ReportsDropdown 
                filters={{ 
                  searchTerm, 
                  priorityFilter, 
                  dateRange, 
                  amountRange 
                }}
                onGenerateReport={handleGenerateReport}
              />
              
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
{/* Premium Enhanced Filter Toolbar */}
<div className="mt-6 mb-8">
  {/* Primary Filter Row - More Prominent */}
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
    {/* Enhanced Search - Takes more space */}
    <div className="lg:col-span-5">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Search Claims
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value.trim())}
          className="block w-full pl-12 pr-12 py-4 text-sm border-2 border-gray-200 rounded-2xl bg-white/90 backdrop-blur-sm placeholder-gray-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white transition-all duration-200 hover:shadow-md focus:shadow-lg"
          placeholder="Enter Claim ID (e.g., LC000002, LC000003...)"
        />
        {searchId && (
          <button
            onClick={() => setSearchId('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
          </button>
        )}
      </div>
    </div>

    {/* Status Filter - Enhanced */}
    <div className="lg:col-span-3">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Filter by Status
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FilterIcon className="h-4 w-4 text-gray-400" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="block w-full pl-11 pr-10 py-4 text-sm border-2 border-gray-200 rounded-2xl bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 hover:shadow-md focus:shadow-lg appearance-none cursor-pointer"
        >
          <option value="all">🔍 All Statuses</option>
          <option value="approved">✅ Approved Claims</option>
          <option value="rejected">❌ Rejected Claims</option>
          <option value="returned">↩️ Returned Claims</option>
        </select>
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>

    {/* Sort Options - Enhanced */}
    <div className="lg:col-span-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Sort Results
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SortAsc className="h-4 w-4 text-gray-400" />
        </div>
        <select
          value={`${sortConfig.key}:${sortConfig.direction}`}
          onChange={(e) => {
            const [key, direction] = e.target.value.split(':');
            setSortConfig({ key, direction });
          }}
          className="block w-full pl-11 pr-10 py-4 text-sm border-2 border-gray-200 rounded-2xl bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 hover:shadow-md focus:shadow-lg appearance-none cursor-pointer"
        >
          <option value="updatedAt:desc">🕐 Latest Updates First</option>
          <option value="updatedAt:asc">🕐 Oldest Updates First</option>
          <option value="amount:desc">💰 Highest Amount First</option>
          <option value="amount:asc">💰 Lowest Amount First</option>
          <option value="createdAt:desc">📅 Recently Created</option>
          <option value="createdAt:asc">📅 Oldest Claims</option>
        </select>
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  </div>

  {/* Advanced Filters - Collapsible Section */}
  <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 rounded-3xl border border-gray-200/60 p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
        <Sliders className="h-4 w-4" />
        Advanced Filters
      </h3>
      <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
        <ChevronUp className="h-4 w-4" />
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Date Range Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          📅 Date Range
        </label>
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={dateRange.from ?? ''}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value || null }))}
                className="w-full text-sm bg-transparent border-none outline-none"
              />
            </div>
            <div className="px-3">
              <ArrowRight className="h-4 w-4 text-gray-300" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={dateRange.to ?? ''}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value || null }))}
                className="w-full text-sm bg-transparent border-none outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Amount Range Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          💰 Amount Range
        </label>
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Min ($)</label>
              <input
                type="number"
                placeholder="0"
                value={amountRange.min}
                onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-full text-sm bg-transparent border-none outline-none"
              />
            </div>
            <div className="px-3">
              <Minus className="h-4 w-4 text-gray-300" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Max ($)</label>
              <input
                type="number"
                placeholder="∞"
                value={amountRange.max}
                onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-full text-sm bg-transparent border-none outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary & Actions */}
      <div className="flex flex-col justify-end">
        <div className="space-y-3">
          {/* Results Counter */}
          <div className="bg-white rounded-2xl border-2 border-blue-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{currentClaims.length}</div>
            <div className="text-xs text-gray-600 font-medium">
              {currentClaims.length === 1 ? 'Claim Found' : 'Claims Found'}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSearchId('');
                setStatusFilter('all');
                setDateRange({ from: null, to: null });
                setAmountRange({ min: '', max: '' });
                setSortConfig({ key: 'updatedAt', direction: 'desc' });
              }}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-200"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
            <button className="flex items-center justify-center px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl transition-all duration-200">
              <Download className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>



          {/* **FIXED** View Toggle Buttons with Correct Counts */}
          <div className="mt-6 flex items-center justify-between">
            <div className="inline-flex bg-gray-100 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setActiveView('pending')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-medium text-sm ${activeView === 'pending'
                  ? 'bg-white text-sky-600 shadow-sm border border-sky-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <Clock className="w-4 h-4" />
                <span>Pending</span>
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${activeView === 'pending'
                  ? 'bg-sky-100 text-sky-700'
                  : 'bg-gray-200 text-gray-600'
                  }`}>
                  {filteredPendingClaims.length}
                </span>
              </button>

              <button
                onClick={() => setActiveView('processed')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-medium text-sm ${activeView === 'processed'
                  ? 'bg-white text-emerald-600 shadow-sm border border-emerald-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Processed</span>
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${activeView === 'processed'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-200 text-gray-600'
                  }`}>
                  {filteredProcessedClaims.length}
                </span>
              </button>
            </div>

            {/* Last updated info */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Claims Display */}
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
            /* **FIXED** Claims Cards with Unique Keys */
            <div className="space-y-6">
              {paginatedClaims.map((claim) => (
                <EnhancedClaimCard
                  key={getUniqueClaimId(claim)} // **FIXED: Unique keys**
                  claim={claim}
                />
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
                  onClick={closeModal}
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

                  {/* Coverage Summary in Approval Modal */}
                  <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                    <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Coverage Validation
                    </h4>
                    <CoverageSummary claim={selectedClaim} isCompact={false} />
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
                      <ApprovalValidation claim={selectedClaim} approvedAmount={approveForm.approvedAmount} />
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
                      {/* Employee & Basic Claim Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-sky-50 rounded-2xl p-6 border border-sky-200">
                          <h3 className="text-xl font-semibold text-sky-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Employee Information
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-sky-600">Full Name</label>
                              <p className="text-lg font-semibold text-gray-900">
                                {getEmployeeName(selectedClaim)}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-sky-600">Email</label>
                              <p className="text-gray-800">{getEmployeeEmail(selectedClaim)}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-sky-600">Employee ID</label>
                              <p className="text-gray-800">{getEmployeeId(selectedClaim)}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-sky-600">Department</label>
                              <p className="text-gray-800">{getEmployeeDepartment(selectedClaim)}</p>
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
                              <label className="text-sm font-medium text-emerald-600">Claim ID</label>
                              <p className="text-lg font-semibold text-gray-900">{selectedClaim.claimId}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-emerald-600">Policy ID</label>
                              <p className="text-lg font-semibold text-gray-900">
                                {detailedClaimData?.policy?.policyId || selectedClaim.policyId || 'Loading...'}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-emerald-600">Claim Type</label>
                              <p className="text-lg font-semibold text-gray-900 capitalize">
                                {selectedClaim.claimType} - {selectedClaim.claimOption}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-emerald-600">HR Forwarded Amount</label>
                              <p className="text-2xl font-bold text-emerald-600">
                                ${getClaimAmount(selectedClaim).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-emerald-600">Submission Date</label>
                              <p className="text-gray-800">{new Date(selectedClaim.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* HR Forwarding Details */}
                      {selectedClaim.hrForwardingDetails && (
                        <div className="bg-violet-50 rounded-2xl p-6 border border-violet-200">
                          <h3 className="text-xl font-semibold text-violet-800 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            HR Forwarding Details
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-violet-600">Coverage Breakdown</label>
                              <div className="mt-2 space-y-2">
                                {selectedClaim.hrForwardingDetails.coverageBreakdown?.map((coverage, index) => (
                                  <div key={index} className="bg-white rounded-lg p-3 border border-violet-200">
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium text-gray-900">
                                        {coverage.coverageType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                      </span>
                                      <span className="font-bold text-violet-600">
                                        ${coverage.requestedAmount?.toLocaleString()}
                                      </span>
                                    </div>
                                    {coverage.notes && (
                                      <p className="text-sm text-gray-600 mt-1">{coverage.notes}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                            {selectedClaim.hrForwardingDetails.hrNotes && (
                              <div>
                                <label className="text-sm font-medium text-violet-600">HR Notes</label>
                                <p className="text-gray-800 bg-white rounded-lg p-3 border border-violet-200 mt-1">
                                  {selectedClaim.hrForwardingDetails.hrNotes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Coverage Analysis */}
                      {coverageAnalysis && (
                        <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-200">
                          <h3 className="text-xl font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            Coverage Utilization Analysis
                          </h3>
                          <div className="space-y-4">
                            {coverageAnalysis.claimedAmounts?.map((coverage, index) => {
                              const utilizationPercentage = coverage.utilizationPercentage || 0;
                              const hrRequestedForThisCoverage = selectedClaim.hrForwardingDetails?.coverageBreakdown?.find(
                                c => c.coverageType === coverage.coverageType
                              );
                              
                              return (
                                <div key={index} className="bg-white rounded-lg p-4 border border-indigo-200">
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <h4 className="font-semibold text-gray-900">
                                        {coverage.coverageType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        {utilizationPercentage.toFixed(1)}% utilized
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      {hrRequestedForThisCoverage && (
                                        <div className="text-sm text-indigo-600 font-medium">
                                          HR Requested: ${hrRequestedForThisCoverage.requestedAmount?.toLocaleString()}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                                    <div>
                                      <div className="text-gray-500">Coverage Limit</div>
                                      <div className="font-semibold text-gray-900">
                                        ${coverage.coverageLimit?.toLocaleString()}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-gray-500">Already Claimed</div>
                                      <div className="font-semibold text-red-600">
                                        ${coverage.claimedAmount?.toLocaleString()}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-gray-500">Remaining</div>
                                      <div className="font-semibold text-green-600">
                                        ${coverage.remainingAmount?.toLocaleString()}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Usage Bar */}
                                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                    <div 
                                      className={`h-3 rounded-full transition-all duration-500 ${
                                        utilizationPercentage >= 90 ? 'bg-red-500' :
                                        utilizationPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                                      }`}
                                      style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                                    />
                                  </div>

                                  {/* Warning if HR requested amount exceeds remaining */}
                                  {hrRequestedForThisCoverage && hrRequestedForThisCoverage.requestedAmount > coverage.remainingAmount && (
                                    <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded-lg">
                                      <div className="flex items-center gap-2 text-red-700 text-sm">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span className="font-medium">
                                          Warning: Requested amount exceeds remaining coverage by ${(hrRequestedForThisCoverage.requestedAmount - coverage.remainingAmount).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons - Only for pending claims */}
                      {activeView === 'pending' && (
                        <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
                          <button
                            onClick={() => {
                              setModalType('approve');
                              setApproveForm(prev => ({
                                ...prev,
                                approvedAmount: getClaimAmount(selectedClaim).toString()
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
                        {selectedClaim.questionnaire.sections?.length > 0 ? (
                          selectedClaim.questionnaire.sections.map((section, sectionIndex) => (
                            <div key={section.sectionId || sectionIndex} className="bg-white rounded-xl p-6 border border-violet-200">
                              <div className="mb-4">
                                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                  {section.title}
                                </h4>
                                {section.description && (
                                  <p className="text-sm text-gray-600">{section.description}</p>
                                )}
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                                  section.isComplete 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {section.isComplete ? 'Complete' : 'Incomplete'}
                                </span>
                              </div>
                              
                              {section.questions?.length > 0 && (
                                <div className="space-y-4">
                                  {section.questions.map((question, questionIndex) => (
                                    <div key={question.questionId || questionIndex} className="bg-gray-50 rounded-lg p-4">
                                      <div className="flex items-start gap-3">
                                        <div className="p-1.5 bg-violet-100 rounded-lg border border-violet-200">
                                          <MessageSquare className="w-4 h-4 text-violet-600" />
                                        </div>
                                        <div className="flex-1">
                                          <h5 className="font-medium text-gray-900 mb-2">
                                            {question.questionText}
                                            {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                                          </h5>
                                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                                            <p className="text-gray-800">
                                              {question.currentAnswer?.value || 'No response provided'}
                                            </p>
                                            {question.currentAnswer?.answeredAt && (
                                              <p className="text-xs text-gray-500 mt-1">
                                                Answered: {new Date(question.currentAnswer.answeredAt).toLocaleString()}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                            <div className="text-center py-8">
                              <MessageSquare className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                              <p className="text-violet-600">No questionnaire sections available</p>
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