/* eslint-disable no-undef */
// src/services/policyService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/policies`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const policyService = {
  // Get all policies with filtering and pagination
  getAllPolicies: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        queryParams.append(key, value);
      }
    });

    return await apiClient.get(`/?${queryParams.toString()}`);
  },

  // Get policy by MongoDB ID
  getPolicyById: async (id) => {
    return await apiClient.get(`/${id}`);
  },

  // Get policy by custom policy ID (e.g., LG0001)
  getPolicyByPolicyId: async (policyId) => {
    return await apiClient.get(`/policy-id/${policyId}`);
  },

  // Update policy status (HR can do this)
  updatePolicyStatus: async (id, status) => {
    return await apiClient.patch(`/${id}/status`, { status });
  },

  // Add beneficiary to policy (HR can do this)
  addBeneficiary: async (id, beneficiaryId) => {
    return await apiClient.patch(`/${id}/beneficiaries/add`, { beneficiaryId });
  },

  // Remove beneficiary from policy (HR can do this)
  removeBeneficiary: async (id, beneficiaryId) => {
    return await apiClient.patch(`/${id}/beneficiaries/remove`, { beneficiaryId });
  },

  // Get policy statistics (HR dashboard)
  getPolicyStats: async () => {
    return await apiClient.get('/stats/overview');
  },

  // Get expiring policies
  getExpiringPolicies: async (days = 30) => {
    return await apiClient.get(`/stats/expiring?days=${days}`);
  },

  // Get policy usage/coverage details
  getPolicyUsage: async (id) => {
    return await apiClient.get(`/${id}/usage`);
  },

  // Get policies by insurance agent
  getPoliciesByAgent: async (agentId) => {
    return await apiClient.get(`/agent/${agentId}`);
  },

  // Search policies (using search parameter in getAllPolicies)
  searchPolicies: async (searchTerm, additionalParams = {}) => {
    return await policyService.getAllPolicies({
      search: searchTerm,
      ...additionalParams
    });
  },

  // Get user's policies (for employees)
  getUserPolicies: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    return await apiClient.get(`/my-policies?${queryParams.toString()}`);
  },

  // Check policy eligibility for user
  checkPolicyEligibility: async (policyType) => {
    return await apiClient.get(`/eligibility/${policyType}`);
  },

  // Bulk operations (admin only, but useful for HR to know)
  bulkUpdateStatus: async (policyIds, status) => {
    return await apiClient.patch('/bulk/status', { policyIds, status });
  }
};

// Export individual functions for convenience
export const {
  getAllPolicies,
  getPolicyById,
  getPolicyByPolicyId,
  updatePolicyStatus,
  addBeneficiary,
  removeBeneficiary,
  getPolicyStats,
  getExpiringPolicies,
  getPolicyUsage,
  getPoliciesByAgent,
  searchPolicies,
  getUserPolicies,
  checkPolicyEligibility,
  bulkUpdateStatus
} = policyService;

export default policyService;