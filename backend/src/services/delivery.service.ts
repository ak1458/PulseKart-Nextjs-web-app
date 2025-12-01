import { query } from '../config/database';

export class DeliveryService {

    static async getZones() {
        const res = await query('SELECT * FROM delivery_zones ORDER BY created_at DESC');
        return res.rows;
    }

    static async createZone(data: any) {
        const { name, pincodes, standard_cost, express_cost, delivery_days_min, delivery_days_max } = data;
        const sql = `
            INSERT INTO delivery_zones (
                name, pincodes, standard_cost, express_cost, delivery_days_min, delivery_days_max
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const res = await query(sql, [
            name,
            JSON.stringify(pincodes || []),
            standard_cost || 0,
            express_cost || 0,
            delivery_days_min || 2,
            delivery_days_max || 5
        ]);
        return res.rows[0];
    }

    static async updateZone(id: string, data: any) {
        const { name, pincodes, standard_cost, express_cost, delivery_days_min, delivery_days_max, is_active } = data;
        const sql = `
            UPDATE delivery_zones 
            SET name = $1, pincodes = $2, standard_cost = $3, express_cost = $4, 
                delivery_days_min = $5, delivery_days_max = $6, is_active = $7
            WHERE id = $8
            RETURNING *
        `;
        const res = await query(sql, [
            name,
            JSON.stringify(pincodes),
            standard_cost,
            express_cost,
            delivery_days_min,
            delivery_days_max,
            is_active,
            id
        ]);
        return res.rows[0];
    }

    static async deleteZone(id: string) {
        await query('DELETE FROM delivery_zones WHERE id = $1', [id]);
        return { success: true };
    }
}
