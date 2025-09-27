// src/hooks/usePolicies.js
import { useState, useEffect, useCallback } from 'react';
import { policyService } from '../services/policyService';
import { PAGINATION_DEFAULTS, SEARCH_CONFIG } from '../utils/policyConstants';

export const usePolicies = (initialParams = {}) => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPolicies, setTotalPolicies] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialParams.page || PAGINATION_DEFAULTS.PAGE);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    policyType: '',
    policyCategory: '',
    status: '',
    insuranceAgent: '',
    ...initialParams
  });

  // Fetch policies function
  const fetchPolicies = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = {
        page: currentPage,
        limit: PAGINATION_DEFAULTS.LIMIT,
        ...filters,
        ...params
      };

      if (searchTerm && searchTerm.length >= SEARCH_CONFIG.MIN_SEARCH_LENGTH) {
        queryParams.search = searchTerm;
      }

      const response = await policyService.getAllPolicies(queryParams);
      
      setPolicies(response.policies || []);
      setTotalPolicies(response.totalPolicies || 0);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(response.currentPage || 1);
    } catch (err) {
      setError(err.message);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, searchTerm]);

  // Initial load and dependency updates
  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchPolicies();
      }
    }, SEARCH_CONFIG.DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchPolicies();
    }
  }, [filters]);

  // Update filter function
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      policyType: '',
      policyCategory: '',
      status: '',
      insuranceAgent: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  // Pagination functions
  const goToPage = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  // Refresh function
  const refresh = useCallback(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  return {
    // Data
    policies,
    totalPolicies,
    totalPages,
    currentPage,
    
    // States
    loading,
    error,
    searchTerm,
    filters,
    
    // Actions
    setSearchTerm,
    updateFilter,
    clearFilters,
    goToPage,
    nextPage,
    prevPage,
    refresh,
    fetchPolicies
  };
};

// Hook for single policy details
export const usePolicy = (policyId) => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPolicy = useCallback(async () => {
    if (!policyId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await policyService.getPolicyById(policyId);
      setPolicy(response.policy);
    } catch (err) {
      setError(err.message);
      setPolicy(null);
    } finally {
      setLoading(false);
    }
  }, [policyId]);

  useEffect(() => {
    fetchPolicy();
  }, [fetchPolicy]);

  // Update policy status
  const updateStatus = useCallback(async (newStatus) => {
    if (!policy) return;
    
    try {
      setLoading(true);
      const response = await policyService.updatePolicyStatus(policy._id, newStatus);
      setPolicy(response.policy);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [policy]);

  // Add beneficiary
  const addBeneficiary = useCallback(async (beneficiaryId) => {
    if (!policy) return;
    
    try {
      setLoading(true);
      const response = await policyService.addBeneficiary(policy._id, beneficiaryId);
      setPolicy(response.policy);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [policy]);

  // Remove beneficiary
  const removeBeneficiary = useCallback(async (beneficiaryId) => {
    if (!policy) return;
    
    try {
      setLoading(true);
      const response = await policyService.removeBeneficiary(policy._id, beneficiaryId);
      setPolicy(response.policy);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [policy]);

  return {
    policy,
    loading,
    error,
    refresh: fetchPolicy,
    updateStatus,
    addBeneficiary,
    removeBeneficiary
  };
};