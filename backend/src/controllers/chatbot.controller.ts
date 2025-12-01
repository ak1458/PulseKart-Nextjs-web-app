import { Request, Response } from 'express';
import { ChatbotService } from '../services/chatbot.service';

export class ChatbotController {

    static async chat(req: Request, res: Response) {
        try {
            const { message, context } = req.body;
            const response = await ChatbotService.processMessage(message, context);
            res.json(response);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
