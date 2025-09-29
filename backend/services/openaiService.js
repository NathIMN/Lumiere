import OpenAI from 'openai';

class OpenAIService {
  constructor() {
    this.openai = null;
    this.initializeOpenAI();
  }

  async initializeOpenAI() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY not found - AI features will be disabled");
      return;
    }

    try {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log("OpenAI service initialized successfully");
    } catch (error) {
      console.error("Failed to initialize OpenAI service:", error.message);
      this.openai = null;
    }
  }

  async generateResponse(userMessage) {
    try {
      if (!this.openai) {
        throw new Error("OpenAI service not available");
      }

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant for the Lumiere Insurance system. Provide clear, professional responses about insurance policies, claims, and general business inquiries."
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw new Error("Failed to generate AI response");
    }
  }

  async generateStreamResponse(userMessage) {
    try {
      if (!this.openai) {
        throw new Error("OpenAI service not available");
      }

      const stream = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant for the Lumiere Insurance system. Provide clear, professional responses about insurance policies, claims, and general business inquiries."
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: true,
      });

      return stream;
    } catch (error) {
      console.error("OpenAI Stream API Error:", error);
      throw new Error("Failed to generate AI response stream");
    }
  }

  async formalizeMessage(userMessage) {
    try {
      // Check if service is available
      if (!this.openai) {
        console.warn("OpenAI service not available, returning original message");
        return userMessage;
      }

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are helping users in the Lumiere Insurance system communicate professionally. The system has employees, HR officers, insurance agents, and administrators who need to communicate about insurance policies, claims, reports, and other business matters.

Please rewrite messages in a formal, professional tone suitable for business communication within an insurance company environment. Make them clear, brief, polite, and appropriate for internal company messaging between different departments and roles.

These are messages meant for direct messaging, not emails - simple text messages for real-time chat.

IMPORTANT: Do NOT include any placeholders like [Name], [Project], [Date], [Department] etc. Create a complete, ready-to-send message that can be used directly without any additional information needed. Use generic terms instead of placeholders if needed.

Only return the formalized message, nothing else.`
          },
          {
            role: "user",
            content: `Please formalize this message: "${userMessage}"`
          }
        ],
        max_tokens: 150,
        temperature: 0.3, // Lower temperature for more consistent, professional outputs
      });

      const formalizedText = completion.choices[0].message.content?.trim();
      
      // Return the formatted text or fallback to original message
      return formalizedText && formalizedText.length > 0 ? formalizedText : userMessage;
    } catch (error) {
      console.error("OpenAI Formalize API Error:", error);
      
      // Return original message as fallback instead of throwing
      console.warn("AI formalization failed, returning original message");
      return userMessage;
    }
  }
}

export default new OpenAIService();