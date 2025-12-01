
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'pulse_user',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'pulse_db',
    password: process.env.POSTGRES_PASSWORD || 'pulse_password',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

const query = (text, params) => pool.query(text, params);

async function testBi() {
    try {
        console.log('Testing BI Queries...');

        console.log('1. Total Revenue...');
        await query('SELECT SUM(total_amount) as total FROM orders WHERE status = $1', ['delivered']);
        console.log('   OK');

        console.log('2. Total Orders...');
        await query('SELECT COUNT(*) as count FROM orders');
        console.log('   OK');

        console.log('3. Total Users...');
        await query('SELECT COUNT(*) as count FROM users');
        console.log('   OK');

        console.log('4. Low Stock...');
        await query(`
                SELECT COUNT(*) as count 
                FROM (
                    SELECT p.id, COALESCE(SUM(b.qty_available), 0) as total_stock
                    FROM products p
                    LEFT JOIN batches b ON p.id = b.sku_id
                    GROUP BY p.id
                ) as stock_counts
                WHERE total_stock < 10
            `);
        console.log('   OK');

        console.log('All queries passed!');
    } catch (error) {
        console.error('QUERY FAILED:', error);
    } finally {
        await pool.end();
    }
}

testBi();
