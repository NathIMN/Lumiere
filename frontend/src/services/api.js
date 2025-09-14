const API_BASE_URL = 'http://localhost:5000/api/v1';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Policy methods
  async getPolicies(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/policies?${queryString}`);
  }

  async getPolicyById(id) {
    return this.request(`/policies/${id}`);
  }

  async createPolicy(policyData) {
    return this.request('/policies', {
      method: 'POST',
      body: JSON.stringify(policyData),
    });
  }

  async updatePolicy(id, policyData) {
    return this.request(`/policies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(policyData),
    });
  }

  async deletePolicy(id) {
    return this.request(`/policies/${id}`, {
      method: 'DELETE',
    });
  }

  async getPolicyStats() {
    return this.request('/policies/stats/overview');
  }

  // User methods
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users?${queryString}`);
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async updateUserStatus(id, status) {
    return this.request(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getUserStats() {
    return this.request('/users/stats/overview');
  }
}

export default new ApiService();