import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import messagingApiService from '../services/messaging-api';
import io from 'socket.io-client';

export const useMessaging = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token || socketRef.current) {
      console.log('⚠️ Socket initialization skipped:', { hasToken: !!token, socketExists: !!socketRef.current });
      return;
    }

    console.log('🔌 Initializing socket connection with token:', !!token);
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to messaging server, socket ID:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from messaging server');
      setIsConnected(false);
    });

    newSocket.on('new_message', (message) => {
      console.log('🔔 useMessaging received new_message:', message);
      
      // Get current user ID from auth context to check if message is from self
      const currentUserId = user?._id;
      const messageSenderId = message.sender._id || message.sender;
      
      console.log('🆔 Notification check:', {
        currentUserId,
        messageSenderId,
        isFromSelf: messageSenderId === currentUserId
      });
      
      // Don't show notifications for messages sent by current user
      if (messageSenderId === currentUserId) {
        console.log('⏭️ Skipping notification for own message');
        return;
      }
      
      console.log('📢 Adding notification for message from other user');
      
      // Update unread count
      setUnreadCount(prev => prev + 1);
      
      // Add notification
      const notification = {
        id: Date.now(),
        type: 'message',
        title: `New message from ${message.sender.profile?.firstName || 'Unknown'}`,
        content: message.content.length > 50 ? message.content.substring(0, 50) + '...' : message.content,
        timestamp: new Date(),
        conversationId: message.conversationId,
        senderId: message.sender._id
      };
      
      setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
      
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.content,
          icon: '/favicon.ico'
        });
      }
    });

    newSocket.on('message_read', (data) => {
      // Update unread count
      if (data.readBy === localStorage.getItem('userId')) {
        setUnreadCount(prev => Math.max(0, prev - (data.messageCount || 1)));
      }
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  }, []);

  // Disconnect socket
  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  }, []);

  // Load initial unread count
  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await messagingApiService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.count || 0);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }, []);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Remove specific notification
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // Initialize on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      initializeSocket();
      loadUnreadCount();
      requestNotificationPermission();
    }

    return () => {
      disconnectSocket();
    };
  }, [initializeSocket, disconnectSocket, loadUnreadCount, requestNotificationPermission]);

  return {
    socket,
    isConnected,
    unreadCount,
    notifications,
    clearNotifications,
    removeNotification,
    initializeSocket,
    disconnectSocket,
    loadUnreadCount,
    requestNotificationPermission
  };
};