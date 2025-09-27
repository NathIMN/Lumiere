// frontend/src/services/vapi-api.js
// Service for handling VAPI function calls through the backend proxy system

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

class VapiApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get authentication headers with Bearer token
   * @param {string} customToken - Optional custom token to use instead of localStorage
   * @returns {Object} Headers object
   */
  getAuthHeaders(customToken = null) {
    const token = customToken || localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  /**
   * Process natural language user message through VAPI
   * @param {string} userMessage - User's natural language request
   * @param {string} userRole - User's role
   * @param {string} userToken - Optional custom token
   * @returns {Promise<Object>} Processed response
   */
  async processUserMessage(userMessage, userRole, userToken = null) {
    try {
      const response = await fetch(`${this.baseURL}/vapi/execute-function`, {
        method: 'POST',
        headers: this.getAuthHeaders(userToken),
        body: JSON.stringify({
          userMessage,
          userRole
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing user message:', error);
      throw error;
    }
  }

  /**
   * Execute any API call through the VAPI proxy
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
   * @param {string} endpoint - API endpoint path
   * @param {Object} body - Request body for POST/PUT requests
   * @param {Object} query - Query parameters
   * @param {string} userToken - Optional custom token
   * @returns {Promise<Object>} API response
   */
  async executeApiCall(method, endpoint, body = null, query = {}, userToken = null) {
    try {
      const response = await fetch(`${this.baseURL}/vapi/api-call`, {
        method: 'POST',
        headers: this.getAuthHeaders(userToken),
        body: JSON.stringify({
          method,
          endpoint,
          body,
          query
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API call failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error executing API call:', error);
      throw error;
    }
  }

  /**
   * Execute database operations through the VAPI proxy
   * @param {string} operation - Operation type (find, create, update, delete, count)
   * @param {string} model - Model name (User, Policy, Claim, etc.)
   * @param {Object} params - Operation parameters
   * @param {string} userToken - Optional custom token
   * @returns {Promise<Object>} Operation result
   */
  async executeDbOperation(operation, model, params = {}, userToken = null) {
    try {
      const response = await fetch(`${this.baseURL}/vapi/db-operation`, {
        method: 'POST',
        headers: this.getAuthHeaders(userToken),
        body: JSON.stringify({
          operation,
          model,
          params
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Database operation failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error executing database operation:', error);
      throw error;
    }
  }

  /**
   * Test function for backwards compatibility
   * @param {string} functionName - Function name to test
   * @param {Object} parameters - Function parameters
   * @param {string} userToken - Optional custom token
   * @returns {Promise<Object>} Function result
   */
  async testFunction(functionName, parameters = {}, userToken = null) {
    try {
      const response = await fetch(`${this.baseURL}/vapi/test-function`, {
        method: 'POST',
        headers: this.getAuthHeaders(userToken),
        body: JSON.stringify({
          functionName,
          parameters
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Test function failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error testing function:', error);
      throw error;
    }
  }

  // ==================== CONVENIENCE METHODS ====================

  /**
   * Get user profile information
   * @param {string} userToken - Optional custom token
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile(userToken = null) {
    return this.processUserMessage('show my profile', localStorage.getItem('userRole') || 'employee', userToken);
  }

  /**
   * Get user policies
   * @param {string} userToken - Optional custom token
   * @returns {Promise<Object>} User policies data
   */
  async getUserPolicies(userToken = null) {
    return this.processUserMessage('show my policies', localStorage.getItem('userRole') || 'employee', userToken);
  }

  /**
   * Get user claims
   * @param {string} userToken - Optional custom token
   * @returns {Promise<Object>} User claims data
   */
  async getUserClaims(userToken = null) {
    return this.processUserMessage('show my claims', localStorage.getItem('userRole') || 'employee', userToken);
  }

  /**
   * Get user counts (admin only)
   * @param {string} userToken - Optional custom token
   * @returns {Promise<Object>} User count data
   */
  async getUserCounts(userToken = null) {
    return this.processUserMessage('how many users are there by role', 'admin', userToken);
  }

  /**
   * Create a new claim
   * @param {string} policyId - Policy ID
   * @param {string} claimType - Type of claim (life, vehicle)
   * @param {string} description - Claim description
   * @param {string} userToken - Optional custom token
   * @returns {Promise<Object>} Claim creation result
   */
  async createClaim(policyId, claimType, description, userToken = null) {
    const userRole = localStorage.getItem('userRole') || 'employee';
    return this.processUserMessage(
      `create a new ${claimType} claim for policy ${policyId} with description: ${description}`, 
      userRole, 
      userToken
    );
  }

  /**
   * Get pending claims for HR review
   * @param {string} userToken - Optional custom token
   * @returns {Promise<Object>} Pending claims data
   */
  async getPendingClaims(userToken = null) {
    return this.processUserMessage('show pending claims for review', 'hr_officer', userToken);
  }

  /**
   * Get assigned claims for insurance agents
   * @param {string} userToken - Optional custom token
   * @returns {Promise<Object>} Assigned claims data
   */
  async getAssignedClaims(userToken = null) {
    return this.processUserMessage('show my assigned claims', 'insurance_agent', userToken);
  }

  /**
   * Generate reports (HR/Admin only)
   * @param {string} reportType - Type of report (users, claims, policies)
   * @param {string} format - Report format (pdf, excel, csv)
   * @param {string} userToken - Optional custom token
   * @returns {Promise<Object>} Report generation result
   */
  async generateReport(reportType, format = 'pdf', userToken = null) {
    const userRole = localStorage.getItem('userRole') || 'hr_officer';
    return this.processUserMessage(
      `generate a ${reportType} report in ${format} format`, 
      userRole, 
      userToken
    );
  }

  // ==================== ADVANCED API CALLS ====================

  /**
   * Get all users (with role-based filtering applied automatically)
   * @param {Object} filters - Optional filters
   * @param {string} userToken - Optional custom token
   * @returns {Promise<Object>} Users data
   */
  async getUsers(filters = {}, userToken = null) {
    return this.executeDbOperation('find', 'User', {
      query: filters,
      select: '-password',
      limit: 50
    }, userToken);
  }

  /**
   * Get all policies (with role-based filtering applied automatically)
   * @param {Object} filters - Optional filters
   * @param {string} userToken - Optional custom token
   * @returns {Promise<Object>} Policies data
   */
  async getPolicies(filters = {}, userToken = null) {
    return this.executeDbOperation('find', 'Policy', {
      query: filters,
      populate: 'beneficiaries',
      limit: 50
    }, userToken);
  }

  /**
   * Get all claims (with role-based filtering applied automatically)
   * @param {Object} filters - Optional filters
   * @param {string} userToken - Optional custom token
   * @returns {Promise<Object>} Claims data
   */
  async getClaims(filters = {}, userToken = null) {
    return this.executeDbOperation('find', 'Claim', {
      query: filters,
      populate: 'policy employeeId',
      limit: 50
    }, userToken);
  }

  /**
   * Update a claim status (for insurance agents/admins)
   * @param {string} claimId - Claim ID
   * @param {Object} updateData - Data to update
   * @param {string} userToken - Optional custom token
   * @returns {Promise<Object>} Update result
   */
  async updateClaim(claimId, updateData, userToken = null) {
    return this.executeDbOperation('update', 'Claim', {
      query: { _id: claimId },
      data: updateData
    }, userToken);
  }

  /**
   * Create a new policy (admin only)
   * @param {Object} policyData - Policy data
   * @param {string} userToken - Optional custom token
   * @returns {Promise<Object>} Policy creation result
   */
  async createPolicy(policyData, userToken = null) {
    return this.executeDbOperation('create', 'Policy', {
      data: policyData
    }, userToken);
  }

  /**
   * Count documents in any model (with role-based access)
   * @param {string} model - Model name
   * @param {Object} filters - Optional filters
   * @param {string} userToken - Optional custom token
   * @returns {Promise<Object>} Count result
   */
  async countDocuments(model, filters = {}, userToken = null) {
    return this.executeDbOperation('count', model, {
      query: filters
    }, userToken);
  }
}

export default new VapiApiService();