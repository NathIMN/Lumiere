import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    async generateResponse(userMessage) {
        try {
            const result = await this.model.generateContent(userMessage);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw new Error('Failed to generate AI response');
        }
    }

    async generateStreamResponse(userMessage) {
        try {
            const result = await this.model.generateContentStream(userMessage);
            return result.stream;
        } catch (error) {
            console.error('Gemini Stream API Error:', error);
            throw new Error('Failed to generate AI response stream');
        }
    }

    async formalizeMessage(userMessage) {
        try {
            const prompt = `Please rewrite the following message in a formal, professional tone while maintaining the original meaning and intent. 
Make it clear, brief, polite, and suitable for business communication.
IMPORTANT: Do NOT include any placeholders like [Name], [Project], [Date] etc. Create a complete, ready-to-send message that can be used directly without any additional information needed.
Use generic terms instead of placeholders if needed.

Original message: "${userMessage}"

Formal version:`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini Formalize API Error:', error);
            throw new Error('Failed to formalize message');
        }
    }
}

export default new GeminiService();