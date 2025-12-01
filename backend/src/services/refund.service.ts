import { query } from '../config/database';

interface RefundRequestDTO {
    order_id: string;
    amount: number;
    reason?: string;
    speed?: 'normal' | 'instant';
    initiated_by: number; // User ID (Admin)
}

export class RefundService {

    // 1. Initiate Refund
    static async initiateRefund(data: RefundRequestDTO) {
        try {
            await query('BEGIN');

            // 1. Fetch Payment Details
            const paymentRes = await query(
                'SELECT * FROM payments WHERE order_id = $1 AND status = $2',
                [data.order_id, 'captured']
            );

            if (paymentRes.rows.length === 0) {
                throw new Error('No captured payment found for this order');
            }
            const payment = paymentRes.rows[0];

            // 2. Validate Amount (Simple check)
            if (data.amount > parseFloat(payment.amount)) {
                throw new Error('Refund amount cannot exceed payment amount');
            }

            // 3. Call Gateway (Mocked)
            const gatewayRefundId = `rfnd_${Math.random().toString(36).substring(7)}`;
            const gatewayStatus = 'processed'; // Assume success for mock

            // 4. Record Refund Transaction
            const refundQuery = `
                INSERT INTO refund_transactions 
                (id, payment_id, order_id, amount, status, speed, reason)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;
            const refundValues = [
                gatewayRefundId, payment.id, data.order_id,
                data.amount, gatewayStatus, data.speed || 'normal', data.reason
            ];
            const refundResult = await query(refundQuery, refundValues);

            // 5. Update Payment Status if full refund
            if (data.amount >= parseFloat(payment.amount)) {
                await query('UPDATE payments SET status = $1 WHERE id = $2', ['refunded', payment.id]);
                await query('UPDATE orders SET payment_status = $1 WHERE id = $2', ['refunded', data.order_id]);
            } else {
                // Partial refund logic could go here (e.g. status = 'partially_refunded')
            }

            // 6. Update Return Request Status (if linked)
            // This would ideally be passed in or looked up. 
            // For now, we assume this might be triggered from a Return Request context.
            await query(
                `UPDATE return_requests SET status = 'refunded' WHERE order_id = $1 AND status = 'approved'`,
                [data.order_id]
            );

            await query('COMMIT');
            return refundResult.rows[0];

        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }
    }

    // 2. Get Refund History
    static async getRefundsByOrder(orderId: string) {
        const result = await query('SELECT * FROM refund_transactions WHERE order_id = $1', [orderId]);
        return result.rows;
    }
}
