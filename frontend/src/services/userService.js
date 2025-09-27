import { apiClient } from '../utils/apiClient';

export const userService = {
  // Get all users
  getAllUsers: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/api/users${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Get users by role
  getUsersByRole: async (role) => {
    try {
      const response = await apiClient.get(`/api/users?role=${role}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await apiClient.post('/api/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await apiClient.patch(`/api/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/api/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  // Update user status
  updateUserStatus: async (userId, status) => {
    try {
      const response = await apiClient.patch(`/api/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  // Search users
  searchUsers: async (searchTerm) => {
    try {
      const response = await apiClient.get(`/api/users/search?q=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
};