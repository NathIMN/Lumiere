import express from 'express';
import {
    sendMessage,
    streamMessage
} from '../controllers/chatbot.js';

const router = express.Router();

// Send message to chatbot
router.post('/message', sendMessage);

// Stream message for real-time responses
router.post('/stream', streamMessage);

export default router;