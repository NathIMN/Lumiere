import io from 'socket.io-client';
import userApiService from './user-api';

class NotificationService {
  constructor() {
    this.socket = null;
    this.listeners = new Set();
    this.baseURL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000';
  }

  // Initialize Socket.IO connection
  connect(token) {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }

    this.socket = io(this.baseURL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('🔔 Notifications connected');
      this.notifyListeners({ type: 'CONNECTED' });
    });

    this.socket.on('new_notification', (notification) => {
      this.handleNewNotification(notification);
    });

    this.socket.on('notification_read', (notificationId) => {
      this.notifyListeners({ 
        type: 'NOTIFICATION_READ', 
        notificationId 
      });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Notification connection failed:', error);
      this.notifyListeners({ type: 'CONNECTION_ERROR', error });
    });

    this.socket.on('disconnect', () => {
      console.log('🔔 Notifications disconnected');
      this.notifyListeners({ type: 'DISCONNECTED' });
    });
  }

  // Disconnect Socket.IO
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Handle new real-time notification
  handleNewNotification(notification) {
    this.notifyListeners({
      type: 'NEW_NOTIFICATION',
      notification
    });

    // Browser notifications are disabled - only in-app notifications
    // If you want to re-enable them, uncomment the line below:
    // this.showBrowserNotification(notification);
  }

  // Show browser notification
  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification._id || notification.id,
        requireInteraction: notification.priority === 'high'
      });

      // Auto close after 5 seconds unless high priority
      if (notification.priority !== 'high') {
        setTimeout(() => browserNotification.close(), 5000);
      }

      // Handle click to navigate to relevant page
      browserNotification.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        browserNotification.close();
      };
    }
  }

  // Request browser notification permission
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Add event listener
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners(event) {
    this.listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Notification listener error:', error);
      }
    });
  }

  // ==================== API METHODS ====================

  // Get user notifications with pagination and filtering
  async getNotifications(options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.limit) params.append('limit', options.limit);
      if (options.page) params.append('page', options.page);
      if (options.status) params.append('status', options.status);
      if (options.category) params.append('category', options.category);
      if (options.priority) params.append('priority', options.priority);

      const queryString = params.toString();
      const endpoint = `/notifications${queryString ? '?' + queryString : ''}`;

      return await userApiService.request(endpoint, {
        method: 'GET'
      });
    } catch (error) {
      console.error('Failed to load notifications:', error);
      throw error;
    }
  }

  // Get unread notification count
  async getUnreadCount() {
    try {
      const response = await userApiService.request('/notifications/unread-count', {
        method: 'GET'
      });
      return response.count || 0;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await userApiService.request(`/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });
      
      this.notifyListeners({
        type: 'NOTIFICATION_READ',
        notificationId
      });
      
      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      await userApiService.request('/notifications/mark-all-read', {
        method: 'PATCH'
      });
      
      this.notifyListeners({
        type: 'ALL_NOTIFICATIONS_READ'
      });
      
      return true;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      await userApiService.request(`/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      
      this.notifyListeners({
        type: 'NOTIFICATION_DELETED',
        notificationId
      });
      
      return true;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  // Send in-app notification (admin/agent use)
  async sendInAppNotification(notificationData) {
    try {
      return await userApiService.request('/notifications/send/in-app', {
        method: 'POST',
        body: JSON.stringify(notificationData)
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  // Send combined notification (admin use)
  async sendCombinedNotification(notificationData) {
    try {
      return await userApiService.request('/notifications/send/combined', {
        method: 'POST',
        body: JSON.stringify(notificationData)
      });
    } catch (error) {
      console.error('Failed to send combined notification:', error);
      throw error;
    }
  }

  // ==================== CLAIM-SPECIFIC HELPERS ====================

  // Generate claim notification data
  static createClaimNotification(claimId, type, status, claimNumber) {
    const notificationMap = {
      'submitted': {
        title: 'Claim Submitted',
        message: `Your claim #${claimNumber} has been successfully submitted and is under review.`,
        category: 'claim',
        priority: 'normal',
        actionUrl: `/claims/${claimId}`
      },
      'under_review': {
        title: 'Claim Under Review',
        message: `Your claim #${claimNumber} is now under review by our team.`,
        category: 'claim',
        priority: 'normal',
        actionUrl: `/claims/${claimId}`
      },
      'approved': {
        title: 'Claim Approved! ✅',
        message: `Great news! Your claim #${claimNumber} has been approved.`,
        category: 'claim',
        priority: 'high',
        actionUrl: `/claims/${claimId}`
      },
      'rejected': {
        title: 'Claim Rejected',
        message: `Your claim #${claimNumber} has been rejected. Please check the details for more information.`,
        category: 'claim',
        priority: 'high',
        actionUrl: `/claims/${claimId}`
      },
      'additional_info_required': {
        title: 'Additional Information Required',
        message: `Please provide additional information for your claim #${claimNumber}.`,
        category: 'claim',
        priority: 'high',
        actionUrl: `/claims/${claimId}`
      }
    };

    return notificationMap[type] || {
      title: 'Claim Update',
      message: `Your claim #${claimNumber} has been updated.`,
      category: 'claim',
      priority: 'normal',
      actionUrl: `/claims/${claimId}`
    };
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;