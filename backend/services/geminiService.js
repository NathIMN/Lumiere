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
}

export default new GeminiService();