import Notification from "../models/Notification.js";
import User from "../models/User.js";
import EmailService from "../services/emailService.js";
import asyncWrapper from "../middleware/async.js";
import { createCustomError } from "../errors/custom-error.js";
import { socketHandler } from "../server.js";

// Send in-app notification
const sendInAppNotification = asyncWrapper(async (req, res, next) => {
  const {
    userId,
    title,
    message,
    type = "info",
    priority = "medium",
    category = "general",
    actionButton = null,
    metadata = {},
    expiresAt = null,
  } = req.body;

  // Validate required fields
  if (!userId || !title || !message) {
    return next(createCustomError("userId, title, and message are required", 400));
  }

  // Validate user exists
  const user = await User.findById(userId);
  if (!user) {
    return next(createCustomError("User not found", 404));
  }

  // Create notification
  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
    priority,
    category,
    actionButton,
    metadata,
    expiresAt,
  });

  // Emit real-time notification via Socket.IO if user is connected
  if (socketHandler && socketHandler.connectedUsers.has(userId)) {
    socketHandler.io.to(`user_${userId}`).emit("new_notification", {
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      category: notification.category,
      actionButton: notification.actionButton,
      createdAt: notification.createdAt,
    });
  }

  res.status(201).json({
    success: true,
    message: "In-app notification sent successfully",
    notification: {
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      category: notification.category,
      createdAt: notification.createdAt,
    },
  });
});

// Send email notification
const sendEmailNotification = asyncWrapper(async (req, res, next) => {
  const {
    userId,
    email,
    subject,
    message,
    priority = "medium",
    actionButton = null,
  } = req.body;

  // Validate required fields
  if (!subject || !message) {
    return next(createCustomError("subject and message are required", 400));
  }

  let recipientEmail = email;

  // If userId provided, get user's email
  if (userId && !email) {
    const user = await User.findById(userId);
    if (!user) {
      return next(createCustomError("User not found", 404));
    }
    recipientEmail = user.email;
  }

  if (!recipientEmail) {
    return next(createCustomError("Recipient email is required", 400));
  }

  try {
    // Send email
    const emailResult = await EmailService.sendNotificationEmail(
      recipientEmail,
      subject,
      message,
      {
        priority,
        actionButton,
      }
    );

    res.status(200).json({
      success: true,
      message: "Email notification sent successfully",
      emailResult: {
        messageId: emailResult.messageId,
        previewUrl: emailResult.previewUrl, // For test environments
      },
    });
  } catch (error) {
    console.error("Error sending email notification:", error);
    return next(createCustomError("Failed to send email notification", 500));
  }
});

// Send both in-app and email notification
const sendCombinedNotification = asyncWrapper(async (req, res, next) => {
  const {
    userId,
    email,
    title,
    subject,
    message,
    type = "info",
    priority = "medium",
    category = "general",
    actionButton = null,
    metadata = {},
    expiresAt = null,
  } = req.body;

  // Validate required fields
  if (!userId || !title || !subject || !message) {
    return next(createCustomError("userId, title, subject, and message are required", 400));
  }

  // Validate user exists
  const user = await User.findById(userId);
  if (!user) {
    return next(createCustomError("User not found", 404));
  }

  const recipientEmail = email || user.email;

  try {
    // Create in-app notification
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      priority,
      category,
      actionButton,
      metadata,
      expiresAt,
    });

    // Send email notification
    const emailResult = await EmailService.sendNotificationEmail(
      recipientEmail,
      subject,
      message,
      {
        priority,
        actionButton,
      }
    );

    // Emit real-time notification via Socket.IO if user is connected
    if (socketHandler && socketHandler.connectedUsers.has(userId)) {
      socketHandler.io.to(`user_${userId}`).emit("new_notification", {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        category: notification.category,
        actionButton: notification.actionButton,
        createdAt: notification.createdAt,
      });
    }

    res.status(201).json({
      success: true,
      message: "Combined notification sent successfully",
      notification: {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        category: notification.category,
        createdAt: notification.createdAt,
      },
      emailResult: {
        messageId: emailResult.messageId,
        previewUrl: emailResult.previewUrl,
      },
    });
  } catch (error) {
    console.error("Error sending combined notification:", error);
    return next(createCustomError("Failed to send combined notification", 500));
  }
});

// Get user's notifications
const getUserNotifications = asyncWrapper(async (req, res) => {
  const {
    status,
    type,
    category,
    limit = 20,
    page = 1,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const options = {
    status,
    type,
    category,
    limit: parseInt(limit),
    page: parseInt(page),
    sortBy,
    sortOrder: sortOrder === "desc" ? -1 : 1,
  };

  const result = await Notification.getUserNotifications(req.user.userId, options);

  res.status(200).json({
    success: true,
    ...result,
  });
});

// Mark notification as read
const markNotificationAsRead = asyncWrapper(async (req, res, next) => {
  const { notificationId } = req.params;

  const notification = await Notification.markAsRead(notificationId, req.user.userId);

  if (!notification) {
    return next(createCustomError("Notification not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    notification,
  });
});

// Mark all notifications as read
const markAllNotificationsAsRead = asyncWrapper(async (req, res) => {
  await Notification.markAllAsRead(req.user.userId);

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
});

// Delete notification
const deleteNotification = asyncWrapper(async (req, res, next) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    userId: req.user.userId,
  });

  if (!notification) {
    return next(createCustomError("Notification not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Notification deleted successfully",
  });
});

// Get unread notification count
const getUnreadCount = asyncWrapper(async (req, res) => {
  const count = await Notification.getUnreadCount(req.user.userId);

  res.status(200).json({
    success: true,
    unreadCount: count,
  });
});

// Admin: Send notification to multiple users
const sendBulkNotification = asyncWrapper(async (req, res, next) => {
  const {
    userIds,
    title,
    message,
    type = "info",
    priority = "medium",
    category = "system",
    sendEmail = false,
    emailSubject,
  } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return next(createCustomError("userIds array is required", 400));
  }

  if (!title || !message) {
    return next(createCustomError("title and message are required", 400));
  }

  try {
    const results = {
      successful: [],
      failed: [],
    };

    for (const userId of userIds) {
      try {
        // Create in-app notification
        const notification = await Notification.create({
          userId,
          title,
          message,
          type,
          priority,
          category,
        });

        // Emit real-time notification if user is connected
        if (socketHandler && socketHandler.connectedUsers.has(userId)) {
          socketHandler.io.to(`user_${userId}`).emit("new_notification", {
            id: notification._id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            priority: notification.priority,
            category: notification.category,
            createdAt: notification.createdAt,
          });
        }

        // Send email if requested
        if (sendEmail && emailSubject) {
          const user = await User.findById(userId);
          if (user && user.email) {
            await EmailService.sendNotificationEmail(
              user.email,
              emailSubject,
              message,
              { priority }
            );
          }
        }

        results.successful.push(userId);
      } catch (error) {
        console.error(`Error sending notification to user ${userId}:`, error);
        results.failed.push({ userId, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: "Bulk notification process completed",
      results,
    });
  } catch (error) {
    console.error("Error in bulk notification:", error);
    return next(createCustomError("Failed to send bulk notifications", 500));
  }
});

export {
  sendInAppNotification,
  sendEmailNotification,
  sendCombinedNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
  sendBulkNotification,
};