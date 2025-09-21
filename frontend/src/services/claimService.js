/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// src/services/claimService.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem('authToken');
  const headers = {};
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper function to handle API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}/claims${endpoint}`;
  const isFormData = options.body instanceof FormData;
  
  const config = {
    method: 'GET',
    headers: getAuthHeaders(isFormData),
    ...options,
  };

  if (options.headers) {
    config.headers = { ...config.headers, ...options.headers };
  }

  const response = await fetch(url, config);
  
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  // Handle blob responses
  if (options.responseType === 'blob') {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.blob();
  }

  // Handle empty responses
  if (response.status === 204) {
    return null;
  }

  const data = await response.json();
  
  if (!response.ok) {
    const message = data?.message || 'An error occurred';
    throw new Error(message);
  }

  return data;
};

export const claimService = {
  // Get all claims with filtering and pagination
  getAllClaims: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        queryParams.append(key, value);
      }
    });

    const endpoint = queryParams.toString() ? `/?${queryParams.toString()}` : '/';
    return await apiRequest(endpoint);
  },

  // Get claim by MongoDB ID
  getClaimById: async (id) => {
    return await apiRequest(`/${id}`);
  },

  // Get claim by custom claim ID
  getClaimByClaimId: async (claimId) => {
    return await apiRequest(`/claim-id/${claimId}`);
  },

  // Update claim status
  updateClaimStatus: async (id, status) => {
    return await apiRequest(`/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Get claim statistics
  getClaimStats: async () => {
    return await apiRequest('/stats/overview');
  },

  // Get claims requiring action
  getClaimsRequiringAction: async () => {
    return await apiRequest('/stats/requiring-action');
  },

  // Get claims by status
  getClaimsByStatus: async (status) => {
    return await apiRequest(`/status/${status}`);
  },

  // Get claims by insurance agent
  getClaimsByAgent: async (agentId) => {
    return await apiRequest(`/agent/${agentId}`);
  },

  // Search claims
  searchClaims: async (searchTerm, additionalParams = {}) => {
    return await claimService.getAllClaims({
      search: searchTerm,
      ...additionalParams
    });
  },

  // Get user's claims
  getUserClaims: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const endpoint = queryParams.toString() ? `/my-claims?${queryParams.toString()}` : '/my-claims';
    return await apiRequest(endpoint);
  },

  // Create new claim
  createClaim: async (claimData) => {
    return await apiRequest('/', {
      method: 'POST',
      body: JSON.stringify(claimData),
    });
  },

  // Get questionnaire questions
  getQuestionnaireQuestions: async (claimId) => {
    return await apiRequest(`/${claimId}/questionnaire`);
  },

  // Update questionnaire answer
  updateQuestionnaireAnswer: async (claimId, answerData) => {
    return await apiRequest(`/${claimId}/questionnaire/answer`, {
      method: 'PATCH',
      body: JSON.stringify(answerData),
    });
  },

  // Submit questionnaire answers
  submitQuestionnaireAnswers: async (claimId, answers) => {
    return await apiRequest(`/${claimId}/questionnaire/answers`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },

  // Submit claim
  submitClaim: async (claimId, submitData) => {
    return await apiRequest(`/${claimId}/submit`, {
      method: 'POST',
      body: JSON.stringify(submitData),
    });
  },

  // Forward to insurer
  forwardToInsurer: async (claimId, forwardData) => {
    return await apiRequest(`/${claimId}/forward`, {
      method: 'POST',
      body: JSON.stringify(forwardData),
    });
  },

  // Make decision
  makeDecision: async (claimId, decisionData) => {
    return await apiRequest(`/${claimId}/decision`, {
      method: 'POST',
      body: JSON.stringify(decisionData),
    });
  },

  // Return claim
  returnClaim: async (claimId, returnData) => {
    return await apiRequest(`/${claimId}/return`, {
      method: 'POST',
      body: JSON.stringify(returnData),
    });
  },

  // Upload documents
  uploadDocument: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }
    return response.json();
  },

  // Download document
  downloadDocument: async (documentId) => {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/download`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }
    return response.blob();
  },

  // Get user policies
  getUserPolicies: async () => {
    const response = await fetch(`${API_BASE_URL}/policies/user`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get policies');
    }
    return response.json();
  },

  // Bulk update status
  bulkUpdateStatus: async (claimIds, status) => {
    return await apiRequest('/bulk/status', {
      method: 'PATCH',
      body: JSON.stringify({ claimIds, status }),
    });
  },

  // Validation helpers
  validateClaimData: (claimData) => {
    const errors = {};

    if (!claimData.employeeId) {
      errors.employeeId = 'Employee ID is required';
    }

    if (!claimData.policy) {
      errors.policy = 'Policy selection is required';
    }

    if (!claimData.claimType) {
      errors.claimType = 'Claim type is required';
    } else if (!['life', 'vehicle'].includes(claimData.claimType)) {
      errors.claimType = 'Invalid claim type';
    }

    if (!claimData.claimOption) {
      errors.claimOption = 'Claim option is required';
    } else {
      const validLifeOptions = ['hospitalization', 'channelling', 'medication', 'death'];
      const validVehicleOptions = ['accident', 'theft', 'fire', 'naturalDisaster'];
      
      if (claimData.claimType === 'life' && !validLifeOptions.includes(claimData.claimOption)) {
        errors.claimOption = 'Invalid life insurance claim option';
      }
      
      if (claimData.claimType === 'vehicle' && !validVehicleOptions.includes(claimData.claimOption)) {
        errors.claimOption = 'Invalid vehicle insurance claim option';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  validateSubmissionData: (submitData) => {
    const errors = {};

    if (!submitData.claimAmount || submitData.claimAmount <= 0) {
      errors.claimAmount = 'Valid claim amount is required';
    }

    if (submitData.claimAmount > 1000000) {
      errors.claimAmount = 'Claim amount exceeds maximum limit';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  validateForwardData: (forwardData) => {
    const errors = {};

    if (!forwardData.coverageBreakdown || !Array.isArray(forwardData.coverageBreakdown) || forwardData.coverageBreakdown.length === 0) {
      errors.coverageBreakdown = 'Coverage breakdown is required';
    } else {
      forwardData.coverageBreakdown.forEach((coverage, index) => {
        if (!coverage.coverageType) {
          errors[`coverage_${index}_type`] = 'Coverage type is required';
        }
        if (!coverage.requestedAmount || coverage.requestedAmount <= 0) {
          errors[`coverage_${index}_amount`] = 'Valid requested amount is required';
        }
      });
    }

    if (forwardData.hrNotes && forwardData.hrNotes.length > 1000) {
      errors.hrNotes = 'HR notes cannot exceed 1000 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  validateReturnData: (returnData) => {
    const errors = {};

    if (!returnData.returnReason || returnData.returnReason.trim().length === 0) {
      errors.returnReason = 'Return reason is required';
    } else if (returnData.returnReason.trim().length < 10) {
      errors.returnReason = 'Return reason must be at least 10 characters';
    } else if (returnData.returnReason.length > 500) {
      errors.returnReason = 'Return reason cannot exceed 500 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  validateDecisionData: (decisionData) => {
    const errors = {};

    if (!decisionData.status || !['approved', 'rejected'].includes(decisionData.status)) {
      errors.status = 'Decision status must be either approved or rejected';
    }

    if (decisionData.status === 'approved') {
      if (!decisionData.approvedAmount || decisionData.approvedAmount <= 0) {
        errors.approvedAmount = 'Approved amount is required for approved claims';
      }
    }

    if (decisionData.status === 'rejected') {
      if (!decisionData.rejectionReason || decisionData.rejectionReason.trim().length === 0) {
        errors.rejectionReason = 'Rejection reason is required for rejected claims';
      }
    }

    if (decisionData.insurerNotes && decisionData.insurerNotes.length > 1000) {
      errors.insurerNotes = 'Insurer notes cannot exceed 1000 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Format helpers
  formatCurrency: (amount) => {
    if (!amount && amount !== 0) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  },

  formatDate: (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  },

  formatDateTime: (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  },

  // Status helpers
  getStatusColor: (status) => {
    const colorMap = {
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      employee: 'bg-blue-100 text-blue-800 border-blue-200',
      hr: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      insurer: 'bg-purple-100 text-purple-800 border-purple-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  },

  getStatusText: (status) => {
    const statusMap = {
      draft: 'Draft',
      employee: 'With Employee',
      hr: 'Pending HR Review',
      insurer: 'With Insurer',
      approved: 'Approved',
      rejected: 'Rejected'
    };
    return statusMap[status] || status;
  },

  getClaimTypeText: (claimType) => {
    return claimType === 'life' ? 'Life Insurance' : 'Vehicle Insurance';
  },

  getClaimOptionText: (claimType, option) => {
    const lifeOptions = {
      hospitalization: 'Hospitalization',
      channelling: 'Channeling',
      medication: 'Medication',
      death: 'Death Benefit'
    };

    const vehicleOptions = {
      accident: 'Accident',
      theft: 'Theft',
      fire: 'Fire Damage',
      naturalDisaster: 'Natural Disaster'
    };

    const options = claimType === 'life' ? lifeOptions : vehicleOptions;
    return options[option] || option;
  },

  // Error handling
  handleApiError: (error) => {
    console.error('Claim Service Error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        message: 'Network error. Please check your internet connection.',
        status: 0,
        errors: {}
      };
    }
    
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
      errors: {}
    };
  }
};

// Export individual functions for convenience
export const {
  getAllClaims,
  getClaimById,
  getClaimByClaimId,
  updateClaimStatus,
  getClaimStats,
  getClaimsRequiringAction,
  getClaimsByStatus,
  getClaimsByAgent,
  searchClaims,
  getUserClaims,
  createClaim,
  getQuestionnaireQuestions,
  updateQuestionnaireAnswer,
  submitQuestionnaireAnswers,
  submitClaim,
  forwardToInsurer,
  makeDecision,
  returnClaim,
  uploadDocument,
  downloadDocument,
  getUserPolicies,
  bulkUpdateStatus
} = claimService;

export default claimService;