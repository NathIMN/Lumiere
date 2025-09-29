export const messagingUtils = {
  // Check if current user can message target user based on role restrictions
  canMessageUser: (currentRole, targetRole) => {
    if (!currentRole || !targetRole) return false;
    
    // Admin and HR officers can message anyone
    if (currentRole === 'admin' || currentRole === 'hr_officer') {
      return true;
    }
    
    // Employees can only message HR officers and admins
    if (currentRole === 'employee') {
      return targetRole === 'hr_officer' || targetRole === 'admin';
    }
    
    // Insurance agents can only message HR officers and admins
    if (currentRole === 'insurance_agent') {
      return targetRole === 'hr_officer' || targetRole === 'admin';
    }
    
    return false;
  },

  // Get allowed recipient roles for current user
  getAllowedRoles: (currentRole) => {
    switch (currentRole) {
      case 'admin':
        return ['admin', 'hr_officer', 'employee', 'insurance_agent'];
      case 'hr_officer':
        return ['admin', 'hr_officer', 'employee', 'insurance_agent'];
      case 'employee':
        return ['admin', 'hr_officer'];
      case 'insurance_agent':
        return ['admin', 'hr_officer'];
      default:
        return [];
    }
  },

  // Format user name for display
  formatUserName: (user) => {
    if (!user) return 'Unknown User';
    const firstName = user.profile?.firstName || user.firstName || '';
    const lastName = user.profile?.lastName || user.lastName || '';
    return `${firstName} ${lastName}`.trim() || user.email || user.userId || 'Unknown User';
  },

  // Get role display name
  getRoleDisplayName: (role) => {
    const roleNames = {
      admin: 'Administrator',
      hr_officer: 'HR Officer', 
      employee: 'Employee',
      insurance_agent: 'Insurance Agent'
    };
    return roleNames[role] || 'User';
  },

  // Get role emoji/icon
  getRoleIcon: (role) => {
    const roleIcons = {
      admin: '👑',
      hr_officer: '👨‍💼',
      employee: '👤',
      insurance_agent: '🏢'
    };
    return roleIcons[role] || '👤';
  },

  // Format time for display
  formatTime: (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor((now - date) / (1000 * 60));
      return minutes <= 0 ? 'Just now' : `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  },

  // Truncate text for preview
  truncateText: (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  },

  // Sort conversations by priority
  sortConversations: (conversations) => {
    return conversations.sort((a, b) => {
      // First: unread messages
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
      
      // Second: recent activity
      const aTime = new Date(a.lastMessage?.createdAt || a.updatedAt || 0);
      const bTime = new Date(b.lastMessage?.createdAt || b.updatedAt || 0);
      
      if (aTime > bTime) return -1;
      if (aTime < bTime) return 1;
      
      // Third: alphabetical
      const aName = a.displayName || '';
      const bName = b.displayName || '';
      return aName.localeCompare(bName);
    });
  },

  // Filter contacts based on search query
  filterContacts: (contacts, searchQuery, roleFilter = 'all', statusFilter = 'all') => {
    return contacts.filter(contact => {
      const matchesSearch = !searchQuery || 
        messagingUtils.formatUserName(contact).toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.userId?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'all' || contact.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'online' && contact.isOnline) ||
        (statusFilter === 'offline' && !contact.isOnline);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }
};