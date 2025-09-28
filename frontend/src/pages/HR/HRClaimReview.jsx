/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  X,
  Eye,
  ArrowRight,
  AlertCircle,
  FileText,
  BarChart3,
  History,
  Send,
  ArrowLeft
} from 'lucide-react';

import { ClaimFilters } from '../../components/claims/ClaimFilters';
import { ClaimTable } from '../../components/claims/ClaimTable';
import { ClaimModal } from '../../components/claims/ClaimModal';
import { ForwardToInsurerModal } from '../../components/claims/ForwardToInsurerModal';
import { ReturnClaimModal } from '../../components/claims/ReturnClaimModal';
import { ClaimStats } from '../../components/claims/ClaimStats';
import { ClaimHistory } from '../../components/claims/ClaimHistory';

import insuranceApiService from '../../services/insurance-api';
import reportsApiService from '../../services/reports-api';

// Inline Notification Component
const Notification = ({ message, type = 'success', onClose }) => {
  const getNotificationStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-100 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-800 dark:text-green-200',
          icon: 'CheckCircle',
          iconColor: 'text-green-500'
        };
      case 'error':
        return {
          bg: 'bg-red-100 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-200',
          icon: 'XCircle',
          iconColor: 'text-red-500'
        };
      default:
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-200',
          icon: 'CheckCircle',
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
    // { 
    //   id: 'activity', 
    //   label: 'Activity Report', 
    //   description: 'Generate HR activity and claim processing report',
    //   icon: History 
    // }
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
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-10">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generate Reports</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Export data with current filters applied</p>
          </div>
          
          <div className="p-2">
            {reportTypes.map((report) => {
              const Icon = report.icon;
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

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-b-xl">
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

// Updated Quick Action Panel Component - HR specific
// REMOVED - Functionality moved to ClaimStats component to avoid duplication

export const HRClaimReview = () => {
  const navigate = useNavigate();
  
  // State management
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState({});
  const [claimsRequiringAction, setClaimsRequiringAction] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Notification state
  const [notification, setNotification] = useState(null);
  
  // Filter and pagination state
  const [filters, setFilters] = useState({
    claimStatus: '',
    claimType: '',
    employeeId: '',
    startDate: '',
    endDate: '',
    searchTerm: '',
    hrAction: '',
    urgency: '',
    hasReturnReason: '',
    hasHRNotes: '',
    daysOld: ''
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 0,
    totalClaims: 0
  });
  
  // Modal state
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  // Sorting state
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchClaims();
    fetchStats();
    fetchClaimsRequiringAction();
  }, [filters, pagination.page, sortBy, sortOrder]);

  const fetchClaims = async () => {
    try {
      setLoading(true);

      // Clean filters - remove empty values
    const cleanFilters = Object.keys(filters).reduce((acc, key) => {
      if (filters[key] && filters[key] !== '') {
        acc[key] = filters[key];
      }
      return acc;
    }, {});
      
      // Enhanced debugging - log the exact request being sent
      const requestParams = {
        ...cleanFilters,
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        includeHistory: true,
        includeQuestionnaireDetails: true
      };
      
      console.log('=== CLAIMS REQUEST DEBUG ===');
      console.log('Request params:', requestParams);
      console.log('Current pagination state:', pagination);
      console.log('Current filters:', filters);
      console.log('=============================');
      
      const response = await insuranceApiService.getClaims(requestParams);
      
      console.log('=== CLAIMS RESPONSE DEBUG ===');
      console.log('Raw response:', response);
      console.log('Response keys:', response ? Object.keys(response) : 'null response');
      console.log('Response type:', typeof response);
      console.log('Is array?', Array.isArray(response));
      console.log('==============================');
      
      // Handle different response structures
      let claimsData = [];
      let paginationData = {};
      
      if (response) {
        if (response.data) {
          console.log('Response.data structure:', response.data);
          console.log('Response.data keys:', Object.keys(response.data));
          
          if (response.data.claims && Array.isArray(response.data.claims)) {
            claimsData = response.data.claims;
            paginationData = {
              totalPages: response.data.totalPages || Math.ceil((response.data.totalClaims || claimsData.length) / pagination.limit),
              totalClaims: response.data.totalClaims || claimsData.length
            };
            console.log('Using response.data.claims structure');
          } else if (Array.isArray(response.data)) {
            claimsData = response.data;
            paginationData = {
              totalPages: 1,
              totalClaims: claimsData.length
            };
            console.log('Using response.data as array');
          }
        } else if (Array.isArray(response)) {
          claimsData = response;
          paginationData = {
            totalPages: 1,
            totalClaims: claimsData.length
          };
          console.log('Using response as array');
        } else if (response.claims && Array.isArray(response.claims)) {
          claimsData = response.claims;
          paginationData = {
            totalPages: response.totalPages || Math.ceil((response.totalClaims || claimsData.length) / pagination.limit),
            totalClaims: response.totalClaims || claimsData.length
          };
          console.log('Using response.claims structure');
        } else {
          console.warn('Unexpected response structure:', response);
          console.warn('Available response properties:', Object.keys(response));
          claimsData = [];
        }
      }
      
      console.log('=== PROCESSED DATA DEBUG ===');
      console.log('Final claimsData length:', claimsData.length);
      console.log('Final paginationData:', paginationData);
      console.log('First few claims:', claimsData.slice(0, 3));
      console.log('=============================');
      
      setClaims(claimsData);
      setPagination(prev => ({
        ...prev,
        ...paginationData
      }));
      
    } catch (err) {
      console.error('=== CLAIMS ERROR DEBUG ===');
      console.error('Error details:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      console.error('===========================');
      setError('Failed to fetch claims');
      showNotification(`Failed to fetch claims: ${err.message}`, 'error');
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await insuranceApiService.getClaimStatistics();
      
      if (response) {
        if (response.data) {
          setStats(response.data);
        } else if (response.stats) {
          setStats(response.stats);
        } else if (typeof response === 'object' && !Array.isArray(response)) {
          setStats(response);
        } else {
          console.warn('Invalid stats response structure:', response);
          setStats({});
        }
      } else {
        console.warn('Stats response is null or undefined');
        setStats({});
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setStats({});
    }
  };

  const fetchClaimsRequiringAction = async () => {
    try {
      const response = await insuranceApiService.getClaimsRequiringAction();
      
      let actionClaims = [];
      
      if (response) {
        if (response.data) {
          if (response.data.claims && Array.isArray(response.data.claims)) {
            actionClaims = response.data.claims;
          } else if (Array.isArray(response.data)) {
            actionClaims = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            actionClaims = response.data.data;
          }
        } else if (Array.isArray(response)) {
          actionClaims = response;
        } else if (response.claims && Array.isArray(response.claims)) {
          actionClaims = response.claims;
        }
      }
      
      setClaimsRequiringAction(actionClaims);
    } catch (err) {
      console.error('Failed to fetch claims requiring action:', err);
      setClaimsRequiringAction([]);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleQuickFilter = (quickFilter) => {
    setFilters(prev => ({ ...prev, ...quickFilter }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleViewClaim = (claim) => {
    setSelectedClaim(claim);
    setShowClaimModal(true);
  };

  const handleViewHistory = (claim) => {
    setSelectedClaim(claim);
    setShowHistoryModal(true);
  };

  const handleForwardClaim = (claim) => {
    if (claim.claimStatus !== 'hr') {
      showNotification('Can only forward claims that are pending HR review', 'error');
      return;
    }
    setSelectedClaim(claim);
    setShowForwardModal(true);
  };

  const handleReturnClaim = (claim) => {
    if (claim.claimStatus !== 'hr') {
      showNotification('Can only return claims that are pending HR review', 'error');
      return;
    }
    setSelectedClaim(claim);
    setShowReturnModal(true);
  };

  const handleForwardSuccess = () => {
    setShowForwardModal(false);
    setSelectedClaim(null);
    fetchClaims();
    fetchStats();
    fetchClaimsRequiringAction();
    showNotification('Claim forwarded to insurer successfully', 'success');
  };

  const handleReturnSuccess = () => {
    setShowReturnModal(false);
    setSelectedClaim(null);
    fetchClaims();
    fetchStats();
    fetchClaimsRequiringAction();
    showNotification('Claim returned to employee successfully', 'success');
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Report generation handler
  const handleGenerateReport = async (reportType) => {
    try {
      let blob;
      const reportFilters = {
        ...filters,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      };

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
        case 'activity':
          blob = await reportsApiService.generateActivityReport(reportFilters);
          break;
        default:
          throw new Error('Invalid report type');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showNotification(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully`, 'success');
    } catch (error) {
      console.error('Report generation failed:', error);
      showNotification(`Failed to generate ${reportType} report: ${error.message}`, 'error');
    }
  };

  if (loading && claims.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            HR Claim Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
            Review and process employee insurance claims
          </p>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Showing {claims.length} of {pagination.totalClaims} total claims
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <ReportsDropdown 
            filters={filters}
            onGenerateReport={handleGenerateReport}
          />
          
          {claimsRequiringAction.length > 0 && (
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 px-6 py-3 rounded-xl border border-amber-200 dark:border-amber-700 shadow-sm">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 animate-pulse" />
                <span className="text-amber-800 dark:text-amber-200 font-semibold">
                  {claimsRequiringAction.length} Claims Need Attention
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards - HR Claim Status Overview and Financial Summary */}
      <ClaimStats stats={stats} />

      {/* Claims Requiring Immediate Action */}
      {claimsRequiringAction.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200">
                Claims Requiring Immediate Action
              </h3>
              <p className="text-amber-600 dark:text-amber-400 text-sm">
                These claims need your attention to proceed with processing
              </p>
            </div>
          </div>
          
          <div className="grid gap-4">
            {claimsRequiringAction.slice(0, 5).map((claim) => (
              <div 
                key={claim._id} 
                className="flex items-center justify-between bg-white/70 dark:bg-gray-800/70 p-4 rounded-xl border border-amber-200 dark:border-amber-700 hover:bg-white dark:hover:bg-gray-800 transition-colors backdrop-blur-sm"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {claim.claimId}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {claim.employeeId?.firstName} {claim.employeeId?.lastName} • 
                      Rs. {claim.claimAmount?.requested?.toLocaleString() || 0} • 
                      {Math.ceil((new Date() - new Date(claim.submittedAt)) / (1000 * 60 * 60 * 24))} days old
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleViewHistory(claim)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm flex items-center space-x-1 px-3 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <History className="h-4 w-4" />
                    <span>History</span>
                  </button>
                  <button
                    onClick={() => handleViewClaim(claim)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium text-sm flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <span>Review</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {claimsRequiringAction.length > 5 && (
              <p className="text-sm text-amber-700 dark:text-amber-300 text-center py-2">
                {claimsRequiringAction.length - 5} more claims require attention. 
                Use filters to view all urgent claims.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <ClaimFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        loading={loading}
        showHRActions={true}
      />

      {/* Claims Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <ClaimTable
          claims={claims}
          loading={loading}
          onViewClaim={handleViewClaim}
          onViewHistory={handleViewHistory}
          onForwardClaim={handleForwardClaim}
          onReturnClaim={handleReturnClaim}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
          pagination={pagination}
          onPageChange={handlePageChange}
          userRole="hr"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
          <div className="flex flex-col items-center space-y-3">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Something went wrong
              </h3>
              <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
            </div>
            <button
              onClick={() => {
                setError(null);
                fetchClaims();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && claims.length === 0 && !error && (
        <div className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Claims Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                {Object.values(filters).some(value => value) 
                  ? "No claims match your current filters. Try adjusting your search criteria."
                  : "No claims have been submitted yet. Claims will appear here once employees submit them."
                }
              </p>
            </div>
            {Object.values(filters).some(value => value) && (
              <button
                onClick={() => {
                  setFilters({
                    claimStatus: '',
                    claimType: '',
                    employeeId: '',
                    startDate: '',
                    endDate: '',
                    searchTerm: '',
                    hrAction: '',
                    urgency: '',
                    hasReturnReason: '',
                    hasHRNotes: '',
                    daysOld: ''
                  });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showClaimModal && selectedClaim && (
        <ClaimModal
          claim={selectedClaim}
          onClose={() => {
            setShowClaimModal(false);
            setSelectedClaim(null);
          }}
          onForward={() => handleForwardClaim(selectedClaim)}
          onReturn={() => handleReturnClaim(selectedClaim)}
          userRole="hr"
          onActionComplete={() => {
            fetchClaims();
            fetchStats();
            fetchClaimsRequiringAction();
          }}
        />
      )}

      {showForwardModal && selectedClaim && (
        <ForwardToInsurerModal
          claim={selectedClaim}
          isOpen={showForwardModal}
          onClose={() => {
            setShowForwardModal(false);
            setSelectedClaim(null);
          }}
          onSuccess={handleForwardSuccess}
        />
      )}

      {showReturnModal && selectedClaim && (
        <ReturnClaimModal
          claim={selectedClaim}
          isOpen={showReturnModal}
          onClose={() => {
            setShowReturnModal(false);
            setSelectedClaim(null);
          }}
          onSuccess={handleReturnSuccess}
        />
      )}

      {showHistoryModal && selectedClaim && (
        <ClaimHistory
          claim={selectedClaim}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedClaim(null);
          }}
        />
      )}
    </div>
  );
};