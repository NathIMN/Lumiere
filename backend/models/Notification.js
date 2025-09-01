import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    type: {
      type: String,
      enum: ["info", "warning", "success", "error", "system"],
      default: "info",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["unread", "read", "dismissed"],
      default: "unread",
    },
    category: {
      type: String,
      enum: ["system", "claim", "policy", "document", "general"],
      default: "general",
    },
    // Optional: action button
    actionButton: {
      text: String,
      url: String,
    },
    // Optional: metadata for additional context
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    // Track when notification was read
    readAt: {
      type: Date,
    },
    // Optional: expiry date for the notification
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
NotificationSchema.index({ userId: 1, status: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Get user's notifications
NotificationSchema.statics.getUserNotifications = async function (userId, options = {}) {
  const {
    status = null,
    type = null,
    category = null,
    limit = 20,
    page = 1,
    sortBy = "createdAt",
    sortOrder = -1
  } = options;

  const query = { userId };
  
  if (status) query.status = status;
  if (type) query.type = type;
  if (category) query.category = category;

  const skip = (page - 1) * limit;

  const notifications = await this.find(query)
    .sort({ [sortBy]: sortOrder })
    .limit(limit)
    .skip(skip);

  const total = await this.countDocuments(query);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Mark notification as read
NotificationSchema.statics.markAsRead = async function (notificationId, userId) {
  const notification = await this.findOneAndUpdate(
    { _id: notificationId, userId },
    { 
      status: "read",
      readAt: new Date(),
    },
    { new: true }
  );

  return notification;
};

// Mark all user notifications as read
NotificationSchema.statics.markAllAsRead = async function (userId) {
  await this.updateMany(
    { userId, status: "unread" },
    { 
      status: "read",
      readAt: new Date(),
    }
  );
};

// Get unread count
NotificationSchema.statics.getUnreadCount = async function (userId) {
  return await this.countDocuments({ userId, status: "unread" });
};

// Delete old notifications (cleanup method)
NotificationSchema.statics.cleanup = async function (daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await this.deleteMany({
    createdAt: { $lt: cutoffDate },
    status: { $in: ["read", "dismissed"] },
  });

  return result.deletedCount;
};

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;