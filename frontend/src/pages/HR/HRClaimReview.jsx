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
  X
} from 'lucide-react';

import { ClaimFilters } from '../../components/claims/ClaimFilters';
import { ClaimTable } from '../../components/claims/ClaimTable';
import { ClaimModal } from '../../components/claims/ClaimModal';
import { ForwardToInsurerModal } from '../../components/claims/ForwardToInsurerModal';
import { ReturnClaimModal } from '../../components/claims/ReturnClaimModal';
import { ClaimStats } from '../../components/claims/ClaimStats';

import { claimService } from '../../services/claimService';

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
      const response = await claimService.getAllClaims({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder
      });
      
      setClaims(response.data.claims);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.totalPages,
        totalClaims: response.data.totalClaims
      }));
    } catch (err) {
      setError('Failed to fetch claims');
      showNotification('Failed to fetch claims', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await claimService.getClaimStatistics();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchClaimsRequiringAction = async () => {
    try {
      const response = await claimService.getClaimsRequiringAction();
      setClaimsRequiringAction(response.data.claims);
    } catch (err) {
      console.error('Failed to fetch claims requiring action:', err);
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