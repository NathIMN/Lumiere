import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: [true, "Conversation ID is required"],
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient is required"],
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    messageType: {
      type: String,
      enum: ["text", "file", "system"],
      default: "text",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    readAt: {
      type: Date,
    },
    // Edit tracking
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    // Optional: for file messages
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileSize: Number,
        mimeType: String,
      },
    ],
    // Optional: for system messages (claim updates, etc.)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ recipient: 1, status: 1 });

// Generate conversation ID between two users
MessageSchema.statics.generateConversationId = function (userId1, userId2) {
  // Sort user IDs to ensure consistent conversation ID regardless of order
  const sortedIds = [userId1.toString(), userId2.toString()].sort();
  return `conv_${sortedIds[0]}_${sortedIds[1]}`;
};

// Get conversation between two users
MessageSchema.statics.getConversation = async function (userId1, userId2, limit = 50, page = 1) {
  const conversationId = this.generateConversationId(userId1, userId2);
  const skip = (page - 1) * limit;

  const messages = await this.find({ conversationId })
    .populate("sender", "userId profile.firstName profile.lastName role")
    .populate("recipient", "userId profile.firstName profile.lastName role")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  return messages.reverse(); // Return in chronological order
};

// Mark messages as read
MessageSchema.statics.markAsRead = async function (conversationId, userId) {
  await this.updateMany(
    {
      conversationId,
      recipient: userId,
      status: { $ne: "read" },
    },
    {
      status: "read",
      readAt: new Date(),
    }
  );
};

// Get user's conversations list
MessageSchema.statics.getUserConversations = async function (userId) {
  const conversations = await this.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { recipient: userId }],
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: "$conversationId",
        lastMessage: { $first: "$$ROOT" },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$recipient", userId] },
                  { $ne: ["$status", "read"] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "lastMessage.sender",
        foreignField: "_id",
        as: "senderInfo",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "lastMessage.recipient",
        foreignField: "_id",
        as: "recipientInfo",
      },
    },
    {
      $addFields: {
        otherUser: {
          $cond: [
            { $eq: ["$lastMessage.sender", userId] },
            { $arrayElemAt: ["$recipientInfo", 0] },
            { $arrayElemAt: ["$senderInfo", 0] },
          ],
        },
      },
    },
    {
      $project: {
        conversationId: "$_id",
        lastMessage: {
          content: "$lastMessage.content",
          createdAt: "$lastMessage.createdAt",
          messageType: "$lastMessage.messageType",
        },
        unreadCount: 1,
        otherUser: {
          _id: 1,
          userId: 1,
          role: 1,
          "profile.firstName": 1,
          "profile.lastName": 1,
        },
      },
    },
    {
      $sort: { "lastMessage.createdAt": -1 },
    },
  ]);

  return conversations;
};

const Message = mongoose.model("Message", MessageSchema);
export default Message;