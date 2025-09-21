/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  DollarSign, 
  Filter,
  Search,
  Eye,
  ArrowRight,
  AlertCircle,
  Calendar,
  FileText,
  User,
  X,
  Download,
  BarChart3,
  Printer
} from 'lucide-react';

import { ClaimFilters } from '../../components/claims/ClaimFilters';
import { ClaimTable } from '../../components/claims/ClaimTable';
import { ClaimModal } from '../../components/claims/ClaimModal';
import { ForwardToInsurerModal } from '../../components/claims/ForwardToInsurerModal';
import { ReturnClaimModal } from '../../components/claims/ReturnClaimModal';
import { ClaimStats } from '../../components/claims/ClaimStats';

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
          icon: CheckCircle,
          iconColor: 'text-green-500'
        };
      case 'error':
        return {
          bg: 'bg-red-100 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-200',
          icon: XCircle,
          iconColor: 'text-red-500'
        };
      default:
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-200',
          icon: CheckCircle,
          iconColor: 'text-blue-500'
        };
    }
  };

  const styles = getNotificationStyles();
  const Icon = styles.icon;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${styles.iconColor}`} />
          </div>
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
      icon: DollarSign 
    }
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
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
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
                  className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{report.label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Reports will be downloaded as PDF files with current filter settings applied.
            </p>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

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
    claimStatus: 'hr', // Default to HR claims
    claimType: '',
    employeeId: '',
    startDate: '',
    endDate: '',
    searchTerm: ''
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalClaims: 0
  });
  
  // Modal state
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  
  // Sorting state
  const [sortBy, setSortBy] = useState('createdAt');
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
      const response = await insuranceApiService.getClaims({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder
      });
      
      console.log('Claims response:', response);
      
      // Handle different response structures for claims
      if (response) {
        if (response.data) {
          if (response.data.claims && Array.isArray(response.data.claims)) {
            setClaims(response.data.claims);
            setPagination(prev => ({
              ...prev,
              totalPages: response.data.totalPages || 0,
              totalClaims: response.data.totalClaims || 0
            }));
          } else if (Array.isArray(response.data)) {
            setClaims(response.data);
            setPagination(prev => ({
              ...prev,
              totalPages: 1,
              totalClaims: response.data.length
            }));
          } else {
            console.warn('Unexpected response.data structure for claims:', response.data);
            setClaims([]);
          }
        } else if (Array.isArray(response)) {
          setClaims(response);
          setPagination(prev => ({
            ...prev,
            totalPages: 1,
            totalClaims: response.length
          }));
        } else if (response.claims && Array.isArray(response.claims)) {
          setClaims(response.claims);
          setPagination(prev => ({
            ...prev,
            totalPages: response.totalPages || 0,
            totalClaims: response.totalClaims || 0
          }));
        } else {
          console.warn('Cannot find claims array in response:', response);
          setClaims([]);
        }
      } else {
        setClaims([]);
      }
    } catch (err) {
      setError('Failed to fetch claims');
      showNotification('Failed to fetch claims', 'error');
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await insuranceApiService.getClaimStatistics();
      
      console.log('Stats response:', response);
      
      // Handle different response structures for stats
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
      
      console.log('Claims requiring action response:', response);
      
      // Handle different possible response structures
      if (response) {
        if (response.data) {
          if (response.data.claims && Array.isArray(response.data.claims)) {
            setClaimsRequiringAction(response.data.claims);
          } else if (Array.isArray(response.data)) {
            setClaimsRequiringAction(response.data);
          } else if (response.data.data && Array.isArray(response.data.data)) {
            setClaimsRequiringAction(response.data.data);
          } else {
            console.warn('Unexpected response.data structure for claims requiring action:', response.data);
            setClaimsRequiringAction([]);
          }
        } else if (Array.isArray(response)) {
          setClaimsRequiringAction(response);
        } else if (response.claims && Array.isArray(response.claims)) {
          setClaimsRequiringAction(response.claims);
        } else if (response.result && Array.isArray(response.result)) {
          setClaimsRequiringAction(response.result);
        } else if (response.items && Array.isArray(response.items)) {
          setClaimsRequiringAction(response.items);
        } else {
          console.warn('Cannot find claims array in response structure:', response);
          setClaimsRequiringAction([]);
        }
      } else {
        console.warn('Response is null or undefined');
        setClaimsRequiringAction([]);
      }
    } catch (err) {
      console.error('Failed to fetch claims requiring action:', err);
      setClaimsRequiringAction([]);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
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

  const handleForwardClaim = (claim) => {
    setSelectedClaim(claim);
    setShowForwardModal(true);
  };

  const handleReturnClaim = (claim) => {
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
        // Convert dates for backend if needed
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      };

      // Remove empty values to clean up the filters
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

      // Create download link
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
    <div className="p-6 space-y-6 bg-white dark:bg-gray-900 min-h-screen">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Claim Review Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Review and manage submitted claims
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Reports Dropdown */}
          <ReportsDropdown 
            filters={filters}
            onGenerateReport={handleGenerateReport}
          />
          
          <div className="bg-green-100 dark:bg-green-900 px-4 py-2 rounded-lg">
            <span className="text-green-800 dark:text-green-200 font-medium">
              {claimsRequiringAction.length} Claims Pending Review
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <ClaimStats stats={stats} />

      {/* Claims Requiring Immediate Action */}
      {claimsRequiringAction.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
              Claims Requiring Action
            </h3>
          </div>
          
          <div className="grid gap-3">
            {claimsRequiringAction.slice(0, 3).map((claim) => (
              <div 
                key={claim._id} 
                className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-md border border-yellow-200 dark:border-yellow-700"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {claim.claimId}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {claim.employeeId?.firstName} {claim.employeeId?.lastName} • 
                      ${claim.claimAmount?.requested?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleViewClaim(claim)}
                  className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium text-sm flex items-center space-x-1"
                >
                  <span>Review</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {claimsRequiringAction.length > 3 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                and {claimsRequiringAction.length - 3} more...
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
      />

      {/* Claims Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <ClaimTable
          claims={claims}
          loading={loading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onViewClaim={handleViewClaim}
          onForwardClaim={handleForwardClaim}
          onReturnClaim={handleReturnClaim}
        />
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.totalClaims)} of{' '}
                {pagination.totalClaims} results
              </p>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showClaimModal && selectedClaim && (
        <ClaimModal
          claim={selectedClaim}
          onClose={() => {
            setShowClaimModal(false);
            setSelectedClaim(null);
          }}
          onForward={() => {
            setShowClaimModal(false);
            setShowForwardModal(true);
          }}
          onReturn={() => {
            setShowClaimModal(false);
            setShowReturnModal(true);
          }}
        />
      )}

      {showForwardModal && selectedClaim && (
        <ForwardToInsurerModal
          claim={selectedClaim}
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
          onClose={() => {
            setShowReturnModal(false);
            setSelectedClaim(null);
          }}
          onSuccess={handleReturnSuccess}
        />
      )}
    </div>
  );
};