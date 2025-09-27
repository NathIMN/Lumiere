import { useState, useEffect, useCallback } from 'react';
import claimService from '../services/claimService';
import { filterClaims, sortClaims } from '../utils/claimHelpers';

/**
 * Custom hook for managing claims data with filtering, sorting, and pagination
 */
export const useClaimsData = (initialFilters = {}, initialSort = { sortBy: 'createdAt', sortOrder: 'desc' }) => {
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalClaims: 0,
    limit: 10
  });
  
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    search: '',
    dateFrom: '',
    dateTo: '',
    amountFrom: '',
    amountTo: '',
    ...initialFilters
  });
  
  const [sort, setSort] = useState(initialSort);

  /**
   * Fetches claims from API
   */
  const fetchClaims = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = {
        page: pagination.currentPage,
        limit: pagination.limit,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
        ...params
      };

      const response = await claimService.getAllClaims(queryParams);
      
      setClaims(response.claims || []);
      setPagination(prev => ({
        ...prev,
        totalClaims: response.totalClaims || 0,
        totalPages: response.totalPages || 1,
        currentPage: response.currentPage || 1
      }));
      
    } catch (err) {
      console.error('Error fetching claims:', err);
      setError(err.message || 'Failed to fetch claims');
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, sort.sortBy, sort.sortOrder]);

  /**
   * Applies filters and sorting to claims
   */
  const applyFiltersAndSort = useCallback(() => {
    let filtered = filterClaims(claims, filters);
    filtered = sortClaims(filtered, sort.sortBy, sort.sortOrder);
    setFilteredClaims(filtered);
  }, [claims, filters, sort]);

  /**
   * Updates filters
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  }, []);

  /**
   * Updates sort criteria
   */
  const updateSort = useCallback((newSort) => {
    setSort(prev => ({ ...prev, ...newSort }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  }, []);

  /**
   * Changes page
   */
  const changePage = useCallback((page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  }, []);

  /**
   * Changes page size
   */
  const changePageSize = useCallback((limit) => {
    setPagination(prev => ({ 
      ...prev, 
      limit, 
      currentPage: 1 // Reset to first page
    }));
  }, []);

  /**
   * Refreshes data
   */
  const refresh = useCallback(() => {
    fetchClaims();
  }, [fetchClaims]);

  /**
   * Clears all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({
      status: 'all',
      type: 'all',
      search: '',
      dateFrom: '',
      dateTo: '',
      amountFrom: '',
      amountTo: ''
    });
  }, []);

  // Fetch claims when dependencies change
  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  // Apply filters when claims or filters change
  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  return {
    // Data
    claims: filteredClaims,
    rawClaims: claims,
    loading,
    error,
    pagination,
    filters,
    sort,
    
    // Actions
    updateFilters,
    updateSort,
    changePage,
    changePageSize,
    refresh,
    clearFilters,
    
    // Computed
    hasData: claims.length > 0,
    isEmpty: !loading && claims.length === 0,
    hasError: !!error
  };
};

/**
 * Custom hook for fetching a single claim
 */
export const useClaimDetails = (claimId) => {
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClaim = useCallback(async () => {
    if (!claimId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await claimService.getClaimById(claimId);
      setClaim(response.claim);
    } catch (err) {
      console.error('Error fetching claim:', err);
      setError(err.message || 'Failed to fetch claim details');
      setClaim(null);
    } finally {
      setLoading(false);
    }
  }, [claimId]);

  const refresh = useCallback(() => {
    fetchClaim();
  }, [fetchClaim]);

  useEffect(() => {
    fetchClaim();
  }, [fetchClaim]);

  return {
    claim,
    loading,
    error,
    refresh,
    hasData: !!claim,
    hasError: !!error
  };
};

/**
 * Custom hook for claims requiring action (dashboard)
 */
export const useClaimsRequiringAction = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClaimsRequiringAction = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await claimService.getClaimsRequiringAction();
      setClaims(response.claims || []);
    } catch (err) {
      console.error('Error fetching claims requiring action:', err);
      setError(err.message || 'Failed to fetch claims requiring action');
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    fetchClaimsRequiringAction();
  }, [fetchClaimsRequiringAction]);

  useEffect(() => {
    fetchClaimsRequiringAction();
  }, [fetchClaimsRequiringAction]);

  return {
    claims,
    loading,
    error,
    refresh,
    count: claims.length,
    hasData: claims.length > 0,
    isEmpty: !loading && claims.length === 0,
    hasError: !!error
  };
};

/**
 * Custom hook for claim statistics
 */
export const useClaimStatistics = () => {
  const [stats, setStats] = useState({
    totalClaims: 0,
    statusStats: [],
    typeStats: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await claimService.getClaimStatistics();
      setStats({
        totalClaims: response.totalClaims || 0,
        statusStats: response.statusStats || [],
        typeStats: response.typeStats || []
      });
    } catch (err) {
      console.error('Error fetching claim statistics:', err);
      setError(err.message || 'Failed to fetch claim statistics');
      setStats({ totalClaims: 0, statusStats: [], typeStats: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    stats,
    loading,
    error,
    refresh,
    hasData: stats.totalClaims > 0,
    hasError: !!error
  };
};