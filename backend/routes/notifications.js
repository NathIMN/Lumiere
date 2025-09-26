import express from "express";
import {
  sendInAppNotification,
  sendEmailNotification,
  sendCombinedNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
  sendBulkNotification,
} from "../controllers/notifications.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Public endpoints for sending notifications (for testing with Postman)
// In production, you might want to add API key authentication or restrict these
router.post("/send/in-app", sendInAppNotification);
router.post("/send/email", sendEmailNotification);
router.post("/send/combined", sendCombinedNotification);
router.post("/send/bulk", sendBulkNotification);

// Protected endpoints (require user authentication)
router.use(authenticate);

// Get user's notifications
router.get("/", getUserNotifications);

// Get unread notification count
router.get("/unread-count", getUnreadCount);

// Mark specific notification as read
router.patch("/:notificationId/read", markNotificationAsRead);

// Mark all notifications as read
router.patch("/mark-all-read", markAllNotificationsAsRead);

// Delete notification
router.delete("/:notificationId", deleteNotification);

export default router;