import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';

const NotificationBell = ({ 
  notifications = [], 
  unreadCount = 0, 
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onLoadMore,
  hasMore = false,
  loading = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.isRead && onMarkAsRead) {
      await onMarkAsRead(notification._id || notification.id);
    }

    // Navigate to action URL if provided
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
      setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (onMarkAllAsRead) {
      await onMarkAllAsRead();
    }
  };

  const handleDeleteNotification = async (notificationId, event) => {
    event.stopPropagation();
    if (onDeleteNotification) {
      await onDeleteNotification(notificationId);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now - notificationTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationTime.toLocaleDateString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getCategoryIcon = (category) => {
    // You can expand this based on your categories
    switch (category) {
      case 'claim': return '📋';
      case 'policy': return '📋';
      case 'system': return '⚙️';
      case 'payment': return '💳';
      default: return '🔔';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification, index) => (
                  <NotificationItem
                    key={`${notification._id || notification.id}-${index}`}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onDelete={(event) => handleDeleteNotification(notification._id || notification.id, event)}
                    formatTimeAgo={formatTimeAgo}
                    getPriorityColor={getPriorityColor}
                    getCategoryIcon={getCategoryIcon}
                  />
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <div className="p-4">
                    <button
                      onClick={onLoadMore}
                      disabled={loading}
                      className="w-full py-2 text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Individual Notification Item Component
const NotificationItem = ({ 
  notification, 
  onClick, 
  onDelete, 
  formatTimeAgo, 
  getPriorityColor, 
  getCategoryIcon 
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors relative group ${
        !notification.isRead ? 'bg-blue-25 border-l-4 border-l-blue-500' : ''
      }`}
    >
      {/* Priority indicator */}
      {notification.priority && notification.priority !== 'normal' && (
        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
          notification.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'
        }`} />
      )}

      <div className="flex items-start gap-3">
        {/* Category Icon */}
        <div className="flex-shrink-0 text-lg">
          {getCategoryIcon(notification.category)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className={`text-sm font-medium ${
              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
            }`}>
              {notification.title}
            </h4>
            
            {/* Delete button - only show on hover */}
            <button
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded text-red-600"
              title="Delete notification"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          
          <p className={`text-sm mt-1 ${
            !notification.isRead ? 'text-gray-800' : 'text-gray-600'
          }`}>
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {formatTimeAgo(notification.createdAt)}
            </span>
            
            {notification.category && (
              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(notification.priority)}`}>
                {notification.category}
              </span>
            )}
          </div>

          {/* Unread indicator */}
          {!notification.isRead && (
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationBell;