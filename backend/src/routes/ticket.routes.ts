import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';

const router = Router();

// Customer
router.post('/', TicketController.createTicket);
router.get('/:id', TicketController.getTicket);
router.post('/:id/messages', TicketController.addMessage);

// Admin / Agent
router.get('/', TicketController.listTickets);
router.patch('/:id/status', TicketController.updateStatus);

export default router;
