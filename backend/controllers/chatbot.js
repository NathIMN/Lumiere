import asyncWrapper from '../middleware/async.js';
import openaiService from '../services/openaiService.js';

// Send a message to the chatbot and get AI response
const sendMessage = asyncWrapper(async (req, res) => {
    const { message } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // Generate AI response
        const aiResponse = await openaiService.generateResponse(message);

        res.status(200).json({
            success: true,
            data: {
                userMessage: message,
                aiResponse: aiResponse,
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ 
            error: 'Failed to process message',
            details: error.message 
        });
    }
});

// Stream response for real-time chat
const streamMessage = asyncWrapper(async (req, res) => {
    const { message } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // Set headers for Server-Sent Events
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });

        // Get streaming response from OpenAI
        const stream = await openaiService.generateStreamResponse(message);
        
        let fullResponse = '';
        
        for await (const chunk of stream) {
            const chunkText = chunk.choices[0]?.delta?.content || '';
            fullResponse += chunkText;
            
            // Send chunk to client
            res.write(`data: ${JSON.stringify({ 
                type: 'chunk', 
                content: chunkText 
            })}\n\n`);
        }

        // Send completion signal
        res.write(`data: ${JSON.stringify({ 
            type: 'complete', 
            fullResponse 
        })}\n\n`);

        res.end();
        
    } catch (error) {
        console.error('Stream error:', error);
        res.write(`data: ${JSON.stringify({ 
            type: 'error', 
            message: 'Failed to generate response' 
        })}\n\n`);
        res.end();
    }
});

// Formalize a message to make it professional
const formalizeMessage = asyncWrapper(async (req, res) => {
    const { message } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // Generate formalized version (service now handles fallbacks gracefully)
        const formalizedMessage = await openaiService.formalizeMessage(message);

        // Check if the message was actually formalized or if it's a fallback
        const wasFormalized = formalizedMessage !== message.trim();

        res.status(200).json({
            success: true,
            data: {
                originalMessage: message,
                formalizedMessage: formalizedMessage,
                wasFormalized: wasFormalized,
                timestamp: new Date()
            }
        });

    } catch (error) {
        // This should rarely happen now since service handles fallbacks
        console.error('Formalize error:', error);
        res.status(200).json({
            success: true,
            data: {
                originalMessage: message,
                formalizedMessage: message.trim(),
                wasFormalized: false,
                error: 'AI service unavailable',
                timestamp: new Date()
            }
        });
    }
});

export {
    sendMessage,
    streamMessage,
    formalizeMessage
};