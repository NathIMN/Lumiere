import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import notificationService from '../services/notification-service';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ToastContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Request browser notification permission on mount (disabled)
  // useEffect(() => {
  //   notificationService.requestNotificationPermission();
  // }, []);

  // Initialize notifications when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      initialize(token);
    } else {
      // Reset state when user logs out
      setNotifications([]);
      setUnreadCount(0);
      setConnected(false);
      setHasMore(true);
      setPage(1);
    }
  }, [isAuthenticated, token]);

  // Initialize notifications when authenticated
  const initialize = useCallback(async (token) => {
    if (!token) return;

    try {
      setLoading(true);
      
      // Connect to Socket.IO
      notificationService.connect(token);
      
      // Load initial notifications
      await loadNotifications(true);
      
      // Load unread count
      await loadUnreadCount();
      
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load notifications with pagination
  const loadNotifications = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      
      const response = await notificationService.getNotifications({
        limit: 20,
        page: currentPage,
        category: 'claim' // Focus on claim notifications
      });

      const newNotifications = response.notifications || [];
      
      if (reset) {
        setNotifications(newNotifications);
        setPage(2);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
        setPage(prev => prev + 1);
      }
      
      setHasMore(newNotifications.length === 20);
      
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  }, []);

  // Handle Socket.IO events
  useEffect(() => {
    const unsubscribe = notificationService.addListener((event) => {
      switch (event.type) {
        case 'CONNECTED':
          setConnected(true);
          break;
          
        case 'DISCONNECTED':
          setConnected(false);
          break;
          
        case 'CONNECTION_ERROR':
          setConnected(false);
          console.error('Notification connection error:', event.error);
          break;
          
        case 'NEW_NOTIFICATION':
          // Check if notification already exists to prevent duplicates
          const notificationExists = notifications.some(
            notif => (notif._id || notif.id) === (event.notification._id || event.notification.id)
          );
          
          if (!notificationExists) {
            // Add new notification to the beginning of the list
            setNotifications(prev => [event.notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show success toast or other UI feedback
            showNotificationToast(event.notification);
          }
          break;
          
        case 'NOTIFICATION_READ':
          // Mark notification as read in local state
          setNotifications(prev =>
            prev.map(notif =>
              (notif._id || notif.id) === event.notificationId
                ? { ...notif, isRead: true }
                : notif
            )
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
          break;
          
        case 'ALL_NOTIFICATIONS_READ':
          // Mark all notifications as read
          setNotifications(prev =>
            prev.map(notif => ({ ...notif, isRead: true }))
          );
          setUnreadCount(0);
          break;
          
        case 'NOTIFICATION_DELETED':
          // Remove notification from local state
          setNotifications(prev =>
            prev.filter(notif => (notif._id || notif.id) !== event.notificationId)
          );
          // Update unread count if deleted notification was unread
          const deletedNotif = notifications.find(n => (n._id || n.id) === event.notificationId);
          if (deletedNotif && !deletedNotif.isRead) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
          break;
          
        default:
          console.log('Unknown notification event:', event);
      }
    });

    return unsubscribe;
  }, [notifications]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      notificationService.disconnect();
    };
  }, []);

  // Show toast notification
  const showNotificationToast = (notification) => {
    // Show toast notification for new notifications
    toast.notification(`${notification.title}: ${notification.message}`);
  };

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      // State will be updated via Socket.IO event
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      // State will be updated via Socket.IO event
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      // State will be updated via Socket.IO event
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, []);

  // Refresh notifications
  const refresh = useCallback(async () => {
    await Promise.all([
      loadNotifications(true),
      loadUnreadCount()
    ]);
  }, [loadNotifications, loadUnreadCount]);

  // Load more notifications (pagination)
  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await loadNotifications(false);
    }
  }, [loading, hasMore, loadNotifications]);

  const value = {
    // State
    notifications,
    unreadCount,
    loading,
    connected,
    hasMore,
    
    // Actions
    initialize,
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    
    // Service access for advanced use cases
    notificationService
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};