// Admin Test Page for VAPI Voice Assistant
// Save this as: frontend/src/pages/Admin/VapiTestPage.jsx

import React, { useState, useEffect } from 'react';
import VoiceAssistant from '../../components/VoiceAssistant';
import { useAuth } from '../../context/AuthContext';
import vapiApiService from '../../services/vapi-api';
import './VapiTestPage.css';

const VapiTestPage = () => {
  const { user, token, isAuthenticated } = useAuth();
  
  const [showAssistant, setShowAssistant] = useState(false);
  const [testLogs, setTestLogs] = useState([]);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAuthenticated) {
      addLog('⚠️ User not authenticated. Please log in to test VAPI.', 'error');
    } else if (!isAdmin) {
      addLog(`⚠️ Current user role: ${user?.role}. Admin role recommended for full testing.`, 'info');
    } else {
      addLog(`✅ Authenticated as admin user: ${user?.name || user?.email}`, 'success');
    }
  }, [isAuthenticated, user, isAdmin]);

  const addLog = (message, type = 'info') => {
    const log = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      type, // 'info', 'success', 'error'
      timestamp: new Date().toISOString()
    };
    setTestLogs(prev => [log, ...prev]);
  };

  const testBackendConnection = async () => {
    if (!token) {
      addLog('❌ No authentication token available', 'error');
      return;
    }

    try {
      addLog('Testing backend connection...', 'info');
      
      // Test the new VAPI proxy service
      const result = await vapiApiService.processUserMessage(
        'hello, test connection',
        user?.role || 'employee',
        token
      );
      
      if (result.success) {
        addLog('✅ Backend connection successful', 'success');
        addLog(`Response: ${result.message || result.result?.message || 'Success'}`, 'success');
      } else {
        addLog(`❌ Backend connection failed: ${result.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Backend connection error: ${error.message}`, 'error');
    }
  };

  const testAssistantCreation = async () => {
    if (!token) {
      addLog('❌ No authentication token available', 'error');
      return;
    }

    try {
      addLog('Testing user profile retrieval...', 'info');
      
      const result = await vapiApiService.getUserProfile(token);
      
      if (result.success) {
        addLog(`✅ Profile retrieved successfully`, 'success');
        addLog(`Message: ${result.message || result.result?.message || 'Profile data retrieved'}`, 'info');
      } else {
        addLog(`❌ Profile retrieval failed: ${result.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Profile retrieval error: ${error.message}`, 'error');
    }
  };

  const testCallCreation = async () => {
    if (!token) {
      addLog('❌ No authentication token available', 'error');
      return;
    }

    try {
      addLog('Testing user counts (admin function)...', 'info');
      
      if (user?.role !== 'admin') {
        addLog(`⚠️ Current user role: ${user?.role}. Admin role required for this test.`, 'info');
      }
      
      const result = await vapiApiService.getUserCounts(token);
      
      if (result.success) {
        addLog(`✅ User counts retrieved successfully`, 'success');
        addLog(`Message: ${result.message || result.result?.message || 'User count data retrieved'}`, 'info');
      } else {
        addLog(`❌ User counts failed: ${result.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      addLog(`❌ User counts error: ${error.message}`, 'error');
    }
  };

  const clearLogs = () => {
    setTestLogs([]);
  };

  const testPolicies = async () => {
    if (!token) {
      addLog('❌ No authentication token available', 'error');
      return;
    }

    try {
      addLog('Testing policy retrieval...', 'info');
      
      const result = await vapiApiService.getUserPolicies(token);
      
      if (result.success) {
        addLog(`✅ Policies retrieved successfully`, 'success');
        addLog(`Message: ${result.message || result.result?.message || 'Policy data retrieved'}`, 'info');
      } else {
        addLog(`❌ Policy retrieval failed: ${result.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Policy retrieval error: ${error.message}`, 'error');
    }
  };

  const testDbOperations = async () => {
    if (!token) {
      addLog('❌ No authentication token available', 'error');
      return;
    }

    try {
      addLog('Testing direct database operations...', 'info');
      
      // Test counting users
      try {
        const userCountResult = await vapiApiService.countDocuments('User', {}, token);
        
        if (userCountResult.success) {
          addLog(`✅ User count operation successful: ${userCountResult.data} users`, 'success');
        } else {
          addLog(`❌ User count operation failed: ${userCountResult.message}`, 'error');
        }
      } catch (error) {
        addLog(`❌ User count error: ${error.message}`, 'error');
      }
      
      // Test getting policies with corrected field names
      try {
        const policiesResult = await vapiApiService.executeDbOperation('find', 'Policy', {
          limit: 5,
          // Remove the populate that was causing issues
        }, token);
        
        if (policiesResult.success) {
          addLog(`✅ Policy query successful: ${policiesResult.count} policies found`, 'success');
          if (policiesResult.data && policiesResult.data.length > 0) {
            const firstPolicy = policiesResult.data[0];
            addLog(`Sample policy: ${firstPolicy.policyId || 'No ID'} (${firstPolicy.policyType})`, 'info');
          }
        } else {
          addLog(`❌ Policy query failed: ${policiesResult.message}`, 'error');
        }
      } catch (error) {
        addLog(`❌ Policy query error: ${error.message}`, 'error');
      }
      
      // Test getting claims
      try {
        const claimsResult = await vapiApiService.countDocuments('Claim', {}, token);
        
        if (claimsResult.success) {
          addLog(`✅ Claims count successful: ${claimsResult.data} claims found`, 'success');
        } else {
          addLog(`❌ Claims count failed: ${claimsResult.message}`, 'error');
        }
      } catch (error) {
        addLog(`❌ Claims count error: ${error.message}`, 'error');
      }
      
    } catch (error) {
      addLog(`❌ Database operations error: ${error.message}`, 'error');
    }
  };

  const runAllTests = async () => {
    clearLogs();
    addLog('🚀 Starting comprehensive VAPI tests...', 'info');
    
    await testBackendConnection();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    await testAssistantCreation();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testCallCreation();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testPolicies();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testDbOperations();
    
    addLog('✅ All tests completed', 'success');
  };

  return (
    <div className="vapi-test-page">
      <div className="test-header">
        <h1>🎙️ VAPI Voice Assistant Test Center</h1>
        <p>Test both voice and text modes of the VAPI integration</p>
      </div>

      <div className="test-content">
        {/* Configuration Panel */}
        <div className="test-panel">
          <h2>� Current User Info</h2>
          
          <div className="user-info-section">
            {isAuthenticated ? (
              <>
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{user?.name || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user?.email || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Role:</span>
                  <span className={`info-value role-${user?.role}`}>{user?.role || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">User ID:</span>
                  <span className="info-value">{user?._id || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Auth Status:</span>
                  <span className="info-value success">✅ Authenticated</span>
                </div>
                {!isAdmin && (
                  <div className="info-item warning">
                    <span className="info-label">⚠️ Note:</span>
                    <span className="info-value">Some admin functions may not work with your current role</span>
                  </div>
                )}
              </>
            ) : (
              <div className="info-item error">
                <span className="info-value">❌ Not authenticated. Please log in first.</span>
              </div>
            )}
          </div>
        </div>

        {/* API Tests Panel */}
        <div className="test-panel">
          <h2>🧪 API Tests</h2>
          
          <div className="test-buttons">
            <button onClick={testBackendConnection} className="test-btn primary">
              Test Backend Connection
            </button>
            <button onClick={testAssistantCreation} className="test-btn primary">
              Test Profile Retrieval
            </button>
            <button onClick={testCallCreation} className="test-btn primary">
              Test User Counts
            </button>
            <button onClick={testPolicies} className="test-btn primary">
              Test Policy Retrieval
            </button>
            <button onClick={testDbOperations} className="test-btn primary">
              Test DB Operations
            </button>
            <button onClick={runAllTests} className="test-btn success">
              Run All Tests
            </button>
            <button onClick={clearLogs} className="test-btn secondary">
              Clear Logs
            </button>
          </div>

          {/* Test Logs */}
          <div className="test-logs">
            <h3>📝 Test Logs</h3>
            <div className="logs-container">
              {testLogs.length === 0 ? (
                <p className="no-logs">No test logs yet. Run some tests to see results.</p>
              ) : (
                testLogs.map(log => (
                  <div key={log.id} className={`log-entry ${log.type}`}>
                    <span className="log-time">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="log-message">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Voice Assistant Panel */}
        <div className="test-panel">
          <h2>🎤 Voice Assistant Test</h2>
          
          <div className="assistant-controls">
            <button 
              onClick={() => setShowAssistant(!showAssistant)}
              className={`test-btn ${showAssistant ? 'danger' : 'success'}`}
            >
              {showAssistant ? 'Hide Assistant' : 'Show Assistant'}
            </button>
          </div>

          {showAssistant && isAuthenticated && (
            <div className="assistant-container">
              <VoiceAssistant 
                userToken={token}
                userRole={user?.role || 'employee'}
              />
            </div>
          )}

          {showAssistant && !isAuthenticated && (
            <div className="assistant-container error">
              <p>❌ Please log in to test the Voice Assistant</p>
            </div>
          )}
        </div>

        {/* Environment Check */}
        <div className="test-panel">
          <h2>🌍 Environment Check</h2>
          
          <div className="env-check">
            <div className="env-item">
              <span className="env-label">VAPI Public Key:</span>
              <span className={`env-value ${import.meta.env.VITE_VAPI_PUBLIC_API_KEY ? 'success' : 'error'}`}>
                {import.meta.env.VITE_VAPI_PUBLIC_API_KEY ? '✅ Configured' : '❌ Missing'}
              </span>
            </div>
            
            <div className="env-item">
              <span className="env-label">Current Environment:</span>
              <span className="env-value info">
                {import.meta.env.NODE_ENV || 'development'}
              </span>
            </div>
            
            <div className="env-item">
              <span className="env-label">Test User Role:</span>
              <span className="env-value info">{user?.role || 'Not authenticated'}</span>
            </div>

            <div className="env-item">
              <span className="env-label">Authentication:</span>
              <span className={`env-value ${isAuthenticated ? 'success' : 'error'}`}>
                {isAuthenticated ? '✅ Authenticated' : '❌ Not authenticated'}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="test-panel">
          <h2>📋 Testing Instructions</h2>
          
          <div className="instructions">
            <h3>🔧 Setup Required:</h3>
            <ol>
              <li>Install VAPI Web SDK: <code>npm install @vapi-ai/web</code></li>
              <li>Get your VAPI keys from the dashboard</li>
              <li>Set <code>VAPI_PRIVATE_API_KEY</code> in backend .env</li>
              <li>Set <code>VITE_VAPI_PUBLIC_API_KEY</code> in frontend .env</li>
              <li>Ensure backend is running on the correct port</li>
            </ol>

            <h3>🧪 How to Test:</h3>
            <ol>
              <li><strong>Login:</strong> Make sure you're logged in as an admin user</li>
              <li><strong>API Tests:</strong> Click "Run All Tests" to verify backend integration</li>
              <li><strong>Voice Mode:</strong> Show assistant → Switch to Voice Mode → Click "Start Voice Call"</li>
              <li><strong>Text Mode:</strong> Show assistant → Switch to Text Mode → Type messages</li>
              <li><strong>Test Phrases:</strong> Try "What is my profile?", "Show me all policies", "Get user counts"</li>
            </ol>

            <h3>🎯 What to Expect:</h3>
            <ul>
              <li><strong>Voice Mode:</strong> Real-time voice conversation with your actual user data</li>
              <li><strong>Text Mode:</strong> Chat interface with typed messages using your token</li>
              <li><strong>Role-based Responses:</strong> Responses based on your actual user role</li>
              <li><strong>Real Data:</strong> Actual profile and data from your logged-in account</li>
              <li><strong>Error Handling:</strong> Clear error messages for any issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VapiTestPage;