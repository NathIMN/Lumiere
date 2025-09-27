/* eslint-disable no-undef */
// src/services/policyService.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const POLICIES_BASE_URL = `${API_BASE_URL}/policies`;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Helper function to handle API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${POLICIES_BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Handle different response statuses
    if (!response.ok) {
      let errorMessage = 'API request failed';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (jsonError) {
        // If response isn't JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    // Return parsed JSON response
    return await response.json();
  } catch (error) {
    // Re-throw the error for handling by the calling function
    throw error;
  }
};

export const policyService = {
  // Create new policy (admin/hr only)
  createPolicy: async (policyData) => {
    return await apiRequest('/', {
      method: 'POST',
      body: JSON.stringify(policyData),
    });
  },

  // Update policy (admin/hr only)
  updatePolicy: async (id, policyData) => {
    return await apiRequest(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(policyData),
    });
  },

  // Delete policy (admin only)
  deletePolicy: async (id) => {
    return await apiRequest(`/${id}`, {
      method: 'DELETE',
    });
  },

  // Get all policies with filtering and pagination
  getAllPolicies: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    return await apiRequest(`/${queryString ? `?${queryString}` : ''}`);
  },

  // Get policy by MongoDB ID
  getPolicyById: async (id) => {
    return await apiRequest(`/${id}`);
  },

  // Get policy by custom policy ID (e.g., LG0001)
  getPolicyByPolicyId: async (policyId) => {
    return await apiRequest(`/policy-id/${policyId}`);
  },

  // Update policy status (HR can do this)
  updatePolicyStatus: async (id, status) => {
    return await apiRequest(`/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Add beneficiary to policy (HR can do this)
  addBeneficiary: async (id, beneficiaryId) => {
    return await apiRequest(`/${id}/beneficiaries/add`, {
      method: 'PATCH',
      body: JSON.stringify({ beneficiaryId }),
    });
  },

  // Remove beneficiary from policy (HR can do this)
  removeBeneficiary: async (id, beneficiaryId) => {
    return await apiRequest(`/${id}/beneficiaries/remove`, {
      method: 'PATCH',
      body: JSON.stringify({ beneficiaryId }),
    });
  },

  // Get policy statistics (HR dashboard)
  getPolicyStats: async () => {
    return await apiRequest('/stats/overview');
  },

  // Get expiring policies
  getExpiringPolicies: async (days = 30) => {
    return await apiRequest(`/stats/expiring?days=${days}`);
  },

  // Get policy usage/coverage details
  getPolicyUsage: async (id) => {
    return await apiRequest(`/${id}/usage`);
  },

  // Get policies by insurance agent
  getPoliciesByAgent: async (agentId) => {
    return await apiRequest(`/agent/${agentId}`);
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

    const queryString = queryParams.toString();
    return await apiRequest(`/my-policies${queryString ? `?${queryString}` : ''}`);
  },

  // Check policy eligibility for user
  checkPolicyEligibility: async (policyType) => {
    return await apiRequest(`/eligibility/${policyType}`);
  },

  // Bulk operations (admin only, but useful for HR to know)
  bulkUpdateStatus: async (policyIds, status) => {
    return await apiRequest('/bulk/status', {
      method: 'PATCH',
      body: JSON.stringify({ policyIds, status }),
    });
  }
};

// Export individual functions for convenience
export const {
  createPolicy,
  updatePolicy,
  deletePolicy,
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