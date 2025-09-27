const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

class ChatbotApiService {
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
        let errorMessage = 'API request failed';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          errorMessage = response.statusText || errorMessage;
        }
        
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }

      return await response.json();
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Network error. Please check your connection.');
      }
      throw error;
    }
  }

  /**
   * Send a message to the chatbot
   * @param {string} message - The message to send
   * @returns {Promise<Object>} AI response
   */
  async sendMessage(message) {
    return this.request('/chatbot/message', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  /**
   * Formalize a message using AI
   * @param {string} message - The message to formalize
   * @returns {Promise<Object>} Formalized message response
   */
  async formalizeMessage(message) {
    return this.request('/chatbot/formalize', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  /**
   * Stream a message response (for real-time chat)
   * @param {string} message - The message to send
   * @returns {Promise<ReadableStream>} Stream response
   */
  async streamMessage(message) {
    const url = `${this.baseURL}/chatbot/stream`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Failed to start message stream');
    }

    return response.body;
  }
}

// Export singleton instance
export default new ChatbotApiService();