import { query } from '../config/database';

export class OrderService {

    static async getAllOrders(limit = 50, offset = 0, search = '', status = '') {
        let sql = `
            SELECT o.*, u.name as customer_name 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id
            WHERE 1=1
        `;
        const params: any[] = [];
        let paramIndex = 1;

        if (search) {
            sql += ` AND (o.id ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (status) {
            sql += ` AND o.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        sql += ` ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const res = await query(sql, params);
        return res.rows;
    }

    static async createOrder(data: any) {
        const { id, user_id, total_amount, status, payment_status } = data;
        const sql = `
            INSERT INTO orders (id, user_id, total_amount, status, payment_status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const res = await query(sql, [id, user_id, total_amount, status, payment_status]);
        return res.rows[0];
    }

    static async updateStatus(id: string, status: string) {
        const sql = `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`;
        const res = await query(sql, [status, id]);
        return res.rows[0];
    }

    static async deleteOrder(id: string) {
        const sql = `DELETE FROM orders WHERE id = $1 RETURNING id`;
        const res = await query(sql, [id]);
        return res.rows[0];
    }
}
