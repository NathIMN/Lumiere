import { GoogleGenAI } from "@google/genai";

/**
 * Google Gemini API Service for text formalization
 */
class GeminiApiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyBLY8xqKZ6uNRZQAoTCO4TRggTUl8tVoJw";
    
    if (!this.apiKey) {
      console.warn('Gemini API key not found. Text formalization will use fallback method.');
      this.genAI = null;
    } else {
      this.genAI = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  /**
   * Formalize casual text into professional business language
   * @param {string} casualText - The casual text to formalize
   * @returns {Promise<Object>} Formalized text result
   */
  async formalizeText(casualText) {
    try {
      if (!casualText || !casualText.trim()) {
        throw new Error("Text to formalize cannot be empty");
      }

      // If no API key, use fallback immediately
      if (!this.genAI) {
        return {
          success: false,
          original: casualText,
          formalized: this.basicFormalization(casualText),
          service: 'fallback',
          error: 'Gemini API not available'
        };
      }

      const prompt = `Please rewrite the following casual message into professional business language while maintaining the original meaning and intent. Make it appropriate for workplace communication. 
      Keep it concise but polite. Output the formalized text directly without quotes or any wrapper. do not include any placeholders. this message will be directly sent to someone.

Casual message: "${casualText.trim()}"

Instructions:
- Return only the formalized text without any explanations
- Maintain the original meaning and intent
- Use professional but friendly tone
- Keep it concise and clear
- Make it appropriate for business communication`;

      const response = await this.genAI.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt
      });

      const formalizedText = response.text.trim();

      return {
        success: true,
        original: casualText,
        formalized: formalizedText,
        service: 'gemini'
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Fallback to basic capitalization if API fails
      const fallbackText = this.basicFormalization(casualText);
      
      return {
        success: false,
        original: casualText,
        formalized: fallbackText,
        service: 'fallback',
        error: error.message
      };
    }
  }

  /**
   * Basic text formalization as fallback when API fails
   * @param {string} text - Text to formalize
   * @returns {string} Basic formalized text
   */
  basicFormalization(text) {
    if (!text || !text.trim()) return text;

    // Basic improvements
    let formatted = text.trim();
    
    // Capitalize first letter
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    
    // Ensure proper ending punctuation
    if (!/[.!?]$/.test(formatted)) {
      formatted += '.';
    }
    
    // Replace common casual phrases
    const replacements = {
      'hey': 'Hello',
      'hi': 'Hello',
      'gonna': 'going to',
      'wanna': 'want to',
      'gotta': 'have to',
      'can\'t': 'cannot',
      'won\'t': 'will not',
      'don\'t': 'do not',
      'isn\'t': 'is not',
      'aren\'t': 'are not',
      'u': 'you',
      'ur': 'your',
      'thx': 'thank you',
      'thanks': 'thank you',
      'plz': 'please',
      'pls': 'please'
    };
    
    // Apply replacements (case-insensitive)
    Object.entries(replacements).forEach(([casual, formal]) => {
      const regex = new RegExp(`\\b${casual}\\b`, 'gi');
      formatted = formatted.replace(regex, formal);
    });
    
    return formatted;
  }

  /**
   * Test the Gemini API connection
   * @returns {Promise<boolean>} Whether the API is working
   */
  async testConnection() {
    try {
      if (!this.genAI) {
        return false;
      }
      
      const response = await this.genAI.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: "Hello"
      });
      
      return true;
    } catch (error) {
      console.error('Gemini API connection test failed:', error);
      return false;
    }
  }
}

export default new GeminiApiService();