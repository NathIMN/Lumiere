import Message from "../models/Message.js";
import User from "../models/User.js";
import asyncWrapper from "../middleware/async.js";
import { createCustomError } from "../errors/custom-error.js";

// Get user's conversations
const getConversations = asyncWrapper(async (req, res) => {
  const conversations = await Message.getUserConversations(req.user.userId);

  res.status(200).json({
    success: true,
    count: conversations.length,
    conversations,
  });
});

// Get conversation between current user and another user
const getConversation = asyncWrapper(async (req, res, next) => {
  const { recipientId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  // Validate recipient exists
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    return next(createCustomError("Recipient not found", 404));
  }

  // Check if conversation is allowed
  if (!isConversationAllowed(req.user.role, recipient.role)) {
    return next(createCustomError("Conversation not allowed between these roles", 403));
  }

  // Get messages
  const messages = await Message.getConversation(
    req.user.userId,
    recipientId,
    parseInt(limit),
    parseInt(page)
  );

  // Get total count for pagination
  const conversationId = Message.generateConversationId(req.user.userId, recipientId);
  const totalMessages = await Message.countDocuments({ conversationId });

  res.status(200).json({
    success: true,
    messages,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalMessages,
      totalPages: Math.ceil(totalMessages / limit),
    },
    recipient: {
      _id: recipient._id,
      userId: recipient.userId,
      name: recipient.fullName,
      role: recipient.role,
    },
  });
});

// Send a message (HTTP endpoint as backup to Socket.IO)
const sendMessage = asyncWrapper(async (req, res, next) => {
  const { recipientId, content, messageType = "text" } = req.body;

  // Validate input
  if (!recipientId || !content?.trim()) {
    return next(createCustomError("Recipient and content are required", 400));
  }

  // Validate recipient
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    return next(createCustomError("Recipient not found", 404));
  }

  // Check conversation permissions
  if (!isConversationAllowed(req.user.role, recipient.role)) {
    return next(createCustomError("Not authorized to send message to this user", 403));
  }

  // Create message
  const conversationId = Message.generateConversationId(req.user.userId, recipientId);
  
  const message = await Message.create({
    conversationId,
    sender: req.user.userId,
    recipient: recipientId,
    content: content.trim(),
    messageType,
  });

  // Populate sender and recipient info
  await message.populate("sender", "userId profile.firstName profile.lastName role");
  await message.populate("recipient", "userId profile.firstName profile.lastName role");

  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: message,
  });
});

// Mark conversation as read
const markConversationAsRead = asyncWrapper(async (req, res, next) => {
  const { recipientId } = req.params;

  // Validate recipient
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    return next(createCustomError("Recipient not found", 404));
  }

  const conversationId = Message.generateConversationId(req.user.userId, recipientId);
  
  // Mark messages as read
  await Message.markAsRead(conversationId, req.user.userId);

  res.status(200).json({
    success: true,
    message: "Messages marked as read",
  });
});

// Get available users to chat with (based on role)
const getAvailableContacts = asyncWrapper(async (req, res) => {
  let query = {};

  // Define who each role can chat with
  switch (req.user.role) {
    case "employee":
      query.role = "hr_officer";
      break;
    case "hr_officer":
      query.role = { $in: ["employee", "insurance_agent", "admin"] };
      break;
    case "insurance_agent":
      query.role = { $in: ["hr_officer", "admin"] };
      break;
    case "admin":
      query.role = { $in: ["employee", "hr_officer", "insurance_agent"] };
      break;
    default:
      query.role = "hr_officer"; // Default fallback
  }

  // Exclude current user and inactive users
  query._id = { $ne: req.user.userId };
  query.status = "active";

  const users = await User.find(query)
    .select("userId profile.firstName profile.lastName role employment.department")
    .sort({ "profile.firstName": 1 });

  res.status(200).json({
    success: true,
    count: users.length,
    contacts: users,
  });
});

// Get unread message count
const getUnreadCount = asyncWrapper(async (req, res) => {
  const unreadCount = await Message.countDocuments({
    recipient: req.user.userId,
    status: { $ne: "read" },
  });

  res.status(200).json({
    success: true,
    unreadCount,
  });
});

// Search messages
const searchMessages = asyncWrapper(async (req, res, next) => {
  const { query, recipientId } = req.query;

  if (!query?.trim()) {
    return next(createCustomError("Search query is required", 400));
  }

  let searchCriteria = {
    $or: [
      { sender: req.user.userId },
      { recipient: req.user.userId },
    ],
    content: { $regex: query.trim(), $options: "i" },
  };

  // If specific recipient provided, filter by conversation
  if (recipientId) {
    const conversationId = Message.generateConversationId(req.user.userId, recipientId);
    searchCriteria.conversationId = conversationId;
  }

  const messages = await Message.find(searchCriteria)
    .populate("sender", "userId profile.firstName profile.lastName role")
    .populate("recipient", "userId profile.firstName profile.lastName role")
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({
    success: true,
    count: messages.length,
    messages,
  });
});

// Helper function to check if conversation is allowed
function isConversationAllowed(role1, role2) {
  const allowedConversations = [
    ["employee", "hr_officer"],
    ["hr_officer", "insurance_agent"],
    ["admin", "hr_officer"],
    ["admin", "insurance_agent"],
    ["admin", "employee"],
  ];

  return allowedConversations.some(
    ([r1, r2]) => (role1 === r1 && role2 === r2) || (role1 === r2 && role2 === r1)
  );
}

// Edit a message
const editMessage = asyncWrapper(async (req, res, next) => {
  const { messageId } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return next(createCustomError("Message content is required", 400));
  }

  // Find the message
  const message = await Message.findById(messageId);
  if (!message) {
    return next(createCustomError("Message not found", 404));
  }

  // Check if user owns the message
  if (message.sender.toString() !== req.user.userId.toString()) {
    return next(createCustomError("You can only edit your own messages", 403));
  }

  // Update the message
  message.content = content.trim();
  message.edited = true;
  message.editedAt = new Date();
  await message.save();

  res.status(200).json({
    success: true,
    message: message
  });
});

// Delete a message
const deleteMessage = asyncWrapper(async (req, res, next) => {
  const { messageId } = req.params;

  // Find the message
  const message = await Message.findById(messageId);
  if (!message) {
    return next(createCustomError("Message not found", 404));
  }

  // Check if user owns the message
  if (message.sender.toString() !== req.user.userId.toString()) {
    return next(createCustomError("You can only delete your own messages", 403));
  }

  // Delete the message
  await Message.findByIdAndDelete(messageId);

  res.status(200).json({
    success: true,
    message: "Message deleted successfully"
  });
});

export {
  getConversations,
  getConversation,
  sendMessage,
  markConversationAsRead,
  getAvailableContacts,
  getUnreadCount,
  searchMessages,
  editMessage,
  deleteMessage,
};