// backend/controllers/vapi.js
import vapiService from '../services/vapiService.js';
import vapiProxyService from '../services/vapiProxyService.js';
import asyncWrapper from '../middleware/async.js';
import { createCustomError } from '../errors/custom-error.js';

// Get VAPI public key for frontend
const getPublicKey = asyncWrapper(async (req, res, next) => {
  const publicKey = process.env.VAPI_PUBLIC_API_KEY;
  
  if (!publicKey) {
    return next(createCustomError('VAPI public key not configured', 500));
  }
  
  res.status(200).json({
    success: true,
    publicKey
  });
});

// Handle function call from VAPI Web SDK
const handleFunctionCall = asyncWrapper(async (req, res, next) => {
  const { name, parameters } = req.body;
  const authHeader = req.headers.authorization;
  const userRole = req.user.role;
  
  if (!name) {
    return next(createCustomError('Function name is required', 400));
  }
  
  // Extract just the token part from "Bearer token"
  const userToken = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : authHeader;
  
  try {
    console.log(`Handling function call: ${name} with parameters:`, parameters);
    
    const result = await vapiService.handleFunctionCall(name, parameters || {}, userToken, userRole);
    
    console.log(`Function call result:`, result);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Function call error:', error);
    res.status(500).json({
      error: error.message || 'Function call failed'
    });
  }
});

// Create assistant for user
const createAssistant = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const userRole = req.user.role;

  const assistant = await vapiService.createAssistant(userRole, userId);
  
  res.status(201).json({
    success: true,
    message: 'Assistant created successfully',
    assistant: {
      id: assistant.id,
      name: assistant.name
    }
  });
});

// Get assistant configuration
const getAssistantConfig = asyncWrapper(async (req, res, next) => {
  const userRole = req.user.role;
  
  // Return inline assistant configuration for web SDK
  const assistantConfig = {
    model: {
      provider: 'openai',
      model: 'gpt-4-0613', // Use GPT-4 which has better function calling support
      messages: vapiService.getSystemMessagesByRole(userRole),
      functions: vapiService.getFunctionsByRole(userRole),
      temperature: 0.3 // Lower temperature for more consistent function calling
    },
    voice: {
      provider: 'playht',
      voiceId: 'jennifer'
    },
    firstMessage: vapiService.getWelcomeMessage(userRole)
  };
  
  console.log('🚀 Assistant config being sent:', JSON.stringify(assistantConfig, null, 2));
  console.log('🚀 Functions count:', assistantConfig.model.functions.length);
  
  res.status(200).json(assistantConfig);
});

// Create call with assistant (following VAPI standards)
const createCall = asyncWrapper(async (req, res, next) => {
  const { assistantId, useInlineAssistant = false } = req.body;
  const { userId } = req.user;
  const userRole = req.user.role;

  const customerData = {
    userId,
    userRole,
    name: `${req.user.profile?.firstName || ''} ${req.user.profile?.lastName || ''}`.trim() || 'User'
  };

  // For web applications, we don't create calls on the server
  // Instead, we return the assistant configuration for the frontend to use
  if (useInlineAssistant || !assistantId) {
    // Return intelligent inline assistant configuration
    const assistantConfig = {
      model: {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        messages: vapiService.getSystemMessagesByRole(userRole),
        functions: vapiService.getFunctionsByRole(userRole),
        temperature: 0.7
      },
      voice: {
        provider: 'playht',
        voiceId: 'jennifer'
      },
      firstMessage: vapiService.getWelcomeMessage(userRole)
    };
    
    res.status(200).json({
      success: true,
      message: 'Intelligent assistant configuration ready for web call',
      call: {
        id: `web-call-${Date.now()}`,
        status: 'ready',
        type: 'web',
        assistantConfig
      }
    });
  } else {
    // Return existing assistant ID for frontend to use
    if (typeof assistantId !== 'string') {
      return next(createCustomError('Assistant ID must be a string', 400));
    }
    
    res.status(200).json({
      success: true,
      message: 'Assistant ready for web call',
      call: {
        id: `web-call-${Date.now()}`,
        status: 'ready',
        type: 'web',
        assistantId
      }
    });
  }
});

