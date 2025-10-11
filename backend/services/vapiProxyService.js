// backend/services/vapiProxyService.js
// Universal proxy service that allows VAPI to access any backend route the user is authorized for

import jwt from 'jsonwebtoken';

class VapiProxyService {
  constructor() {
    // User API service instances to handle different types of requests
    this.apiHandlers = new Map();
  }

  /**
   * Execute any API call that the user is authorized to make
   * This uses express-style internal routing rather than HTTP fetch
   * @param {string} userToken - JWT token for authentication
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
   * @param {string} endpoint - API endpoint path (e.g., '/users/profile', '/policies')
   * @param {Object} body - Request body for POST/PUT requests
   * @param {Object} query - Query parameters
   * @returns {Promise<Object>} API response
   */
  async executeApiCall(userToken, method, endpoint, body = null, query = {}) {
    try {
      // Verify and decode the JWT token
      const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
      const { userId, role } = decoded;

      // For internal API calls, we'll use the existing controllers directly
      // This is more efficient than making HTTP requests to ourselves
      
      // Route the request to appropriate controllers based on endpoint
      const routePath = endpoint.toLowerCase();
      
      if (routePath.startsWith('/users')) {
        return await this.handleUserRoute(method, routePath, body, query, userId, role);
      } else if (routePath.startsWith('/policies')) {
        return await this.handlePolicyRoute(method, routePath, body, query, userId, role);
      } else if (routePath.startsWith('/claims')) {
        return await this.handleClaimRoute(method, routePath, body, query, userId, role);
      } else if (routePath.startsWith('/reports')) {
        return await this.handleReportRoute(method, routePath, body, query, userId, role);
      } else {
        throw new Error(`Unsupported endpoint: ${endpoint}`);
      }

    } catch (error) {
      console.error('VapiProxyService error:', error);
      
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid authentication token');
      }
      
      if (error.name === 'TokenExpiredError') {
        throw new Error('Authentication token has expired');
      }

      throw new Error(error.message || 'API call failed');
    }
  }

  /**
   * Handle user-related routes
   */
  async handleUserRoute(method, path, body, query, userId, role) {
    const User = await import('../models/User.js');
    
    switch (method.toUpperCase()) {
      case 'GET':
        if (path === '/users/profile') {
          const user = await User.default.findById(userId).select('-password');
          return { success: true, data: user };
        } else if (path === '/users' && ['admin', 'hr_officer'].includes(role)) {
          const users = await User.default.find({}).select('-password').limit(50);
          return { success: true, data: users };
        }
        break;
        
      case 'PUT':
        if (path === '/users/profile') {
          const updatedUser = await User.default.findByIdAndUpdate(userId, body, { new: true }).select('-password');
          return { success: true, data: updatedUser };
        }
        break;
    }
    
    throw new Error('Unauthorized or unsupported user operation');
  }

  /**
   * Handle policy-related routes
   */
  async handlePolicyRoute(method, path, body, query, userId, role) {
    const Policy = await import('../models/Policy.js');
    
    switch (method.toUpperCase()) {
      case 'GET':
        let policyQuery = {};
        if (role === 'employee') {
          policyQuery.beneficiaries = userId;
        }
        const policies = await Policy.default.find(policyQuery).populate('beneficiaries').limit(50);
        return { success: true, data: policies };
        
      case 'POST':
        if (['admin'].includes(role)) {
          const newPolicy = await Policy.default.create(body);
          return { success: true, data: newPolicy };
        }
        throw new Error('Insufficient permissions to create policies');
    }
    
    throw new Error('Unsupported policy operation');
  }

  /**
   * Handle claim-related routes
   */
  async handleClaimRoute(method, path, body, query, userId, role) {
    const Claim = await import('../models/Claim.js');
    
    switch (method.toUpperCase()) {
      case 'GET':
        let claimQuery = {};
        if (role === 'employee') {
          claimQuery.employeeId = userId;
        } else if (role === 'insurance_agent') {
          claimQuery.$or = [
            { assignedAgent: userId },
            { assignedAgent: { $exists: false } },
            { assignedAgent: null }
          ];
        }
        const claims = await Claim.default.find(claimQuery).populate('policy').limit(50);
        return { success: true, data: claims };
        
      case 'POST':
        const newClaim = await Claim.default.create({
          ...body,
          employeeId: userId,
          claimStatus: 'draft'
        });
        return { success: true, data: newClaim };
        
      case 'PUT':
        if (['insurance_agent', 'admin'].includes(role)) {
          const claimId = path.split('/').pop();
          const updatedClaim = await Claim.default.findByIdAndUpdate(claimId, body, { new: true });
          return { success: true, data: updatedClaim };
        }
        throw new Error('Insufficient permissions to update claims');
    }
    
    throw new Error('Unsupported claim operation');
  }

  /**
   * Handle report-related routes
   */
  async handleReportRoute(method, path, body, query, userId, role) {
    if (!['admin', 'hr_officer'].includes(role)) {
      throw new Error('Insufficient permissions to access reports');
    }
    
    // Mock report generation for now
    return {
      success: true,
      data: {
        reportType: body?.reportType || 'general',
        format: body?.format || 'pdf',
        generatedAt: new Date().toISOString(),
        generatedBy: userId
      }
    };
  }

  /**
   * Handle direct database operations through existing models
   * @param {string} userToken - JWT token for authentication
   * @param {string} operation - Operation type (find, create, update, delete, count)
   * @param {string} model - Model name (User, Policy, Claim, etc.)
   * @param {Object} params - Operation parameters
   * @returns {Promise<Object>} Operation result
   */
  async executeDbOperation(userToken, operation, model, params = {}) {
    try {
      // Verify and decode the JWT token
      console.log('🔴 DEBUGGING JWT DECODE 🔴');
      console.log(' userToken (first 30 chars):', userToken ? userToken.substring(0, 30) + '...' : 'NO TOKEN');
      
      const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
      console.log(' decoded JWT payload:', decoded);
      
      let { userId, role } = decoded;
      
      // CRITICAL FIX: Check if userId is itself a JWT token (double encoding issue)
      if (typeof userId === 'string' && userId.includes('.') && userId.startsWith('eyJ')) {
        console.log('🔴 DETECTED NESTED JWT TOKEN! 🔴');
        console.log(' Nested JWT:', userId.substring(0, 50) + '...');
        
        try {
          const nestedDecoded = jwt.verify(userId, process.env.JWT_SECRET);
          console.log(' Nested decoded payload:', nestedDecoded);
          userId = nestedDecoded.userId || nestedDecoded.id || nestedDecoded.sub;
          console.log(' Extracted actual userId from nested JWT:', userId);
        } catch (nestedError) {
          console.log(' Failed to decode nested JWT:', nestedError.message);
        }
      }
      
      console.log(' final extracted userId:', userId);
      console.log(' extracted role:', role);

      // Import the required model dynamically
      const modelModule = await import(`../models/${model}.js`);
      const Model = modelModule.default;

      let result;
      let query = params.query || {};
      console.log(' original query:', query);

      // Apply role-based access control
      query = this.applyRoleBasedAccess(query, model, userId, role);
      console.log(' modified query after role access:', query);

      // Apply role-based access control
      query = this.applyRoleBasedAccess(query, model, userId, role);
      console.log(' modified query after role access:', query);

      switch (operation.toLowerCase()) {
        case 'find':
          result = await Model.find(query)
            .limit(params.limit || 50)
            .skip(params.skip || 0)
            .populate(params.populate || '')
            .select(params.select || '');
          break;

        case 'findone':
          result = await Model.findOne(query)
            .populate(params.populate || '')
            .select(params.select || '');
          break;

        case 'count':
          result = await Model.countDocuments(query);
          break;

        case 'create':
          // Ensure user can only create records for themselves (unless admin/hr)
          if (!['admin', 'hr_officer'].includes(role) && params.data) {
            params.data.createdBy = userId;
            if (model === 'Claim') params.data.claimantId = userId;
            if (model === 'User') throw new Error('Insufficient permissions to create users');
          }
          result = await Model.create(params.data);
          break;

        case 'update':
          result = await Model.findOneAndUpdate(query, params.data, { new: true, runValidators: true });
          break;

        case 'delete':
          if (!['admin'].includes(role)) {
            throw new Error('Insufficient permissions for delete operations');
          }
          result = await Model.findOneAndDelete(query);
          break;

        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      return {
        success: true,
        data: result,
        count: Array.isArray(result) ? result.length : (result ? 1 : 0)
      };

    } catch (error) {
      console.error('VapiProxyService DB operation error:', error);
      throw error;
    }
  }

  /**
   * Apply role-based access control to database queries
   * @param {Object} query - Original query
   * @param {string} model - Model name
   * @param {string} userId - Current user ID
   * @param {string} role - User role
   * @returns {Object} Modified query with access controls
   */
  applyRoleBasedAccess(query, model, userId, role) {
    const modifiedQuery = { ...query };

    switch (model) {
      case 'User':
        if (role === 'employee') {
          // Employees can only see their own data
          modifiedQuery._id = userId;
        }
        // HR officers and agents can see all users
        // Admins can see all users
        break;

      case 'Policy':
        if (role === 'employee') {
          // Employees can only see policies where they are beneficiaries
          modifiedQuery.beneficiaries = userId;
        }
        // Other roles can see all policies
        break;

      case 'Claim':
        if (role === 'employee') {
          // Employees can only see their own claims
          modifiedQuery.employeeId = userId;
        } else if (role === 'insurance_agent') {
          // Agents can see claims assigned to them or pending assignment
          modifiedQuery.$or = [
            { assignedAgent: userId },
            { assignedAgent: { $exists: false } },
            { assignedAgent: null }
          ];
        }
        // HR officers and admins can see all claims
        break;

      case 'Document':
        if (role === 'employee') {
          // Employees can only see their own documents
          modifiedQuery.uploadedBy = userId;
        }
        // Other roles can see relevant documents based on their assigned cases
        break;

      default:
        // For other models, apply general restrictions
        if (role === 'employee' && modifiedQuery.createdBy === undefined) {
          modifiedQuery.createdBy = userId;
        }
        break;
    }

    return modifiedQuery;
  }

  /**
   * Process natural language requests and map them to API calls
   * @param {string} userMessage - User's natural language request
   * @param {string} userToken - JWT token for authentication
   * @param {string} userRole - User's role
   * @returns {Promise<Object>} Response with appropriate message and data
   */
  async processNaturalLanguageRequest(userMessage, userToken, userRole) {
    try {
      const message = userMessage.toLowerCase();
      
      // Text formalization requests
      if (message.includes('please rewrite') || message.includes('formalize') || message.includes('professional business language')) {
        // Extract the text to be formalized - it should be in quotes
        const textMatch = userMessage.match(/[""]([^"""]+)[""]/) || userMessage.match(/"([^"]+)"/);
        
        if (textMatch) {
          const textToFormalize = textMatch[1];
          const formalizedText = await this.formalizeTextWithAI(textToFormalize);
          
          return {
            success: true,
            result: formalizedText,
            response: formalizedText,
            content: formalizedText
          };
        } else {
          return {
            success: false,
            message: "I couldn't find the text to formalize. Please put the text in quotes."
          };
        }
      }
      
      // Count queries
      if (message.includes('how many') || message.includes('count')) {
        if (message.includes('hr officer') || message.includes('hr officers')) {
          const result = await this.executeDbOperation(userToken, 'count', 'User', {
            query: { role: 'hr_officer' }
          });
          const totalResult = await this.executeDbOperation(userToken, 'count', 'User', {});
          return {
            success: true,
            message: `There are ${result.data} HR officers in the system out of ${totalResult.data} total users.`
          };
        }

        if (message.includes('user') || message.includes('users')) {
          const results = await Promise.all([
            this.executeDbOperation(userToken, 'count', 'User', { query: { role: 'hr_officer' } }),
            this.executeDbOperation(userToken, 'count', 'User', { query: { role: 'insurance_agent' } }),
            this.executeDbOperation(userToken, 'count', 'User', { query: { role: 'employee' } }),
            this.executeDbOperation(userToken, 'count', 'User', { query: { role: 'admin' } })
          ]);
          
          const [hrCount, agentCount, empCount, adminCount] = results.map(r => r.data);
          const total = hrCount + agentCount + empCount + adminCount;
          
          return {
            success: true,
            message: `Here's the user breakdown: ${hrCount} HR Officers, ${agentCount} Insurance Agents, ${empCount} Employees, and ${adminCount} Administrators. Total: ${total} users.`
          };
        }

        if (message.includes('polic') || message.includes('policies')) {
          const result = await this.executeDbOperation(userToken, 'count', 'Policy', {});
          return {
            success: true,
            message: `There are ${result.data} policies in the system.`
          };
        }

        if (message.includes('claim') || message.includes('claims')) {
          const result = await this.executeDbOperation(userToken, 'count', 'Claim', {});
          return {
            success: true,
            message: `There are ${result.data} claims in the system.`
          };
        }
      }

      // Profile queries
      if (message.includes('profile') || message.includes('my info')) {
        const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
        
        // Handle nested JWT tokens
        let userId = decoded.userId;
        if (typeof userId === 'string' && userId.includes('.') && userId.startsWith('eyJ')) {
          console.log('🔴 PROFILE QUERY: DETECTED NESTED JWT TOKEN! 🔴');
          try {
            const nestedDecoded = jwt.verify(userId, process.env.JWT_SECRET);
            userId = nestedDecoded.userId || nestedDecoded.id || nestedDecoded.sub;
            console.log(' PROFILE: Extracted actual userId from nested JWT:', userId);
          } catch (nestedError) {
            console.log(' PROFILE: Failed to decode nested JWT:', nestedError.message);
          }
        }
        
        const result = await this.executeDbOperation(userToken, 'findone', 'User', {
          query: { _id: userId },
          select: '-password'
        });
        
        if (result.data) {
          const user = result.data;
          return {
            success: true,
            message: `Here's your profile: Name: ${user.profile?.firstName || 'Not set'} ${user.profile?.lastName || ''}, Email: ${user.email}, Role: ${user.role}, Member since: ${new Date(user.createdAt).toLocaleDateString()}.`
          };
        }
      }

      // Policy queries
      if (message.includes('my polic') || message.includes('policies') || message.includes('policy list')) {
        const result = await this.executeDbOperation(userToken, 'find', 'Policy', {
          populate: 'beneficiaries',
          limit: 10
        });
        
        if (result.data && result.data.length > 0) {
          const policyList = result.data.map(p => 
            `${p.policyId || 'Policy'} (${p.policyType}) - Coverage: $${p.coverage?.coverageAmount || 'TBD'}, Premium: $${p.premium?.amount || 'TBD'}`
          ).join('; ');
          return {
            success: true,
            message: `I found ${result.data.length} policies: ${policyList}.`
          };
        } else {
          return {
            success: true,
            message: "No policies found for your account."
          };
        }
      }

      // Claim queries
      if (message.includes('my claim') || message.includes('claims') || message.includes('claim status')) {
        const result = await this.executeDbOperation(userToken, 'find', 'Claim', {
          populate: 'policy',
          limit: 10
        });
        
        if (result.data && result.data.length > 0) {
          const claimList = result.data.map(c => 
            `Claim ${c.claimId || c._id.toString().slice(-6)} (${c.claimType}) - Status: ${c.claimStatus}, Type: ${c.lifeClaimOption || c.vehicleClaimOption || 'TBD'}`
          ).join('; ');
          return {
            success: true,
            message: `I found ${result.data.length} claims: ${claimList}.`
          };
        } else {
          return {
            success: true,
            message: "No claims found for your account."
          };
        }
      }

      // Generic help
      if (message.includes('help') || message.includes('what can')) {
        const capabilities = {
          employee: "view your profile, check your policies, create and track claims, update personal information",
          hr_officer: "manage employee registrations, review claims, generate reports, assign policies",
          insurance_agent: "review and process claims, manage assigned policies, communicate with clients",
          admin: "full system management, create policies, manage users, generate comprehensive reports"
        };
        
        return {
          success: true,
          message: `As a ${userRole.replace('_', ' ')}, you can ${capabilities[userRole] || capabilities.employee}. Try asking me about your profile, policies, claims, or user counts.`
        };
      }

      // Default response
      return {
        success: true,
        message: `I understand you're asking about "${userMessage}". I can help you with profile information, policies, claims, user counts, and more. Could you be more specific about what you'd like to know?`
      };

    } catch (error) {
      console.error('Natural language processing error:', error);
      return {
        success: false,
        message: `I'm sorry, I encountered an error processing your request: ${error.message}`
      };
    }
  }

  /**
   * Formalize casual text into professional business language
   * @param {string} casualText - The casual text to formalize
   * @returns {Promise<string>} Formalized text
   */
  async formalizeTextWithAI(casualText) {
    // Simple rule-based text formalization
    // This is a backup when AI services aren't available
    const formalizationRules = {
      // Common casual to formal mappings
      'hey': 'Hello',
      'hi': 'Hello',
      'whats up': 'How are you doing',
      'what\'s up': 'How are you doing',
      'ur': 'your',
      'u': 'you',
      'gonna': 'going to',
      'wanna': 'want to',
      'lemme': 'let me',
      'gimme': 'give me',
      'dunno': 'do not know',
      'yeah': 'yes',
      'nope': 'no',
      'btw': 'by the way',
      'fyi': 'for your information',
      'asap': 'as soon as possible',
      'thx': 'thank you',
      'thanks': 'thank you',
      'pls': 'please',
      'plz': 'please',
      'ok': 'okay',
      'omg': 'oh my',
      'lol': '',
      'haha': '',
      'lmao': '',
      'wtf': 'what',
      'damn': '',
      'shit': '',
      'crap': 'issue'
    };

    let formalizedText = casualText;

    // Apply basic formalization rules
    Object.entries(formalizationRules).forEach(([casual, formal]) => {
      const regex = new RegExp(`\\b${casual}\\b`, 'gi');
      formalizedText = formalizedText.replace(regex, formal);
    });

    // Clean up extra spaces
    formalizedText = formalizedText.replace(/\s+/g, ' ').trim();

    // Capitalize first letter if not already
    if (formalizedText.length > 0) {
      formalizedText = formalizedText.charAt(0).toUpperCase() + formalizedText.slice(1);
    }

    // Ensure proper punctuation
    if (formalizedText && !formalizedText.match(/[.!?]$/)) {
      formalizedText += '.';
    }

    return formalizedText || casualText;
  }
}

export default new VapiProxyService();