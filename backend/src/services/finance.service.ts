import { query } from '../config/database';

export class FinanceService {

    static async getStats() {
        // Total Revenue (Captured Payments)
        const revenueRes = await query(`
            SELECT SUM(amount) as total 
            FROM payments 
            WHERE status = 'captured'
        `);

        // Total Refunds
        const refundRes = await query(`
            SELECT SUM(amount) as total 
            FROM refund_transactions 
            WHERE status = 'processed'
        `);

        // Pending Settlements (Authorized but not Settled - simplified logic)
        // In reality, this would query the settlements table or gateway API
        const pendingRes = await query(`
            SELECT SUM(amount) as total 
            FROM payments 
            WHERE status = 'authorized'
        `);

        return {
            total_revenue: parseFloat(revenueRes.rows[0].total || '0'),
            total_refunds: parseFloat(refundRes.rows[0].total || '0'),
            pending_settlement: parseFloat(pendingRes.rows[0].total || '0')
        };
    }

    static async getTransactions(limit = 20, offset = 0) {
        const sql = `
            SELECT 
                p.id, p.order_id, p.amount, p.status, p.method, p.created_at,
                u.name as customer_name
            FROM payments p
            LEFT JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const res = await query(sql, [limit, offset]);
        return res.rows;
    }
}
