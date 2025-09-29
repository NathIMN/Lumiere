/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../../styles/mobile-messaging.css';
import {
  MessageCircle,
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
  BellOff
} from 'lucide-react';
import messagingApiService from '../../services/messaging-api';
import chatbotApiService from '../../services/chatbot-api';
import { useMessaging } from '../../hooks/useMessaging';
import { messagingUtils } from '../../utils/messagingUtils';
import { useAuth } from '../../context/AuthContext';

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
  const [currentView, setCurrentView] = useState('conversations'); // 'conversations', 'contacts', 'chat'
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [formalizeLoading, setFormalizeLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // Filtering
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  
  // Refs
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Get user's role and permissions
  const userRole = currentUser?.role || 'employee';
  
  const getRoleConfig = useCallback(() => {
    const defaultConfigs = {
      admin: {
        title: "Admin Messages",
        allowedRoles: ["hr_officer", "employee", "insurance_agent"],
        features: { canCallUsers: true, canVideoCall: true }
      },
      hr_officer: {
        title: "HR Messages",
        allowedRoles: ["admin", "employee", "insurance_agent"],
        features: { canCallUsers: true, canVideoCall: true }
      },
      employee: {
        title: "Messages",
        allowedRoles: ["admin", "hr_officer", "insurance_agent"],
        features: { canCallUsers: false, canVideoCall: false }
      },
      insurance_agent: {
        title: "Agent Messages",
        allowedRoles: ["admin", "hr_officer"],
        features: { canCallUsers: false, canVideoCall: false }
      }
    };

    return defaultConfigs[userRole] || defaultConfigs.employee;
  }, [userRole]);

  const roleConfig = getRoleConfig();

  // Initialize user and load data
  useEffect(() => {
    const initializeMessaging = async () => {
      if (!currentUser || !isAuthenticated) {
        console.log('❌ User not authenticated, skipping messaging initialization');
        return;
      }
      
      setLoading(true);
      try {
        await Promise.all([
          loadConversations(currentUser),
          loadContacts()
        ]);
      } catch (error) {
        console.error('Error initializing messaging:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeMessaging();
  }, [currentUser, isAuthenticated]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) {
      console.log('❌ No socket available');
      return;
    }

    console.log('🔌 Setting up socket event listeners');

    const handleNewMessage = (message) => {
      console.log('📨 NEW MESSAGE EVENT RECEIVED:', {
        message: message,
        activeConversationId: activeConversation?._id,
        messageConversationId: message.conversationId,
        willAdd: activeConversation && message.conversationId === activeConversation._id
      });
      
      if (activeConversation && message.conversationId === activeConversation._id) {
        console.log('✅ Adding message to UI');
        setMessages(prev => {
          console.log('Previous messages count:', prev.length);
          const newMessages = [...prev, message];
          console.log('New messages count:', newMessages.length);
          return newMessages;
        });
        scrollToBottom();
      } else {
        console.log('⏭️ Message not for current conversation');
      }
      updateConversationsList(message);
    };

    const handleTypingStart = (data) => {
      console.log('⌨️ Typing start:', data);
      setTypingUsers(prev => ({
        ...prev,
        [data.conversationId]: {
          ...prev[data.conversationId],
          [data.userId]: data.userName
        }
      }));
    };

    const handleTypingStop = (data) => {
      console.log('⌨️ Typing stop:', data);
      setTypingUsers(prev => {
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

    console.log('🎧 Registering socket event listeners');
    socket.on('new_message', handleNewMessage);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);

    return () => {
      console.log('🧹 Cleaning up socket event listeners');
      socket.off('new_message', handleNewMessage);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
    };
  }, [socket, activeConversation]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations
  const loadConversations = async (user = currentUser) => {
    try {
      const response = await messagingApiService.getConversations();
      if (response.success) {
        const transformedConversations = response.conversations.map(conv => ({
          ...conv,
          _id: conv.conversationId || conv._id,
          otherParticipant: conv.otherUser,
          participants: [user, conv.otherUser]
        }));
        const sortedConversations = messagingUtils.sortConversations(transformedConversations);
        setConversations(sortedConversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  // Load contacts
  const loadContacts = async () => {
    setContactsLoading(true);
    try {
      const response = await messagingApiService.getContacts();
      if (response.success) {
        const filteredContacts = response.contacts?.filter(contact => 
          roleConfig.allowedRoles.includes(contact.role)
        ) || [];
        setContacts(filteredContacts);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setContactsLoading(false);
    }
  };

  // Load messages for conversation
  const loadMessages = async (recipientId) => {
    setMessageLoading(true);
    try {
      const response = await messagingApiService.request(`/messages/conversation/${recipientId}`);
      if (response.success) {
        setMessages(response.messages || []);
        await messagingApiService.request(`/messages/conversation/${recipientId}/read`, {
          method: 'PATCH'
        });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setMessageLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!messageInput.trim() || !activeConversation || !socket) {
      console.log('❌ Cannot send message - missing requirements:', {
        hasInput: !!messageInput.trim(),
        hasConversation: !!activeConversation,
        hasSocket: !!socket
      });
      return;
    }

    const messageContent = messageInput.trim();
    setMessageInput('');
    
    console.log('📤 Sending message via socket:', {
      recipientId: activeConversation.otherParticipant._id,
      content: messageContent,
      conversationId: activeConversation._id
    });
    
    socket.emit('send_message', {
      recipientId: activeConversation.otherParticipant._id,
      content: messageContent,
      messageType: 'text'
    });
  };

  // Formalize message using AI
  const formalizeMessage = async () => {
    if (!messageInput.trim()) {
      return;
    }

    setFormalizeLoading(true);
    
    try {
      const response = await chatbotApiService.formalizeMessage(messageInput);
      
      if (response.success && response.data.formalizedMessage) {
        setMessageInput(response.data.formalizedMessage);
        
        // Show feedback to user if AI was unavailable
        if (response.data.error) {
          console.warn('AI formalization unavailable:', response.data.error);
          // You could show a toast notification here if needed
        }
      }
    } catch (error) {
      console.error('Failed to formalize message:', error);
      // Keep the original message and show a subtle warning
      console.warn('AI formalization failed, keeping original message');
    } finally {
      setFormalizeLoading(false);
    }
  };

  // Start conversation with contact
  const startConversation = async (contact) => {
    try {
      const response = await messagingApiService.request(`/messages/conversation/${contact._id}`);
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
          lastMessage: response.messages?.[response.messages.length - 1] || null,
          unreadCount: 0
        };
        
        setActiveConversation(conversation);
        setCurrentView('chat');
        setMessages(response.messages || []);
        
        if (socket) {
          console.log('🏠 Joining conversation room for recipient:', contact._id);
          socket.emit('join_conversation', {
            recipientId: contact._id
          });
        }
        
        setConversations(prev => {
          const exists = prev.find(conv => 
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
      console.error('Error starting conversation:', error);
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
        unreadCount: 0
      };
      
      setActiveConversation(conversation);
      setCurrentView('chat');
      setMessages([]);
      
      if (socket) {
        console.log('🏠 Joining conversation room for recipient:', contact._id);
        socket.emit('join_conversation', {
          recipientId: contact._id
        });
      }
      
      setConversations(prev => [conversation, ...prev]);
    }
  };

  // Open existing conversation
  const openConversation = (conversation) => {
    setActiveConversation(conversation);
    setCurrentView('chat');
    loadMessages(conversation.otherParticipant._id);
    
    if (socket) {
      console.log('🏠 Joining existing conversation room for:', conversation.otherParticipant._id);
      socket.emit('join_conversation', {
        recipientId: conversation.otherParticipant._id
      });
    }
  };

  // Update conversations list with new message
  const updateConversationsList = (message) => {
    setConversations(prev => {
      const updated = prev.map(conv => {
        if (conv._id === message.conversationId) {
          return {
            ...conv,
            lastMessage: message,
            updatedAt: message.createdAt,
            unreadCount: conv._id === activeConversation?._id ? 0 : (conv.unreadCount || 0) + 1
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
      console.log('⌨️ Starting typing indicator for conversation:', activeConversation._id);
      socket.emit('typing_start', { conversationId: activeConversation._id });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && activeConversation) {
        console.log('⌨️ Stopping typing indicator for conversation:', activeConversation._id);
        socket.emit('typing_stop', { conversationId: activeConversation._id });
      }
      setIsTyping(false);
    }, 1000);
  };

  // Filter functions
  const getFilteredContacts = () => {
    return messagingUtils.filterContacts(contacts, searchQuery, roleFilter, statusFilter);
  };

  const getFilteredConversations = () => {
    let filtered = conversations;
    
    if (searchQuery) {
      filtered = filtered.filter(conv => 
        messagingUtils.formatUserName(conv.otherParticipant).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  // Message status icon
  const getMessageStatusIcon = (message) => {
    if (message.status === 'sending') return <Clock className="w-3 h-3 text-gray-400" />;
    if (message.status === 'failed') return <AlertTriangle className="w-3 h-3 text-red-500" />;
    if (message.readBy && message.readBy.length > 1) return <CheckCheck className="w-3 h-3 text-blue-500" />;
    return <Check className="w-3 h-3 text-gray-400" />;
  };

  // Show loading or error state if user not authenticated
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading user authentication...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Mobile Menu Overlay
  const MobileMenu = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${showMenu ? 'block' : 'hidden'}`}>
      <div className="fixed right-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform mobile-safe-area">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h3>
            <button
              onClick={() => setShowMenu(false)}
              className="mobile-touch-target mobile-touchable p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {messagingUtils.formatUserName(currentUser).charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {messagingUtils.formatUserName(currentUser)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {messagingUtils.getRoleDisplayName(currentUser.role)}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowMenu(false);
                loadContacts();
              }}
              className="mobile-touchable w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
            >
              <Settings className="w-5 h-5 text-gray-500" />
              <span className="text-gray-900 dark:text-white">Refresh Contacts</span>
            </button>
            <button
              onClick={() => {
                logout();
                setShowMenu(false);
              }}
              className="mobile-touchable w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-red-600 dark:text-red-400"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mobile-messaging-container min-h-screen bg-gray-50 dark:bg-gray-900">
      <MobileMenu />
      
      {currentView === 'chat' && activeConversation ? (
        // Chat View
        <div className="mobile-chat-container flex flex-col h-screen">
          {/* Chat Header */}
          <div className="mobile-safe-area bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentView('conversations')}
                className="mobile-touch-target mobile-touchable p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {messagingUtils.formatUserName(activeConversation.otherParticipant).charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                  {messagingUtils.formatUserName(activeConversation.otherParticipant)}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {messagingUtils.getRoleDisplayName(activeConversation.otherParticipant.role)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {roleConfig.features.canCallUsers && (
                <button className="mobile-touch-target mobile-touchable p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <Phone className="w-5 h-5" />
                </button>
              )}
              {roleConfig.features.canVideoCall && (
                <button className="mobile-touch-target mobile-touchable p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <Video className="w-5 h-5" />
                </button>
              )}
              <button className="mobile-touch-target mobile-touchable p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="mobile-messages-container flex-1 overflow-y-auto px-4 py-2 space-y-3">
            {messageLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const currentUserId = currentUser?._id || currentUser?.id;
                const messageSenderId = message.sender._id || message.sender.id || message.sender;
                const isOwn = messageSenderId === currentUserId;
                const showAvatar = index === 0 || messages[index - 1].sender._id !== message.sender._id;
                
                return (
                  <div key={message._id || message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-xs`}>
                      {showAvatar && !isOwn && (
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            {messagingUtils.formatUserName(message.sender).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div
                        className={`px-3 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center justify-end mt-1 space-x-1 ${isOwn ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
                          <span className="text-xs">
                            {messagingUtils.formatTime(message.createdAt)}
                          </span>
                          {isOwn && getMessageStatusIcon(message)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Typing indicator */}
          {typingUsers[activeConversation._id] && Object.keys(typingUsers[activeConversation._id]).length > 0 && (
            <div className="px-4 pb-2">
              <div className="flex justify-start">
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {Object.values(typingUsers[activeConversation._id])[0]} is typing...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="mobile-input-container mobile-safe-area bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
            <div className="flex items-center space-x-2">
              <button className="mobile-touch-target mobile-touchable p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <Paperclip className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <input
                  ref={messageInputRef}
                  type="text"
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="mobile-message-input w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <button
                onClick={formalizeMessage}
                disabled={!messageInput.trim() || formalizeLoading}
                className="mobile-touch-target mobile-touchable p-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Formalize message with AI"
              >
                {formalizeLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={sendMessage}
                disabled={!messageInput.trim()}
                className="mobile-touch-target mobile-touchable p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Main View (Conversations/Contacts)
        <div className="mobile-chat-container flex flex-col h-screen">
          {/* Header */}
          <div className="mobile-safe-area bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {roleConfig.title}
              </h2>
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <Circle className="w-3 h-3 text-green-500 fill-current" />
                ) : (
                  <Circle className="w-3 h-3 text-red-500 fill-current" />
                )}
                <button
                  onClick={() => setShowMenu(true)}
                  className="mobile-touch-target mobile-touchable p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mobile-message-input w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* View Tabs */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full p-1">
              <button
                onClick={() => setCurrentView('conversations')}
                className={`mobile-touchable flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  currentView === 'conversations'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Chats
              </button>
              <button
                onClick={() => setCurrentView('contacts')}
                className={`mobile-touchable flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  currentView === 'contacts'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Contacts
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {currentView === 'conversations' ? (
              /* Conversations List */
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {getFilteredConversations().length === 0 ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start a new conversation from Contacts</p>
                  </div>
                ) : (
                  getFilteredConversations().map(conversation => {
                    if (!conversation.otherParticipant) {
                      console.warn('Conversation missing otherParticipant:', conversation);
                      return null;
                    }
                    
                    return (
                      <div
                        key={conversation._id}
                        onClick={() => openConversation(conversation)}
                        className="mobile-touchable p-4 active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              {messagingUtils.formatUserName(conversation.otherParticipant).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {messagingUtils.formatUserName(conversation.otherParticipant)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {messagingUtils.formatTime(conversation.lastMessage?.createdAt || conversation.updatedAt)}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {conversation.lastMessage?.content || 'No messages yet'}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {messagingUtils.getRoleDisplayName(conversation.otherParticipant.role)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }).filter(Boolean)
                )}
              </div>
            ) : (
              /* Contacts List */
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {contactsLoading ? (
                  <div className="p-6 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                  </div>
                ) : getFilteredContacts().length === 0 ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No contacts found</p>
                  </div>
                ) : (
                  getFilteredContacts().map(contact => (
                    <div
                      key={contact._id}
                      onClick={() => startConversation(contact)}
                      className="mobile-touchable p-4 active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="font-medium text-gray-600 dark:text-gray-300">
                            {messagingUtils.formatUserName(contact).charAt(0).toUpperCase()}
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