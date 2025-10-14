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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  useEffect(() => {
    if (vapiInitialized.current) {
      console.log('Lumi VAPI already initialized, skipping...');
      return;
    }
    
    console.log('Initializing Lumi VAPI event listeners...');
    vapiInitialized.current = true;
    
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
      
      if (message.type === "status-update") {
        if (message.status === "ended") {
          setIsConnected(false);
          setIsLoading(false);
          setIsListening(false);
          setIsAssistantSpeaking(false);
        }
        return;
      }
      
      if (message.type === "speech-update") {
        if (message.role === "assistant") {
          setIsAssistantSpeaking(message.status === "started");
        }
        return;
      }
      
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
      const isDuplicate = prev.some(existingMsg => 
        existingMsg.text === text && 
        existingMsg.type === type && 
        Math.abs(existingMsg.timestamp - message.timestamp) < 1000
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
      
      let systemContext = 'You are Lumi, the Lumiere Insurance voice assistant. Lumiere is a digital-first insurance company with A+ rating, offering life and auto coverage in Sri Lanka. You assist with claims (submit, track, process), policies (view, manage, renew), account settings (password, profile, 2FA), dashboard navigation, and support contact. Provide helpful, specific information about Lumiere\'s systems, features, and procedures. Keep responses concise but informative and friendly.\n\nIMPORTANT PRONUNCIATION RULES:\n1. Never pronounce technical IDs like "VC000005" or "LG0001". Instead, speak naturally: "your auto insurance claim number 5" or "your group life insurance policy".\n2. CURRENCY: All amounts are in Sri Lankan Rupees (LKR). When stating amounts:\n   - For amounts like 50000, say "fifty thousand rupees" (NOT "dollar" or "Rs")\n   - For amounts like 150000, say "one hundred and fifty thousand rupees" or "one lakh fifty thousand rupees"\n   - For amounts like 1000000, say "one million rupees" or "ten lakhs rupees"\n   - Use lakhs naturally (1 lakh = 100,000 rupees) when appropriate for Sri Lankan context\n   - Never say "dollars", "USD", or "$" - always "rupees" or "LKR"\n3. Use friendly, conversational Sri Lankan English when appropriate.';
      
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
          model: 'gpt-4o-mini', // Better model for natural speech
          messages: [{
            role: 'system',
            content: systemContext
          }],
          temperature: 0.7,
          maxTokens: 250
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
    
    setTimeout(() => {
      const response = generateLumiereResponse(messageText, employeeContext);
      addMessage('assistant', response);
    }, 1000);
  };

  const generateLumiereResponse = (query, context) => {
    const lowerQuery = query.toLowerCase();
    
    if (context && context.employee) {
      const { profile, claims, policies, notifications } = context.employee;
      
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
      return "For premium payments: You can view and pay premiums in the 'Billing' section. We accept automatic payments, credit/debit cards, and bank transfers. Set up auto-pay to never miss a payment and potentially get a discount! All amounts are in Sri Lankan Rupees.";
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
    
    return "I'm Lumi, your Lumiere Insurance assistant! I can help you with claims (submit, track), policies (view, renew), payments, document uploads, account settings, and general navigation. What specific assistance do you need today?";
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (currentMessage.trim()) {
      sendTextMessage(currentMessage);
      setCurrentMessage('');
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!microphoneSupported) {
    return null;
  }

  const getStatusText = () => {
    if (isLoading && !isConnected) return "Connecting...";
    if (isLoading && isConnected) return "Disconnecting...";
    if (isConnected && isListening) return "Listening...";
    if (isConnected && isAssistantSpeaking) return "Speaking...";
    if (isConnected) return "Connected";
    return "Ask me anything";
  };

  const MicIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" x2="12" y1="19" y2="22"/>
    </svg>
  );

  const StopIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2"/>
    </svg>
  );

  const SendIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" x2="11" y1="2" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );

  const ChevronIcon = ({ isExpanded }) => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
    >
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );

  return (
    <div className={`lumi-assistant ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div 
        className={`assistant-header ${isListening ? 'listening' : ''} ${isAssistantSpeaking ? 'speaking' : ''}`} 
        onClick={toggleExpand}
      >
        <div className="lumi-avatar">
          <img 
            src="/chatbot.png" 
            alt="Lumi Assistant" 
            className="avatar-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="avatar-placeholder" style={{ display: 'none' }}>
            <span className="avatar-initial">L</span>
          </div>
        </div>
        <div className="lumi-info">
          <span className="lumi-name">Lumi</span>
          <span className="lumi-status">{getStatusText()}</span>
        </div>
        <div className="expand-toggle">
          <ChevronIcon isExpanded={isExpanded} />
        </div>
      </div>

      {isExpanded && (
        <div className="assistant-content">
          <div className="voice-controls">
            <div className="control-buttons">
              {!isConnected ? (
                <button 
                  onClick={startVoiceCall} 
                  disabled={isLoading}
                  className="voice-button start"
                >
                  <span className="icon"><MicIcon /></span>
                  <span style={{ marginLeft: '6px' }}>{isLoading ? "Connecting..." : "Start Voice"}</span>
                </button>
              ) : (
                <button 
                  onClick={stopVoiceCall} 
                  disabled={isLoading}
                  className="voice-button stop"
                >
                  <span className="icon"><StopIcon /></span>
                  <span style={{ marginLeft: '6px' }}>{isLoading ? "Disconnecting..." : "Stop Voice"}</span>
                </button>
              )}
            </div>
            
            {contextLoading && (
              <div className="context-status">
                Loading your account information...
              </div>
            )}
          </div>

          <div className="messages-container">
            {messages.length === 0 && (
              <div className="welcome-message">
                <p><strong>Welcome to Lumi!</strong></p>
                {contextLoading ? (
                  <p>Loading your account information to provide personalized assistance...</p>
                ) : employeeContext ? (
                  <p>I have access to your current account details and can help with your specific claims, policies, notifications, and more!</p>
                ) : (
                  <p>I'm here to assist you with all your Lumiere Insurance needs.</p>
                )}
                <p>You can use voice mode or type your questions below.</p>
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
                <SendIcon />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FloatingVoiceAssistant;