import React, { useState, useEffect, useRef } from 'react';
import Vapi from "@vapi-ai/web";
import './MobileVoiceAssistant.css';

// Initialize VAPI with your public key
const vapi = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_API_KEY || "YOUR_PUBLIC_API_KEY");

const MobileVoiceAssistant = () => {
  const [callStatus, setCallStatus] = useState("inactive");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [microphoneSupported, setMicrophoneSupported] = useState(true);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check microphone support on mount
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
        console.log('Microphone not supported:', err);
        setMicrophoneSupported(false);
      }
    };
    
    checkMicSupport();
  }, []);

  // Initialize VAPI event listeners
  useEffect(() => {
    vapi.on("call-start", () => {
      setCallStatus("active");
      setIsListening(true);
      setError(null);
      addMessage("assistant", "Hi! I'm your Lumiere Insurance assistant. I can help with claims, policies, account settings, and system navigation. What do you need help with?");
    });

    vapi.on("call-end", () => {
      setCallStatus("inactive");
      setIsListening(false);
    });

    vapi.on("speech-start", () => {
      setIsListening(true);
    });

    vapi.on("speech-end", () => {
      setIsListening(false);
    });

    vapi.on("message", (message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        addMessage("user", message.transcript);
        handleUserQuery(message.transcript);
      } else if (message.type === "assistant-message") {
        addMessage("assistant", message.content);
      }
    });

    vapi.on("error", (error) => {
      console.error("VAPI Error:", error);
      setError("Voice connection failed. Please try text mode.");
      setCallStatus("inactive");
      setIsListening(false);
    });

    return () => {
      vapi.removeAllListeners();
    };
  }, []);

  // Comprehensive system responses with detailed Lumiere Insurance context
  const hardcodedResponses = {
    // Claims Management
    "submit claim": "To submit a claim in Lumiere's system: 1) Log into your dashboard at lumiere.com, 2) Navigate to Claims → New Claim, 3) Select claim type (Life or Vehicle), 4) Complete the digital form with incident details, 5) Upload required documents using your phone's camera. Our AI will pre-validate your submission. Claims are processed within 5-10 business days with real-time updates via notifications.",
    
    "claim status": "Check your claim status in real-time through your dashboard Claims section. Lumiere's system provides live updates including: claim received, under review, additional documents needed, approved/denied, and payment processed. You'll also receive SMS and email notifications at each stage. Agents can view individual coverage approvals for complex claims.",
    
    "claim documents": "For Lumiere claims, you need: 1) Completed claim form (auto-filled from your profile), 2) Incident documentation (photos, police reports, medical records), 3) Policy number (auto-populated), 4) Supporting receipts or estimates. Our system accepts JPG, PNG, PDF formats up to 10MB per file. Use your phone camera for quick uploads with automatic image enhancement.",
    
    "claim processing": "Lumiere's claim processing workflow: 1) Auto-validation checks (2 hours), 2) Agent assignment based on claim type and complexity, 3) Document review (24-48 hours), 4) Coverage verification against your policy limits, 5) Approval decision with detailed breakdown, 6) Payment initiation (ACH transfer 1-3 days). Complex claims may require additional review by senior agents.",
    
    "claim denial": "If your Lumiere claim is denied: 1) You'll receive detailed explanation with policy references, 2) Review the specific coverage exclusions cited, 3) Submit additional documentation if available, 4) Request supervisor review through your dashboard, 5) Contact our claims department at 1-800-LUMIERE-CLAIMS, 6) File formal appeal within 30 days. Most denials are due to incomplete documentation.",
    
    // Policy Management
    "view policy": "Access your Lumiere policies through Dashboard → Policies. Here you'll find: 1) Active policies with coverage amounts, 2) Premium payment history and next due date, 3) Policy documents (PDF download), 4) Coverage details including deductibles and limits, 5) Beneficiary information, 6) Renewal dates and automatic renewal settings. Swipe cards to see quick details or tap for full view.",
    
    "coverage": "Lumiere offers comprehensive coverage: LIFE INSURANCE: Term life, whole life, and universal life with coverage up to $1M. Includes accidental death, disability riders. VEHICLE INSURANCE: Liability, collision, comprehensive, uninsured motorist protection. Additional options: rental car, roadside assistance, glass coverage. All policies include 24/7 emergency support.",
    
    "policy renewal": "Lumiere policies auto-renew unless you opt out. 60 days before expiration: 1) Review notice sent via email/SMS, 2) Updated premium calculations based on claims history, 3) Coverage adjustment options presented, 4) Confirm or modify through dashboard, 5) Payment processed automatically from saved method. Manual renewal available with 30-day grace period.",
    
    "premium payment": "Pay Lumiere premiums via: 1) Auto-pay from bank account (2% discount), 2) Credit/debit card through dashboard, 3) Mobile app payment, 4) Phone payment at 1-800-LUMIERE-PAY, 5) Check mailed to processing center. Late payments incur $25 fee after 10-day grace period. Payment plans available for annual premiums over $500.",
    
    // Account Management
    "reset password": "Reset your Lumiere account password: 1) Go to lumiere.com/auth, 2) Click 'Forgot Password', 3) Enter your registered email, 4) Check email (including spam folder), 5) Click secure reset link (expires in 1 hour), 6) Create new password (8+ chars, mixed case, numbers, symbols), 7) Enable two-factor authentication for enhanced security.",
    
    "update information": "Update your Lumiere profile: Dashboard → Account Settings. Modify: personal information, contact details, banking info, beneficiaries, notification preferences. Important: Address changes may affect policy rates. Beneficiary updates require identity verification. Bank account changes have 3-day security hold before taking effect.",
    
    "two factor authentication": "Enable 2FA for Lumiere account security: 1) Go to Account Settings → Security, 2) Choose SMS or authenticator app (Google Authenticator, Authy), 3) Verify phone number or scan QR code, 4) Enter verification code, 5) Save backup codes securely. 2FA is required for policy changes over $10,000 and all beneficiary modifications.",
    
    "profile verification": "Lumiere requires profile verification for: 1) New accounts (driver's license + utility bill), 2) Major policy changes, 3) Beneficiary additions, 4) Claims over $5,000. Upload documents through secure portal. Verification typically takes 24-48 hours. Automated ID verification available for most documents.",
    
    // System Navigation
    "dashboard navigation": "Lumiere dashboard sections: 1) OVERVIEW: Quick stats, recent activity, notifications, 2) CLAIMS: Submit, track, view history, 3) POLICIES: View coverage, download documents, manage beneficiaries, 4) MESSAGES: Secure communication with agents and support, 5) ACCOUNT: Personal settings, payment methods, security. Mobile app mirrors web functionality.",
    
    "notifications": "Lumiere's notification system: 1) Real-time dashboard alerts, 2) Email summaries (daily/weekly), 3) SMS for urgent matters, 4) Push notifications via mobile app, 5) Secure in-app messaging. Customize frequency in Account Settings. Important notices (policy changes, payment due) always sent via multiple channels.",
    
    "browser support": "Lumiere dashboard works best on: Chrome, Firefox, Safari, Edge (latest versions). Mobile browsers: iOS Safari 14+, Android Chrome 90+. Features requiring camera access need permission approval. Clear cache if experiencing issues. Internet Explorer not supported - please upgrade for security.",
    
    // Support & Contact
    "contact support": "Lumiere support channels: 1) Live chat in dashboard (business hours), 2) Phone: 1-800-LUMIERE (Mon-Fri 8AM-8PM, Sat 9AM-5PM ET), 3) Email: support@lumiere.com (24-hour response), 4) Secure messaging via dashboard, 5) Emergency claims: 1-800-LUMIERE-911 (24/7). Average wait times: chat 2 minutes, phone 5 minutes.",
    
    "live chat": "Access Lumiere live chat: 1) Look for chat bubble icon in dashboard bottom-right, 2) Available during business hours (Mon-Fri 8AM-8PM, Sat 9AM-5PM ET), 3) Instantly connected to trained representatives, 4) Chat history saved in your dashboard, 5) Can escalate to phone call if needed. After-hours messages answered next business day.",
    
    "emergency support": "Lumiere 24/7 emergency support: 1) Accidents: Call 1-800-LUMIERE-911, 2) Theft/vandalism: Report within 24 hours, 3) Medical emergencies: Contact emergency services first, then Lumiere, 4) Natural disasters: Priority claim processing activated, 5) Death benefits: Call dedicated line 1-800-LUMIERE-LIFE. Emergency claims processed within 4 hours.",
    
    "complaint resolution": "File complaints with Lumiere: 1) Start with your assigned agent via dashboard messaging, 2) Escalate to supervisor through Account Settings, 3) Formal complaint form available in Help section, 4) External: State insurance department, 5) Ombudsman services available. We aim to resolve 95% of issues within 48 hours.",
    
    // Business Information
    "business hours": "Lumiere business hours: CUSTOMER SERVICE: Mon-Fri 8AM-8PM, Sat 9AM-5PM Eastern. CLAIMS DEPARTMENT: Mon-Fri 7AM-9PM, Sat-Sun 8AM-6PM. EMERGENCY CLAIMS: 24/7/365. LIVE CHAT: Business hours only. EMAIL SUPPORT: 24-hour response time. Holiday hours may vary - check website for updates.",
    
    "company info": "Lumiere Insurance: Founded 2020, licensed in all 50 states. A+ rating from AM Best, 4.8/5 customer satisfaction. Specializing in digital-first life and auto insurance. Over 100,000 customers served. Headquarters: New York, NY. Committed to transparent pricing, fast claims, and exceptional customer service through technology innovation.",
    
    "mobile app": "Lumiere mobile app features: 1) Complete policy management, 2) Photo claim submission with AI validation, 3) Digital ID cards, 4) Push notifications, 5) Offline document access, 6) Emergency roadside assistance, 7) Find local repair shops. Download: 'Lumiere Insurance' in App Store/Google Play. 4.9-star rating with 50,000+ downloads.",
    
    // Additional Features
    "roadside assistance": "Lumiere roadside assistance (included with auto policies): 1) 24/7 availability via app or phone, 2) Towing up to 15 miles, 3) Jump start, flat tire change, lockout service, 4) Emergency fuel delivery, 5) Average arrival time 30 minutes. GPS location sharing for faster service. No limit on usage per year.",
    
    "documents": "Access Lumiere documents: Dashboard → Documents section. Available: 1) Policy certificates (PDF download), 2) Claims history reports, 3) Payment receipts, 4) Tax documents (1099s), 5) Coverage summaries. Documents stored securely for 7 years. Email copies available. Mobile app provides offline access to recent documents.",
    
    "payment history": "View Lumiere payment history: Dashboard → Account → Billing. Shows: 1) All premium payments with dates, 2) Payment methods used, 3) Late fees or adjustments, 4) Refunds processed, 5) Upcoming due dates. Export to PDF or CSV. Set up payment reminders to avoid late fees.",
    
    "agent assignment": "Lumiere agent system: 1) Personal agent assigned based on location and policy type, 2) Direct messaging through dashboard, 3) Phone access during business hours, 4) Specialized agents for complex claims, 5) Supervisors available for escalations. Agent changes possible if needed for service improvement."
  };

  const addMessage = (type, text) => {
    const message = {
      id: `msg-${Date.now()}`,
      type,
      text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, message]);
  };

  const handleUserQuery = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Default response with more specific guidance
    let response = "I can help you with: claims (submit, status, documents), policies (view, coverage, renewal), account help (password, updates, 2FA), support contact, emergency procedures, mobile app, and system navigation. What specific question do you have?";
    
    // Enhanced keyword matching with more intelligent scoring
    let bestMatch = "";
    let highestScore = 0;
    
    // Check each response key and calculate relevance score
    for (const [key, value] of Object.entries(hardcodedResponses)) {
      let score = 0;
      const keywords = key.split(' ');
      
      // Direct keyword matches
      keywords.forEach(keyword => {
        if (lowerQuery.includes(keyword)) {
          score += 2;
        }
      });
      
      // Partial matches and synonyms
      if (key.includes('claim') && (lowerQuery.includes('file') || lowerQuery.includes('report') || lowerQuery.includes('incident'))) score += 1;
      if (key.includes('policy') && (lowerQuery.includes('insurance') || lowerQuery.includes('plan'))) score += 1;
      if (key.includes('password') && (lowerQuery.includes('login') || lowerQuery.includes('access') || lowerQuery.includes('account'))) score += 1;
      if (key.includes('support') && (lowerQuery.includes('help') || lowerQuery.includes('contact') || lowerQuery.includes('phone'))) score += 1;
      if (key.includes('documents') && (lowerQuery.includes('download') || lowerQuery.includes('pdf') || lowerQuery.includes('file'))) score += 1;
      if (key.includes('emergency') && (lowerQuery.includes('urgent') || lowerQuery.includes('accident') || lowerQuery.includes('911'))) score += 1;
      
      // Context-aware matching
      if (lowerQuery.includes('how') && key.includes('submit')) score += 1;
      if (lowerQuery.includes('what') && key.includes('coverage')) score += 1;
      if (lowerQuery.includes('when') && key.includes('hours')) score += 1;
      if (lowerQuery.includes('where') && key.includes('dashboard')) score += 1;
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = value;
      }
    }
    
    if (bestMatch && highestScore >= 2) {
      response = bestMatch;
    }
    
    setTimeout(() => {
      addMessage("assistant", response);
    }, 500);
  };

  const startVoiceCall = async () => {
    if (!microphoneSupported) {
      setError("Microphone not available. Please use text mode below.");
      return;
    }

    try {
      setCallStatus("loading");
      setError(null);

      const mobileConfig = {
        model: {
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'system',
            content: 'You are the official Lumiere Insurance voice assistant. Lumiere is a digital-first insurance company offering life and auto coverage with A+ AM Best rating. You help employees with claims (submission, tracking, documents), policies (viewing, coverage, renewals), account management (passwords, updates, 2FA), and support contact. Keep responses brief but informative, focusing on specific Lumiere system features like dashboard navigation, real-time claim tracking, and 24/7 emergency support.'
          }],
          temperature: 0.7,
          maxTokens: 150
        },
        voice: {
          provider: 'playht',
          voiceId: 'jennifer'
        },
        firstMessage: "Hi! How can I help with your insurance today?",
        maxDurationSeconds: 300,
        backgroundSound: 'off'
      };

      await vapi.start(mobileConfig);
      
    } catch (err) {
      setError("Couldn't start voice mode. Please use text below.");
      setCallStatus("inactive");
    }
  };

  const stopVoiceCall = () => {
    setCallStatus("loading");
    vapi.stop();
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    
    addMessage("user", textInput);
    handleUserQuery(textInput);
    setTextInput('');
  };

  const quickQuestions = [
    "Submit claim",
    "Claim status", 
    "View policy",
    "Reset password",
    "Contact support",
    "Emergency claim",
    "Mobile app",
    "Live chat",
    "Coverage details",
    "Payment history",
    "Add beneficiary",
    "Business hours"
  ];

  return (
    <div className="mobile-voice-assistant">
      {/* Header */}
      <div className="mobile-header">
        <div className="header-content">
          <h1>🎤 Lumiere Assistant</h1>
          <p>Get instant insurance help</p>
        </div>
      </div>

      {/* Status Banner */}
      {error && (
        <div className="error-banner">
          <span>⚠️</span>
          <div>
            <p>{error}</p>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        </div>
      )}

      {/* Voice Controls */}
      <div className="voice-controls">
        {callStatus === "inactive" && (
          <button 
            onClick={startVoiceCall} 
            className="voice-button start"
            disabled={!microphoneSupported}
          >
            <span className="mic-icon">🎤</span>
            <div>
              <div className="button-text">Start Voice Chat</div>
              {!microphoneSupported && <div className="button-subtext">Not available</div>}
            </div>
          </button>
        )}

        {callStatus === "loading" && (
          <div className="loading-state">
            <div className="spinner"></div>
            <span>Connecting...</span>
          </div>
        )}

        {callStatus === "active" && (
          <div className="active-call">
            <button onClick={stopVoiceCall} className="voice-button stop">
              <span>🛑</span>
              <div className="button-text">End Call</div>
            </button>
            {isListening && (
              <div className="listening-indicator">
                <div className="pulse"></div>
                <span>Listening...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h3>👋 Welcome to Lumiere!</h3>
            <p>I'm your digital insurance assistant. Ask me about claims, policies, account help, or system navigation.</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                <div className="message-bubble">
                  <p>{message.text}</p>
                  <span className="timestamp">
                    {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Quick Questions */}
      <div className="quick-questions">
        <p>Quick questions:</p>
        <div className="questions-grid">
          {quickQuestions.map((question) => (
            <button
              key={question}
              onClick={() => setTextInput(question)}
              className="quick-button"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Text Input */}
      <div className="text-input-container">
        <form onSubmit={handleTextSubmit} className="text-form">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type your question..."
            className="text-input"
          />
          <button 
            type="submit" 
            disabled={!textInput.trim()}
            className="send-button"
          >
            📤
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="mobile-footer">
        <p>Need immediate help? Call <a href="tel:1-800-LUMIERE">1-800-LUMIERE</a></p>
      </div>
    </div>
  );
};

export default MobileVoiceAssistant;