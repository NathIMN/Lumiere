import React, { useState, useEffect } from 'react';
import Vapi from "@vapi-ai/web";
import './FloatingVoiceAssistant.css';

const vapi = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_API_KEY || "YOUR_PUBLIC_API_KEY");

const FloatingVoiceAssistant = () => {
  const [callStatus, setCallStatus] = useState("inactive");
  const [microphoneSupported, setMicrophoneSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);

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

  // VAPI Event Listeners
  useEffect(() => {
    vapi.on("call-start", () => {
      console.log("VAPI Call started");
      setCallStatus("active");
      setIsListening(false);
    });

    vapi.on("call-end", () => {
      console.log("VAPI Call ended");
      setCallStatus("inactive");
      setIsListening(false);
    });

    vapi.on("speech-start", () => {
      console.log("User started speaking");
      setIsListening(true);
    });

    vapi.on("speech-end", () => {
      console.log("User stopped speaking");
      setIsListening(false);
    });

    vapi.on("error", (error) => {
      console.error("VAPI Error:", error);
      setCallStatus("inactive");
      setIsListening(false);
    });

    return () => {
      vapi.removeAllListeners();
    };
  }, []);

  const startVoiceCall = async () => {
    if (!microphoneSupported) {
      return;
    }

    try {
      console.log("Starting VAPI call...");
      setCallStatus("loading");
      
      const config = {
        model: {
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'system',
            content: 'You are the Lumiere Insurance voice assistant. Lumiere is a digital-first insurance company with A+ rating, offering life and auto coverage. You assist with claims (submit, track, process), policies (view, manage, renew), account settings (password, profile, 2FA), dashboard navigation, and support contact. Provide helpful, specific information about Lumiere\'s systems, features, and procedures. Keep responses concise but informative.'
          }],
          temperature: 0.7,
          maxTokens: 200
        },
        voice: {
          provider: 'playht',
          voiceId: 'jennifer'
        },
        firstMessage: "Hello! I'm your Lumiere Insurance assistant. How can I help you today?",
        maxDurationSeconds: 300,
        backgroundSound: 'off'
      };

      await vapi.start(config);
      console.log("VAPI call started successfully");
      
      // Fallback timeout
      setTimeout(() => {
        if (callStatus === "loading") {
          console.log("Call-start timeout, assuming active");
          setCallStatus("active");
        }
      }, 3000);
      
    } catch (err) {
      console.error("Failed to start VAPI call:", err);
      setCallStatus("inactive");
    }
  };

  const stopVoiceCall = () => {
    console.log("Stopping VAPI call...");
    try {
      vapi.stop();
    } catch (err) {
      console.error("Error stopping call:", err);
    }
    // Force state reset
    setTimeout(() => {
      setCallStatus("inactive");
      setIsListening(false);
    }, 500);
  };

  const handleClick = () => {
    if (callStatus === "inactive") {
      startVoiceCall();
    } else if (callStatus === "active" || callStatus === "loading") {
      stopVoiceCall();
    }
  };

  // Don't render if microphone not supported
  if (!microphoneSupported) {
    return null;
  }

  // Determine widget appearance based on state
  const getStatusIcon = () => {
    if (callStatus === "loading") return "🔄";
    if (callStatus === "active" && isListening) return "🎙️";
    if (callStatus === "active") return "🔊";
    return "🎤";
  };

  const getStatusText = () => {
    if (callStatus === "loading") return "Connecting...";
    if (callStatus === "active" && isListening) return "Listening";
    if (callStatus === "active") return "Connected";
    return "Voice Assistant";
  };

  return (
    <div 
      className={`lumi-assistant ${callStatus} ${isListening ? 'listening' : ''}`}
      onClick={handleClick}
      title={getStatusText()}
    >
      <div className="lumi-avatar">
        {/* Placeholder for Lumi's image/logo */}
        <div className="avatar-placeholder">
          <span className="avatar-initial">L</span>
        </div>
      </div>
      <div className="lumi-info">
        <span className="lumi-name">Lumi</span>
        <span className="lumi-status">{getStatusText()}</span>
      </div>
    </div>
  );
};

export default FloatingVoiceAssistant;