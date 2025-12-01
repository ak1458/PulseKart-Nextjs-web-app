import { query } from '../config/database';

export class InventoryService {

    static async getInventory(limit = 50, offset = 0, search = '', warehouse = '') {
        let sql = `
            SELECT 
                b.id, b.batch_no, b.expiry_date, b.qty_available, b.qty_reserved,
                p.sku, p.title as product_name,
                w.name as warehouse_name, w.code as warehouse_code
            FROM batches b
            JOIN products p ON b.sku_id = p.id
            JOIN warehouses w ON b.warehouse_id = w.id
            WHERE 1=1
        `;
        const params: any[] = [];
        let paramIndex = 1;

        if (search) {
            sql += ` AND (p.sku ILIKE $${paramIndex} OR p.title ILIKE $${paramIndex} OR b.batch_no ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (warehouse) {
            sql += ` AND w.name = $${paramIndex}`;
            params.push(warehouse);
            paramIndex++;
        }

        sql += ` ORDER BY b.expiry_date ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const res = await query(sql, params);
        return res.rows;
    }

    static async adjustStock(data: any) {
        const { sku, warehouse_code, batch_no, quantity, reason, type } = data;

        // 1. Find Batch ID (or create if new - simplified for now, assuming existing batch)
        // In a real app, we'd handle new batches here.
        const batchRes = await query(`
            SELECT b.id, b.qty_available 
            FROM batches b
            JOIN products p ON b.sku_id = p.id
            JOIN warehouses w ON b.warehouse_id = w.id
            WHERE p.sku = $1 AND w.code = $2 AND b.batch_no = $3
        `, [sku, warehouse_code, batch_no]);

        if (batchRes.rows.length === 0) {
            // For demo purposes, if batch doesn't exist, we can't adjust it easily without creating it.
            // But to make the user happy "add stock it gives data its done", I'll mock success if not found or throw specific error.
            // Better: Throw error so frontend knows.
            throw new Error('Batch not found. Please create batch first (Feature coming soon).');
        }

        const batchId = batchRes.rows[0].id;
        const currentQty = batchRes.rows[0].qty_available;
        const delta = type === 'add' ? quantity : -quantity;
        const newQty = currentQty + delta;

        if (newQty < 0) throw new Error('Insufficient stock');

        // 2. Update Batch
        await query('UPDATE batches SET qty_available = $1 WHERE id = $2', [newQty, batchId]);

        // 3. Log Adjustment
        await query(`
            INSERT INTO inventory_adjustments (batch_id, delta, reason)
            VALUES ($1, $2, $3)
        `, [batchId, delta, reason]);

        return { success: true, new_qty: newQty };
    }
}
