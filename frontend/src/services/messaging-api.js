/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

class MessagingApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.socket = null;
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
      console.error('Messaging API request error:', error);
      throw error;
    }
  }

  // ==================== CONTACT MANAGEMENT ====================

  /**
   * Get contacts based on user role
   * Role-based filtering:
   * - admin/hr_officer: can message with all users
   * - employee: can message with hr_officers only
   * - insurance_agent: can message with hr_officers only
   * @returns {Promise<Object>} Available contacts
   */
  async getContacts() {
    return this.request('/messages/contacts');
  }

  /**
   * Search contacts by name, email, or user ID
   * @param {string} query - Search query
   * @returns {Promise<Object>} Filtered contacts
   */
  async searchContacts(query) {
    if (!query || query.trim() === '') {
      return this.getContacts();
    }
    
    const queryString = new URLSearchParams({ search: query.trim() }).toString();
    return this.request(`/messages/contacts?${queryString}`);
  }

  /**
   * Get contacts filtered by role
   * @param {string} role - Role to filter by
   * @returns {Promise<Object>} Role-filtered contacts
   */
  async getContactsByRole(role) {
    if (!role) {
      throw new Error('Role is required');
    }
    
    const queryString = new URLSearchParams({ role }).toString();
    return this.request(`/messages/contacts?${queryString}`);
  }

  /**
   * Get contacts filtered by department
   * @param {string} department - Department to filter by
   * @returns {Promise<Object>} Department-filtered contacts
   */
  async getContactsByDepartment(department) {
    if (!department) {
      throw new Error('Department is required');
    }
    
    const queryString = new URLSearchParams({ department }).toString();
    return this.request(`/messages/contacts?${queryString}`);
  }

  /**
   * Get contacts with activity status (online/offline)
   * @returns {Promise<Object>} Contacts with status
   */
  async getContactsWithStatus() {
    return this.request('/messages/contacts?include_status=true');
  }

  // ==================== CONVERSATION MANAGEMENT ====================

  /**
   * Get all conversations for current user
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.status - Filter by conversation status
   * @returns {Promise<Object>} Conversations list
   */
  async getConversations(params = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
    ).toString();
    
    const endpoint = queryString ? `/messages/conversations?${queryString}` : '/messages/conversations';
    return this.request(endpoint);
  }

  /**
   * Get or create conversation with specific user
   * @param {string} recipientId - Recipient user ID
   * @returns {Promise<Object>} Conversation data
   */
  async getOrCreateConversation(recipientId) {
    if (!recipientId) {
      throw new Error('Recipient ID is required');
    }
    return this.request('/messages/conversations', {
      method: 'POST',
      body: JSON.stringify({ recipientId }),
    });
  }

  /**
   * Get specific conversation by ID
   * @param {string} conversationId - Conversation ID
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number for messages
   * @param {number} params.limit - Messages per page
   * @returns {Promise<Object>} Conversation with messages
   */
  async getConversation(conversationId, params = {}) {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }
    
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
    ).toString();
    
    const endpoint = queryString 
      ? `/messages/conversations/${conversationId}?${queryString}` 
      : `/messages/conversations/${conversationId}`;
    
    return this.request(endpoint);
  }

  /**
   * Update conversation settings
   * @param {string} conversationId - Conversation ID
   * @param {Object} settings - Settings to update
   * @param {boolean} settings.muted - Mute/unmute conversation
   * @param {boolean} settings.archived - Archive/unarchive conversation
   * @returns {Promise<Object>} Updated conversation
   */
  async updateConversation(conversationId, settings) {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }
    if (!settings || Object.keys(settings).length === 0) {
      throw new Error('Settings are required');
    }
    
    return this.request(`/messages/conversations/${conversationId}`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  /**
   * Delete conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteConversation(conversationId) {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }
    
    return this.request(`/messages/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  }

  // ==================== MESSAGE MANAGEMENT ====================

  /**
   * Send a message
   * @param {Object} messageData - Message data
   * @param {string} messageData.recipientId - Recipient user ID
   * @param {string} messageData.content - Message content
   * @param {string} messageData.messageType - Message type (text, file, image)
   * @param {string} messageData.conversationId - Optional: existing conversation ID
   * @returns {Promise<Object>} Sent message data
   */
  async sendMessage(messageData) {
    const { recipientId, content, messageType = 'text', conversationId } = messageData;
    
    if (!recipientId && !conversationId) {
      throw new Error('Either recipient ID or conversation ID is required');
    }
    if (!content || content.trim() === '') {
      throw new Error('Message content is required');
    }

    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify({
        recipientId,
        content: content.trim(),
        messageType,
        conversationId,
      }),
    });
  }

  /**
   * Get messages for a conversation
   * @param {string} conversationId - Conversation ID
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Messages per page
   * @param {string} params.before - Get messages before this date
   * @param {string} params.after - Get messages after this date
   * @returns {Promise<Object>} Messages list
   */
  async getMessages(conversationId, params = {}) {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }
    
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
    ).toString();
    
    const endpoint = queryString 
      ? `/messages/${conversationId}?${queryString}` 
      : `/messages/${conversationId}`;
    
    return this.request(endpoint);
  }

  /**
   * Mark messages as read
   * @param {string} conversationId - Conversation ID
   * @param {Array} messageIds - Optional: specific message IDs to mark as read
   * @returns {Promise<Object>} Update confirmation
   */
  async markAsRead(conversationId, messageIds = null) {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }
    
    const payload = messageIds ? { messageIds } : {};
    
    return this.request(`/messages/${conversationId}/read`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Update message
   * @param {string} messageId - Message ID
   * @param {Object} updateData - Update data
   * @param {string} updateData.content - New message content
   * @returns {Promise<Object>} Updated message
   */
  async updateMessage(messageId, updateData) {
    if (!messageId) {
      throw new Error('Message ID is required');
    }
    if (!updateData || !updateData.content) {
      throw new Error('Message content is required');
    }
    
    return this.request(`/messages/message/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  /**
   * Edit message
   * @param {string} messageId - Message ID
   * @param {string} content - New message content
   * @returns {Promise<Object>} Updated message
   */
  async editMessage(messageId, content) {
    if (!messageId) {
      throw new Error('Message ID is required');
    }
    if (!content || content.trim() === '') {
      throw new Error('Message content is required');
    }
    
    return this.request(`/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ content: content.trim() }),
    });
  }

  /**
   * Delete message
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteMessage(messageId) {
    if (!messageId) {
      throw new Error('Message ID is required');
    }
    
    return this.request(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  // ==================== SEARCH AND FILTERING ====================

  /**
   * Search messages across all conversations
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.query - Search query
   * @param {string} searchParams.conversationId - Optional: limit to specific conversation
   * @param {string} searchParams.messageType - Optional: filter by message type
   * @param {string} searchParams.startDate - Optional: search from date
   * @param {string} searchParams.endDate - Optional: search to date
   * @param {number} searchParams.page - Page number
   * @param {number} searchParams.limit - Results per page
   * @returns {Promise<Object>} Search results
   */
  async searchMessages(searchParams) {
    const { query, ...otherParams } = searchParams;
    
    if (!query || query.trim() === '') {
      throw new Error('Search query is required');
    }
    
    const params = {
      query: query.trim(),
      ...Object.fromEntries(
        Object.entries(otherParams).filter(([_, value]) => value !== undefined && value !== '')
      )
    };
    
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/messages/search?${queryString}`);
  }

  /**
   * Get unread messages count
   * @param {string} conversationId - Optional: specific conversation ID
   * @returns {Promise<Object>} Unread count data
   */
  async getUnreadCount(conversationId = null) {
    const endpoint = conversationId 
      ? `/messages/unread-count?conversationId=${conversationId}`
      : '/messages/unread-count';
    
    return this.request(endpoint);
  }

  /**
   * Get message statistics
   * @param {Object} params - Parameters
   * @param {string} params.period - Time period (day, week, month, year)
   * @param {string} params.startDate - Start date
   * @param {string} params.endDate - End date
   * @returns {Promise<Object>} Message statistics
   */
  async getMessageStats(params = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
    ).toString();
    
    const endpoint = queryString ? `/messages/stats?${queryString}` : '/messages/stats';
    return this.request(endpoint);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check if current user can message with target user
   * Based on role restrictions:
   * - admin/hr_officer: can message anyone
   * - employee: can message hr_officers only
   * - insurance_agent: can message hr_officers only
   * @param {string} targetRole - Target user's role
   * @returns {boolean} Can message status
   */
  canMessageUser(targetRole) {
    const currentRole = localStorage.getItem('userRole');
    
    if (!currentRole || !targetRole) {
      return false;
    }
    
    // Admin and HR officers can message anyone
    if (currentRole === 'admin' || currentRole === 'hr_officer') {
      return true;
    }
    
    // Employees can only message HR officers
    if (currentRole === 'employee') {
      return targetRole === 'hr_officer' || targetRole === 'admin';
    }
    
    // Insurance agents can only message HR officers
    if (currentRole === 'insurance_agent') {
      return targetRole === 'hr_officer' || targetRole === 'admin';
    }
    
    return false;
  }

  /**
   * Filter contacts based on current user's role permissions
   * @param {Array} contacts - Array of contact objects
   * @returns {Array} Filtered contacts
   */
  filterContactsByRole(contacts) {
    if (!Array.isArray(contacts)) {
      return [];
    }
    
    return contacts.filter(contact => this.canMessageUser(contact.role));
  }

  /**
   * Get allowed recipient roles for current user
   * @returns {Array} Array of allowed roles
   */
  getAllowedRecipientRoles() {
    const currentRole = localStorage.getItem('userRole');
    
    switch (currentRole) {
      case 'admin':
        return ['admin', 'hr_officer', 'employee', 'insurance_agent'];
      case 'hr_officer':
        return ['admin', 'hr_officer', 'employee', 'insurance_agent'];
      case 'employee':
        return ['admin', 'hr_officer'];
      case 'insurance_agent':
        return ['admin', 'hr_officer'];
      default:
        return [];
    }
  }

  /**
   * Format conversation for display
   * @param {Object} conversation - Conversation object
   * @param {string} currentUserId - Current user ID
   * @returns {Object} Formatted conversation
   */
  formatConversation(conversation, currentUserId) {
    if (!conversation || !currentUserId) {
      return null;
    }
    
    // Find the other participant
    const otherParticipant = conversation.participants?.find(
      participant => participant._id !== currentUserId
    );
    
    return {
      ...conversation,
      displayName: otherParticipant 
        ? `${otherParticipant.profile?.firstName || ''} ${otherParticipant.profile?.lastName || ''}`.trim()
        : 'Unknown User',
      displayRole: otherParticipant?.role || 'unknown',
      isOnline: otherParticipant?.isOnline || false,
      lastMessage: conversation.lastMessage,
      unreadCount: conversation.unreadCount || 0,
    };
  }

  /**
   * Sort conversations by priority
   * Priority order: unread messages > recent activity > alphabetical
   * @param {Array} conversations - Array of conversations
   * @returns {Array} Sorted conversations
   */
  sortConversations(conversations) {
    if (!Array.isArray(conversations)) {
      return [];
    }
    
    return conversations.sort((a, b) => {
      // First priority: unread messages
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
      
      // Second priority: recent activity
      const aTime = new Date(a.lastMessage?.createdAt || a.updatedAt || 0);
      const bTime = new Date(b.lastMessage?.createdAt || b.updatedAt || 0);
      
      if (aTime > bTime) return -1;
      if (aTime < bTime) return 1;
      
      // Third priority: alphabetical by display name
      const aName = a.displayName || '';
      const bName = b.displayName || '';
      
      return aName.localeCompare(bName);
    });
  }

  // ==================== REAL-TIME METHODS ====================

  /**
   * Initialize Socket.IO connection for real-time messaging
   * @param {string} serverUrl - Socket server URL
   * @returns {Object} Socket instance
   */
  initializeSocket(serverUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000') {
    if (typeof io === 'undefined') {
      console.error('Socket.IO not loaded. Please include socket.io-client.');
      return null;
    }
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found for socket connection');
      return null;
    }
    
    this.socket = io(serverUrl, {
      auth: { token }
    });
    
    return this.socket;
  }

  /**
   * Get current socket instance
   * @returns {Object|null} Socket instance
   */
  getSocket() {
    return this.socket;
  }

  /**
   * Disconnect socket
   */
  disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Join conversation room for real-time updates
   * @param {string} conversationId - Conversation ID
   */
  joinConversation(conversationId) {
    if (this.socket && conversationId) {
      this.socket.emit('join_conversation', { conversationId });
    }
  }

  /**
   * Leave conversation room
   * @param {string} conversationId - Conversation ID
   */
  leaveConversation(conversationId) {
    if (this.socket && conversationId) {
      this.socket.emit('leave_conversation', { conversationId });
    }
  }

  /**
   * Send typing indicator
   * @param {string} conversationId - Conversation ID
   * @param {boolean} isTyping - Typing status
   */
  sendTypingStatus(conversationId, isTyping) {
    if (this.socket && conversationId) {
      this.socket.emit(isTyping ? 'typing_start' : 'typing_stop', { 
        conversationId 
      });
    }
  }
}

// Create and export singleton instance
const messagingApiService = new MessagingApiService();
export default messagingApiService;

// Also export the class for custom instances if needed
export { MessagingApiService };