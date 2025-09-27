import express from 'express';
import {
    sendMessage,
    streamMessage,
    formalizeMessage
} from '../controllers/chatbot.js';

const router = express.Router();

// Send message to chatbot
router.post('/message', sendMessage);

router.post('/formalize', formalizeMessage)

// Stream message for real-time responses
router.post('/stream', streamMessage);

export default router;