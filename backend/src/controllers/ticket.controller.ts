import { Request, Response } from 'express';
import { TicketService } from '../services/ticket.service';

export class TicketController {

    static async createTicket(req: Request, res: Response) {
        try {
            // TODO: Get user_id from auth token
            const result = await TicketService.createTicket({
                ...req.body,
                user_id: 1 // Mocked
            });
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async addMessage(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { message, is_internal } = req.body;
            // TODO: Get sender_id from auth token
            const result = await TicketService.addMessage(id, 1, message, is_internal);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getTicket(req: Request, res: Response) {
        try {
            const result = await TicketService.getTicket(req.params.id);
            if (!result) return res.status(404).json({ error: 'Ticket not found' });
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async listTickets(req: Request, res: Response) {
        try {
            const { status } = req.query;
            const result = await TicketService.listTickets(status as string);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const result = await TicketService.updateStatus(id, status);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
