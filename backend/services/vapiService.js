// backend/services/vapiService.js
import { VapiClient } from '@vapi-ai/server-sdk';
import { validateUserRole } from '../utils/validation.js';

class VapiService {
  constructor() {
    if (!process.env.VAPI_PRIVATE_API_KEY) {
      throw new Error('VAPI_PRIVATE_API_KEY is required in environment variables');
    }
    
    this.vapi = new VapiClient({
      token: process.env.VAPI_PRIVATE_API_KEY
    });
  }

  // Create assistant (following official VAPI standards)
  async createAssistant(userRole, userId) {
    // Validate user role
    if (!validateUserRole(userRole)) {
      throw new Error(`Invalid user role: ${userRole}`);
    }
    
    try {
      // Create intelligent assistant with role-specific capabilities
      const assistant = await this.vapi.assistants.create({
        name: `Lumiere ${userRole} Assistant`,
        model: {
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          messages: this.getSystemMessagesByRole(userRole),
          functions: this.getFunctionsByRole(userRole),
          temperature: 0.7
        },
        voice: {
          provider: 'playht',
          voiceId: 'jennifer'
        },
        firstMessage: this.getWelcomeMessage(userRole)
        // Note: For local development, webhooks need HTTPS URLs
        // We'll handle function calls differently for localhost
      });
      
      return assistant;
    } catch (error) {
      console.error('VAPI Assistant Creation Error:', error);
      throw new Error(`Failed to create assistant: ${error.message}`);
    }
  }

  // Create call with assistant (following official standards)
  async createCall(assistantId, customerData = {}) {
    if (!assistantId) {
      throw new Error('Assistant ID is required');
    }
    
    try {
      // For web-based calls, we don't need phoneNumberId
      const call = await this.vapi.calls.create({
        assistantId: assistantId,
        metadata: {
          userId: customerData.userId,
          userRole: customerData.userRole,
          sessionType: 'web',
          timestamp: new Date().toISOString()
        }
      });
      
      return call;
    } catch (error) {
      throw new Error(`Failed to create call: ${error.message}`);
    }
  }

