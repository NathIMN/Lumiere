const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

class InsuranceApiService {
   constructor() {
      this.baseURL = API_BASE_URL;
   }

   /**
    * Get authentication headers with Bearer token
    * @returns {Object} Headers object
    */
   getAuthHeaders() {
      const token = localStorage.getItem('authToken');
      return {
         'Content-Type': 'application/json',
         ...(token && { 'Authorization': `Bearer ${token}` }),
      };
   }


/**
 * Make authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} API response
 */
async request(endpoint, options = {}) {
  const url = `${this.baseURL}${endpoint}`;
  const config = {
    headers: this.getAuthHeaders(),
    ...options,
  };

  // Add Content-Type header for requests with body
  if (options.body && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  try {
    console.log('Making API request:', {
      method: options.method || 'GET',
      url,
      headers: config.headers,
      body: options.body ? JSON.parse(options.body) : undefined
    });

    const response = await fetch(url, config);
    
    console.log('API response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      let errorMessage = `API request failed with status ${response.status}`;
      let errorDetails = null;
      
      try {
        const errorData = await response.json();
        console.log('Error response body:', errorData);
        errorMessage = errorData.message || errorMessage;
        errorDetails = errorData;
      } catch (jsonError) {
        console.log('Failed to parse error response as JSON:', jsonError);
        try {
          const textError = await response.text();
          console.log('Error response text:', textError);
          errorMessage = textError || response.statusText || errorMessage;
        } catch (textError) {
          console.log('Failed to read error response as text:', textError);
          errorMessage = response.statusText || errorMessage;
        }
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.details = errorDetails;
      throw error;
    }

    const responseData = await response.json();
    console.log('Success response body:', responseData);
    return responseData;
    
  } catch (error) {
    console.error('API request error details:', {
      message: error.message,
      status: error.status,
      details: error.details,
      stack: error.stack
    });
    throw error;
  }
}

   // ==================== CLAIMS METHODS ====================

   /**
    * Create a new claim
    * @param {Object} claimData - Claim creation data
    * @param {string} claimData.employeeId - Employee ID
    * @param {string} claimData.policy - Policy ID
    * @param {string} claimData.claimType - Claim type ('life' or 'vehicle')
    * @param {string} claimData.claimOption - Claim option based on type
    * @returns {Promise<Object>} Created claim with questionnaire
    */
   async createClaim(claimData) {
      if (!claimData) {
         throw new Error('Claim data is required');
      }
      return this.request('/claims', {
         method: 'POST',
         body: JSON.stringify(claimData),
      });
   }

   /**
    * Get all claims with optional filtering
    * @param {Object} params - Query parameters
    * @param {string} params.employeeId - Filter by employee
    * @param {string} params.claimStatus - Filter by status
    * @param {string} params.claimType - Filter by type
    * @param {string} params.startDate - Filter by start date
    * @param {string} params.endDate - Filter by end date
    * @param {number} params.page - Page number
    * @param {number} params.limit - Items per page
    * @param {string} params.sortBy - Sort field
    * @param {string} params.sortOrder - Sort order ('asc' or 'desc')
    * @returns {Promise<Object>} Claims list with metadata
    */
   async getClaims(params = {}) {
      const queryString = new URLSearchParams(
         Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
      ).toString();

      const endpoint = queryString ? `/claims?${queryString}` : '/claims';
      return this.request(endpoint);
   }

   /**
    * Get claim by ID
    * @param {string} claimId - Claim ID
    * @returns {Promise<Object>} Claim data with populated fields
    */
   async getClaimById(claimId) {
      if (!claimId) {
         throw new Error('Claim ID is required');
      }
      return this.request(`/claims/${claimId}`);
   }

   /**
    * Get claims requiring action for current user
    * @returns {Promise<Object>} Claims pending action
    */
   async getClaimsRequiringAction() {
      return this.request('/claims/actions/pending');
   }

   /**
    * Get claim statistics
    * @returns {Promise<Object>} Claim statistics by status and type
    */
   async getClaimStatistics() {
      return this.request('/claims/stats/overview');
   }

   /**
    * Get questionnaire questions for a claim
    * @param {string} claimId - Claim ID
    * @returns {Promise<Object>} Questionnaire with questions and current answers
    */
   async getQuestionnaireQuestions(claimId) {
      if (!claimId) {
         throw new Error('Claim ID is required');
      }
      return this.request(`/claims/${claimId}/questionnaire`);
   }

   /**
    * Update a single questionnaire answer
    * @param {string} claimId - Claim ID
    * @param {Object} answerData - Answer data
    * @param {string} answerData.questionId - Question ID
    * @param {any} answerData.answer - Answer value
    * @returns {Promise<Object>} Updated claim with questionnaire status
    */
   async updateQuestionnaireAnswer(claimId, answerData) { //update only one answer
      if (!claimId) {
         throw new Error('Claim ID is required');
      }
      if (!answerData || !answerData.questionId) {
         throw new Error('Question ID and answer are required');
      }
      return this.request(`/claims/${claimId}/questionnaire/answer`, {
         method: 'PATCH',
         body: JSON.stringify(answerData),
      });
   }

   /**
    * Submit multiple questionnaire answers at once
    * @param {string} claimId - Claim ID
    * @param {Array} answers - Array of answer objects
    * @returns {Promise<Object>} Updated questionnaire with completion status
    */
   async submitQuestionnaireAnswers(claimId, answers) {
      if (!claimId) {
         throw new Error('Claim ID is required');
      }
      if (!Array.isArray(answers) || answers.length === 0) {
         throw new Error('Answers array is required and must not be empty');
      }
      return this.request(`/claims/${claimId}/questionnaire/submit-answers`, {
         method: 'PATCH',
         body: JSON.stringify({ answers }),
      });
   }
      /**
    * Submit multiple questionnaire answers at once
    * @param {string} claimId - Claim ID
    * @param {Array} answers - Array of answer objects
    * @returns {Promise<Object>} Updated questionnaire with completion status
    */
   async submitQuestionnaireSectionAnswers(claimId, sectionId, answers) {
      if (!claimId || !sectionId) {
         throw new Error('Claim ID and Section ID is required');
      }
      if (!Array.isArray(answers) || answers.length === 0) {
         throw new Error('Answers array is required and must not be empty');
      }
      return this.request(`/claims/${claimId}/questionnaire/section/${sectionId}/submit-answers`, {
         method: 'PATCH',
         body: JSON.stringify({ answers }),
      });
   }

   /**
    * Submit claim for review
    * @param {string} claimId - Claim ID
    * @param {Object} submissionData - Submission data
    * @param {number} submissionData.claimAmount - Requested claim amount
    * @param {Array} submissionData.documents - Optional supporting documents
    * @returns {Promise<Object>} Submitted claim
    */
   async submitClaim(claimId, submissionData) {
      if (!claimId) {
         throw new Error('Claim ID is required');
      }
      if (!submissionData || !submissionData.claimAmount) {
         throw new Error('Claim amount is required for submission');
      }
      return this.request(`/claims/${claimId}/submit`, {
         method: 'PATCH',
         body: JSON.stringify(submissionData),
      });
   }

   /**
    * Forward claim to insurer (HR only)
    * @param {string} claimId - Claim ID
    * @param {Object} forwardData - Forwarding data
    * @param {Array} forwardData.coverageBreakdown - Coverage breakdown array
    * @param {string} forwardData.hrNotes - Optional HR notes
    * @returns {Promise<Object>} Forwarded claim
    */
   async forwardClaimToInsurer(claimId, forwardData) {
      if (!claimId) {
         throw new Error('Claim ID is required');
      }
      if (!forwardData || !forwardData.coverageBreakdown) {
         throw new Error('Coverage breakdown is required');
      }
      return this.request(`/claims/${claimId}/forward`, {
         method: 'PATCH',
         body: JSON.stringify(forwardData),
      });
   }

   /**
    * Make final decision on claim (Insurance agent only)
    * @param {string} claimId - Claim ID
    * @param {Object} decisionData - Decision data
    * @param {string} decisionData.status - 'approved' or 'rejected'
    * @param {number} decisionData.approvedAmount - Approved amount (if approved)
    * @param {string} decisionData.rejectionReason - Rejection reason (if rejected)
    * @param {string} decisionData.insurerNotes - Optional insurer notes
    * @returns {Promise<Object>} Finalized claim
    */
   async makeClaimDecision(claimId, decisionData) {
      if (!claimId) {
         throw new Error('Claim ID is required');
      }
      if (!decisionData || !decisionData.status) {
         throw new Error('Decision status is required');
      }
      return this.request(`/claims/${claimId}/decision`, {
         method: 'PATCH',
         body: JSON.stringify(decisionData),
      });
   }

   /**
    * Return claim to previous stage
    * @param {string} claimId - Claim ID
    * @param {string} returnReason - Reason for returning the claim
    * @returns {Promise<Object>} Returned claim
    */
   async returnClaim(claimId, returnReason) {
      if (!claimId) {
         throw new Error('Claim ID is required');
      }
      if (!returnReason) {
         throw new Error('Return reason is required');
      }
      return this.request(`/claims/${claimId}/return`, {
         method: 'PATCH',
         body: JSON.stringify({ returnReason }),
      });
   }

   // ==================== POLICIES METHODS ====================

   /**
    * Create a new policy (Admin only)
    * @param {Object} policyData - Policy creation data
    * @returns {Promise<Object>} Created policy
    */
   async createPolicy(policyData) {
      if (!policyData) {
         throw new Error('Policy data is required');
      }
      return this.request('/policies', {
         method: 'POST',
         body: JSON.stringify(policyData),
      });
   }

   /**
    * Get all policies with filtering
    * @param {Object} params - Query parameters
    * @param {string} params.policyType - Filter by policy type
    * @param {string} params.policyCategory - Filter by category
    * @param {string} params.status - Filter by status
    * @param {string} params.insuranceAgent - Filter by agent
    * @param {number} params.page - Page number
    * @param {number} params.limit - Items per page
    * @param {string} params.search - Search term
    * @returns {Promise<Object>} Policies list with metadata
    */
   async getPolicies(params = {}) {
      const queryString = new URLSearchParams(
         Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
      ).toString();

      const endpoint = queryString ? `/policies?${queryString}` : '/policies';
      return this.request(endpoint);
   }

   /**
    * Get policy by ID
    * @param {string} policyId - Policy ID
    * @returns {Promise<Object>} Policy data with populated fields
    */
   async getPolicyById(policyId) {
      if (!policyId) {
         throw new Error('Policy ID is required');
      }
      return this.request(`/policies/${policyId}`);
   }

   /**
    * Get policy by custom policy ID (e.g., LG0001)
    * @param {string} policyId - Custom policy ID
    * @returns {Promise<Object>} Policy data
    */
   async getPolicyByCustomId(policyId) {
      if (!policyId) {
         throw new Error('Policy ID is required');
      }
      return this.request(`/policies/policy-id/${policyId}`);
   }

   /**
    * Update policy (Admin only)
    * @param {string} policyId - Policy ID
    * @param {Object} policyData - Policy update data
    * @returns {Promise<Object>} Updated policy
    */
   async updatePolicy(policyId, policyData) {
      if (!policyId) {
         throw new Error('Policy ID is required');
      }
      if (!policyData) {
         throw new Error('Policy data is required');
      }
      return this.request(`/policies/${policyId}`, {
         method: 'PATCH',
         body: JSON.stringify(policyData),
      });
   }

   /**
    * Delete policy (Admin only)
    * @param {string} policyId - Policy ID
    * @returns {Promise<Object>} Deletion confirmation
    */
   async deletePolicy(policyId) {
      if (!policyId) {
         throw new Error('Policy ID is required');
      }
      return this.request(`/policies/${policyId}`, {
         method: 'DELETE',
      });
   }

   /**
    * Update policy status
    * @param {string} policyId - Policy ID
    * @param {string} status - New status
    * @returns {Promise<Object>} Updated policy
    */
   async updatePolicyStatus(policyId, status) {
      if (!policyId) {
         throw new Error('Policy ID is required');
      }
      if (!status) {
         throw new Error('Status is required');
      }
      return this.request(`/policies/${policyId}/status`, {
         method: 'PATCH',
         body: JSON.stringify({ status }),
      });
   }

   /**
    * Add beneficiary to policy
    * @param {string} policyId - Policy ID
    * @param {string} beneficiaryId - User ID to add as beneficiary
    * @returns {Promise<Object>} Updated policy
    */
   async addPolicyBeneficiary(policyId, beneficiaryId) {
      if (!policyId) {
         throw new Error('Policy ID is required');
      }
      if (!beneficiaryId) {
         throw new Error('Beneficiary ID is required');
      }
      return this.request(`/policies/${policyId}/beneficiaries/add`, {
         method: 'PATCH',
         body: JSON.stringify({ beneficiaryId }),
      });
   }

   /**
    * Remove beneficiary from policy
    * @param {string} policyId - Policy ID
    * @param {string} beneficiaryId - User ID to remove as beneficiary
    * @returns {Promise<Object>} Updated policy
    */
   async removePolicyBeneficiary(policyId, beneficiaryId) {
      if (!policyId) {
         throw new Error('Policy ID is required');
      }
      if (!beneficiaryId) {
         throw new Error('Beneficiary ID is required');
      }
      return this.request(`/policies/${policyId}/beneficiaries/remove`, {
         method: 'PATCH',
         body: JSON.stringify({ beneficiaryId }),
      });
   }

   /**
    * Get current user's policies
    * @param {Object} params - Query parameters
    * @param {string} params.status - Filter by status
    * @param {string} params.policyType - Filter by type
    * @returns {Promise<Object>} User's policies
    */
   async getUserPolicies(params = {}) {
      const queryString = new URLSearchParams(
         Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
      ).toString();

      const endpoint = queryString ? `/policies/my-policies?${queryString}` : '/policies/my-policies';
      return this.request(endpoint);

   }

   /**
    * Get policies managed by insurance agent
    * @param {Object} params - Query parameters
    * @returns {Promise<Object>} Agent's policies
    */
   async getAgentPolicies(params = {}) {
      const queryString = new URLSearchParams(
         Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
      ).toString();

      const endpoint = queryString ? `/policies/my-agent-policies?${queryString}` : '/policies/my-agent-policies';
      return this.request(endpoint);
   }

   /**
    * Get policy statistics
    * @returns {Promise<Object>} Policy statistics
    */
   async getPolicyStatistics() {
      return this.request('/policies/stats/overview');
   }

   /**
    * Get expiring policies
    * @param {number} days - Days ahead to check for expiration
    * @returns {Promise<Object>} Expiring policies
    */
   async getExpiringPolicies(days = 30) {
      return this.request(`/policies/stats/expiring?days=${days}`);
   }

   /**
    * Renew policy
    * @param {string} policyId - Policy ID
    * @param {Object} renewalData - Renewal data
    * @param {string} renewalData.newEndDate - New end date
    * @param {number} renewalData.newPremiumAmount - Optional new premium amount
    * @returns {Promise<Object>} Renewed policy
    */
   async renewPolicy(policyId, renewalData) {
      if (!policyId) {
         throw new Error('Policy ID is required');
      }
      if (!renewalData || !renewalData.newEndDate) {
         throw new Error('New end date is required for renewal');
      }
      return this.request(`/policies/${policyId}/renew`, {
         method: 'PATCH',
         body: JSON.stringify(renewalData),
      });
   }

   /**
    * Check policy eligibility for user
    * @param {string} policyType - Policy type ('life' or 'vehicle')
    * @returns {Promise<Object>} Eligibility status and eligible policies
    */
   async checkPolicyEligibility(policyType) {
      if (!policyType) {
         throw new Error('Policy type is required');
      }
      return this.request(`/policies/eligibility/${policyType}`);
   }

   /**
    * Get policy usage summary
    * @param {string} policyId - Policy ID
    * @returns {Promise<Object>} Policy usage data
    */
   async getPolicyUsage(policyId) {
      if (!policyId) {
         throw new Error('Policy ID is required');
      }
      return this.request(`/policies/${policyId}/usage`);
   }

   /**
    * Bulk update policy status
    * @param {Array} policyIds - Array of policy IDs
    * @param {string} status - New status
    * @returns {Promise<Object>} Bulk update result
    */
   async bulkUpdatePolicyStatus(policyIds, status) {
      if (!Array.isArray(policyIds) || policyIds.length === 0) {
         throw new Error('Policy IDs array is required');
      }
      if (!status) {
         throw new Error('Status is required');
      }
      return this.request('/policies/bulk/status', {
         method: 'PATCH',
         body: JSON.stringify({ policyIds, status }),
      });
   }

   /**
    * Get policies by agent
    * @param {string} agentId - Agent ID
    * @param {Object} params - Query parameters
    * @returns {Promise<Object>} Agent's policies
    */
   async getPoliciesByAgent(agentId, params = {}) {
      if (!agentId) {
         throw new Error('Agent ID is required');
      }
      const queryString = new URLSearchParams(
         Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
      ).toString();

      const endpoint = queryString ? `/policies/agent/${agentId}?${queryString}` : `/policies/agent/${agentId}`;
      return this.request(endpoint);
   }

   // ==================== QUESTIONNAIRE TEMPLATES METHODS ====================

   /**
    * Get valid claim type and option combinations
    * @returns {Promise<Object>} Valid combinations
    */
   async getValidCombinations() {
      return this.request('/questionnaire-templates/combinations/valid');
   }

   /**
    * Get missing template combinations
    * @returns {Promise<Object>} Missing combinations
    */
   async getMissingCombinations() {
      return this.request('/questionnaire-templates/combinations/missing');
   }

   /**
    * Get all questionnaire templates
    * @param {Object} params - Query parameters
    * @param {string} params.claimType - Filter by claim type
    * @param {string} params.claimOption - Filter by claim option
    * @param {boolean} params.isActive - Filter by active status
    * @returns {Promise<Object>} Templates list with coverage info
    */
   async getQuestionnaireTemplates(params = {}) {
      const queryString = new URLSearchParams(
         Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
      ).toString();

      const endpoint = queryString ? `/questionnaire-templates?${queryString}` : '/questionnaire-templates';
      return this.request(endpoint);
   }

   /**
    * Get questionnaire template by ID
    * @param {string} templateId - Template ID
    * @returns {Promise<Object>} Template data
    */
   async getQuestionnaireTemplateById(templateId) {
      if (!templateId) {
         throw new Error('Template ID is required');
      }
      return this.request(`/questionnaire-templates/${templateId}`);
   }

   /**
    * Get template by claim type and option
    * @param {string} claimType - Claim type
    * @param {string} claimOption - Claim option
    * @returns {Promise<Object>} Active template for the combination
    */
   async getTemplateByTypeAndOption(claimType, claimOption) {
      if (!claimType) {
         throw new Error('Claim type is required');
      }
      if (!claimOption) {
         throw new Error('Claim option is required');
      }
      return this.request(`/questionnaireTemplates/by-type/${claimType}/${claimOption}`);
   }

   /**
    * Create new questionnaire template
    * @param {Object} templateData - Template creation data
    * @param {string} templateData.claimType - Claim type
    * @param {string} templateData.claimOption - Claim option
    * @param {string} templateData.title - Template title
    * @param {string} templateData.description - Template description
    * @param {Array} templateData.questions - Questions array
    * @returns {Promise<Object>} Created template
    */
   async createQuestionnaireTemplate(templateData) {
      if (!templateData) {
         throw new Error('Template data is required');
      }
      return this.request('/questionnaire-templates', {
         method: 'POST',
         body: JSON.stringify(templateData),
      });
   }

   /**
    * Update questionnaire template
    * @param {string} templateId - Template ID
    * @param {Object} templateData - Template update data
    * @returns {Promise<Object>} Updated template
    */
   async updateQuestionnaireTemplate(templateId, templateData) {
      if (!templateId) {
         throw new Error('Template ID is required');
      }
      if (!templateData) {
         throw new Error('Template data is required');
      }
      return this.request(`/questionnaire-templates/${templateId}`, {
         method: 'PATCH',
         body: JSON.stringify(templateData),
      });
   }

   /**
    * Delete questionnaire template (soft delete)
    * @param {string} templateId - Template ID
    * @returns {Promise<Object>} Deleted template
    */
   async deleteQuestionnaireTemplate(templateId) {
      if (!templateId) {
         throw new Error('Template ID is required');
      }
      return this.request(`/questionnaire-templates/${templateId}`, {
         method: 'DELETE',
      });
   }

   /**
    * Hard delete questionnaire template (Admin only)
    * @param {string} templateId - Template ID
    * @returns {Promise<Object>} Permanently deleted template
    */
   async hardDeleteQuestionnaireTemplate(templateId) {
      if (!templateId) {
         throw new Error('Template ID is required');
      }
      return this.request(`/questionnaire-templates/${templateId}/hard-delete`, {
         method: 'DELETE',
      });
   }

   /**
    * Toggle template status (activate/deactivate)
    * @param {string} templateId - Template ID
    * @returns {Promise<Object>} Template with updated status
    */
   async toggleTemplateStatus(templateId) {
      if (!templateId) {
         throw new Error('Template ID is required');
      }
      return this.request(`/questionnaire-templates/${templateId}/toggle-status`, {
         method: 'PATCH',
      });
   }

   /**
    * Clone questionnaire template
    * @param {string} templateId - Template ID to clone
    * @returns {Promise<Object>} Cloned template
    */
   async cloneQuestionnaireTemplate(templateId) {
      if (!templateId) {
         throw new Error('Template ID is required');
      }
      return this.request(`/questionnaire-templates/${templateId}/clone`, {
         method: 'POST',
      });
   }

  /**
   * Validate template structure
   * @param {Object} templateData - Template data to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateTemplateStructure(templateData) {
    if (!templateData) {
      throw new Error('Template data is required');
    }
    return this.request('/questionnaire-templates/validate', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  }

  // ==================== 🆕 ANALYTICS & DASHBOARD METHODS ====================

  /**
   * Get real-time agent analytics
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Real-time statistics
   */
  async getAgentRealTimeStats(params = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
    ).toString();
    
    const endpoint = queryString ? `/analytics/agent/realtime?${queryString}` : '/analytics/agent/realtime';
    return this.request(endpoint);
  }

  /**
   * Get agent performance metrics
   * @param {string} timeRange - Time range (24h, 7d, 30d, 90d)
   * @returns {Promise<Object>} Performance metrics
   */
  async getAgentPerformanceMetrics(timeRange = '24h') {
    return this.request(`/analytics/agent/performance?timeRange=${timeRange}`);
  }

  /**
   * Get agent workload analysis
   * @returns {Promise<Object>} Workload data
   */
  async getAgentWorkloadAnalysis() {
    return this.request('/analytics/agent/workload');
  }

  /**
   * Get efficiency insights for agent
   * @param {string} timeRange - Time range for analysis
   * @returns {Promise<Object>} Efficiency data
   */
  async getAgentEfficiencyInsights(timeRange = '7d') {
    return this.request(`/analytics/agent/efficiency?timeRange=${timeRange}`);
  }

  /**
   * Get urgent claims requiring immediate attention
   * @returns {Promise<Array>} List of urgent claims
   */
  async getUrgentClaims() {
    return this.request('/claims/agent/urgent');
  }

  /**
   * Get AI-powered recommendations for agent
   * @returns {Promise<Array>} AI recommendations
   */
  async getAIRecommendations() {
    return this.request('/ai/agent/recommendations');
  }

  /**
   * Get active notifications for agent
   * @returns {Promise<Array>} Active notifications
   */
  async getActiveNotifications() {
    return this.request('/notifications/agent/active');
  }

  /**
   * Get predictive analytics
   * @returns {Promise<Object>} Predictive data
   */
  async getPredictiveAnalytics() {
    return this.request('/analytics/agent/predictions');
  }

  /**
   * Get claims statistics for dashboard
   * @param {string} timeRange - Time range for stats
   * @returns {Promise<Object>} Claims statistics
   */
  async getClaimsStatsDashboard(timeRange = '24h') {
    return this.request(`/claims/stats/dashboard?timeRange=${timeRange}`);
  }

  /**
   * Get agent activity timeline
   * @param {string} timeRange - Time range for activity
   * @returns {Promise<Array>} Activity timeline
   */
  async getAgentActivityTimeline(timeRange = '24h') {
    return this.request(`/analytics/agent/timeline?timeRange=${timeRange}`);
  }

  /**
   * Bulk approve claims with similar characteristics
   * @param {Array} claimIds - Array of claim IDs to approve
   * @param {Object} approvalData - Bulk approval data
   * @returns {Promise<Object>} Bulk approval result
   */
  async bulkApproveClaims(claimIds, approvalData) {
    if (!Array.isArray(claimIds) || claimIds.length === 0) {
      throw new Error('Claim IDs array is required');
    }
    return this.request('/claims/bulk/approve', {
      method: 'POST',
      body: JSON.stringify({ claimIds, ...approvalData }),
    });
  }

  /**
   * Search claims with AI-powered features
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Search results
   */
  async smartSearchClaims(searchParams) {
    return this.request('/claims/search/smart', {
      method: 'POST',
      body: JSON.stringify(searchParams),
    });
  }

  /**
   * Get team chat messages
   * @returns {Promise<Array>} Chat messages
   */
  async getTeamChatMessages() {
    return this.request('/communications/team/messages');
  }

  /**
   * Send message to team chat
   * @param {Object} messageData - Message data
   * @returns {Promise<Object>} Sent message
   */
  async sendTeamMessage(messageData) {
    return this.request('/communications/team/send', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  /**
   * Export dashboard data
   * @param {Object} exportParams - Export parameters
   * @returns {Promise<Blob>} Export file
   */
  async exportDashboardData(exportParams) {
    return this.request('/analytics/export/dashboard', {
      method: 'POST',
      body: JSON.stringify(exportParams),
    });
  }

  /**
   * Update agent preferences
   * @param {Object} preferences - User preferences
   * @returns {Promise<Object>} Updated preferences
   */
  async updateAgentPreferences(preferences) {
    return this.request('/agents/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  }

  /**
   * Get agent preferences
   * @returns {Promise<Object>} Agent preferences
   */
  async getAgentPreferences() {
    return this.request('/agents/preferences');
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  /**
   * Get similar claims for bulk processing
   * @param {string} claimId - Reference claim ID
   * @returns {Promise<Array>} Similar claims
   */
  async getSimilarClaims(claimId) {
    if (!claimId) {
      throw new Error('Claim ID is required');
    }
    return this.request(`/claims/${claimId}/similar`);
  }

   // ==================== UTILITY METHODS ====================

   /**
    * Check if user is authenticated
    * @returns {boolean} Authentication status
    */
   isAuthenticated() {
      return !!localStorage.getItem('authToken');
   }

   /**
    * Get stored user role
    * @returns {string|null} User role
    */
   getUserRole() {
      return localStorage.getItem('userRole');
   }

   /**
    * Get stored user ID
    * @returns {string|null} User ID
    */
   getCurrentUserId() {
      return localStorage.getItem('userId');
   }

   /**
    * Check if current user has required role
    * @param {string|Array} requiredRoles - Required role(s)
    * @returns {boolean} Authorization status
    */
   hasRole(requiredRoles) {
      const userRole = this.getUserRole();
      if (!userRole) return false;

      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      return roles.includes(userRole);
   }

   /**
    * Check if current user can access admin features
    * @returns {boolean} Admin access status
    */
   isAdmin() {
      return this.hasRole('admin');
   }

   /**
    * Check if current user can access HR features
    * @returns {boolean} HR access status
    */
   isHR() {
      return this.hasRole(['admin', 'hr_officer']);
   }

   /**
    * Check if current user is an insurance agent
    * @returns {boolean} Insurance agent status
    */
   isInsuranceAgent() {
      return this.hasRole('insurance_agent');
   }

   /**
    * Check if current user is an employee
    * @returns {boolean} Employee status
    */
   isEmployee() {
      return this.hasRole('employee');
   }

   // ==================== WORKFLOW HELPER METHODS ====================

   /**
    * Get claims dashboard data for current user
    * @returns {Promise<Object>} Dashboard data with counts and pending actions
    */
   async getClaimsDashboardData() {
      const [stats, pendingClaims] = await Promise.all([
         this.getClaimStatistics(),
         this.getClaimsRequiringAction()
      ]);

      return {
         statistics: stats,
         pendingActions: pendingClaims,
      };
   }

   /**
    * Get policies dashboard data for current user
    * @returns {Promise<Object>} Dashboard data with policies and stats
    */
   async getPoliciesDashboardData() {
      const userRole = this.getUserRole();

      if (userRole === 'insurance_agent') {
         const [stats, agentPolicies, expiringPolicies] = await Promise.all([
            this.getPolicyStatistics(),
            this.getAgentPolicies(),
            this.getExpiringPolicies()
         ]);

         return {
            statistics: stats,
            agentPolicies: agentPolicies,
            expiringPolicies: expiringPolicies,
         };
      } else if (this.isHR()) {
         const [stats, expiringPolicies] = await Promise.all([
            this.getPolicyStatistics(),
            this.getExpiringPolicies()
         ]);

         return {
            statistics: stats,
            expiringPolicies: expiringPolicies,
         };
      } else {
         // Employee view
         const userPolicies = await this.getUserPolicies();
         return {
            userPolicies: userPolicies,
         };
      }
   }

   /**
    * Complete claim workflow in one go (for testing/admin purposes)
    * @param {string} claimId - Claim ID
    * @param {Array} answers - Questionnaire answers
    * @param {number} claimAmount - Claim amount
    * @param {Array} documents - Supporting documents
    * @returns {Promise<Object>} Submitted claim
    */
   async completeClaimWorkflow(claimId, answers, claimAmount, documents = []) {
      if (!claimId) {
         throw new Error('Claim ID is required');
      }

      // Submit answers
      await this.submitQuestionnaireAnswers(claimId, answers);

      // Submit claim
      return this.submitClaim(claimId, { claimAmount, documents });
   }

   /**
  * Update claim status
  * @param {string} claimId - Claim ID
  * @param {string} status - New status ('draft', 'employee', 'hr', 'insurer', 'approved', 'rejected')
  * @returns {Promise<Object>} Updated claim
  */
   async updateClaimStatus(claimId, status) {
      if (!claimId) {
         throw new Error('Claim ID is required');
      }
      if (!status) {
         throw new Error('Status is required');
      }
      return this.request(`/claims/${claimId}/status`, {
         method: 'PATCH',
         body: JSON.stringify({ status }),
      });
   }

   /**
    * Delete claim (Employee only)
    * @param {string} claimId - Claim ID (MongoDB ObjectId)
    * @returns {Promise<Object>} Deletion confirmation
    */
   async deleteClaim(claimId) {
      if (!claimId) {
         throw new Error('Claim ID is required');
      }
      return this.request(`/claims/by-id/${claimId}`, {
         method: 'DELETE',
      });
   }

   // ==================== CLAIM DOCUMENT UPLOAD METHODS ====================

   /**
    * Upload single document to a claim
    * @param {string} claimId - Claim ID
    * @param {File} file - File to upload
    * @param {Object} metadata - Document metadata
    * @param {string} metadata.docType - Document type (medical_bill, police_report, etc.)
    * @param {string} [metadata.description] - Document description
    * @param {string} [metadata.tags] - Comma-separated tags
    * @returns {Promise<Object>} Upload response with document data
    */
   async uploadClaimDocument(claimId, file, metadata) {
      if (!claimId) {
         throw new Error('Claim ID is required');
      }
      if (!file) {
         throw new Error('File is required');
      }
      if (!metadata || !metadata.docType) {
         throw new Error('Document type is required');
      }

      const formData = new FormData();
      formData.append('document', file);
      formData.append('docType', metadata.docType);
      
      if (metadata.description) {
         formData.append('description', metadata.description);
      }
      if (metadata.tags) {
         formData.append('tags', metadata.tags);
      }

      // Make upload request without Content-Type header (FormData sets it automatically)
      const url = `${this.baseURL}/claims/${claimId}/documents/upload`;
      const token = localStorage.getItem('authToken');
      const config = {
         method: 'POST',
         headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
         },
         body: formData,
      };

      try {
         const response = await fetch(url, config);
         
         if (!response.ok) {
            let errorMessage = 'Upload failed';
            try {
               const errorData = await response.json();
               errorMessage = errorData.message || errorMessage;
            } catch (jsonError) {
               errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
         }

         return await response.json();
      } catch (error) {
         console.error('Document upload error:', error);
         throw error;
      }
   }

   /**
    * Upload multiple documents to a claim
    * @param {string} claimId - Claim ID
    * @param {File[]} files - Files to upload
    * @param {Object} metadata - Document metadata
    * @param {string[]} metadata.docTypes - Document types array (must match files length)
    * @param {string} [metadata.description] - Shared description for all documents
    * @param {string} [metadata.tags] - Comma-separated tags for all documents
    * @returns {Promise<Object>} Upload response with documents data
    */
   async uploadMultipleClaimDocuments(claimId, files, metadata) {
      if (!claimId) {
         throw new Error('Claim ID is required');
      }
      if (!files || !Array.isArray(files) || files.length === 0) {
         throw new Error('Files array is required');
      }
      if (!metadata || !metadata.docTypes || !Array.isArray(metadata.docTypes)) {
         throw new Error('Document types array is required');
      }
      if (metadata.docTypes.length !== files.length) {
         throw new Error('Number of document types must match number of files');
      }

      const formData = new FormData();
      
      // Append all files
      files.forEach(file => {
         formData.append('documents', file);
      });
      
      // Append document types as JSON string
      formData.append('docTypes', JSON.stringify(metadata.docTypes));
      
      if (metadata.description) {
         formData.append('description', metadata.description);
      }
      if (metadata.tags) {
         formData.append('tags', metadata.tags);
      }

      // Make upload request without Content-Type header (FormData sets it automatically)
      const url = `${this.baseURL}/claims/${claimId}/documents/upload/multiple`;
      const token = localStorage.getItem('authToken');
      const config = {
         method: 'POST',
         headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
         },
         body: formData,
      };

      try {
         const response = await fetch(url, config);
         
         if (!response.ok) {
            let errorMessage = 'Multiple upload failed';
            try {
               const errorData = await response.json();
               errorMessage = errorData.message || errorMessage;
            } catch (jsonError) {
               errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
         }

         return await response.json();
      } catch (error) {
         console.error('Multiple document upload error:', error);
         throw error;
      }
   }

   /**
    * Get documents for a specific claim
    * @param {string} claimId - Claim ID
    * @returns {Promise<Object>} Claim documents
    */
   async getClaimDocuments(claimId) {
      if (!claimId) {
         throw new Error('Claim ID is required');
      }
      return this.request(`/claims/${claimId}/documents`);
   }

   /**
    * Get valid document types for a claim type and option
    * @param {string} claimType - Claim type ('life' or 'vehicle')
    * @param {string} claimOption - Claim option
    * @returns {Array<string>} Valid document types
    */
   getValidDocumentTypesForClaim(claimType, claimOption) {
      const commonDocTypes = ['supporting', 'identification', 'proof_of_policy', 'supporting_document', 'other'];
      
      if (claimType === 'life') {
         const lifeSpecific = {
            'hospitalization': ['medical_bill', 'discharge_summary', 'prescription', 'lab_report'],
            'channelling': ['channelling_receipt', 'doctor_report'],
            'medication': ['prescription', 'pharmacy_receipt', 'medical_report'],
            'death': ['death_certificate', 'medical_report', 'police_report']
         };
         return [...commonDocTypes, ...(lifeSpecific[claimOption] || [])];
      } else if (claimType === 'vehicle') {
         const vehicleSpecific = {
            'accident': ['police_report', 'damage_assessment', 'repair_estimate', 'photos'],
            'theft': ['police_report', 'fir_copy', 'vehicle_registration'],
            'fire': ['fire_department_report', 'damage_assessment', 'photos'],
            'naturalDisaster': ['weather_report', 'damage_assessment', 'photos']
         };
         return [...commonDocTypes, ...(vehicleSpecific[claimOption] || [])];
      }
      
      return commonDocTypes;
   }

   /**
    * Validate file before claim upload
    * @param {File} file - File to validate
    * @param {string} claimType - Claim type
    * @param {string} claimOption - Claim option
    * @returns {Object} Validation result
    */
   validateClaimFile(file, claimType, claimOption) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
         'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
         'application/pdf', 'application/msword',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      const errors = [];

      if (!file) {
         errors.push('No file provided');
         return { valid: false, errors };
      }

      if (file.size > maxSize) {
         errors.push(`File size exceeds maximum limit of ${this.formatFileSize(maxSize)}`);
      }

      if (!allowedTypes.includes(file.type)) {
         errors.push(`File type ${file.type} is not supported for claims`);
      }

      return {
         valid: errors.length === 0,
         errors,
         fileInfo: {
            name: file.name,
            size: file.size,
            type: file.type,
            formattedSize: this.formatFileSize(file.size)
         },
         validDocTypes: this.getValidDocumentTypesForClaim(claimType, claimOption)
      };
   }

   /**
    * Format file size in human readable format
    * @param {number} bytes - File size in bytes
    * @returns {string} Formatted size
    */
   formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
   }


}

// Create and export singleton instance
const insuranceApiService = new InsuranceApiService();
export default insuranceApiService;

// Also export the class for custom instances if needed
export { InsuranceApiService };
