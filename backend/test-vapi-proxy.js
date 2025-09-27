// Test script to verify VAPI proxy functionality
// Run with: node test-vapi-proxy.js

import jwt from 'jsonwebtoken';
import VapiProxyService from './services/vapiProxyService.js';

async function testVapiProxy() {
  try {
    console.log('🧪 Testing VAPI Proxy Service...\n');

    // Create a test JWT token
    const testPayload = {
      userId: '64a1b2c3d4e5f6789a0b1c2d',
      role: 'admin'
    };
    
    const testToken = jwt.sign(testPayload, process.env.JWT_SECRET || 'test_secret', { expiresIn: '1h' });
    
    console.log('1. Testing natural language processing...');
    
    // Test user count query
    const userCountResult = await VapiProxyService.processNaturalLanguageRequest(
      'how many users are there',
      testToken,
      'admin'
    );
    console.log('User Count Result:', userCountResult);
    console.log('');
    
    // Test profile query
    const profileResult = await VapiProxyService.processNaturalLanguageRequest(
      'show my profile',
      testToken,
      'admin'
    );
    console.log('Profile Result:', profileResult);
    console.log('');
    
    // Test policy query
    const policyResult = await VapiProxyService.processNaturalLanguageRequest(
      'show my policies',
      testToken,
      'admin'
    );
    console.log('Policy Result:', policyResult);
    console.log('');
    
    console.log('2. Testing database operations...');
    
    // Test user count operation
    const dbUserCount = await VapiProxyService.executeDbOperation(
      testToken,
      'count',
      'User',
      {}
    );
    console.log('DB User Count:', dbUserCount);
    console.log('');
    
    // Test finding policies
    const dbPolicies = await VapiProxyService.executeDbOperation(
      testToken,
      'find',
      'Policy',
      { limit: 5 }
    );
    console.log('DB Policies:', dbPolicies);
    console.log('');
    
    console.log('✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testVapiProxy();
}

export default testVapiProxy;