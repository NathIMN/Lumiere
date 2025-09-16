const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

class UserApiService {
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
        
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // ==================== AUTHENTICATION METHODS ====================

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.role - User role
   * @param {Object} userData.profile - User profile data
   * @returns {Promise<Object>} Registration response with user data and token
   */
  async register(userData) {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} Login response with user data and token
   */
  async login(credentials) {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  /**
   * Logout user (client-side token removal)
   */
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
  }

  // ==================== PROFILE METHODS ====================

  /**
   * Get current user's profile
   * @returns {Promise<Object>} User profile data
   */
  async getProfile() {
    return this.request('/users/profile');
  }

  /**
   * Update current user's profile
   * @param {Object} profileData - Profile update data
   * @returns {Promise<Object>} Updated user data
   */
  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  /**
   * Change current user's password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise<Object>} Success response
   */
  async changePassword(passwordData) {
    return this.request('/users/change-password', {
      method: 'PATCH',
      body: JSON.stringify(passwordData),
    });
  }

  // ==================== USER MANAGEMENT METHODS (Admin/HR) ====================

  /**
   * Get all users with optional filters
   * @param {Object} params - Query parameters
   * @param {string} params.role - Filter by role
   * @param {string} params.status - Filter by status
   * @param {string} params.department - Filter by department
   * @param {number} params.page - Page number for pagination
   * @param {number} params.limit - Items per page
   * @returns {Promise<Object>} Users list with metadata
   */
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
    ).toString();
    
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    return this.request(endpoint);
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User data
   */
  async getUserById(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.request(`/users/${userId}`);
  }

  /**
   * Create new user (Admin/HR only)
   * @param {Object} userData - User creation data
   * @returns {Promise<Object>} Created user data
   */
  async createUser(userData) {
    if (!userData) {
      throw new Error('User data is required');
    }
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Update user by ID (Admin/HR only)
   * @param {string} userId - User ID
   * @param {Object} userData - User update data
   * @returns {Promise<Object>} Updated user data
   */
  async updateUser(userId, userData) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!userData) {
      throw new Error('User data is required');
    }
    return this.request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Delete user by ID (Admin only)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteUser(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Update user status (Admin/HR only)
   * @param {string} userId - User ID
   * @param {string} status - New status ('active', 'inactive', 'suspended', 'terminated')
   * @returns {Promise<Object>} Updated user data
   */
  async updateUserStatus(userId, status) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!status) {
      throw new Error('Status is required');
    }
    
    const validStatuses = ['active', 'inactive', 'suspended', 'terminated'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return this.request(`/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  /**
   * Reset user password (Admin/HR only)
   * @param {string} userId - User ID
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Success response
   */
  async resetPassword(userId, newPassword) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!newPassword) {
      throw new Error('New password is required');
    }
    return this.request(`/users/${userId}/reset-password`, {
      method: 'PATCH',
      body: JSON.stringify({ newPassword }),
    });
  }

  /**
   * Get user statistics (Admin/HR only)
   * @returns {Promise<Object>} User statistics data
   */
  async getUserStats() {
    return this.request('/users/stats/overview');
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
   * Store authentication data
   * @param {Object} authData - Authentication data
   * @param {string} authData.token - JWT token
   * @param {Object} authData.user - User data
   */
  setAuthData({ token, user }) {
    if (token) {
      localStorage.setItem('authToken', token);
    }
    if (user) {
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userId', user._id || user.userId);
    }
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
   * Get users by role
   * @param {string} role - User role to filter by
   * @returns {Promise<Object>} Filtered users
   */
  async getUsersByRole(role) {
    return this.getUsers({ role });
  }

  /**
   * Get users by department
   * @param {string} department - Department to filter by
   * @returns {Promise<Object>} Filtered users
   */
  async getUsersByDepartment(department) {
    return this.getUsers({ department });
  }

  /**
   * Get active users only
   * @returns {Promise<Object>} Active users
   */
  async getActiveUsers() {
    return this.getUsers({ status: 'active' });
  }

  /**
   * Bulk update user status
   * @param {Array} userIds - Array of user IDs
   * @param {string} status - New status
   * @returns {Promise<Array>} Array of update promises
   */
  async bulkUpdateUserStatus(userIds, status) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new Error('User IDs array is required');
    }
    
    const updatePromises = userIds.map(userId => 
      this.updateUserStatus(userId, status).catch(error => ({
        userId,
        error: error.message,
        success: false
      }))
    );

    return Promise.allSettled(updatePromises);
  }
}

// Create and export singleton instance
const userApiService = new UserApiService();
export default userApiService;

// Also export the class for custom instances if needed
export { UserApiService };