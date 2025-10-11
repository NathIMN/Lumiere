/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from "react";
import "../../styles/mobile-messaging.css";
import {
  MessageCircle,
  MessageSquare,
  Search,
  Send,
  Phone,
  Video,
  ArrowLeft,
  MoreVertical,
  Users,
  Clock,
  Check,
  CheckCheck,
  Circle,
  Loader2,
  AlertTriangle,
  Paperclip,
  Smile,
  Sparkles,
  Menu,
  X,
  Settings,
  Bell,
  BellOff,
  Edit3,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import messagingApiService from "../../services/messaging-api";
import geminiApiService from "../../services/gemini-api";
import { useMessaging } from "../../hooks/useMessaging";
import { messagingUtils } from "../../utils/messagingUtils";
import { useAuth } from "../../context/AuthContext";

const MobileMessagingPage = () => {
  // Use the authentication context to get current user
  const { user: currentUser, isAuthenticated, logout } = useAuth();

  // State management
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  // Use the messaging hook directly
  const { socket, isConnected, unreadCount } = useMessaging();

  // Mobile-specific UI state
  const [currentView, setCurrentView] = useState("conversations"); // 'conversations', 'contacts', 'chat'
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [formalizeLoading, setFormalizeLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // Message edit/delete state
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageContent, setEditMessageContent] = useState("");
  const [showMessageOptions, setShowMessageOptions] = useState(null);

  // Filtering
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Refs
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Get user's role and permissions
  const userRole = currentUser?.role || "employee";

  const getRoleConfig = useCallback(() => {
    const defaultConfigs = {
      admin: {
        title: "Admin Messages",
        allowedRoles: ["hr_officer", "employee", "insurance_agent"],
        features: { canCallUsers: true, canVideoCall: true },
      },
      hr_officer: {
        title: "HR Messages",
        allowedRoles: ["admin", "employee", "insurance_agent"],
        features: { canCallUsers: true, canVideoCall: true },
      },
      employee: {
        title: "Messages",
        allowedRoles: ["admin", "hr_officer", "insurance_agent"],
        features: { canCallUsers: false, canVideoCall: false },
      },
      insurance_agent: {
        title: "Agent Messages",
        allowedRoles: ["admin", "hr_officer"],
        features: { canCallUsers: false, canVideoCall: false },
      },
    };

    return defaultConfigs[userRole] || defaultConfigs.employee;
  }, [userRole]);

  const roleConfig = getRoleConfig();

  // Initialize user and load data
  useEffect(() => {
    const initializeMessaging = async () => {
      if (!currentUser || !isAuthenticated) {
        console.log(
          "❌ User not authenticated, skipping messaging initialization"
        );
        return;
      }

      setLoading(true);
      try {
        await Promise.all([loadConversations(currentUser), loadContacts()]);
      } catch (error) {
        console.error("Error initializing messaging:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeMessaging();
  }, [currentUser, isAuthenticated]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) {
      console.log("❌ No socket available");
      return;
    }

    console.log("🔌 Setting up socket event listeners");

    const handleNewMessage = (message) => {
      console.log("📨 NEW MESSAGE EVENT RECEIVED:", {
        message: message,
        activeConversationId: activeConversation?._id,
        messageConversationId: message.conversationId,
        willAdd:
          activeConversation &&
          message.conversationId === activeConversation._id,
      });

      if (
        activeConversation &&
        message.conversationId === activeConversation._id
      ) {
        console.log("✅ Adding message to UI");
        setMessages((prev) => {
          console.log("Previous messages count:", prev.length);
          const newMessages = [...prev, message];
          console.log("New messages count:", newMessages.length);
          return newMessages;
        });
        scrollToBottom();
      } else {
        console.log("⏭️ Message not for current conversation");
      }
      updateConversationsList(message);
    };

    const handleTypingStart = (data) => {
      console.log("⌨️ Typing start:", data);
      setTypingUsers((prev) => ({
        ...prev,
        [data.conversationId]: {
          ...prev[data.conversationId],
          [data.userId]: data.userName,
        },
      }));
    };

    const handleTypingStop = (data) => {
      console.log("⌨️ Typing stop:", data);
      setTypingUsers((prev) => {
        const updated = { ...prev };
        if (updated[data.conversationId]) {
          delete updated[data.conversationId][data.userId];
          if (Object.keys(updated[data.conversationId]).length === 0) {
            delete updated[data.conversationId];
          }
        }
        return updated;
      });
    };

    console.log("🎧 Registering socket event listeners");
    socket.on("new_message", handleNewMessage);
    socket.on("typing_start", handleTypingStart);
    socket.on("typing_stop", handleTypingStop);

    return () => {
      console.log("🧹 Cleaning up socket event listeners");
      socket.off("new_message", handleNewMessage);
      socket.off("typing_start", handleTypingStart);
      socket.off("typing_stop", handleTypingStop);
    };
  }, [socket, activeConversation]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations
  const loadConversations = async (user = currentUser) => {
    try {
      const response = await messagingApiService.getConversations();
      if (response.success) {
        const transformedConversations = response.conversations.map((conv) => ({
          ...conv,
          _id: conv.conversationId || conv._id,
          otherParticipant: conv.otherUser,
          participants: [user, conv.otherUser],
        }));
        const sortedConversations = messagingUtils.sortConversations(
          transformedConversations
        );
        setConversations(sortedConversations);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  // Load contacts
  const loadContacts = async () => {
    setContactsLoading(true);
    try {
      const response = await messagingApiService.getContacts();
      if (response.success) {
        const filteredContacts =
          response.contacts?.filter((contact) =>
            roleConfig.allowedRoles.includes(contact.role)
          ) || [];
        setContacts(filteredContacts);
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
    } finally {
      setContactsLoading(false);
    }
  };

  // Load messages for conversation
  const loadMessages = async (recipientId) => {
    setMessageLoading(true);
    try {
      const response = await messagingApiService.request(
        `/messages/conversation/${recipientId}`
      );
      if (response.success) {
        setMessages(response.messages || []);
        await messagingApiService.request(
          `/messages/conversation/${recipientId}/read`,
          {
            method: "PATCH",
          }
        );
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setMessageLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!messageInput.trim() || !activeConversation || !socket) {
      console.log("❌ Cannot send message - missing requirements:", {
        hasInput: !!messageInput.trim(),
        hasConversation: !!activeConversation,
        hasSocket: !!socket,
      });
      return;
    }

    const messageContent = messageInput.trim();
    setMessageInput("");

    console.log("📤 Sending message via socket:", {
      recipientId: activeConversation.otherParticipant._id,
      content: messageContent,
      conversationId: activeConversation._id,
    });

    socket.emit("send_message", {
      recipientId: activeConversation.otherParticipant._id,
      content: messageContent,
      messageType: "text",
    });
  };

  // Formalize message using AI
  const formalizeMessage = async () => {
    if (!messageInput.trim()) {
      return;
    }

    setFormalizeLoading(true);

    try {
      const response = await geminiApiService.formalizeText(messageInput);
      
      if (response.success && response.formalized) {
        setMessageInput(response.formalized);
      } else if (response.formalized) {
        // Even if not successful, use the fallback formalization
        setMessageInput(response.formalized);
      }
    } catch (error) {
      console.error("Failed to formalize message:", error);
      // Show user-friendly error message or keep original text
    } finally {
      setFormalizeLoading(false);
    }
  };  // Edit message function
  const editMessage = async (messageId, newContent) => {
    if (!newContent.trim()) {
      setEditingMessageId(null);
      setEditMessageContent("");
      return;
    }

    try {
      const response = await messagingApiService.editMessage(messageId, newContent);

      if (response.success) {
        // Update local messages
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === messageId 
              ? { ...msg, content: newContent.trim(), edited: true, editedAt: new Date() }
              : msg
          )
        );

        // Emit socket event for real-time update
        if (socket) {
          socket.emit('message_edited', {
            messageId,
            newContent: newContent.trim(),
            conversationId: activeConversation._id
          });
        }
      }
    } catch (error) {
      console.error('Failed to edit message:', error);
    } finally {
      setEditingMessageId(null);
      setEditMessageContent("");
    }
  };

  // Delete message function
  const deleteMessage = async (messageId) => {
    try {
      const response = await messagingApiService.deleteMessage(messageId);

      if (response.success) {
        // Update local messages
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg._id !== messageId)
        );

        // Emit socket event for real-time update
        if (socket) {
          socket.emit('message_deleted', {
            messageId,
            conversationId: activeConversation._id
          });
        }
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    } finally {
      setShowMessageOptions(null);
    }
  };

  // Start editing a message
  const startEditingMessage = (message) => {
    setEditingMessageId(message._id);
    setEditMessageContent(message.content);
    setShowMessageOptions(null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditMessageContent("");
  };

  // Start conversation with contact
  const startConversation = async (contact) => {
    try {
      const response = await messagingApiService.request(
        `/messages/conversation/${contact._id}`
      );
      if (response.success) {
        const currentUserId = (currentUser._id || currentUser.id).toString();
        const contactId = contact._id.toString();
        const sortedIds = [currentUserId, contactId].sort();
        const conversationId = `conv_${sortedIds[0]}_${sortedIds[1]}`;

        const conversation = {
          _id: conversationId,
          participants: [currentUser, contact],
          otherParticipant: contact,
          messages: response.messages || [],
          lastMessage:
            response.messages?.[response.messages.length - 1] || null,
          unreadCount: 0,
        };

        setActiveConversation(conversation);
        setCurrentView("chat");
        setMessages(response.messages || []);

        if (socket) {
          console.log(
            "🏠 Joining conversation room for recipient:",
            contact._id
          );
          socket.emit("join_conversation", {
            recipientId: contact._id,
          });
        }

        setConversations((prev) => {
          const exists = prev.find(
            (conv) =>
              conv.otherParticipant?._id === contact._id ||
              conv._id === conversation._id
          );
          if (!exists) {
            return [conversation, ...prev];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      // Handle error by creating empty conversation
      const currentUserId = (currentUser._id || currentUser.id).toString();
      const contactId = contact._id.toString();
      const sortedIds = [currentUserId, contactId].sort();
      const conversationId = `conv_${sortedIds[0]}_${sortedIds[1]}`;

      const conversation = {
        _id: conversationId,
        participants: [currentUser, contact],
        otherParticipant: contact,
        messages: [],
        lastMessage: null,
        unreadCount: 0,
      };

      setActiveConversation(conversation);
      setCurrentView("chat");
      setMessages([]);

      if (socket) {
        console.log("🏠 Joining conversation room for recipient:", contact._id);
        socket.emit("join_conversation", {
          recipientId: contact._id,
        });
      }

      setConversations((prev) => [conversation, ...prev]);
    }
  };

  // Open existing conversation
  const openConversation = (conversation) => {
    setActiveConversation(conversation);
    setCurrentView("chat");
    loadMessages(conversation.otherParticipant._id);

    if (socket) {
      console.log(
        "🏠 Joining existing conversation room for:",
        conversation.otherParticipant._id
      );
      socket.emit("join_conversation", {
        recipientId: conversation.otherParticipant._id,
      });
    }
  };

  // Update conversations list with new message
  const updateConversationsList = (message) => {
    setConversations((prev) => {
      const updated = prev.map((conv) => {
        if (conv._id === message.conversationId) {
          return {
            ...conv,
            lastMessage: message,
            updatedAt: message.createdAt,
            unreadCount:
              conv._id === activeConversation?._id
                ? 0
                : (conv.unreadCount || 0) + 1,
          };
        }
        return conv;
      });
      return messagingUtils.sortConversations(updated);
    });
  };

  // Handle typing
  const handleTyping = () => {
    if (!isTyping && socket && activeConversation) {
      setIsTyping(true);
      console.log(
        "⌨️ Starting typing indicator for conversation:",
        activeConversation._id
      );
      socket.emit("typing_start", { conversationId: activeConversation._id });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && activeConversation) {
        console.log(
          "⌨️ Stopping typing indicator for conversation:",
          activeConversation._id
        );
        socket.emit("typing_stop", { conversationId: activeConversation._id });
      }
      setIsTyping(false);
    }, 1000);
  };

  // Filter functions
  const getFilteredContacts = () => {
    return messagingUtils.filterContacts(
      contacts,
      searchQuery,
      roleFilter,
      statusFilter
    );
  };

  const getFilteredConversations = () => {
    let filtered = conversations;

    if (searchQuery) {
      filtered = filtered.filter((conv) =>
        messagingUtils
          .formatUserName(conv.otherParticipant)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  // Message status icon
  const getMessageStatusIcon = (message) => {
    if (message.status === "sending")
      return <Clock className="w-3 h-3 text-gray-400" />;
    if (message.status === "failed")
      return <AlertTriangle className="w-3 h-3 text-red-500" />;
    if (message.readBy && message.readBy.length > 1)
      return <CheckCheck className="w-3 h-3 text-rose-700" />;
    return <Check className="w-3 h-3 text-gray-400" />;
  };

  // Show loading or error state if user not authenticated
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-900" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading user authentication...
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <Loader2 className="w-8 h-8 animate-spin text-red-900" />
      </div>
    );
  }

  // Mobile Menu Overlay
  const MobileMenu = () => (
    <>
      <div
        className={`mobile-menu-backdrop ${showMenu ? "open" : ""}`}
        onClick={() => setShowMenu(false)}
      />
      <div className={`mobile-slide-menu ${showMenu ? "open" : ""}`}>
        <div className="mobile-safe-area">
          <div className="p-6 border-b-2 border-red-900/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#151E3D]">Menu</h3>
              <button
                onClick={() => setShowMenu(false)}
                className="mobile-touchable p-2 text-gray-500 hover:text-red-900 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div className="mobile-card p-4">
                <div className="flex items-center space-x-4">
                  <div className="mobile-avatar">
                    {messagingUtils
                      .formatUserName(currentUser)
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-[#151E3D]">
                      {messagingUtils.formatUserName(currentUser)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {messagingUtils.getRoleDisplayName(currentUser.role)}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowMenu(false);
                  loadContacts();
                }}
                className="mobile-button-secondary w-full flex items-center justify-center space-x-3"
              >
                <Settings className="w-5 h-5" />
                <span>Refresh Contacts</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  setShowMenu(false);
                }}
                className="mobile-button-primary w-full flex items-center justify-center space-x-3 bg-red-600 hover:bg-red-700"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="mobile-messaging-container">
      <MobileMenu />

      {currentView === "chat" && activeConversation ? (
        // Chat View with Fixed Header and Footer
        <div className="mobile-chat-container flex flex-col h-full">
          {/* Fixed Chat Header */}
          <div className="mobile-header-bar flex items-center justify-between px-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentView("conversations")}
                className="mobile-touchable p-2 text-gray-600 hover:text-red-900 rounded-lg"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div
                className="mobile-avatar"
                style={{ width: "36px", height: "36px", fontSize: "14px" }}
              >
                {messagingUtils
                  .formatUserName(activeConversation.otherParticipant)
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-[#151E3D] text-base">
                  {messagingUtils.formatUserName(
                    activeConversation.otherParticipant
                  )}
                </h3>
                <p className="text-xs text-gray-600">
                  {messagingUtils.getRoleDisplayName(
                    activeConversation.otherParticipant.role
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {roleConfig.features.canCallUsers && (
                <button className="mobile-touchable p-2 text-gray-600 hover:text-red-900 rounded-lg">
                  <Phone className="w-5 h-5" />
                </button>
              )}
              {roleConfig.features.canVideoCall && (
                <button className="mobile-touchable p-2 text-gray-600 hover:text-red-900 rounded-lg">
                  <Video className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setShowMenu(true)}
                className="mobile-touchable p-2 text-gray-600 hover:text-red-900 rounded-lg"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="mobile-content-area mobile-messages-container overflow-y-auto px-4 space-y-4">
            {messageLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="mobile-loading-spinner"></div>
                <span className="ml-2 text-sm text-gray-500">
                  Loading messages...
                </span>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-[#151E3D]">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              messages.map((message, index) => {
                const currentUserId = currentUser?._id || currentUser?.id;
                const messageSenderId =
                  message.sender._id || message.sender.id || message.sender;
                const isOwn = messageSenderId === currentUserId;
                const showAvatar =
                  index === 0 ||
                  messages[index - 1].sender._id !== message.sender._id;

                return (
                  <div
                    key={message._id || message.id}
                    className={`flex ${
                      isOwn ? "justify-end" : "justify-start"
                    } items-end space-x-2`}
                  >
                    {!isOwn && showAvatar && (
                      <div
                        className="mobile-avatar"
                        style={{
                          width: "32px",
                          height: "32px",
                          fontSize: "12px",
                        }}
                      >
                        {messagingUtils
                          .formatUserName(message.sender)
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                    <div className="relative group">
                      <div
                        className={
                          isOwn
                            ? "mobile-message-sent"
                            : "mobile-message-received"
                        }
                      >
                        {editingMessageId === message._id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editMessageContent}
                              onChange={(e) => setEditMessageContent(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  editMessage(message._id, editMessageContent);
                                } else if (e.key === 'Escape') {
                                  cancelEditing();
                                }
                              }}
                              className="w-full bg-transparent border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-red-900"
                              autoFocus
                            />
                            <div className="flex space-x-2 justify-end">
                              <button
                                onClick={cancelEditing}
                                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => editMessage(message._id, editMessageContent)}
                                className="text-xs text-green-600 hover:text-green-700 px-2 py-1 rounded"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm leading-relaxed">
                              {message.content}
                              {message.edited && (
                                <span className="ml-1 text-xs opacity-60">(edited)</span>
                              )}
                            </p>
                            <div
                              className={`flex items-center justify-between mt-1 ${
                                isOwn ? "text-white/70" : "text-gray-500"
                              }`}
                            >
                              <div className="flex items-center space-x-1">
                                <span className="text-xs">
                                  {messagingUtils.formatTime(message.createdAt)}
                                </span>
                                {isOwn && getMessageStatusIcon(message)}
                              </div>
                              {isOwn && (
                                <button
                                  onClick={() => setShowMessageOptions(
                                    showMessageOptions === message._id ? null : message._id
                                  )}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/10 rounded"
                                >
                                  <MoreHorizontal className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Message Options Dropdown */}
                      {isOwn && showMessageOptions === message._id && (
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                          <button
                            onClick={() => startEditingMessage(message)}
                            className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => deleteMessage(message._id)}
                            className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center space-x-2"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                    {isOwn && showAvatar && (
                      <div
                        className="mobile-avatar"
                        style={{
                          width: "32px",
                          height: "32px",
                          fontSize: "12px",
                        }}
                      >
                        {messagingUtils
                          .formatUserName(message.sender)
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Typing indicator */}
          {typingUsers[activeConversation._id] &&
            Object.keys(typingUsers[activeConversation._id]).length > 0 && (
              <div className="px-6 pb-2">
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-red-900 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-red-900 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-red-900 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">
                      {Object.values(typingUsers[activeConversation._id])[0]} is
                      typing...
                    </span>
                  </div>
                </div>
              </div>
            )}

          {/* Fixed Message Input Bottom Bar */}
          <div className="mobile-bottom-bar flex items-center px-3 py-3">
            <div className="flex items-center w-full space-x-2 bg-white rounded-full px-3 py-2 shadow-sm border border-gray-200">
              <button className="mobile-touchable flex-shrink-0 p-1 text-gray-500 hover:text-red-900 rounded-lg">
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                ref={messageInputRef}
                type="text"
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="mobile-message-input flex-1 min-w-0 border-none bg-transparent focus:outline-none text-gray-900 placeholder-gray-500"
                style={{ fontSize: "16px" }}
              />

              <button
                onClick={formalizeMessage}
                disabled={!messageInput.trim() || formalizeLoading}
                className="mobile-touchable flex-shrink-0 p-1 text-purple-600 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                title="Formalize message with AI"
              >
                {formalizeLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </button>

               <button
                onClick={sendMessage}
                disabled={!messageInput.trim()}
                className="mobile-button-primary flex-shrink-0 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                style={{ width: "40px", height: "40px", minWidth: "40px", padding: "8px" }}
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Main View (Conversations/Contacts) with Fixed Header
        <div className="mobile-chat-container">
          {/* Fixed Header */}
          <div className="mobile-header-bar flex flex-col px-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#151E3D]">
                {roleConfig.title}
              </h2>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {isConnected ? (
                    <Circle className="w-3 h-3 text-green-500 fill-current" />
                  ) : (
                    <Circle className="w-3 h-3 text-red-500 fill-current" />
                  )}
                  <span className="text-xs text-gray-600">
                    {isConnected ? "Online" : "Offline"}
                  </span>
                </div>
                <button
                  onClick={() => setShowMenu(true)}
                  className="mobile-touchable p-2 text-gray-600 hover:text-red-900 rounded-lg"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations & contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mobile-search-input pl-10"
              />
            </div>
          </div>

          {/* Fixed Navigation Tabs */}
          <div className="bg-white border-b-2 border-gray-100 px-4 py-2">
            <div className="flex">
              <button
                onClick={() => setCurrentView("conversations")}
                className={`mobile-nav-tab ${
                  currentView === "conversations" ? "active" : ""
                }`}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Conversations
              </button>
              <button
                onClick={() => setCurrentView("contacts")}
                className={`mobile-nav-tab ${
                  currentView === "contacts" ? "active" : ""
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Contacts
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="mobile-content-area overflow-y-auto">
            {currentView === "conversations" ? (
              /* Conversations List */
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {getFilteredConversations().length === 0 ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No conversations yet</p>
                    <p className="text-sm">
                      Start a new conversation from Contacts
                    </p>
                  </div>
                ) : (
                  getFilteredConversations()
                    .map((conversation) => {
                      if (!conversation.otherParticipant) {
                        console.warn(
                          "Conversation missing otherParticipant:",
                          conversation
                        );
                        return null;
                      }

                      return (
                        <div
                          key={conversation._id}
                          onClick={() => openConversation(conversation)}
                          className="mobile-touchable p-4 active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-rose-700 dark:text-rose-400">
                                {messagingUtils
                                  .formatUserName(conversation.otherParticipant)
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {messagingUtils.formatUserName(
                                    conversation.otherParticipant
                                  )}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {messagingUtils.formatTime(
                                    conversation.lastMessage?.createdAt ||
                                      conversation.updatedAt
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                  {conversation.lastMessage?.content ||
                                    "No messages yet"}
                                </p>
                                {conversation.unreadCount > 0 && (
                                  <span className="ml-2 bg-red-900 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                    {conversation.unreadCount > 99
                                      ? "99+"
                                      : conversation.unreadCount}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {messagingUtils.getRoleDisplayName(
                                  conversation.otherParticipant.role
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                    .filter(Boolean)
                )}
              </div>
            ) : (
              /* Contacts List */
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {contactsLoading ? (
                  <div className="p-6 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-900" />
                  </div>
                ) : getFilteredContacts().length === 0 ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No contacts found</p>
                  </div>
                ) : (
                  getFilteredContacts().map((contact) => (
                    <div
                      key={contact._id}
                      onClick={() => startConversation(contact)}
                      className="mobile-touchable p-4 active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="font-medium text-gray-600 dark:text-gray-300">
                            {messagingUtils
                              .formatUserName(contact)
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {messagingUtils.formatUserName(contact)}
                            </p>
                            <span className="text-xs">
                              {messagingUtils.getRoleIcon(contact.role)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {messagingUtils.getRoleDisplayName(contact.role)}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                            {contact.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMessagingPage;