// Handle webhook from Vapi
const handleWebhook = asyncWrapper(async (req, res, next) => {
  const { type, call, message } = req.body;
  
  // Basic webhook validation
  if (!type) {
    return next(createCustomError('Webhook type is required', 400));
  }
  
  console.log('Vapi webhook received:', type);
  
  switch (type) {
    case 'function-call':
      if (!message?.functionCall) {
        return next(createCustomError('Function call data is missing', 400));
      }
      
      const { functionCall } = message;
      const callMetadata = call?.metadata || {};
      const { userId, userRole, userToken } = callMetadata;
      
      console.log('Function call webhook received:', {
        functionName: functionCall.name,
        parameters: functionCall.parameters,
        metadata: callMetadata
      });
      
      if (!userId || !userRole) {
        console.error('User metadata missing from webhook:', { userId, userRole, metadata: callMetadata });
        return next(createCustomError('User metadata is missing in webhook. Ensure call was started with proper metadata.', 400));
      }
      
      // Generate or use the provided token for authentication
      let authToken = userToken;
      if (!authToken) {
        console.log('Generating temporary token for user:', userId);
        try {
          const jwt = await import('jsonwebtoken');
          authToken = jwt.default.sign(
            { userId, role: userRole },
            process.env.JWT_SECRET || 'temp_secret',
            { expiresIn: '1h' }
          );
        } catch (error) {
          console.error('Failed to generate auth token:', error);
          return next(createCustomError('Authentication token generation failed', 500));
        }
      }
      
      const result = await vapiService.handleFunctionCall(
        functionCall.name,
        functionCall.parameters,
        userId,
        userRole,
        authToken
      );
      
      console.log('Function call result:', result);
      
      res.status(200).json({
        result: result
      });
      break;
      
    case 'call-start':
      console.log('Call started:', call?.id);
      // You can log this to your database or perform other actions
      res.status(200).json({ received: true });
      break;
      
    case 'call-end':
      console.log('Call ended:', call?.id);
      // Log call completion, duration, etc.
      res.status(200).json({ received: true });
      break;
      
    default:
      console.log('Unknown webhook type:', type);
      res.status(200).json({ received: true });
  }
});

// Get call history
const getCallHistory = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const { page = 1, limit = 10 } = req.query;
  
  // This would integrate with your database to store and retrieve call history
  // For now, returning mock data
  const callHistory = {
    calls: [
      {
        id: 'call_123',
        startedAt: new Date().toISOString(),
        duration: 300, // seconds
        status: 'completed',
        summary: 'User inquired about life insurance policy coverage'
      }
    ],
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: 1,
      pages: 1
    }
  };
  
  res.status(200).json({
    success: true,
    callHistory
  });
});

// Get assistant performance metrics (Admin/HR only)
const getAssistantMetrics = asyncWrapper(async (req, res, next) => {
  // Check if user has permission
  if (!['admin', 'hr_officer'].includes(req.user.role)) {
    return next(createCustomError('Access denied', 403));
  }
  
  const { dateFrom, dateTo } = req.query;
  
  // Mock metrics data - replace with actual implementation
  const metrics = {
    totalSessions: 150,
    averageSessionDuration: 245, // seconds
    successfulResolutions: 128,
    totalMessages: 850,
    averageMessagesPerSession: 5.7,
    commonQueries: [
      { query: 'Policy coverage inquiry', count: 45 },
      { query: 'Claim status check', count: 38 },
      { query: 'Premium payment', count: 32 }
    ],
    userSatisfactionScore: 4.2,
    peakUsageHours: ['10:00-12:00', '14:00-16:00']
  };
  
  res.status(200).json({
    success: true,
    metrics
  });
});

