// routes/messages.js
import express from "express";
import {
  getConversations,
  getConversation,
  sendMessage,
  markConversationAsRead,
  getAvailableContacts,
  getUnreadCount,
  searchMessages,
  editMessage,
  deleteMessage,
} from "../controllers/messages.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// All message routes require authentication
router.use(authenticate);

// Get user's conversations list
router.get("/conversations", getConversations);

// Get available contacts to chat with
router.get("/contacts", getAvailableContacts);

// Get unread message count
router.get("/unread-count", getUnreadCount);

// Search messages
router.get("/search", searchMessages);

// Get conversation with specific user
router.get("/conversation/:recipientId", getConversation);

// Send message (HTTP fallback)
router.post("/send", sendMessage);

// Mark conversation as read
router.patch("/conversation/:recipientId/read", markConversationAsRead);

// Edit a message
router.put("/:messageId", editMessage);

// Delete a message
router.delete("/:messageId", deleteMessage);

export default router;