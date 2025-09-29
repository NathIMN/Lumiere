import React, { useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import notificationService from '../../services/notification-service';
import { Send, Bell, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const NotificationTester = () => {
  const { notifications, unreadCount, connected } = useNotifications();
  const { user } = useAuth();
  const { toast } = useToast();
  const [testType, setTestType] = useState('claim_submitted');
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);

  const testNotificationTypes = [
    {
      value: 'claim_submitted',
      label: 'Claim Submitted',
      icon: '📋',
      data: {
        title: 'Claim Submitted Successfully',
        message: 'Your insurance claim #CLM-2025-001 has been submitted and is under review.',
        category: 'claim',
        priority: 'medium',
        type: 'info'
      }
    },
    {
      value: 'claim_approved',
      label: 'Claim Approved',
      icon: '✅',
      data: {
        title: 'Claim Approved!',
        message: 'Great news! Your claim #CLM-2025-001 has been approved for $2,500.',
        category: 'claim',
        priority: 'high',
        type: 'success'
      }
    },
    {
      value: 'claim_rejected',
      label: 'Claim Rejected',
      icon: '❌',
      data: {
        title: 'Claim Rejected',
        message: 'Your claim #CLM-2025-001 has been rejected. Please review the details.',
        category: 'claim',
        priority: 'high',
        type: 'error'
      }
    },
    {
      value: 'info_required',
      label: 'Additional Info Required',
      icon: '📝',
      data: {
        title: 'Additional Information Required',
        message: 'Please provide additional documentation for claim #CLM-2025-001.',
        category: 'claim',
        priority: 'high',
        type: 'warning'
      }
    },
    {
      value: 'payment_processed',
      label: 'Payment Processed',
      icon: '💳',
      data: {
        title: 'Payment Processed',
        message: 'Your claim payment of $2,500 has been processed and will arrive in 2-3 business days.',
        category: 'claim',
        priority: 'high',
        type: 'success'
      }
    }
  ];

  const sendTestNotification = async () => {
    setSending(true);
    
    try {
      if (!user || !user._id) {
        toast.error('User not found. Please make sure you are logged in.');
        return;
      }

      let notificationData;
      
      if (testType === 'custom') {
        notificationData = {
          userId: user._id,
          title: customTitle || 'Test Notification',
          message: customMessage || 'This is a test notification message.',
          category: 'general',
          priority: 'medium',
          type: 'info',
          actionButton: {
            text: 'View Details',
            url: '/claims'
          },
          metadata: {
            source: 'notification-tester',
            testType: 'custom'
          }
        };
      } else {
        const selectedType = testNotificationTypes.find(type => type.value === testType);
        notificationData = {
          userId: user._id,
          ...selectedType.data,
          actionButton: {
            text: 'View Claim',
            url: '/claims/CLM-2025-001'
          },
          metadata: {
            source: 'notification-tester',
            testType: testType,
            claimId: 'CLM-2025-001'
          }
        };
      }

      console.log('Sending notification data:', notificationData);

      // Send via the notification service
      const response = await notificationService.sendInAppNotification(notificationData);
      
      console.log('Notification sent successfully:', response);
      toast.success('Test notification sent successfully! Check the notification bell in the header.');
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast.error('Failed to send test notification: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const getConnectionStatus = () => {
    if (connected) {
      return <span className="text-green-600 flex items-center gap-1">
        <CheckCircle className="w-4 h-4" /> Connected
      </span>;
    } else {
      return <span className="text-red-600 flex items-center gap-1">
        <XCircle className="w-4 h-4" /> Disconnected
      </span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Bell className="w-6 h-6 text-blue-600" />
          Notification System Tester
        </h2>

        {/* Connection Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">System Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>Socket Connection: {getConnectionStatus()}</div>
                <div>Unread Count: <span className="font-bold text-blue-600">{unreadCount}</span></div>
                <div>Total Notifications: <span className="font-bold text-gray-600">{notifications.length}</span></div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Logged in as:</span>
              <span className="font-medium">{user?.email || 'Unknown'}</span>
              <span className="text-gray-400">({user?.role || 'No role'})</span>
              {user?._id && <span className="text-xs text-gray-400 font-mono">ID: {user._id.slice(-8)}</span>}
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Send Test Notification</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Notification Type</label>
              <select 
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {testNotificationTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
                <option value="custom">🔧 Custom Message</option>
              </select>
            </div>

            <div>
              <button
                onClick={sendTestNotification}
                disabled={sending}
                className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Test Notification
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Custom Message Fields */}
          {testType === 'custom' && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-2">Custom Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Enter notification title"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Custom Message</label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Enter notification message"
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="mt-8">
          <h3 className="font-semibold text-lg mb-4">Recent Notifications</h3>
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No notifications yet. Send a test notification to see it here!
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.slice(0, 5).map((notification, index) => (
                <div 
                  key={`${notification._id || notification.id || 'notif'}-${index}-${Date.now()}`}
                  className={`p-3 border rounded-lg ${
                    !notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(notification.createdAt || Date.now()).toLocaleString()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          notification.priority === 'high' ? 'bg-red-100 text-red-700' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {notification.category}
                        </span>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Testing Instructions</h3>
        <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
          <li>Make sure you're logged in to see the notification bell in the header</li>
          <li>Check the connection status above - should show "Connected" if Socket.IO is working</li>
          <li>Select a notification type and click "Send Test Notification"</li>
          <li>Look for the red badge on the notification bell in the header</li>
          <li>Click the notification bell to see the dropdown with your notifications</li>
          <li>Browser notifications should also appear if you've granted permission</li>
        </ol>
      </div>
    </div>
  );
};

export default NotificationTester;