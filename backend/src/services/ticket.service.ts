import { query } from '../config/database';

interface CreateTicketDTO {
    user_id: number;
    subject: string;
    category: string;
    message: string;
    priority?: string;
}

export class TicketService {

    // 1. Create Ticket
    static async createTicket(data: CreateTicketDTO) {
        try {
            await query('BEGIN');

            const ticketRes = await query(
                'INSERT INTO tickets (user_id, subject, category, priority) VALUES ($1, $2, $3, $4) RETURNING id',
                [data.user_id, data.subject, data.category, data.priority || 'medium']
            );
            const ticketId = ticketRes.rows[0].id;

            await query(
                'INSERT INTO ticket_messages (ticket_id, sender_id, message) VALUES ($1, $2, $3)',
                [ticketId, data.user_id, data.message]
            );

            await query('COMMIT');
            return { id: ticketId, status: 'open' };
        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }
    }

    // 2. Add Message
    static async addMessage(ticketId: string, senderId: number | null, message: string, isInternal: boolean = false) {
        const result = await query(
            'INSERT INTO ticket_messages (ticket_id, sender_id, message, is_internal) VALUES ($1, $2, $3, $4) RETURNING *',
            [ticketId, senderId, message, isInternal]
        );

        // Auto-reopen if closed
        await query("UPDATE tickets SET status = 'in_progress', updated_at = NOW() WHERE id = $1 AND status = 'closed'", [ticketId]);

        return result.rows[0];
    }

    // 3. Get Ticket Details
    static async getTicket(id: string) {
        const ticket = await query('SELECT * FROM tickets WHERE id = $1', [id]);
        if (ticket.rows.length === 0) return null;

        const messages = await query(
            'SELECT m.*, u.name as sender_name FROM ticket_messages m LEFT JOIN users u ON m.sender_id = u.id WHERE ticket_id = $1 ORDER BY created_at ASC',
            [id]
        );

        return { ...ticket.rows[0], messages: messages.rows };
    }

    // 4. List Tickets (Admin)
    static async listTickets(status?: string) {
        let sql = 'SELECT t.*, u.name as user_name FROM tickets t JOIN users u ON t.user_id = u.id';
        const params: any[] = [];

        if (status) {
            sql += ' WHERE t.status = $1';
            params.push(status);
        }

        sql += ' ORDER BY t.updated_at DESC';
        const result = await query(sql, params);
        return result.rows;
    }

    // 5. Update Status
    static async updateStatus(id: string, status: string) {
        const result = await query(
            'UPDATE tickets SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, id]
        );
        return result.rows[0];
    }
}