  // Alternative: Create call with inline assistant (as shown in docs)
  async createCallWithInlineAssistant(userRole, customerData = {}) {
    if (!validateUserRole(userRole)) {
      throw new Error(`Invalid user role: ${userRole}`);
    }
    
    try {
      // For web applications, we might need to create calls differently
      // Let's try without the assistant parameter first to see if it's supported
      const call = await this.vapi.calls.create({
        type: 'webCall', // Specify this is a web call
        assistant: {
          model: {
            provider: 'openai',
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are a helpful insurance assistant for Lumiere Insurance. The user is a ${userRole}.`
              }
            ]
          },
          voice: {
            provider: 'playht',
            voiceId: 'jennifer'
          }
        }
      });
      
      return call;
    } catch (error) {
      console.error('VAPI Call Creation Error:', error);
      
      // Try alternative approach - maybe inline assistant calls aren't supported
      try {
        console.log('Trying alternative call creation method...');
        
        // First create an assistant, then create a call with that assistant
        const assistant = await this.createAssistant(userRole, customerData.userId || 'test');
        
        const call = await this.vapi.calls.create({
          assistantId: assistant.id
        });
        
        return call;
      } catch (altError) {
        console.error('Alternative call creation also failed:', altError);
        throw new Error(`Failed to create call: ${error.message}. Alternative method also failed: ${altError.message}`);
      }
    }
  }

  // Get system messages based on user role
  getSystemMessagesByRole(userRole) {
        const baseSystem = `You are an intelligent voice assistant for Lumiere Insurance. You help users manage their insurance needs efficiently and professionally.
    
    CRITICAL: You have access to functions that can retrieve real data from the system. When users ask for information, you MUST call the appropriate function to get actual data instead of giving generic responses.
    
    Keep responses concise, professional, and helpful. Always verify user identity before providing sensitive information.`;

    const roleSpecific = {
      employee: `You are assisting an employee. You can help with:
        - Viewing personal policies and coverage details
        - Creating and submitting insurance claims
        - Checking claim status and history
        - Updating personal profile information
        - Understanding policy benefits and coverage
        - Messaging with HR officers
        You cannot access other employees' information or perform administrative tasks.`,
      
      hr_officer: `You are assisting an HR Officer. You can help with:
        - Managing employee registrations and profiles
        - Reviewing and processing insurance claims
        - Generating reports on users, policies, and claims
        - Managing policy assignments
        - Communicating with employees and insurance agents
        - Overseeing document verification processes`,
      
      insurance_agent: `You are assisting an Insurance Agent. You can help with:
        - Reviewing submitted insurance claims
        - Making claim approval/rejection decisions
        - Managing assigned policies
        - Communicating with HR officers and employees
        - Generating claim and policy reports
        - Providing technical insurance guidance`,
      
      admin: `You are assisting a System Administrator. You have access to powerful functions to help with:
        - Full system oversight and management
        - Creating and managing insurance policies  
        - User management and role assignments
        - System configuration and settings
        - Comprehensive reporting and analytics
        - All administrative functions across the platform
        
        IMPORTANT: When the user asks questions that require data, you MUST call the appropriate function instead of giving generic responses. For example:
        - If they ask "What is my profile?" → call get_user_profile
        - If they ask "How many users are there?" → call get_user_counts  
        - If they ask about policies → call get_policies
        - If they ask for reports → call get_system_reports
        
        Always use functions to get real data rather than giving placeholder responses.`
    };

    return [
      {
        role: 'system',
        content: `${baseSystem}\n\n${roleSpecific[userRole] || roleSpecific.employee}`
      }
    ];
  }

  // Get available functions based on user role
  getFunctionsByRole(userRole) {
    const commonFunctions = [
      {
        name: 'test_function',
        description: 'A simple test function that returns a success message. Use this when the user says "test" or wants to test function calling.',
        parameters: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'get_user_profile', 
        description: 'Retrieves the current user\'s profile information including name, email, role, and account details. Use this when the user asks "what is my profile", "who am I", "my profile", "my account", or "my information".',
        parameters: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'get_policies',
        description: 'Retrieves insurance policies for the user. Use this when the user asks about "policies", "my policies", "insurance policies", "coverage", or "policy information".',
        parameters: {
          type: 'object',
          properties: {
            status: { 
              type: 'string', 
              enum: ['active', 'inactive', 'expired'],
              description: 'Filter policies by status'
            },
            type: { 
              type: 'string', 
              enum: ['life', 'vehicle'],
              description: 'Filter policies by type'
            }
          },
          required: []
        }
      }
    ];

    const roleFunctions = {
      employee: [
        {
          name: 'create_claim',
          description: 'Create a new insurance claim',
          parameters: {
            type: 'object',
            properties: {
              policyId: { type: 'string' },
              claimType: { type: 'string', enum: ['life', 'vehicle'] },
              description: { type: 'string' }
            },
            required: ['policyId', 'claimType']
          }
        },
        {
          name: 'get_claim_status',
          description: 'Get status of user claims',
          parameters: {
            type: 'object',
            properties: {
              claimId: { type: 'string' }
            }
          }
        }
      ],
      hr_officer: [
        {
          name: 'get_pending_claims',
          description: 'Get claims pending HR review',
          parameters: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'generate_report',
          description: 'Generate system reports',
          parameters: {
            type: 'object',
            properties: {
              reportType: { type: 'string', enum: ['users', 'claims', 'policies'] },
              format: { type: 'string', enum: ['pdf', 'excel', 'csv'] }
            },
            required: ['reportType']
          }
        }
      ],
      insurance_agent: [
        {
          name: 'get_assigned_claims',
          description: 'Get claims assigned for review',
          parameters: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'update_claim_decision',
          description: 'Make decision on a claim',
          parameters: {
            type: 'object',
            properties: {
              claimId: { type: 'string' },
              decision: { type: 'string', enum: ['approved', 'rejected'] },
              amount: { type: 'number' },
              comments: { type: 'string' }
            },
            required: ['claimId', 'decision']
          }
        }
      ],
      admin: [
        {
          name: 'create_policy',
          description: 'Create new insurance policy. Call this when the user wants to create or add a new policy.',
          parameters: {
            type: 'object',
            properties: {
              policyType: { type: 'string', enum: ['life', 'vehicle'] },
              coverageAmount: { type: 'number' },
              premium: { type: 'number' }
            },
            required: ['policyType', 'coverageAmount', 'premium']
          }
        },
        {
          name: 'get_user_counts',
          description: 'Get count of users in the system by role. Call this when the user asks "how many users", "user count", "user statistics", or "how many people are in the system".',
          parameters: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'manage_users',
          description: 'Manage user accounts and operations. Call this when the user wants to manage, create, update, or get information about users.',
          parameters: {
            type: 'object',
            properties: {
              action: { type: 'string', enum: ['create', 'update', 'suspend', 'activate', 'count'] },
              userId: { type: 'string' }
            },
            required: ['action']
          }
        },
        {
          name: 'get_system_reports',
          description: 'Generate system reports and analytics. Call this when the user asks for reports, analytics, or system overview.',
          parameters: {
            type: 'object',
            properties: {}
          }
        }
      ]
    };

    return [...commonFunctions, ...(roleFunctions[userRole] || [])];
  }

  // Get welcome message based on role
  getWelcomeMessage(userRole) {
    const messages = {
      employee: "Hello! I'm your Lumiere Insurance voice assistant. I can help you with your policies, claims, and account information. How can I assist you today?",
      hr_officer: "Hello! I'm here to help you manage employee insurance matters, review claims, and generate reports. What would you like to work on?",
      insurance_agent: "Hello! I'm your assistant for reviewing claims, managing policies, and making insurance decisions. How can I help you today?",
      admin: "Hello! I'm here to help you with system administration, policy management, and comprehensive oversight. What would you like to do?"
    };
    
    return messages[userRole] || messages.employee;
  }

  // Handle function calls from the assistant - now uses proxy service
  async handleFunctionCall(functionName, parameters, userId, userRole, userToken) {
    // Import the proxy service
    const vapiProxyService = await import('./vapiProxyService.js');
    
    console.log(`VAPI Function called: ${functionName}`, parameters);
    
    try {
      // Map function calls to natural language requests for the proxy service
      let userMessage = '';
      
      switch (functionName) {
        case 'test_function':
          return {
            success: true,
            message: '🎉 Function calling is working! This proves that VAPI can successfully call backend functions.'
          };
          
        case 'get_user_profile':
          userMessage = 'show my profile information';
          break;
        
        case 'get_policies':
          userMessage = 'show my policies';
          break;
        
        case 'get_claims':
        case 'get_claim_status':
          userMessage = 'show my claims and their status';
          break;
        
        case 'create_claim':
          const { policyId, claimType, description } = parameters;
          userMessage = `create a new ${claimType} claim for policy ${policyId} with description: ${description || 'claim request'}`;
          break;
        
        case 'get_user_counts':
          userMessage = 'how many users are there by role';
          break;
        
        case 'get_pending_claims':
          userMessage = 'show pending claims that need review';
          break;
        
        case 'get_assigned_claims':
          userMessage = 'show claims assigned to me';
          break;
        
        case 'generate_report':
          const { reportType, format } = parameters;
          userMessage = `generate a ${reportType} report in ${format || 'pdf'} format`;
          break;
        
        case 'update_claim_decision':
          const { claimId, decision, amount, comments } = parameters;
          userMessage = `update claim ${claimId} with decision ${decision}, amount ${amount || 'TBD'}, comments: ${comments || 'none'}`;
          break;
        
        case 'create_policy':
          const { policyType, coverageAmount, premium } = parameters;
          userMessage = `create a new ${policyType} policy with coverage ${coverageAmount} and premium ${premium}`;
          break;
        
        case 'manage_users':
          if (parameters.action === 'count') {
            userMessage = 'how many users are there by role';
          } else {
            userMessage = `perform user management action: ${parameters.action}`;
          }
          break;
        
        default:
          userMessage = `execute ${functionName} function with parameters: ${JSON.stringify(parameters)}`;
          break;
      }
      
      // Generate a temporary token if one isn't provided
      let tokenToUse = userToken;
      if (!tokenToUse) {
        const jwt = await import('jsonwebtoken');
        tokenToUse = jwt.default.sign(
          { userId, role: userRole },
          process.env.JWT_SECRET || 'temp_secret',
          { expiresIn: '1h' }
        );
      }
      
      // Use the proxy service to process the request
      const result = await vapiProxyService.default.processNaturalLanguageRequest(
        userMessage,
        tokenToUse,
        userRole
      );
      
      return {
        success: result.success,
        message: result.message,
        data: result.data || null
      };
      
    } catch (error) {
      console.error('Function call error:', error);
      return { 
        success: false, 
        message: `Error executing ${functionName}: ${error.message}` 
      };
    }
  }
}

export default new VapiService();