import React, { createContext, useContext } from 'react';
import { useMessaging } from '../../hooks/useMessaging';

const MessagingContext = createContext();

const MessagingSystem = ({ isOpen, onClose, className = "" }) => {
  // State management
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [socket, setSocket] = useState(null);
  
  // UI state
  const [activeView, setActiveView] = useState("conversations"); // conversations, contacts, search
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  
  // Filtering and sorting
  const [statusFilter, setStatusFilter] = useState("all"); // all, online, offline
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent"); // recent, alphabetical, unread
  
  // Refs
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Role-based contact filtering rules
  const getRoleFilterOptions = () => {
    const currentRole = localStorage.getItem('userRole');
    const baseOptions = [{ value: "all", label: "All Contacts" }];
    
    switch (currentRole) {
      case 'admin':
        return [
          ...baseOptions,
          { value: "hr_officer", label: "HR Officers" },
          { value: "employee", label: "Employees" },
          { value: "insurance_agent", label: "Insurance Agents" }
        ];
      case 'hr_officer':
        return [
          ...baseOptions,
          { value: "admin", label: "Administrators" },
          { value: "employee", label: "Employees" },
          { value: "insurance_agent", label: "Insurance Agents" }
        ];
      case 'employee':
        return [
          ...baseOptions,
          { value: "admin", label: "Administrators" },
          { value: "hr_officer", label: "HR Officers" }
        ];
      case 'insurance_agent':
        return [
          ...baseOptions,
          { value: "admin", label: "Administrators" },
          { value: "hr_officer", label: "HR Officers" }
        ];
      default:
        return baseOptions;
    }
  };

  // Initialize component
  useEffect(() => {
    if (isOpen) {
      initializeMessaging();
    }
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isOpen]);

  const initializeMessaging = async () => {
    try {
      setLoading(true);
      
      // Get current user data
      const userId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('userRole');
      setCurrentUser({ id: userId, role: userRole });
      
      // Initialize socket connection
      initializeSocket();
      
      // Load initial data
      await Promise.all([
        loadConversations(),
        loadContacts()
      ]);
      
    } catch (error) {
      console.error('Error initializing messaging:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const newSocket = io('http://localhost:5000', {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to messaging server');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from messaging server');
      });

      newSocket.on('new_message', (message) => {
        handleNewMessage(message);
      });

      newSocket.on('conversation_updated', (conversation) => {
        updateConversationInList(conversation);
      });

      newSocket.on('typing_start', ({ userId, conversationId, userName }) => {
        if (activeConversation?.id === conversationId) {
          setTypingUsers(prev => ({ ...prev, [userId]: userName }));
        }
      });

      newSocket.on('typing_stop', ({ userId, conversationId }) => {
        if (activeConversation?.id === conversationId) {
          setTypingUsers(prev => {
            const updated = { ...prev };
            delete updated[userId];
            return updated;
          });
        }
      });

      newSocket.on('user_status_change', (data) => {
        updateUserStatus(data);
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await messagingApiService.getConversations();
      if (response.success) {
        const formattedConversations = response.conversations.map(conv =>
          messagingApiService.formatConversation(conv, currentUser?.id)
        );
        setConversations(messagingApiService.sortConversations(formattedConversations));
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadContacts = async () => {
    try {
      setContactsLoading(true);
      const response = await messagingApiService.getContactsWithStatus();
      if (response.success) {
        const filteredContacts = messagingApiService.filterContactsByRole(response.contacts);
        setContacts(filteredContacts);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setContactsLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    if (activeConversation && message.conversationId === activeConversation.id) {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
      
      // Auto-mark as read if conversation is active
      messagingApiService.markAsRead(message.conversationId);
    }
    
    // Update conversation in list
    updateConversationInList({
      id: message.conversationId,
      lastMessage: message,
      unreadCount: activeConversation?.id === message.conversationId ? 0 : undefined
    });
  };

  const updateConversationInList = (updatedConversation) => {
    setConversations(prev => {
      const updated = prev.map(conv => 
        conv.id === updatedConversation.id 
          ? { ...conv, ...updatedConversation }
          : conv
      );
      return messagingApiService.sortConversations(updated);
    });
  };

  const updateUserStatus = (statusData) => {
    setContacts(prev => prev.map(contact => 
      contact._id === statusData.userId 
        ? { ...contact, isOnline: statusData.isOnline }
        : contact
    ));
  };

  const startConversation = async (contact) => {
    try {
      setMessageLoading(true);
      const response = await messagingApiService.getOrCreateConversation(contact._id);
      
      if (response.success) {
        const conversation = {
          id: response.conversation._id,
          displayName: `${contact.profile?.firstName || ''} ${contact.profile?.lastName || ''}`.trim(),
          displayRole: contact.role,
          isOnline: contact.isOnline || false,
          participant: contact
        };
        
        setActiveConversation(conversation);
        setActiveView("conversation");
        
        // Load conversation messages
        await loadConversationMessages(conversation.id);
        
        // Join socket room
        if (socket) {
          socket.emit('join_conversation', { conversationId: conversation.id });
        }
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    } finally {
      setMessageLoading(false);
    }
  };

  const selectConversation = async (conversation) => {
    try {
      setMessageLoading(true);
      setActiveConversation(conversation);
      setActiveView("conversation");
      
      await loadConversationMessages(conversation.id);
      
      // Join socket room and mark as read
      if (socket) {
        socket.emit('join_conversation', { conversationId: conversation.id });
      }
      
      if (conversation.unreadCount > 0) {
        await messagingApiService.markAsRead(conversation.id);
        updateConversationInList({ ...conversation, unreadCount: 0 });
      }
      
    } catch (error) {
      console.error('Error selecting conversation:', error);
    } finally {
      setMessageLoading(false);
    }
  };

  const loadConversationMessages = async (conversationId) => {
    try {
      const response = await messagingApiService.getMessages(conversationId, { limit: 50 });
      if (response.success) {
        setMessages(response.messages.reverse()); // Reverse to show oldest first
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !activeConversation) return;

    const messageContent = messageInput.trim();
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content: messageContent,
      sender: { _id: currentUser?.id },
      createdAt: new Date().toISOString(),
      status: 'sending',
      isTemporary: true
    };

    // Add temporary message to UI immediately
    setMessages(prev => [...prev, tempMessage]);
    setMessageInput('');
    scrollToBottom();
    stopTyping();

    try {
      const response = await messagingApiService.sendMessage({
        recipientId: activeConversation.participant._id,
        content: messageContent,
        conversationId: activeConversation.id
      });

      if (response.success) {
        // Replace temporary message with actual message
        setMessages(prev => prev.map(msg => 
          msg._id === tempMessage._id ? response.message : msg
        ));
      } else {
        // Mark message as failed
        setMessages(prev => prev.map(msg => 
          msg._id === tempMessage._id 
            ? { ...msg, status: 'failed', error: true }
            : msg
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Mark message as failed
      setMessages(prev => prev.map(msg => 
        msg._id === tempMessage._id 
          ? { ...msg, status: 'failed', error: true }
          : msg
      ));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else {
      handleTyping();
    }
  };

  const handleTyping = () => {
    if (!activeConversation || !socket) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing_start', { conversationId: activeConversation.id });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const stopTyping = () => {
    if (isTyping && socket && activeConversation) {
      setIsTyping(false);
      socket.emit('typing_stop', { conversationId: activeConversation.id });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter and search functions
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchQuery || 
      contact.profile?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.profile?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.userId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || contact.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "online" && contact.isOnline) ||
      (statusFilter === "offline" && !contact.isOnline);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = !searchQuery ||
      conv.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (sortBy === "alphabetical") {
      const aName = `${a.profile?.firstName || ''} ${a.profile?.lastName || ''}`.trim();
      const bName = `${b.profile?.firstName || ''} ${b.profile?.lastName || ''}`.trim();
      return aName.localeCompare(bName);
    }
    
    // Default: online first, then alphabetical
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    
    const aName = `${a.profile?.firstName || ''} ${a.profile?.lastName || ''}`.trim();
    const bName = `${b.profile?.firstName || ''} ${b.profile?.lastName || ''}`.trim();
    return aName.localeCompare(bName);
  });

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return '👑';
      case 'hr_officer': return '👨‍💼';
      case 'employee': return '👤';
      case 'insurance_agent': return '🏢';
      default: return '👤';
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'hr_officer': return 'HR Officer';
      case 'employee': return 'Employee';
      case 'insurance_agent': return 'Insurance Agent';
      default: return 'User';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getMessageStatus = (message) => {
    if (message.isTemporary) {
      if (message.status === 'sending') {
        return <Clock className="w-3 h-3 text-gray-400" />;
      } else if (message.error) {
        return <AlertTriangle className="w-3 h-3 text-red-500" />;
      }
    }
    
    if (message.status === 'read') {
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    } else if (message.status === 'delivered') {
      return <Check className="w-3 h-3 text-gray-500" />;
    }
    
    return <Circle className="w-2 h-2 text-gray-400" />;
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${className}`}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl h-[600px] flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Messages
              </h2>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search messages or contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveView("conversations")}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                activeView === "conversations"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-700"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Chats
            </button>
            <button
              onClick={() => setActiveView("contacts")}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                activeView === "contacts"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-700"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Contacts
            </button>
          </div>

          {/* Filters (only show for contacts) */}
          {activeView === "contacts" && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 space-y-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-white"
              >
                {getRoleFilterOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="recent">Recent</option>
                  <option value="alphabetical">A-Z</option>
                </select>
              </div>
            </div>
          )}

          {/* Content List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : activeView === "conversations" ? (
              filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  {searchQuery ? "No conversations found" : "No conversations yet"}
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => selectConversation(conversation)}
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                      activeConversation?.id === conversation.id
                        ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {getRoleIcon(conversation.displayRole)}
                        </div>
                        {conversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        )}
                        {conversation.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-sm font-medium truncate ${
                            conversation.unreadCount > 0
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-700 dark:text-gray-300"
                          }`}>
                            {conversation.displayName}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(conversation.lastMessage?.createdAt || conversation.updatedAt)}
                          </span>
                        </div>
                        <p className={`text-xs truncate mt-1 ${
                          conversation.unreadCount > 0
                            ? "text-gray-600 dark:text-gray-400 font-medium"
                            : "text-gray-500 dark:text-gray-500"
                        }`}>
                          {conversation.lastMessage?.content || "Start a conversation..."}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {getRoleName(conversation.displayRole)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              contactsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : sortedContacts.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  {searchQuery ? "No contacts found" : "No contacts available"}
                </div>
              ) : (
                sortedContacts.map((contact) => (
                  <div
                    key={contact._id}
                    onClick={() => startConversation(contact)}
                    className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {getRoleIcon(contact.role)}
                        </div>
                        {contact.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {contact.profile?.firstName} {contact.profile?.lastName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {contact.email}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {getRoleName(contact.role)}
                        </p>
                        <p className={`text-xs mt-1 ${contact.isOnline ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                          {contact.isOnline ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {!activeConversation ? (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Welcome to Lumiere Messaging
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Select a conversation or contact to start messaging
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setActiveConversation(null);
                        setActiveView("conversations");
                      }}
                      className="lg:hidden p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {getRoleIcon(activeConversation.displayRole)}
                      </div>
                      {activeConversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {activeConversation.displayName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {getRoleName(activeConversation.displayRole)} • {activeConversation.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800">
                {messageLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">
                        Start the conversation with {activeConversation.displayName}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.sender._id === currentUser?.id;
                      return (
                        <div
                          key={message._id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwn
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                          } ${message.error ? 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700' : ''}`}>
                            <p className="text-sm break-words">{message.content}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                              isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              <span>{formatTime(message.createdAt)}</span>
                              {isOwn && getMessageStatus(message)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Typing Indicator */}
                    {Object.keys(typingUsers).length > 0 && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {Object.values(typingUsers)[0]} is typing...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <textarea
                      ref={messageInputRef}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      rows="1"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 dark:text-white"
                      style={{ minHeight: '40px', maxHeight: '120px' }}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!messageInput.trim()}
                    className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingSystem;