import React, { useState, useEffect, useRef } from 'react';
import Vapi from "@vapi-ai/web";
import EmployeeContextService from '../utils/employeeContextService';
import './FloatingVoiceAssistant.css';

const vapi = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_API_KEY || "YOUR_PUBLIC_API_KEY");

const FloatingVoiceAssistant = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [microphoneSupported, setMicrophoneSupported] = useState(true);
  const [employeeContext, setEmployeeContext] = useState(null);
  const [contextLoading, setContextLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const vapiInitialized = useRef(false);
  const contextService = useRef(new EmployeeContextService());

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch employee context on component mount
  useEffect(() => {
    const fetchEmployeeContext = async () => {
      try {
        setContextLoading(true);
        console.log('Fetching employee context for Lumi...');
        const context = await contextService.current.getComprehensiveEmployeeContext();
        setEmployeeContext(context);
        console.log('Employee context loaded:', context);
      } catch (error) {
        console.error('Failed to load employee context:', error);
      } finally {
        setContextLoading(false);
      }
    };

    fetchEmployeeContext();
  }, []);

  // Check microphone support
  useEffect(() => {
    const checkMicSupport = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setMicrophoneSupported(false);
          return;
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setMicrophoneSupported(true);
      } catch (err) {
        setMicrophoneSupported(false);
      }
    };
    
    checkMicSupport();
  }, []);

  // Initialize VAPI event listeners
  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (vapiInitialized.current) {
      console.log('Lumi VAPI already initialized, skipping...');
      return;
    }
    
    console.log('Initializing Lumi VAPI event listeners...');
    vapiInitialized.current = true;
    
    // Set up VAPI event listeners
    vapi.on("call-start", () => {
      console.log("Lumi voice assistant connected");
      setIsConnected(true);
      setIsLoading(false);
      addMessage('system', 'Voice assistant connected. How can I help you with Lumiere Insurance today?');
    });

    vapi.on("call-end", () => {
      console.log("Lumi voice assistant disconnected");
      setIsConnected(false);
      setIsLoading(false);
      setIsListening(false);
      setIsAssistantSpeaking(false);
      addMessage('system', 'Voice assistant disconnected.');
    });

    vapi.on("speech-start", () => {
      console.log("User started speaking");
      setIsListening(true);
    });

    vapi.on("speech-end", () => {
      console.log("User stopped speaking");
      setIsListening(false);
    });

    vapi.on("message", (message) => {
      console.log("VAPI Lumi Message:", message);
      
      // Handle status updates
      if (message.type === "status-update") {
        if (message.status === "ended") {
          setIsConnected(false);
          setIsLoading(false);
          setIsListening(false);
          setIsAssistantSpeaking(false);
        }
        return;
      }
      
      // Handle speech updates
      if (message.type === "speech-update") {
        if (message.role === "assistant") {
          setIsAssistantSpeaking(message.status === "started");
        }
        return;
      }
      
      // Handle transcripts
      if (message.type === "transcript") {
        if (message.transcriptType === "final" && message.transcript) {
          if (message.role === "user") {
            addMessage('user', message.transcript);
          } else if (message.role === "assistant") {
            addMessage('assistant', message.transcript);
          }
        }
      } else if (message.type === "assistant-message") {
        if (message.message) {
          addMessage('assistant', message.message);
        }
      }
    });

    vapi.on("error", (error) => {
      console.error("VAPI Lumi Error:", error);
      setIsConnected(false);
      setIsLoading(false);
      setIsListening(false);
      setIsAssistantSpeaking(false);
      if (error.errorMsg && !error.errorMsg.includes('ended') && !error.errorMsg.includes('customer-ended-call')) {
        addMessage('error', `Error: ${error.errorMsg}`);
      }
    });

    return () => {
      console.log('Cleaning up Lumi VAPI event listeners...');
      try {
        vapi.removeAllListeners();
        if (isConnected) {
          vapi.stop();
        }
      } catch (error) {
        console.error('Error during Lumi VAPI cleanup:', error);
      }
      vapiInitialized.current = false;
    };
  }, [isConnected]);

  const addMessage = (type, text) => {
    const message = {
      id: `lumi-msg-${Date.now()}-${Math.random()}`,
      type,
      text,
      timestamp: new Date()
    };
    setMessages(prev => {
      // Check if this exact message already exists to prevent duplicates
      const isDuplicate = prev.some(existingMsg => 
        existingMsg.text === text && 
        existingMsg.type === type && 
        Math.abs(existingMsg.timestamp - message.timestamp) < 1000 // Within 1 second
      );
      
      if (isDuplicate) {
        console.log('Preventing duplicate Lumi message:', text);
        return prev;
      }
      
      return [...prev, message];
    });
  };

  const startVoiceCall = async () => {
    if (!microphoneSupported) {
      return;
    }

    try {
      console.log("Starting VAPI call...");
      setIsLoading(true);
      
      // Generate enhanced system context with employee data
      let systemContext = 'You are Lumi, the Lumiere Insurance voice assistant. Lumiere is a digital-first insurance company with A+ rating, offering life and auto coverage. You assist with claims (submit, track, process), policies (view, manage, renew), account settings (password, profile, 2FA), dashboard navigation, and support contact. Provide helpful, specific information about Lumiere\'s systems, features, and procedures. Keep responses concise but informative and friendly.\n\nIMPORTANT: Never pronounce technical IDs like "VC000005" or "LG0001". Instead, speak naturally: "your auto insurance claim number 5" or "your group life insurance policy". Use friendly language and be conversational.';
      
      if (employeeContext) {
        const contextString = contextService.current.generateContextString(employeeContext);
        systemContext += `\n\n${contextString}`;
        console.log(systemContext);
        console.log('Enhanced system context with employee data');
      } else {
        console.log('No employee context available, using basic system prompt');
      }
      
      const config = {
        model: {
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'system',
            content: systemContext
          }],
          temperature: 0.7,
          maxTokens: 200
        },
        voice: {
          provider: 'playht',
          voiceId: 'jennifer'
        },
        firstMessage: employeeContext && employeeContext.employee ? 
          `Hello ${employeeContext.employee.profile?.profile?.firstName || ''}! I'm Lumi, your Lumiere Insurance assistant. I can see you have ${employeeContext.employee.claims?.summary?.total || 0} claims and ${employeeContext.employee.policies?.summary?.total || 0} policies. How can I help you today?` :
          "Hello! I'm Lumi, your Lumiere Insurance assistant. I have access to your current account information and can help you with your specific claims, policies, and more. How can I help you today?",
        maxDurationSeconds: 600,
        backgroundSound: 'off'
      };

      await vapi.start(config);
      console.log("VAPI call started successfully");
      
      // Fallback timeout
      setTimeout(() => {
        if (isLoading && !isConnected) {
          console.log("Call-start timeout, assuming active");
          setIsConnected(true);
          setIsLoading(false);
        }
      }, 3000);
      
    } catch (err) {
      console.error("Failed to start VAPI call:", err);
      setIsLoading(false);
      addMessage('error', 'Failed to start voice assistant. Please try again.');
    }
  };

  const stopVoiceCall = () => {
    console.log("Stopping VAPI call...");
    setIsLoading(true);
    try {
      vapi.stop();
    } catch (err) {
      console.error("Error stopping call:", err);
    }
    
    // Force state reset after a short delay to ensure cleanup
    setTimeout(() => {
      setIsConnected(false);
      setIsLoading(false);
      setIsListening(false);
      setIsAssistantSpeaking(false);
    }, 1000);
  };

  const sendTextMessage = async (messageText) => {
    if (!messageText.trim()) return;
    
    addMessage('user', messageText);
    
    // For text mode, we'll generate enhanced responses using employee context
    setTimeout(() => {
      const response = generateLumiereResponse(messageText, employeeContext);
      addMessage('assistant', response);
    }, 1000);
  };

  const generateLumiereResponse = (query, context) => {
    const lowerQuery = query.toLowerCase();
    
    // Enhanced responses with context awareness
    if (context && context.employee) {
      const { profile, claims, policies, notifications } = context.employee;
      
      // Context-aware responses for claims
      if (lowerQuery.includes('my claim') || (lowerQuery.includes('claim') && lowerQuery.includes('status'))) {
        if (claims.summary.total > 0) {
          const recentClaim = claims.summary.recent[0];
          if (recentClaim) {
            return `Your most recent claim (${recentClaim.claimId}) is a ${recentClaim.type} claim with status: ${recentClaim.status}. You have ${claims.summary.total} total claims. Would you like me to provide more details about any specific claim?`;
          }
        }
        return "I don't see any claims in your account yet. Would you like help submitting a new claim?";
      }
      
      if (lowerQuery.includes('my polic') || (lowerQuery.includes('policy') && (lowerQuery.includes('details') || lowerQuery.includes('information')))) {
        if (policies.summary.total > 0) {
          const activePolicies = policies.summary.active;
          if (activePolicies.length > 0) {
            const policyList = activePolicies.map(p => `${p.policyId} (${p.type})`).join(', ');
            return `You have ${policies.summary.total} policies, with ${activePolicies.length} currently active: ${policyList}. Would you like details about any specific policy?`;
          }
        }
        return "I don't see any active policies in your account. Please contact your insurance agent for policy setup.";
      }
      
      if (lowerQuery.includes('notification') || lowerQuery.includes('alert')) {
        if (notifications.summary.unread > 0) {
          return `You have ${notifications.summary.unread} unread notifications. Recent ones include: ${notifications.summary.recent.map(n => n.title).join(', ')}. Would you like me to help you review them?`;
        }
        return "You're all caught up! No unread notifications at the moment.";
      }
      
      if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('help')) {
        const firstName = profile?.profile?.firstName || 'there';
        let greeting = `Hi ${firstName}! I'm Lumi, and I have access to your account information. `;
        
        const highlights = [];
        if (claims.summary.total > 0) highlights.push(`${claims.summary.total} claims`);
        if (policies.summary.total > 0) highlights.push(`${policies.summary.total} policies`);
        if (notifications.summary.unread > 0) highlights.push(`${notifications.summary.unread} unread notifications`);
        
        if (highlights.length > 0) {
          greeting += `I can see you have ${highlights.join(', ')}. `;
        }
        
        greeting += `How can I help you today?`;
        return greeting;
      }
    }
    
    // Fallback to standard responses for non-context queries
    if (lowerQuery.includes('claim') && (lowerQuery.includes('submit') || lowerQuery.includes('file') || lowerQuery.includes('new'))) {
      return "To submit a new claim: 1) Go to the 'Claims' section in your dashboard, 2) Click 'Submit New Claim', 3) Select claim type (Auto/Life), 4) Fill in incident details and date, 5) Upload supporting documents, 6) Review and submit. You'll receive a claim number for tracking.";
    }
    
    if (lowerQuery.includes('claim') && (lowerQuery.includes('track') || lowerQuery.includes('status') || lowerQuery.includes('check'))) {
      return "To track your claim status: Visit the 'Claims' section in your dashboard where you'll see all your claims with current status (Submitted, Under Review, Approved, Paid). Click on any claim for detailed updates and next steps.";
    }
    
    if (lowerQuery.includes('policy') && (lowerQuery.includes('view') || lowerQuery.includes('details') || lowerQuery.includes('information'))) {
      return "To view your policy details: Go to the 'Policies' section in your dashboard. Here you'll find all your active policies with coverage details, premium amounts, deductibles, and renewal dates. Click on any policy for complete terms and conditions.";
    }
    
    if (lowerQuery.includes('policy') && (lowerQuery.includes('renew') || lowerQuery.includes('renewal'))) {
      return "For policy renewal: Lumiere automatically sends renewal notices 30 days before expiration. You can renew online through the 'Policies' section by clicking 'Renew Policy' next to the expiring policy. You can also update coverage during renewal.";
    }
    
    if (lowerQuery.includes('password') || lowerQuery.includes('login') || lowerQuery.includes('account') && lowerQuery.includes('access')) {
      return "For account access issues: 1) Use 'Forgot Password' on the login page to reset your password, 2) Check your email for reset instructions, 3) If you still can't access your account, contact our support team. For security, you can also enable two-factor authentication in account settings.";
    }
    
    if (lowerQuery.includes('premium') || lowerQuery.includes('payment') || lowerQuery.includes('billing')) {
      return "For premium payments: You can view and pay premiums in the 'Billing' section. We accept automatic payments, credit/debit cards, and bank transfers. Set up auto-pay to never miss a payment and potentially get a discount!";
    }
    
    if (lowerQuery.includes('document') || lowerQuery.includes('upload') || lowerQuery.includes('proof')) {
      return "To upload documents: Use the 'Documents' section to upload policy documents, claim supporting evidence, or identification. Accepted formats are PDF, JPG, PNG. For claims, upload photos of damage, police reports, medical records, or receipts as applicable.";
    }
    
    if (lowerQuery.includes('contact') || lowerQuery.includes('support') || lowerQuery.includes('help')) {
      return "To contact support: You can reach us through the 'Contact' section, live chat (bottom right corner), phone at 1-800-LUMIERE, or email support@lumiere.com. Our team is available 24/7 for claims emergencies and 9AM-6PM for general inquiries.";
    }
    
    if (lowerQuery.includes('dashboard') || lowerQuery.includes('navigate') || lowerQuery.includes('menu')) {
      return "Your dashboard includes: 'Overview' (quick summary), 'Claims' (submit/track claims), 'Policies' (view/manage coverage), 'Documents' (upload/view files), 'Billing' (payments/statements), 'Messaging' (communication), and 'Account Settings' (personal info/preferences).";
    }
    
    if (lowerQuery.includes('coverage') || lowerQuery.includes('what') && lowerQuery.includes('covered')) {
      return "Your coverage details are available in the 'Policies' section. For auto insurance, this typically includes liability, collision, comprehensive, and personal injury. For life insurance, it includes death benefit and any riders. Check your specific policy documents for exact coverage limits and exclusions.";
    }
    
    if (lowerQuery.includes('deductible')) {
      return "Your deductible information is shown in your policy details under the 'Policies' section. This is the amount you pay out-of-pocket before insurance coverage kicks in. Lower deductibles mean higher premiums, and vice versa. You can often adjust deductibles during policy renewal.";
    }
    
    if (lowerQuery.includes('emergency') || lowerQuery.includes('accident') || lowerQuery.includes('urgent')) {
      return "For emergencies: 1) Ensure everyone's safety first, 2) Call emergency services if needed, 3) For auto accidents, call our 24/7 claims hotline at 1-800-LUMIERE, 4) Take photos and gather information, 5) Don't admit fault. Our emergency team will guide you through next steps.";
    }
    
    // Default helpful response
    return "I'm Lumi, your Lumiere Insurance assistant! I can help you with claims (submit, track), policies (view, renew), payments, document uploads, account settings, and general navigation. What specific assistance do you need today?";
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (currentMessage.trim()) {
      sendTextMessage(currentMessage);
      setCurrentMessage('');
    }
  };

  const refreshContext = async () => {
    try {
      setContextLoading(true);
      console.log('Manually refreshing employee context...');
      
      // Refresh the token in case it was updated
      contextService.current.refreshToken();
      
      const context = await contextService.current.getComprehensiveEmployeeContext();
      setEmployeeContext(context);
      console.log('Employee context refreshed:', context);
      
      if (context && context.employee) {
        addMessage('system', `Context refreshed! Found ${context.employee.claims.summary.total} claims and ${context.employee.policies.summary.total} policies.`);
      } else {
        addMessage('system', 'Context refresh completed, but no data was found.');
      }
    } catch (error) {
      console.error('Failed to refresh context:', error);
      addMessage('error', `Failed to refresh context: ${error.message}`);
    } finally {
      setContextLoading(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Don't render if microphone not supported
  if (!microphoneSupported) {
    return null;
  }

  // Determine widget appearance based on state
  const getStatusIcon = () => {
    if (isLoading) return "🔄";
    if (isConnected && isListening) return "🎙️";
    if (isConnected && isAssistantSpeaking) return "🔊";
    if (isConnected) return "✅";
    return "💬";
  };

  const getStatusText = () => {
    if (isLoading && !isConnected) return "Connecting...";
    if (isLoading && isConnected) return "Disconnecting...";
    if (isConnected && isListening) return "Listening...";
    if (isConnected && isAssistantSpeaking) return "Speaking...";
    if (isConnected) return "Connected";
    return "Lumi Assistant";
  };

  return (
    <div className={`lumi-assistant ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Header / Toggle Button */}
      <div className="assistant-header" onClick={toggleExpand}>
        <div className="lumi-avatar">
          <div className="avatar-placeholder">
            <span className="avatar-initial">L</span>
          </div>
        </div>
        <div className="lumi-info">
          <span className="lumi-name">Lumi</span>
          <span className="lumi-status">{getStatusText()}</span>
        </div>
        <div className="expand-toggle">
          {isExpanded ? '🔽' : '🔼'}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="assistant-content">
          {/* Voice Controls */}
          <div className="voice-controls">
            <div className="control-buttons">
              {!isConnected ? (
                <button 
                  onClick={startVoiceCall} 
                  disabled={isLoading}
                  className="voice-button start"
                >
                  {isLoading ? "Connecting..." : "🎤 Start Voice Mode"}
                </button>
              ) : (
                <button 
                  onClick={stopVoiceCall} 
                  disabled={isLoading}
                  className="voice-button stop"
                >
                  {isLoading ? "Disconnecting..." : "🛑 Stop Voice Mode"}
                </button>
              )}
              
              {/* <button 
                onClick={refreshContext} 
                disabled={contextLoading}
                className="voice-button refresh"
                title="Refresh employee context"
              >
                {contextLoading ? "🔄 Refreshing..." : "🔄 Refresh Context"}
              </button> */}
            </div>
            
            {contextLoading && (
              <div className="context-status">
                <span>Loading your account information...</span>
              </div>
            )}
            
            {/* {employeeContext && (
              <div className="context-status success">
                <span>✅ Account context loaded ({employeeContext.employee.claims.summary.total} claims, {employeeContext.employee.policies.summary.total} policies)</span>
              </div>
            )} */}
          </div>

          {/* Messages */}
          <div className="messages-container">
            {messages.length === 0 && (
              <div className="welcome-message">
                <p>👋 Hi! I'm Lumi, your Lumiere Insurance assistant.</p>
                {contextLoading ? (
                  <p>🔄 Loading your account information to provide personalized assistance...</p>
                ) : employeeContext ? (
                  <p>✅ I have access to your current account details and can help with your specific claims, policies, notifications, and more!</p>
                ) : (
                  <p>⚠️ I'm running in basic mode. Click "Refresh Context" above to load your account information for personalized assistance.</p>
                )}
                <p>You can use voice mode or type questions below.</p>
              </div>
            )}
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                <div className="message-content">
                  <p>{message.text}</p>
                  <span className="timestamp">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Text Input */}
          <form onSubmit={handleSendMessage} className="message-input-form">
            <div className="input-container">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask me about your insurance..."
                className="message-input"
              />
              <button
                type="submit"
                disabled={!currentMessage.trim()}
                className="send-button"
                title="Send message"
              >
                📤
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FloatingVoiceAssistant;