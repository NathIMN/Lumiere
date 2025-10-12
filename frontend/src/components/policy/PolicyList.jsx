/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  MoreHorizontal,
  Shield,
  Users,
  Calendar,
  Coins,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Plus
} from 'lucide-react';
import { PolicyFilters } from './PolicyFilters';
import { BeneficiaryManagementModal } from './BeneficiaryManagementModal';
import { PolicyDetailsModal } from './PolicyDetailsModal';
import insuranceApiService from '../../services/insurance-api';

export const PolicyList = () => {
  // State management
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    policyType: '',
    policyCategory: '',
    status: '',
    insuranceAgent: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalResults: 0,
    limit: 20
  });

  // Modal states
  const [beneficiaryModal, setBeneficiaryModal] = useState({
    isOpen: false,
    policy: null,
    mode: 'add' // 'add' or 'remove'
  });
  
  const [policyDetailsModal, setPolicyDetailsModal] = useState({
    isOpen: false,
    policy: null,
    loading: false
  });

  const [actionLoading, setActionLoading] = useState(null);

  // Load policies
  const loadPolicies = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page,
        limit: pagination.limit
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === undefined || params[key] === null) {
          delete params[key];
        }
      });

      const response = await insuranceApiService.getPolicies(params);
      
      // Handle different response structures
      let policiesData = [];
      let totalResults = 0;
      let totalPages = 0;

      if (response.policies) {
        policiesData = response.policies;
        totalResults = response.totalResults || response.total || response.count || 0;
        totalPages = response.totalPages || Math.ceil(totalResults / pagination.limit);
      } else if (response.data) {
        policiesData = Array.isArray(response.data) ? response.data : [response.data];
        totalResults = response.totalResults || response.total || response.count || policiesData.length;
        totalPages = response.totalPages || Math.ceil(totalResults / pagination.limit);
      } else if (Array.isArray(response)) {
        policiesData = response;
        totalResults = response.length;
        totalPages = Math.ceil(totalResults / pagination.limit);
      }

      setPolicies(policiesData);
      setPagination(prev => ({
        ...prev,
        currentPage: page,
        totalPages,
        totalResults
      }));

    } catch (error) {
      console.error('Error loading policies:', error);
      setPolicies([]);
      setPagination(prev => ({
        ...prev,
        totalResults: 0,
        totalPages: 0
      }));
    } finally {
      setLoading(false);
    }
  };

  // Load policy details for modal
  const loadPolicyDetails = async (policyId) => {
    setPolicyDetailsModal(prev => ({
      ...prev,
      loading: true
    }));

    try {
      const policyDetails = await insuranceApiService.getPolicyById(policyId);
      
      setPolicyDetailsModal({
        isOpen: true,
        policy: policyDetails.data || policyDetails,
        loading: false
      });
    } catch (error) {
      console.error('Error loading policy details:', error);
      setPolicyDetailsModal(prev => ({
        ...prev,
        loading: false
      }));
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Handle search
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      search: '',
      policyType: '',
      policyCategory: '',
      status: '',
      insuranceAgent: ''
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status display
  const getStatusDisplay = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Active' },
      expired: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Expired' },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: 'Cancelled' },
      suspended: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Suspended' },
      pending: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Pending' }
    };

    return statusConfig[status] || statusConfig.pending;
  };

  // Handle policy actions
  const handleViewPolicy = async (policy) => {
    await loadPolicyDetails(policy._id);
  };

  const handleEditPolicy = (policy) => {
    // Implement edit functionality
    console.log('Edit policy:', policy);
  };

  const handleDeletePolicy = async (policy) => {
    if (window.confirm(`Are you sure you want to delete policy ${policy.policyId}?`)) {
      setActionLoading(policy._id);
      try {
        await insuranceApiService.deletePolicy(policy._id);
        loadPolicies(pagination.currentPage);
      } catch (error) {
        console.error('Error deleting policy:', error);
        alert('Failed to delete policy: ' + error.message);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleAddBeneficiary = (policy) => {
    setBeneficiaryModal({
      isOpen: true,
      policy,
      mode: 'add'
    });
  };

  const handleRemoveBeneficiary = (policy) => {
    setBeneficiaryModal({
      isOpen: true,
      policy,
      mode: 'remove'
    });
  };

  // Close modals
  const closeBeneficiaryModal = () => {
    setBeneficiaryModal({
      isOpen: false,
      policy: null,
      mode: 'add'
    });
    // Refresh policies to get updated beneficiary data
    loadPolicies(pagination.currentPage);
  };

  const closePolicyDetailsModal = () => {
    setPolicyDetailsModal({
      isOpen: false,
      policy: null,
      loading: false
    });
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      loadPolicies(page);
    }
  };

  // Effects
  useEffect(() => {
    loadPolicies(1);
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Policies</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage insurance policies and beneficiaries
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <Plus className="h-4 w-4" />
          New Policy
        </button>
      </div>

      {/* Filters */}
      <PolicyFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
        totalResults={pagination.totalResults}
        loading={loading}
      />

      {/* Policies List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8">
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="flex items-center p-4 border-b border-gray-200">
                    <div className="w-16 h-16 bg-gray-300 rounded-lg mr-4"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : policies.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No policies found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {Object.values(filters).some(filter => filter) 
                ? 'Try adjusting your search filters'
                : 'Get started by creating your first policy'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Policies Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Policy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type & Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Coverage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Validity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Beneficiaries
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {policies.map((policy) => {
                    const statusDisplay = getStatusDisplay(policy.status);
                    const StatusIcon = statusDisplay.icon;

                    return (
                      <tr key={policy._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        {/* Policy Info */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {policy.policyId}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {policy.insuranceAgent?.profile?.firstName || policy.insuranceAgent?.firstName || 'Unknown'}{' '}
                                {policy.insuranceAgent?.profile?.lastName || policy.insuranceAgent?.lastName || 'Agent'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Type & Category */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white capitalize">
                            {policy.policyType} Insurance
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {policy.policyCategory}
                          </div>
                        </td>

                        {/* Coverage */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(policy.coverage?.coverageAmount)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatCurrency(policy.premium?.amount)} {policy.premium?.frequency}
                          </div>
                        </td>

                        {/* Validity */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {policy.validity?.startDate ? formatDate(policy.validity.startDate) : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            to {policy.validity?.endDate ? formatDate(policy.validity.endDate) : 'N/A'}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusDisplay.label}
                          </span>
                        </td>

                        {/* Beneficiaries */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {policy.beneficiaries?.length || 0}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {/* View Details */}
                            <button
                              onClick={() => handleViewPolicy(policy)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {/* Edit Policy */}
                            <button
                              onClick={() => handleEditPolicy(policy)}
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                              title="Edit Policy"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            {/* Add Beneficiary */}
                            <button
                              onClick={() => handleAddBeneficiary(policy)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Add Beneficiary"
                            >
                              <UserPlus className="h-4 w-4" />
                            </button>

                            {/* Remove Beneficiary */}
                            {policy.beneficiaries?.length > 0 && (
                              <button
                                onClick={() => handleRemoveBeneficiary(policy)}
                                className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                                title="Remove Beneficiary"
                              >
                                <UserMinus className="h-4 w-4" />
                              </button>
                            )}

                            {/* Delete Policy */}
                            <button
                              onClick={() => handleDeletePolicy(policy)}
                              disabled={actionLoading === policy._id}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                              title="Delete Policy"
                            >
                              {actionLoading === policy._id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing{' '}
                      <span className="font-medium">
                        {((pagination.currentPage - 1) * pagination.limit) + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.currentPage * pagination.limit, pagination.totalResults)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{pagination.totalResults}</span>{' '}
                      results
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage <= 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage >= pagination.totalPages}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Beneficiary Management Modal */}
      <BeneficiaryManagementModal
        isOpen={beneficiaryModal.isOpen}
        onClose={closeBeneficiaryModal}
        policy={beneficiaryModal.policy}
        mode={beneficiaryModal.mode}
        onAddBeneficiary={() => {
          // Callback when beneficiary is added
          loadPolicies(pagination.currentPage);
        }}
        onRemoveBeneficiary={() => {
          // Callback when beneficiary is removed
          loadPolicies(pagination.currentPage);
        }}
      />

      {/* Policy Details Modal */}
      <PolicyDetailsModal
        isOpen={policyDetailsModal.isOpen}
        onClose={closePolicyDetailsModal}
        policy={policyDetailsModal.policy}
        loading={policyDetailsModal.loading}
      />
    </div>
  );
};