// Update assistant configuration (Admin only)
const updateAssistantConfig = asyncWrapper(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(createCustomError('Access denied', 403));
  }
  
  const { assistantId } = req.params;
  const { name, model, voice, systemMessage } = req.body;
  
  // Update assistant configuration via Vapi API
  // Implementation would depend on Vapi's update endpoint
  
  res.status(200).json({
    success: true,
    message: 'Assistant configuration updated successfully'
  });
});

// Execute function calls through the proxy service (for testing and text mode)
const executeFunction = asyncWrapper(async (req, res, next) => {
  const { userMessage, userRole, functionName, parameters } = req.body;
  const { userId } = req.user;
  const userToken = req.headers.authorization?.replace('Bearer ', '');
  
  if (!userToken) {
    return next(createCustomError('Authentication token is required', 401));
  }
  
  try {
    let result;
    
    // Handle direct function calls (from VAPI client-side function handling)
    if (functionName) {
      console.log('Executing direct function:', {
        functionName,
        parameters,
        userId,
        userRole
      });
      
      result = await vapiService.handleFunctionCall(
        functionName,
        parameters,
        userId,
        userRole,
        userToken
      );
      
      console.log('Function call result:', result);
    }
    // Handle natural language requests (from text mode)
    else if (userMessage) {
      result = await vapiProxyService.processNaturalLanguageRequest(
        userMessage,
        userToken,
        userRole
      );
    }
    else {
      return next(createCustomError('Either userMessage or functionName is required', 400));
    }
    
    res.status(200).json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error('Execute function error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process request'
    });
  }
});

// Execute any API call through the proxy (for advanced use cases)
const executeApiCall = asyncWrapper(async (req, res, next) => {
  const { method, endpoint, body, query } = req.body;
  const userToken = req.headers.authorization?.replace('Bearer ', '');
  
  if (!userToken) {
    return next(createCustomError('Authentication token is required', 401));
  }
  
  if (!method || !endpoint) {
    return next(createCustomError('Method and endpoint are required', 400));
  }
  
  try {
    const result = await vapiProxyService.executeApiCall(
      userToken,
      method,
      endpoint,
      body,
      query
    );
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Execute API call error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to execute API call'
    });
  }
});

// Execute database operations through the proxy
const executeDbOperation = asyncWrapper(async (req, res, next) => {
  const { operation, model, params } = req.body;
  const userToken = req.headers.authorization?.replace('Bearer ', '');
  
  if (!userToken) {
    return next(createCustomError('Authentication token is required', 401));
  }
  
  if (!operation || !model) {
    return next(createCustomError('Operation and model are required', 400));
  }
  
  try {
    const result = await vapiProxyService.executeDbOperation(
      userToken,
      operation,
      model,
      params
    );
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Execute DB operation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to execute database operation'
    });
  }
});

// Test function for backwards compatibility
const testFunction = asyncWrapper(async (req, res, next) => {
  const { functionName, parameters } = req.body;
  const userToken = req.headers.authorization?.replace('Bearer ', '');
  const { userId, role: userRole } = req.user;
  
  if (!userToken) {
    return next(createCustomError('Authentication token is required', 401));
  }
  
  try {
    // Map old function names to new natural language requests
    let userMessage = '';
    
    switch (functionName) {
      case 'get_user_counts':
        userMessage = 'how many users are there';
        break;
      case 'get_user_profile':
        userMessage = 'show my profile';
        break;
      case 'get_policies':
        userMessage = 'show my policies';
        break;
      case 'get_claims':
        userMessage = 'show my claims';
        break;
      default:
        userMessage = `execute ${functionName}`;
    }
    
    const result = await vapiProxyService.processNaturalLanguageRequest(
      userMessage,
      userToken,
      userRole
    );
    
    res.status(200).json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error('Test function error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to execute test function'
    });
  }
});

export {
  getPublicKey,
  handleFunctionCall,
  createAssistant,
  getAssistantConfig,
  createCall,
  handleWebhook,
  getCallHistory,
  getAssistantMetrics,
  updateAssistantConfig,
  executeFunction,
  executeApiCall,
  executeDbOperation,
  testFunction
};