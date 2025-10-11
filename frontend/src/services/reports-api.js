const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

class ReportsApiService {
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

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Get available report templates
   * @returns {Promise<Object>} Available report templates
   */
  async getReportTemplates() {
    return this.request('/reports/templates');
  }

  /**
   * Generate users report
   * @param {Object} filters - Report filters
   * @returns {Promise<Blob>} PDF blob
   */
  async generateUsersReport(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/reports/users${queryParams ? `?${queryParams}` : ''}`;
    
    return this.downloadReport(endpoint);
  }

  /**
   * Generate policies report
   * @param {Object} filters - Report filters
   * @returns {Promise<Blob>} PDF blob
   */
  async generatePoliciesReport(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/reports/policies${queryParams ? `?${queryParams}` : ''}`;
    
    return this.downloadReport(endpoint);
  }

  /**
   * Generate claims report
   * @param {Object} filters - Report filters
   * @returns {Promise<Blob>} PDF blob
   */
  async generateClaimsReport(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/reports/claims${queryParams ? `?${queryParams}` : ''}`;
    
    return this.downloadReport(endpoint);
  }

  /**
   * Generate financial report
   * @param {Object} filters - Report filters
   * @returns {Promise<Blob>} PDF blob
   */
  async generateFinancialReport(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/reports/financial${queryParams ? `?${queryParams}` : ''}`;
    
    return this.downloadReport(endpoint);
  }

  /**
   * Generate policy users report
   * @param {string} policyId - Policy ID
   * @param {Object} filters - Report filters
   * @returns {Promise<Blob>} PDF blob
   */
  async generatePolicyUsersReport(policyId, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/reports/policy-users/${policyId}${queryParams ? `?${queryParams}` : ''}`;
    
    return this.downloadReport(endpoint);
  }

  /**
   * Download report as PDF blob
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Blob>} PDF blob
   */
  async downloadReport(endpoint) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      method: 'GET',
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Report download failed:', error);
      throw error;
    }
  }

  /**
   * Schedule a report
   * @param {Object} scheduleData - Schedule configuration
   * @returns {Promise<Object>} Schedule confirmation
   */
  async scheduleReport(scheduleData) {
    return this.request('/reports/schedule', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  }

  /**
   * Generate individual claim report for employee
   * @param {string} claimId - Claim ID
   * @returns {Promise<Blob>} PDF blob
   */
  async generateEmployeeClaimReport(claimId) {
    const endpoint = `/reports/employee/claim/${claimId}`;
    return this.downloadReport(endpoint);
  }

  /**
   * Generate claims summary report for employee
   * @param {Object} filters - Report filters
   * @returns {Promise<Blob>} PDF blob
   */
  async generateEmployeeClaimsSummaryReport(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/reports/employee/claims-summary${queryParams ? `?${queryParams}` : ''}`;
    return this.downloadReport(endpoint);
  }

  /**
   * Generate individual policy report for employee
   * @param {string} policyId - Policy ID
   * @returns {Promise<Blob>} PDF blob
   */
  async generateEmployeePolicyReport(policyId) {
    const endpoint = `/reports/employee/policy/${policyId}`;
    return this.downloadReport(endpoint);
  }
}

// Export singleton instance
const reportsApiService = new ReportsApiService();
export default reportsApiService;