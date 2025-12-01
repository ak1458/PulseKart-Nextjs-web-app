import { query } from '../config/database';

export class BiService {

    static async getDashboardMetrics() {
        // In a real app, this would query a Data Warehouse or materialized views
        // Here we aggregate live data from Postgres

        const [
            salesRes,
            ordersRes,
            usersRes,
            lowStockRes
        ] = await Promise.all([
            query('SELECT SUM(total_amount) as total FROM orders WHERE status = $1', ['delivered']),
            query('SELECT COUNT(*) as count FROM orders'),
            query('SELECT COUNT(*) as count FROM users'),
            query(`
                SELECT COUNT(*) as count 
                FROM (
                    SELECT p.id, COALESCE(SUM(b.qty_available), 0) as total_stock
                    FROM products p
                    LEFT JOIN batches b ON p.id = b.sku_id
                    GROUP BY p.id
                ) as stock_counts
                WHERE total_stock < 10
            `)
        ]);

        return {
            totalRevenue: parseFloat(salesRes.rows[0].total || '0'),
            totalOrders: parseInt(ordersRes.rows[0].count),
            totalUsers: parseInt(usersRes.rows[0].count),
            lowStockItems: parseInt(lowStockRes.rows[0].count)
        };
    }

    static async getSalesTrend() {
        // Mock 7-day trend
        return [
            { date: 'Mon', value: 4500 },
            { date: 'Tue', value: 5200 },
            { date: 'Wed', value: 4800 },
            { date: 'Thu', value: 6100 },
            { date: 'Fri', value: 5900 },
            { date: 'Sat', value: 7500 },
            { date: 'Sun', value: 8200 }
        ];
    }

    static async getCategoryDistribution() {
        // Mock distribution
        return [
            { name: 'Medicines', value: 45 },
            { name: 'Wellness', value: 25 },
            { name: 'Personal Care', value: 20 },
            { name: 'Devices', value: 10 }
        ];
    }
}
