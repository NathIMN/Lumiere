// backend/routes/vapi.js
import express from 'express';
const router = express.Router();

import {
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
} from '../controllers/vapi.js';

import { authenticate, authorize, authorizeOwnerOrAdmin } from '../middleware/auth.js';

// Public webhook endpoint (no auth required)
router.post('/webhook', handleWebhook);

// Public key endpoint (requires auth for security)
router.get('/public-key', authenticate, getPublicKey);

// Protected routes (require authentication)
router.use(authenticate); // Apply auth middleware to all routes below

// Assistant management - Available to all authenticated users
router.post('/assistant/create', createAssistant);
router.get('/assistant/config', getAssistantConfig);

// Function call handling for Web SDK
router.post('/function-call', handleFunctionCall);

// Assistant config updates - Admin only
router.patch('/assistant/:assistantId/config', authorize('admin'), updateAssistantConfig);

// Call management - Available to all authenticated users
router.post('/call/create', createCall);
router.get('/calls/history', getCallHistory);

// Analytics and metrics - Admin and HR only
router.get('/metrics', authorize('admin', 'hr_officer'), getAssistantMetrics);

// NEW: Proxy endpoints for VAPI function calls
// Natural language processing endpoint - All authenticated users
router.post('/execute-function', executeFunction);

// Direct API call proxy - All authenticated users (with role-based access control applied internally)
router.post('/api-call', executeApiCall);

// Database operation proxy - All authenticated users (with role-based access control applied internally)  
router.post('/db-operation', executeDbOperation);

// Backwards compatibility test endpoint
router.post('/test-function', testFunction);

export default router;