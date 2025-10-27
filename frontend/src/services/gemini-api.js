import { GoogleGenAI } from "@google/genai";

/**
 * Google Gemini API Service for text formalization
 */
class GeminiApiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
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
    console.log("formalize called jajaxd");
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
   * Reformat OCR extracted text to clean and structure it
   * @param {string} extractedText - The OCR extracted text to reformat
   * @param {string} documentType - Type of document for context
   * @returns {Promise<Object>} Reformatted text result
   */
  async reformatOCRText(extractedText, documentType = 'claim_document') {
    console.log("OCR reformat called");
    try {
      if (!extractedText || !extractedText.trim()) {
        throw new Error("Text to reformat cannot be empty");
      }

      // If no API key, use fallback immediately
      if (!this.genAI) {
        return {
          success: false,
          original: extractedText,
          reformatted: this.basicOCRCleanup(extractedText),
          service: 'fallback',
          error: 'Gemini API not available'
        };
      }

      const prompt = `You are an AI assistant specializing in cleaning up OCR-extracted text from insurance and claim-related documents. Your task is to reformat and structure the text while preserving all important information.

**CONTEXT**: This text was extracted from a ${documentType} using OCR technology. The document contains important claim-related information.

**YOUR TASK**: 
1. Remove irrelevant content like page numbers, headers/footers, OCR artifacts, and formatting noise
2. Preserve ALL critical information including:
   - Company/institution names and headers
   - All form fields (both questions AND answers)
   - Personal information (names, dates, addresses, ID numbers)
   - Medical information (if present)
   - Financial amounts and policy details
   - Signatures and dates
   - Any handwritten notes or additional comments

3. Structure the information logically with clear sections
4. Fix obvious OCR errors (like "0" instead of "O", misread characters)
5. Use proper formatting with headers, bullet points, or numbered lists where appropriate
6. Group related information together
7. Make the text more readable and professional

**IMPORTANT GUIDELINES**:
- Output as plain text and not markdown, do not add any markdown formatting like asterisks
- ALWAYS reformat and restructure the text, even if it looks clean
- DO NOT remove any substantive content - err on the side of inclusion
- DO NOT add information that wasn't in the original text
- DO NOT interpret or analyze the content - just clean and format it
- Output the cleaned text directly without quotes or wrapper text

**INPUT TEXT**:
${extractedText.trim()}

**CLEANED AND FORMATTED OUTPUT**:`;

      const response = await this.genAI.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt
      });

      const reformattedText = response.text.trim();

      return {
        success: true,
        original: extractedText,
        reformatted: reformattedText,
        service: 'gemini'
      };
    } catch (error) {
      console.error('Gemini OCR Reformat Error:', error);
      
      // Fallback to basic cleanup if API fails
      const fallbackText = this.basicOCRCleanup(extractedText);
      
      return {
        success: false,
        original: extractedText,
        reformatted: fallbackText,
        service: 'fallback',
        error: error.message
      };
    }
  }

  /**
   * Basic OCR text cleanup as fallback when API fails
   * @param {string} text - Text to clean up
   * @returns {string} Basic cleaned text
   */
  basicOCRCleanup(text) {
    if (!text || !text.trim()) return text;

    let cleaned = text.trim();
    
    // Remove excessive whitespace and newlines
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n'); // Remove triple+ newlines
    cleaned = cleaned.replace(/\s+/g, ' '); // Replace multiple spaces with single space
    cleaned = cleaned.replace(/\n /g, '\n'); // Remove space at beginning of lines
    
    // Remove all blank lines (lines containing only whitespace) -- not working as expected
    cleaned = cleaned.replace(/^\s*\n/gm, ''); // Remove lines that contain only whitespace, shut it doesnt work as expected
    
    // Remove common OCR artifacts
    cleaned = cleaned.replace(/[|]{2,}/g, ''); // Remove multiple pipe characters
    cleaned = cleaned.replace(/[-]{3,}/g, '---'); // Replace long dashes with standard separator
    cleaned = cleaned.replace(/[_]{3,}/g, '___'); // Replace long underscores
    
    // Fix common OCR character errors
    const charFixes = {
      'l': 'I', // lowercase l that should be uppercase I
      '0': 'O', // zero that should be letter O (in names/words)
      '5': 'S', // five that should be letter S
      '1': 'I', // one that should be letter I
    };
    
    // Apply character fixes carefully (only in likely word contexts)
    // This is basic - the AI version would be much smarter about context
    
    return cleaned;
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