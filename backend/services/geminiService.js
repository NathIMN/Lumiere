import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Try multiple models in order of preference - using simpler names
    this.modelNames = [
      "gemini-1.5-flash-latest", 
      "gemini-1.5-flash", 
      "gemini-1.5-pro-latest",
      "gemini-1.5-pro", 
      "gemini-pro", 
      "gemini-1.0-pro"
    ];
    this.model = null;
    this.initializeModel();
  }

  async initializeModel() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not found - AI features will be disabled");
      return;
    }

    console.log("Initializing Gemini model...");

    // Simple approach: just try to create models without testing them upfront
    // We'll test them when actually used
    for (const modelName of this.modelNames) {
      try {
        console.log(`Setting up Gemini model: ${modelName}`);
        this.model = this.genAI.getGenerativeModel({ model: modelName });
        console.log(`Gemini model ${modelName} configured - will test on first use`);
        
        // Don't test here - testing during initialization causes issues
        // The model will be tested when actually used
        return; // Success - we have a model configured
      } catch (error) {
        console.warn(`Failed to configure model ${modelName}:`, error.message);
        this.model = null;
      }
    }

    console.error("Failed to configure any Gemini model - AI features will be disabled");
    this.model = null;
  }

  async generateResponse(userMessage) {
    try {
      if (!this.model) {
        throw new Error("Gemini model not available");
      }
      
      const result = await this.model.generateContent(userMessage);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to generate AI response");
    }
  }

  async generateStreamResponse(userMessage) {
    try {
      if (!this.model) {
        throw new Error("Gemini model not available");
      }
      
      const result = await this.model.generateContentStream(userMessage);
      return result.stream;
    } catch (error) {
      console.error("Gemini Stream API Error:", error);
      throw new Error("Failed to generate AI response stream");
    }
  }

  async formalizeMessage(userMessage) {
    try {
      // Check if model is available
      if (!this.model) {
        console.warn("Gemini model not available, returning original message");
        return userMessage;
      }

      const prompt = `You are helping users in the Lumiere Insurance system communicate professionally. The system has employees, HR officers, insurance agents, and administrators who need to communicate about insurance policies, claims, reports, and other business matters.

Please rewrite the following message in a formal, professional tone suitable for business communication within an insurance company environment. Make it clear, brief, polite, and appropriate for internal company messaging between different departments and roles.

These are messages meant for direct messaging, not emails or anything, simple text messages for a real time chat.

IMPORTANT: Do NOT include any placeholders like [Name], [Project], [Date], [Department] etc. Create a complete, ready-to-send message that can be used directly without any additional information needed. Use generic terms instead of placeholders if needed.

Original message: "${userMessage}"

Formal version:`;

      // Try the current model first
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Return the formatted text or fallback to original message
        return text && text.trim() ? text.trim() : userMessage;
      } catch (modelError) {
        console.warn("Current model failed, trying to reinitialize:", modelError.message);
        
        // Try to reinitialize with a different model
        await this.initializeModel();
        
        if (this.model) {
          try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            return text && text.trim() ? text.trim() : userMessage;
          } catch (retryError) {
            console.warn("Retry with new model also failed:", retryError.message);
          }
        }
        
        // If all else fails, return original message
        return userMessage;
      }
    } catch (error) {
      console.error("Gemini Formalize API Error:", error);
      
      // Return original message as fallback instead of throwing
      console.warn("AI formalization failed, returning original message");
      return userMessage;
    }
  }
}

export default new GeminiService();
