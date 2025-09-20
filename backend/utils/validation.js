// backend/utils/validation.js

/**
 * Validates user role
 * @param {string} role - The role to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateUserRole = (role) => {
  const validRoles = ['employee', 'hr_officer', 'insurance_agent', 'admin'];
  return validRoles.includes(role);
};

/**
 * Validates assistant ID format
 * @param {string} assistantId - The assistant ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateAssistantId = (assistantId) => {
  if (!assistantId || typeof assistantId !== 'string') {
    return false;
  }
  
  // Basic format validation - adjust according to VAPI's actual format
  return assistantId.length > 0 && assistantId.trim() !== '';
};

/**
 * Validates message content
 * @param {string} message - The message to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return false;
  }
  
  // Check message length (adjust limits as needed)
  const trimmed = message.trim();
  return trimmed.length > 0 && trimmed.length <= 5000;
};

/**
 * Validates session ID format
 * @param {string} sessionId - The session ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateSessionId = (sessionId) => {
  if (!sessionId || typeof sessionId !== 'string') {
    return false;
  }
  
  // Basic format validation for session IDs
  return sessionId.length > 0 && sessionId.trim() !== '';
};