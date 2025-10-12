// Employee Context Service for Lumi Voice Assistant
// This service fetches comprehensive employee data to provide context to Lumi

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

class EmployeeContextService {
  constructor() {
    this.refreshToken();
    console.log('EmployeeContextService initialized with token:', this.token ? `Token exists (${this.token.substring(0, 20)}...)` : 'No token found');
  }

  // Check if token exists and is valid format
  hasValidToken() {
    return this.token && this.token.length > 0 && this.token !== 'null' && this.token !== 'undefined';
  }

  // Refresh token from localStorage using the correct key
  refreshToken() {
    this.token = localStorage.getItem('authToken');
    console.log('Token refreshed:', this.token ? `Token exists (${this.token.substring(0, 20)}...)` : 'No token found');
  }

  async fetchWithAuth(url, options = {}) {
    try {
      // Check if we have a token before making requests
      if (!this.hasValidToken()) {
        this.refreshToken();
        if (!this.hasValidToken()) {
          throw new Error('No authentication token available. Please log in again.');
        }
      }

      console.log(`Making API request to: ${API_BASE_URL}${url}`);
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
          ...options.headers,
        },
      });

      console.log(`API Response status: ${response.status} for ${url}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API request failed for ${url}:`, response.status, errorText);
        
        // If we get 401, the token might be expired
        if (response.status === 401) {
          console.warn('Received 401 Unauthorized. Token may be expired.');
          throw new Error('Authentication failed. Please log in again.');
        }
        
        throw new Error(`API request failed: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`API Response data for ${url}:`, data);
      return data;
    } catch (error) {
      console.error(`Error in fetchWithAuth for ${url}:`, error);
      throw error;
    }
  }

  // Fetch current user profile data
  async getEmployeeProfile() {
    try {
      const response = await this.fetchWithAuth('/users/profile');
      return response.user;
    } catch (error) {
      console.error('Failed to fetch employee profile:', error);
      return null;
    }
  }

  // Fetch employee's claims data
  async getEmployeeClaims() {
    try {
      console.log('Fetching employee claims...');
      const response = await this.fetchWithAuth('/claims?limit=50&sortBy=createdAt&sortOrder=desc');
      console.log('Claims response:', response);
      return response.claims || [];
    } catch (error) {
      console.error('Failed to fetch employee claims:', error);
      return [];
    }
  }

    // Fetch employee policies
    async getEmployeePolicies() {
        try {
            const data = await this.fetchWithAuth('/policies/my-policies');
            if (data && data.success) {
                return data.policies || [];
            }
            return [];
        } catch (error) {
            console.error('Failed to fetch employee policies:', error);
            return [];
        }
    }  // Fetch employee's notifications
  async getEmployeeNotifications() {
    try {
      const response = await this.fetchWithAuth('/notifications?limit=20&status=unread');
      return response.notifications || [];
    } catch (error) {
      console.error('Failed to fetch employee notifications:', error);
      return [];
    }
  }

  // Fetch employee's conversations/messages
  async getEmployeeConversations() {
    try {
      const response = await this.fetchWithAuth('/messages/conversations');
      return response.conversations || [];
    } catch (error) {
      console.error('Failed to fetch employee conversations:', error);
      return [];
    }
  }

  // Get claim statistics for the employee
  async getClaimStatistics() {
    try {
      const response = await this.fetchWithAuth('/claims/stats/overview');
      return response.statistics || {};
    } catch (error) {
      console.error('Failed to fetch claim statistics:', error);
      return {};
    }
  }

  // Compile comprehensive employee context
  async getComprehensiveEmployeeContext() {
    try {
      console.log('Fetching comprehensive employee context for Lumi...');
      
      // Check authentication first
      if (!this.hasValidToken()) {
        this.refreshToken(); // Try to refresh the token
        if (!this.hasValidToken()) {
          console.error('No authentication token available. This should not happen on employee dashboard.');
          throw new Error('Authentication token not found. Please refresh the page.');
        }
      }
      
      const [
        profile,
        claims,
        policies,
        notifications,
        conversations,
        claimStats
      ] = await Promise.allSettled([
        this.getEmployeeProfile(),
        this.getEmployeeClaims(),
        this.getEmployeePolicies(),
        this.getEmployeeNotifications(),
        this.getEmployeeConversations(),
        this.getClaimStatistics()
      ]);

      const context = {
        timestamp: new Date().toISOString(),
        authenticated: true,
        employee: {
          profile: profile.status === 'fulfilled' ? profile.value : null,
          claims: {
            data: claims.status === 'fulfilled' ? claims.value : [],
            summary: this.summarizeClaims(claims.status === 'fulfilled' ? claims.value : [])
          },
          policies: {
            data: policies.status === 'fulfilled' ? policies.value : [],
            summary: this.summarizePolicies(policies.status === 'fulfilled' ? policies.value : [])
          },
          notifications: {
            data: notifications.status === 'fulfilled' ? notifications.value : [],
            summary: this.summarizeNotifications(notifications.status === 'fulfilled' ? notifications.value : [])
          },
          conversations: {
            data: conversations.status === 'fulfilled' ? conversations.value : [],
            summary: this.summarizeConversations(conversations.status === 'fulfilled' ? conversations.value : [])
          },
          statistics: claimStats.status === 'fulfilled' ? claimStats.value : {}
        }
      };

      return context;
    } catch (error) {
      console.error('Failed to compile employee context:', error);
      throw error;
    }
  }

  // Helper methods to summarize data for Lumi
  summarizeClaims(claims) {
    if (!claims || claims.length === 0) {
      return {
        total: 0,
        byStatus: {},
        byType: {},
        recent: []
      };
    }

    const byStatus = {};
    const byType = {};
    
    claims.forEach(claim => {
      byStatus[claim.claimStatus] = (byStatus[claim.claimStatus] || 0) + 1;
      byType[claim.claimType] = (byType[claim.claimType] || 0) + 1;
    });

    return {
      total: claims.length,
      byStatus,
      byType,
      recent: claims.slice(0, 5).map(claim => ({
        claimId: claim.claimId,
        type: claim.claimType,
        status: claim.claimStatus,
        option: claim.lifeClaimOption || claim.vehicleClaimOption || claim.claimOption,
        submittedDate: claim.createdAt,
        submittedAt: claim.submittedAt,
        amount: claim.claimAmount?.requested || claim.claimedAmount,
        approvedAmount: claim.claimAmount?.approved || claim.decision?.approvedAmount,
        description: claim.description,
        incidentDate: claim.incidentDate,
        lastUpdated: claim.updatedAt,
        documents: claim.documents?.length || 0,
        questionnaire: {
          isComplete: claim.questionnaire?.isComplete || false,
          completedAt: claim.questionnaire?.completedAt,
          sections: claim.questionnaire?.sections?.length || 0
        },
        hrNotes: claim.hrForwardingDetails?.hrNotes,
        insurerNotes: claim.decision?.insurerNotes,
        rejectionReason: claim.decision?.rejectionReason,
        returnReason: claim.returnReason,
        policy: claim.policy ? {
          id: claim.policy.policyId || claim.policy._id,
          type: claim.policy.policyType
        } : null
      }))
    };
  }

  summarizePolicies(policies) {
    if (!policies || policies.length === 0) {
      return {
        total: 0,
        byType: {},
        byStatus: {},
        active: []
      };
    }

    const byType = {};
    const byStatus = {};
    
    policies.forEach(policy => {
      byType[policy.policyType] = (byType[policy.policyType] || 0) + 1;
      byStatus[policy.status] = (byStatus[policy.status] || 0) + 1;
    });

    return {
      total: policies.length,
      byType,
      byStatus,
      active: policies.filter(p => p.status === 'active').map(policy => ({
        policyId: policy.policyId,
        type: policy.policyType,
        category: policy.policyCategory || 'group', // Default to group if not specified
        startDate: policy.validity?.startDate,
        endDate: policy.validity?.endDate,
        expiryDate: policy.validity?.endDate, // Alias for consistency
        premium: policy.premium?.amount || policy.premium,
        frequency: policy.premium?.frequency,
        coverageAmount: policy.coverage?.coverageAmount,
        deductible: policy.coverage?.deductible,
        coverageTypes: policy.coverage?.typeLife || policy.coverage?.typeVehicle || [],
        coverageDetails: policy.coverage?.coverageDetails || [],
        beneficiaries: policy.beneficiaries?.length || 0,
        claimedToDate: policy.claimedAmount || 0,
        insuranceAgent: policy.insuranceAgent ? {
          name: `${policy.insuranceAgent.firstName} ${policy.insuranceAgent.lastName}`,
          email: policy.insuranceAgent.email,
          phone: policy.insuranceAgent.phone
        } : null,
        documents: policy.documents?.length || 0,
        status: policy.status,
        description: policy.description
      }))
    };
  }

  summarizeNotifications(notifications) {
    if (!notifications || notifications.length === 0) {
      return {
        total: 0,
        unread: 0,
        byType: {},
        recent: []
      };
    }

    const byType = {};
    let unread = 0;
    
    notifications.forEach(notification => {
      byType[notification.type] = (byType[notification.type] || 0) + 1;
      if (notification.status === 'unread') unread++;
    });

    return {
      total: notifications.length,
      unread,
      byType,
      recent: notifications.slice(0, 3).map(notification => ({
        title: notification.title,
        type: notification.type,
        category: notification.category,
        createdAt: notification.createdAt
      }))
    };
  }

  summarizeConversations(conversations) {
    if (!conversations || conversations.length === 0) {
      return {
        total: 0,
        active: []
      };
    }

    return {
      total: conversations.length,
      active: conversations.slice(0, 3).map(conv => ({
        recipientName: conv.recipientName,
        recipientRole: conv.recipientRole,
        lastMessageDate: conv.lastMessageDate,
        unreadCount: conv.unreadCount
      }))
    };
  }

  // Generate context string for Lumi's system prompt
  generateContextString(contextData) {
    if (!contextData || !contextData.employee) {
      return "No employee context available.";
    }

    const { profile, claims, policies, notifications, conversations, statistics } = contextData.employee;
    
    let contextString = `Current Employee Context (${contextData.timestamp}):\n\n`;

    // Employee Profile
    if (profile) {
      contextString += `EMPLOYEE PROFILE:\n`;
      contextString += `- Name: ${profile.profile?.firstName} ${profile.profile?.lastName}\n`;
      contextString += `- Employee ID: ${profile.userId}\n`;
      contextString += `- Role: ${profile.role}\n`;
      contextString += `- Email: ${profile.email}\n`;
      
      if (profile.employment) {
        contextString += `- Department: ${profile.employment.department}\n`;
        contextString += `- Designation: ${profile.employment.designation}\n`;
        contextString += `- Employment Type: ${profile.employment.employmentType}\n`;
        contextString += `- Join Date: ${profile.employment.joinDate}\n`;
      }
      contextString += `\n`;
    }

    // Enhanced Claims Summary
    contextString += `CLAIMS SUMMARY:\n`;
    contextString += `- Total Claims: ${claims.summary.total}\n`;
    if (claims.summary.total > 0) {
      contextString += `- By Status: ${JSON.stringify(claims.summary.byStatus)}\n`;
      contextString += `- By Type: ${JSON.stringify(claims.summary.byType)}\n`;
      if (claims.summary.recent.length > 0) {
        contextString += `- Recent Claims (speak naturally, don't pronounce IDs):\n`;
        claims.summary.recent.forEach(claim => {
          const claimTypeMap = {
            'vehicle': 'auto insurance',
            'life': 'life insurance'
          };
          const friendlyType = claimTypeMap[claim.type] || claim.type;
          const claimNumber = this.extractClaimNumber(claim.claimId);
          
          contextString += `  * ${friendlyType} claim #${claimNumber}:\n`;
          
          // Claim option/category
          if (claim.option) {
            const optionMap = {
              // Life insurance options
              'hospitalization': 'hospitalization claim',
              'channelling': 'channeling/consultation claim', 
              'medication': 'medication/prescription claim',
              'death': 'death benefit claim',
              // Vehicle insurance options
              'accident': 'accident claim',
              'theft': 'theft claim',
              'fire': 'fire damage claim',
              'naturalDisaster': 'natural disaster claim'
            };
            const friendlyOption = optionMap[claim.option] || claim.option;
            contextString += `    - Type: ${friendlyOption}\n`;
          }
          
          // Status with detailed explanation
          const statusMap = {
            'draft': 'in draft status - questionnaire not yet completed',
            'employee': 'waiting for you to complete the questionnaire and submit',
            'hr': 'under HR review - being processed by human resources',
            'insurer': 'with insurance company for final review and decision',
            'approved': 'approved and processed for payment',
            'rejected': 'rejected'
          };
          const friendlyStatus = statusMap[claim.status] || claim.status;
          contextString += `    - Status: ${friendlyStatus}\n`;
          
          // Amount information
          if (claim.amount) {
            const amount = typeof claim.amount === 'object' ? JSON.stringify(claim.amount) : claim.amount;
            contextString += `    - Amount requested: $${amount}\n`;
          }
          
          if (claim.approvedAmount && claim.approvedAmount > 0) {
            contextString += `    - Amount approved: $${claim.approvedAmount}\n`;
          }
          
          // Policy information
          if (claim.policy) {
            contextString += `    - Related policy: ${friendlyType} policy ${claim.policy.id || claim.policy.type}\n`;
          }
          
          // Questionnaire status
          if (claim.questionnaire) {
            if (claim.questionnaire.isComplete) {
              contextString += `    - Questionnaire: completed`;
              if (claim.questionnaire.completedAt) {
                const completedDate = new Date(claim.questionnaire.completedAt);
                contextString += ` on ${completedDate.toLocaleDateString()}`;
              }
              contextString += `\n`;
            } else {
              contextString += `    - Questionnaire: ${claim.questionnaire.sections || 0} sections, not yet completed\n`;
            }
          }
          
          // Important dates
          if (claim.submittedAt) {
            const submittedDate = new Date(claim.submittedAt);
            contextString += `    - Submitted: ${submittedDate.toLocaleDateString()}\n`;
          } else if (claim.submittedDate) {
            const date = new Date(claim.submittedDate);
            contextString += `    - Created: ${date.toLocaleDateString()}\n`;
          }
          
          if (claim.incidentDate) {
            const incidentDate = new Date(claim.incidentDate);
            contextString += `    - Incident date: ${incidentDate.toLocaleDateString()}\n`;
          }
          
          // Description
          if (claim.description) {
            contextString += `    - Description: "${claim.description}"\n`;
          }
          
          // Documents
          if (claim.documents > 0) {
            contextString += `    - Supporting documents: ${claim.documents} files uploaded\n`;
          }
          
          // HR notes
          if (claim.hrNotes) {
            contextString += `    - HR notes: "${claim.hrNotes}"\n`;
          }
          
          // Insurer notes
          if (claim.insurerNotes) {
            contextString += `    - Insurance company notes: "${claim.insurerNotes}"\n`;
          }
          
          // Rejection reason
          if (claim.rejectionReason) {
            contextString += `    - Rejection reason: "${claim.rejectionReason}"\n`;
          }
          
          // Return reason
          if (claim.returnReason) {
            contextString += `    - Returned for: "${claim.returnReason}"\n`;
          }
          
          // Last update
          if (claim.lastUpdated && claim.lastUpdated !== claim.submittedDate) {
            const updated = new Date(claim.lastUpdated);
            contextString += `    - Last updated: ${updated.toLocaleDateString()}\n`;
          }
          
          contextString += `\n`;
        });
      }
    }
    contextString += `\n`;

    // Enhanced Policies Summary  
    contextString += `POLICIES SUMMARY:\n`;
    contextString += `- Total Policies: ${policies.summary.total}\n`;
    if (policies.summary.total > 0) {
      contextString += `- By Type: ${JSON.stringify(policies.summary.byType)}\n`;
      contextString += `- By Status: ${JSON.stringify(policies.summary.byStatus)}\n`;
      if (policies.summary.active.length > 0) {
        contextString += `- Active Policies (speak naturally, don't pronounce IDs):\n`;
        policies.summary.active.forEach(policy => {
          const policyTypeMap = {
            'vehicle': 'auto insurance',
            'life': 'life insurance'
          };
          const friendlyType = policyTypeMap[policy.type] || policy.type;
          const policyNumber = this.extractPolicyNumber(policy.policyId);
          const categoryMap = {
            'group': 'group policy',
            'individual': 'individual policy'
          };
          const friendlyCategory = categoryMap[policy.category] || policy.category;
          
          contextString += `  * ${friendlyType} ${friendlyCategory} #${policyNumber}:\n`;
          
          // Coverage amount
          if (policy.coverageAmount) {
            contextString += `    - Coverage: $${typeof policy.coverageAmount === 'object' ? JSON.stringify(policy.coverageAmount) : policy.coverageAmount.toLocaleString()}\n`;
          }
          
          // Premium information
          if (policy.premium) {
            const premiumAmount = typeof policy.premium === 'object' ? JSON.stringify(policy.premium) : policy.premium;
            contextString += `    - Premium: $${premiumAmount}`;
            if (policy.frequency) {
              contextString += ` ${policy.frequency}`;
            }
            contextString += `\n`;
          }
          
          // Deductible
          if (policy.deductible) {
            contextString += `    - Deductible: $${typeof policy.deductible === 'object' ? JSON.stringify(policy.deductible) : policy.deductible.toLocaleString()}\n`;
          }
          
          // Validity dates
          if (policy.startDate) {
            const startDate = new Date(policy.startDate);
            contextString += `    - Started: ${startDate.toLocaleDateString()}\n`;
          }
          if (policy.expiryDate || policy.endDate) {
            const date = new Date(policy.expiryDate || policy.endDate);
            contextString += `    - Expires: ${date.toLocaleDateString()}\n`;
          }
          
          // Coverage types
          if (policy.coverageTypes && policy.coverageTypes.length > 0) {
            const typeMap = {
              'life_cover': 'life coverage',
              'hospitalization': 'hospitalization',
              'surgical_benefits': 'surgical benefits',
              'outpatient': 'outpatient care',
              'prescription_drugs': 'prescription drugs',
              'collision': 'collision coverage',
              'liability': 'liability coverage',
              'comprehensive': 'comprehensive coverage',
              'personal_accident': 'personal accident coverage'
            };
            const friendlyTypes = policy.coverageTypes.map(type => typeMap[type] || type);
            contextString += `    - Coverage includes: ${friendlyTypes.join(', ')}\n`;
          }
          
          // Coverage details
          if (policy.coverageDetails && policy.coverageDetails.length > 0) {
            contextString += `    - Coverage breakdown:\n`;
            policy.coverageDetails.forEach(detail => {
              contextString += `      • ${detail.description}: $${detail.limit?.toLocaleString() || 'N/A'}\n`;
            });
          }
          
          // Beneficiaries
          if (policy.beneficiaries > 0) {
            contextString += `    - Beneficiaries: ${policy.beneficiaries}\n`;
          }
          
          // Claimed amount
          if (policy.claimedToDate > 0) {
            contextString += `    - Amount claimed to date: $${policy.claimedToDate.toLocaleString()}\n`;
          }
          
          // Insurance agent
          if (policy.insuranceAgent) {
            contextString += `    - Insurance agent: ${policy.insuranceAgent.name}`;
            if (policy.insuranceAgent.phone) {
              contextString += ` (${policy.insuranceAgent.phone})`;
            }
            contextString += `\n`;
          }
          
          // Documents
          if (policy.documents > 0) {
            contextString += `    - Documents: ${policy.documents} files on record\n`;
          }
          
          // Description
          if (policy.description) {
            contextString += `    - Description: ${policy.description}\n`;
          }
          
          contextString += `\n`;
        });
      }
    }
    contextString += `\n`;

    // Notifications Summary
    contextString += `NOTIFICATIONS SUMMARY:\n`;
    contextString += `- Total Notifications: ${notifications.summary.total}\n`;
    contextString += `- Unread: ${notifications.summary.unread}\n`;
    if (notifications.summary.total > 0) {
      contextString += `- By Type: ${JSON.stringify(notifications.summary.byType)}\n`;
      if (notifications.summary.recent.length > 0) {
        contextString += `- Recent Notifications:\n`;
        notifications.summary.recent.forEach(notif => {
          contextString += `  * ${notif.title} (${notif.type})\n`;
        });
      }
    }
    contextString += `\n`;

    // Conversations Summary
    contextString += `RECENT CONVERSATIONS:\n`;
    if (conversations.summary.total > 0) {
      conversations.summary.active.forEach(conv => {
        contextString += `- ${conv.recipientName} (${conv.recipientRole})`;
        if (conv.unreadCount > 0) {
          contextString += ` - ${conv.unreadCount} unread messages`;
        }
        contextString += `\n`;
      });
    } else {
      contextString += `- No recent conversations\n`;
    }

    contextString += `\n\nIMPORTANT INSTRUCTIONS FOR LUMI:\n`;
    contextString += `- Never pronounce technical IDs like "VC000005" or "LG0001"\n`;
    contextString += `- Instead refer to claims and policies naturally: "your auto insurance claim number 5" or "your group life insurance policy"\n`;
    contextString += `- Use friendly language: "vehicle claim" becomes "auto insurance claim", "life claim" becomes "life insurance claim"\n`;
    contextString += `- When referencing claims, mention the type, status, and any relevant details like amounts or dates\n`;
    contextString += `- For policies, mention the type, coverage details, premium information, and important dates\n`;
    contextString += `- Use the detailed context to provide specific, helpful information about claim statuses, coverage breakdowns, and next steps\n`;
    contextString += `- If claims are "under HR review" or "with insurance company", explain what that means and typical timeframes\n`;
    contextString += `- For questionnaire completion, guide users on what they need to do\n`;
    contextString += `- Reference specific coverage types, amounts, and policy details when relevant\n`;
    contextString += `- Provide personalized, relevant assistance based on this employee's specific claims and policies\n`;

    return contextString;
  }

  // Helper method to extract readable numbers from IDs
  extractClaimNumber(claimId) {
    if (claimId && claimId.match(/[A-Z]+(\d+)/)) {
      return claimId.match(/[A-Z]+(\d+)/)[1];
    }
    return claimId;
  }

  // Helper method to extract readable numbers from policy IDs
  extractPolicyNumber(policyId) {
    if (policyId && policyId.match(/[A-Z]+(\d+)/)) {
      return policyId.match(/[A-Z]+(\d+)/)[1];
    }
    return policyId;
  }
}

export default EmployeeContextService;