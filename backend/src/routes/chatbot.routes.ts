import { Router } from 'express';
import { ChatbotController } from '../controllers/chatbot.controller';

const router = Router();

router.post('/chat', ChatbotController.chat);

export default router;
