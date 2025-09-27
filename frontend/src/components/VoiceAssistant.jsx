// Updated VoiceAssistant component using official VAPI Web SDK
// Make sure to install: npm install @vapi-ai/web
import React, { useState, useEffect, useRef } from 'react';
import Vapi from "@vapi-ai/web";
import './VoiceAssistant.css';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Initialize VAPI (you'll need to get your public API key from the dashboard)
export const vapi = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_API_KEY || "YOUR_PUBLIC_API_KEY");

const VoiceAssistant = ({ userToken, userRole }) => {
  const [assistantId, setAssistantId] = useState(null);
  const [callStatus, setCallStatus] = useState("inactive");
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useVoiceMode, setUseVoiceMode] = useState(true);
  const [messageCounter, setMessageCounter] = useState(0);
  const [userId, setUserId] = useState(null);
  
  const messagesEndRef = useRef(null);
  const vapiInitialized = useRef(false); // Prevent duplicate initialization

  // 🔴 DEBUG: Check login status on component mount 🔴
  useEffect(() => {
    console.log('🔴 VOICEASSISTANT MOUNTED - CHECKING LOGIN STATUS 🔴');
    console.log(' All localStorage keys:', Object.keys(localStorage));
    console.log(' localStorage contents:', Object.fromEntries(Object.entries(localStorage)));
    
    const token = localStorage.getItem('authToken'); // Fixed: use 'authToken' not 'token'
    console.log(' Current login status:');
    console.log('   Token exists:', !!token);
    console.log('   Token preview:', token ? token.substring(0, 30) + '...' : 'NO TOKEN FOUND');
    console.log('   userToken prop:', !!userToken);
    console.log('   userRole prop:', userRole);
    
    if (!token) {
      console.log('🔴 WARNING: NO TOKEN FOUND - USER NOT LOGGED IN! 🔴');
      console.log(' Please log in to use voice assistant functions!');
    }
  }, [userToken, userRole]);

  // Extract userId from JWT token
  const extractUserIdFromToken = (token) => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id || payload.sub;
    } catch (error) {
      console.error('Error extracting userId from token:', error);
      return null;
    }
  };

  // Initialize userId from token
  useEffect(() => {
    if (userToken) {
      const extractedUserId = extractUserIdFromToken(userToken);
      setUserId(extractedUserId);
    }
  }, [userToken]);

  // Initialize VAPI event listeners
  useEffect(() => {
    // Prevent duplicate initialization in React StrictMode
    if (vapiInitialized.current) {
      console.log(' VAPI already initialized, skipping duplicate setup');
      return;
    }
    
    console.log(' Initializing VAPI event listeners...');
    vapiInitialized.current = true;
    
    // Set up VAPI event listeners
    vapi.on("call-start", () => {
      console.log("Call started");
      setCallStatus("active");
      setError(null);
    });

    vapi.on("call-end", () => {
      console.log("Call ended");
      setCallStatus("inactive");
    });

    vapi.on("speech-start", () => {
      console.log("User started speaking");
    });

    vapi.on("speech-end", () => {
      console.log("User stopped speaking");
    });

    // CONSOLIDATED MESSAGE HANDLER - Handle all message types in one place
    vapi.on("message", async (message) => {
      // console.log("🎤 VOICE: VAPI Message:", message); // COMMENTED OUT TO REDUCE CONSOLE SPAM
      
      // Handle transcripts and assistant messages
      if (message.type === "transcript") {
        if (message.transcriptType === "final") {
          addMessage("user", message.transcript);
        }
      } else if (message.type === "assistant-message") {
        addMessage("assistant", message.content);
      } else if (message.type === "function-call") {
        console.log(" VOICE: Function call detected in message:", message);
      }
      
      // Handle tool calls within the same message handler
      if (message.type === 'tool-calls' && message.toolCalls && message.toolCalls.length > 0) {
        console.log("🔴 TOOL CALLS EVENT FIRED! 🔴");
        console.log(" Tool calls data:", message.toolCalls);
        console.log(" Full message object:", message);
        
        // Process each tool call
        for (const toolCall of message.toolCalls) {
          console.log(" Processing tool call:", toolCall);
          console.log(" Full toolCall object:", toolCall);
          console.log(" Function name:", toolCall?.function?.name);
          console.log(" Function parameters:", toolCall?.function?.arguments);
          
          if (!toolCall?.function?.name) {
            console.error(" Tool call missing function name!");
            continue;
          }

          try {
            console.log('🔴 DEBUGGING TOKEN RETRIEVAL 🔴');
            console.log(' All localStorage keys:', Object.keys(localStorage));
            console.log(' localStorage contents:', Object.fromEntries(Object.entries(localStorage)));
            
            const token = localStorage.getItem('authToken'); // Fixed: use 'authToken' not 'token'
            console.log(" Making API call to backend with function:", toolCall.function.name);
            console.log(" Token available:", !!token);
            console.log(" Token value (first 20 chars):", token ? token.substring(0, 20) + '...' : 'NO TOKEN');
            console.log(" API URL:", `${API_BASE_URL}/vapi/function-call`);
            
            // Also check for other possible token keys
            const authToken = localStorage.getItem('authToken');
            const jwt = localStorage.getItem('jwt');
            const accessToken = localStorage.getItem('accessToken');
            
            console.log(' Alternative token checks:');
            console.log('   authToken:', !!authToken, authToken ? authToken.substring(0, 20) + '...' : 'NONE');
            console.log('   jwt:', !!jwt, jwt ? jwt.substring(0, 20) + '...' : 'NONE');
            console.log('   accessToken:', !!accessToken, accessToken ? accessToken.substring(0, 20) + '...' : 'NONE');
            
            // Parse arguments if they're a string
            let parameters = {};
            if (typeof toolCall.function.arguments === 'string') {
              try {
                parameters = JSON.parse(toolCall.function.arguments);
              } catch (e) {
                console.error(" Failed to parse function arguments:", e);
                parameters = {};
              }
            } else {
              parameters = toolCall.function.arguments || {};
            }
            
            console.log(" Parsed parameters:", parameters);
            
            const requestHeaders = {
              'Content-Type': 'application/json'
            };
            
            if (token) {
              requestHeaders['Authorization'] = `Bearer ${token}`;
              console.log(" Authorization header set");
            } else {
              console.log(" NO TOKEN - Request will fail!");
            }
            
            const response = await fetch(`${API_BASE_URL}/vapi/function-call`, {
              method: 'POST',
              headers: requestHeaders,
              body: JSON.stringify({
                name: toolCall.function.name,
                parameters: parameters
              })
            });

            console.log(" Backend response status:", response.status);
            console.log(" Backend response ok:", response.ok);
            
            if (response.ok) {
              const result = await response.json();
              console.log(" Backend response data:", result);
              
              // Extract the message content for VAPI
              const functionResult = result.message || result.data || 'Function executed successfully.';
              console.log(" Returning function result to VAPI:", functionResult);
              
              // Call the VAPI function result method
              if (toolCall.call && typeof toolCall.call.result === 'function') {
                console.log(" Calling toolCall.call.result with:", functionResult);
                toolCall.call.result(toolCall.id, functionResult);
              } else {
                console.log(" No callback available, trying vapi.say()");
                // Fallback: use vapi.say to speak the result
                if (vapi && typeof vapi.say === 'function') {
                  vapi.say(functionResult);
                } else {
                  console.error(" No method to return result to VAPI!");
                  addMessage("assistant", functionResult);
                }
              }
            } else {
              const errorText = await response.text();
              console.error(" Function call failed:", response.status, errorText);
              const errorMessage = "Sorry, I encountered an error processing your request.";
              
              // Call the VAPI function result method with error
              if (toolCall.call && typeof toolCall.call.result === 'function') {
                toolCall.call.result(toolCall.id, errorMessage);
              } else if (vapi && typeof vapi.say === 'function') {
                vapi.say(errorMessage);
              } else {
                addMessage("assistant", errorMessage);
              }
            }
          } catch (error) {
            console.error(' Function call error:', error);
            const errorMessage = "I encountered an error processing your request. Please try again.";
            
            // Call the VAPI function result method with error
            if (toolCall.call && typeof toolCall.call.result === 'function') {
              toolCall.call.result(toolCall.id, errorMessage);
            } else if (vapi && typeof vapi.say === 'function') {
              vapi.say(errorMessage);
            } else {
              addMessage("assistant", errorMessage);
            }
          }
        }
      }
      
      if (message.type === 'function-call') {
        console.log(" Message contains function call!", message);
      }
    });

    // Add back other event handlers that were removed
    vapi.on("call-start", () => {
      console.log(" EVENT: call-start");
    });

    vapi.on("speech-start", () => {
      console.log(" EVENT: speech-start");
    });

    vapi.on("speech-end", () => {
      console.log(" EVENT: speech-end");
    });

    vapi.on("transcript", (transcript) => {
      console.log(" EVENT: transcript", transcript);
    });

    // Enhanced function call handling with extensive debugging
    vapi.on("error", (error) => {
      console.error("VAPI Error:", error);
      // Only set error state for serious errors, not normal call ending
      if (error.errorMsg && !error.errorMsg.includes('Meeting has ended')) {
        setError(`VAPI Error: ${error.errorMsg || error}`);
      }
      setCallStatus("inactive");
    });
    
    // Cleanup event listeners
    return () => {
      console.log(' Cleaning up VAPI event listeners...');
      vapi.removeAllListeners();
      vapiInitialized.current = false;
    };
  }, []);

  // Initialize assistant
  useEffect(() => {
    initializeAssistant();
  }, [userRole]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (type, text) => {
    setMessageCounter(prev => prev + 1);
    const message = {
      id: `msg-${Date.now()}-${messageCounter}`,
      type,
      text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, message]);
  };

  const initializeAssistant = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For inline assistants, we don't need to create an assistant ahead of time
      // Just add welcome message
      addMessage('assistant', getWelcomeMessage(userRole));
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getWelcomeMessage = (role) => {
    const messages = {
      employee: "Hello! I'm your Lumiere Insurance voice assistant. I can help you with your policies, claims, and account information. Click 'Start Voice Call' to begin speaking, or use text mode below.",
      hr_officer: "Hello! I'm here to help you manage employee insurance matters, review claims, and generate reports. How would you like to interact today?",
      insurance_agent: "Hello! I'm your assistant for reviewing claims, managing policies, and making insurance decisions. Ready to assist you!",
      admin: "Hello! I'm here to help you with system administration, policy management, and comprehensive oversight. Let's get started!"
    };
    return messages[role] || messages.employee;
  };

  // Start voice call using official VAPI method
  const startVoiceCall = async () => {
    if (!userId || !userRole) {
      setError("User information not available");
      return;
    }
    
    try {
      setCallStatus("loading");
      setError(null);
      
      // Get assistant configuration from our backend
      const configResponse = await fetch('/api/v1/vapi/assistant/config', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!configResponse.ok) {
        throw new Error('Failed to get assistant configuration');
      }
      
      const config = await configResponse.json();
      
      console.log("Assistant config from backend:", config);
      console.log("Functions available:", config.model?.functions);
      console.log("Number of functions:", config.model?.functions?.length);
      
      const callConfig = {
        model: {
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          messages: config.model?.messages || [],
          functions: config.model?.functions || [],
          temperature: 0.7
        },
        voice: {
          provider: 'playht',
          voiceId: 'jennifer'
        },
        firstMessage: config.firstMessage
      };
      
      console.log("🎤 Starting VAPI call with config:", callConfig);
      console.log("🎤 Functions being passed to VAPI:", callConfig.model.functions);
      
      // Start call with inline assistant configuration
      await vapi.start(callConfig);
      
    } catch (err) {
      setError(`Failed to start call: ${err.message}`);
      setCallStatus("inactive");
    }
  };

  // Stop voice call
  const stopVoiceCall = () => {
    setCallStatus("loading");
    vapi.stop();
  };

  // Send text message (for hybrid text/voice mode)
  const sendTextMessage = async (messageText) => {
    if (!messageText.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Add user message to chat
      addMessage("user", messageText);
      
      // All queries now go through the VAPI function call system
      const response = await fetch('/api/v1/vapi/execute-function', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userMessage: messageText,
          userRole: userRole
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Extract message from the result data  
          const message = result.result?.message || result.message || "I processed your request successfully.";
          addMessage("assistant", message);
        } else {
          addMessage("assistant", result.message || "I encountered an error processing your request. Please try again.");
        }
      } else {
        throw new Error('Failed to process your request');
      }
      
    } catch (err) {
      setError(err.message);
      addMessage("assistant", "I'm sorry, I encountered an error processing your message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTextMessage = (e) => {
    e.preventDefault();
    sendTextMessage(currentMessage);
    setCurrentMessage('');
  };

  if (isLoading && !assistantId) {
    return (
      <div className="voice-assistant loading">
        <div className="loading-spinner"></div>
        <p>Initializing voice assistant...</p>
      </div>
    );
  }

  return (
    <div className="voice-assistant">
      <div className="voice-assistant-header">
        <h3>🎙️ Lumiere Insurance Assistant</h3>
        <p>Role: {userRole.replace('_', ' ').toUpperCase()}</p>
        
        {/* Mode Toggle */}
        <div className="mode-toggle">
          <button 
            className={useVoiceMode ? 'active' : ''} 
            onClick={() => setUseVoiceMode(true)}
          >
            🎤 Voice Mode
          </button>
          <button 
            className={!useVoiceMode ? 'active' : ''} 
            onClick={() => setUseVoiceMode(false)}
          >
            💬 Text Mode
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      
      {/* Voice Mode Controls */}
      {useVoiceMode && (
        <div className="voice-controls">
          {callStatus === "inactive" && (
            <button onClick={startVoiceCall} className="voice-call-button start">
              🎤 Start Voice Call
            </button>
          )}
          {callStatus === "loading" && (
            <div className="loading-indicator">
              <div className="loading-spinner small"></div>
              <span>Connecting...</span>
            </div>
          )}
          {callStatus === "active" && (
            <button onClick={stopVoiceCall} className="voice-call-button stop">
              🛑 End Call
            </button>
          )}
        </div>
      )}
      
      {/* Messages Display */}
      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-content">
              <p>{message.text}</p>
              <span className="timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant typing">
            <div className="message-content">
              <p>Assistant is typing...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Text Mode Input */}
      {!useVoiceMode && (
        <form onSubmit={handleSendTextMessage} className="message-input-form">
          <div className="input-container">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="message-input"
            />
            
            <button
              type="submit"
              disabled={!currentMessage.trim() || isLoading}
              className="send-button"
              title="Send message"
            >
              📤
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default VoiceAssistant;