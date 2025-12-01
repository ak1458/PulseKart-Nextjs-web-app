import { query } from '../config/database';

interface CreateReturnRequestDTO {
    order_id: string;
    user_id: number;
    reason: string;
    description?: string;
    images?: string[];
    items: {
        order_item_id: number;
        quantity: number;
        reason: string;
        condition: string;
    }[];
    pickup_slot?: string; // ISO Date string
    refund_method: 'original' | 'wallet';
}

interface InspectionDTO {
    return_request_id: string;
    inspector_id: number;
    outcome: 'accept' | 'reject' | 'repair' | 'quarantine';
    notes?: string;
    images?: string[];
    restock_batch_id?: number;
}

export class ReturnService {

    // 1. Create Return Request
    static async createReturnRequest(data: CreateReturnRequestDTO) {
        // Generate ID: RET-YYYY-RANDOM
        const year = new Date().getFullYear();
        const random = Math.floor(1000 + Math.random() * 9000);
        const id = `RET-${year}-${random}`;

        try {
            await query('BEGIN');

            // 1. Create Request Header
            const reqQuery = `
                INSERT INTO return_requests 
                (id, order_id, user_id, reason, description, images, pickup_slot, refund_method, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'requested')
                RETURNING *
            `;
            const reqValues = [
                id, data.order_id, data.user_id, data.reason,
                data.description || '', JSON.stringify(data.images || []),
                data.pickup_slot, data.refund_method
            ];
            const reqResult = await query(reqQuery, reqValues);

            // 2. Create Return Items
            for (const item of data.items) {
                const itemQuery = `
                    INSERT INTO return_items 
                    (return_request_id, order_item_id, quantity, reason, condition, status)
                    VALUES ($1, $2, $3, $4, $5, 'pending')
                `;
                await query(itemQuery, [id, item.order_item_id, item.quantity, item.reason, item.condition]);
            }

            // 3. Update Order Status (Optional: Mark as 'return_requested'?)
            // For now, we keep order status as is, or maybe 'partially_returned' logic later.

            await query('COMMIT');
            return reqResult.rows[0];

        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }
    }

    // 2. Update Status (State Machine)
    static async updateStatus(id: string, status: string, metadata: any = {}) {
        const validTransitions: Record<string, string[]> = {
            'requested': ['scheduled', 'rejected'],
            'scheduled': ['picked_up', 'cancelled'],
            'picked_up': ['received', 'lost'],
            'received': ['inspected'],
            'inspected': ['approved', 'rejected'],
            'approved': ['refunded'],
            'rejected': [], // Terminal
            'refunded': []  // Terminal
        };

        // Fetch current status
        const currentRes = await query('SELECT status FROM return_requests WHERE id = $1', [id]);
        if (currentRes.rows.length === 0) throw new Error('Return request not found');

        const currentStatus = currentRes.rows[0].status;

        // Validate transition
        if (!validTransitions[currentStatus]?.includes(status)) {
            throw new Error(`Invalid status transition from ${currentStatus} to ${status}`);
        }

        const result = await query(
            'UPDATE return_requests SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, id]
        );
        return result.rows[0];
    }

    // 3. Process Inspection
    static async processInspection(data: InspectionDTO) {
        try {
            await query('BEGIN');

            // 1. Create Inspection Record
            const insQuery = `
                INSERT INTO inspections 
                (return_request_id, inspector_id, outcome, notes, images, restock_batch_id)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            const insValues = [
                data.return_request_id, data.inspector_id, data.outcome,
                data.notes || '', JSON.stringify(data.images || []), data.restock_batch_id
            ];
            const insResult = await query(insQuery, insValues);

            // 2. Update Return Request Status based on Outcome
            let newStatus = 'inspected'; // Intermediate
            if (data.outcome === 'accept') newStatus = 'approved';
            else if (data.outcome === 'reject') newStatus = 'rejected';

            await this.updateStatus(data.return_request_id, newStatus);

            // 3. If Restock & Batch provided, increment inventory
            if (data.outcome === 'accept' && data.restock_batch_id) {
                // Logic to increment batch qty would go here (using InventoryService ideally)
                // For now, raw SQL update
                await query(
                    'UPDATE batches SET qty_available = qty_available + 1 WHERE id = $1',
                    [data.restock_batch_id]
                );
            }

            await query('COMMIT');
            return insResult.rows[0];

        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }
    }

    // 4. Handle RTO (Auto-log)
    static async logRTO(orderId: string, courierId: string, reason: string) {
        const queryStr = `
            INSERT INTO rto_logs (order_id, courier_id, reason, status, received_at)
            VALUES ($1, $2, $3, 'initiated', NOW())
            RETURNING *
        `;
        const result = await query(queryStr, [orderId, courierId, reason]);
        return result.rows[0];
    }

    // 5. Get Return Details
    static async getReturnDetails(id: string) {
        const req = await query('SELECT * FROM return_requests WHERE id = $1', [id]);
        if (req.rows.length === 0) return null;

        const items = await query('SELECT * FROM return_items WHERE return_request_id = $1', [id]);
        const inspections = await query('SELECT * FROM inspections WHERE return_request_id = $1', [id]);

        return {
            ...req.rows[0],
            items: items.rows,
            inspections: inspections.rows
        };
    }
}
