
import pool from '../config/database';

export class PrescriptionService {

    static async getQueue() {
        const result = await pool.query(`
            SELECT 
                o.id, 
                u.name as user, 
                o.created_at as uploaded, 
                o.status, 
                o.risk_score,
                o.prescription_url as image,
                (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as items
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.status IN ('awaiting_rx', 'rx_review')
            ORDER BY o.created_at DESC
        `);
        return result.rows;
    }

    static async reviewRx(orderId: string, status: 'approved' | 'rejected', notes?: string) {
        const newStatus = status === 'approved' ? 'payment_pending' : 'cancelled'; // Or 'rejected_rx'

        const result = await pool.query(`
            UPDATE orders 
            SET status = $1, pharmacist_notes = $2, updated_at = NOW()
            WHERE id = $3
            RETURNING *
        `, [newStatus, notes, orderId]);

        return result.rows[0];
    }

    static async deleteRx(orderId: string) {
        // Soft delete or cancel
        const result = await pool.query(`
            UPDATE orders 
            SET status = 'cancelled', notes = 'Prescription deleted by admin', updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `, [orderId]);
        return result.rows[0];
    }
}
