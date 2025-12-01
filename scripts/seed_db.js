
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: 'pulse_user',
    host: '127.0.0.1',
    database: 'pulse_db',
    password: 'pulse_password',
    port: 5432,
});

async function seed() {
    try {
        console.log('Connecting to database...');
        const client = await pool.connect();
        console.log('Connected!');

        // 1. Ensure Default Warehouse Exists
        console.log('Ensuring default warehouse...');
        let warehouseId;
        const whRes = await client.query(`
            INSERT INTO warehouses (code, name, address, pincodes)
            VALUES ('WH-001', 'Main Warehouse', '123 Logistics Way', '["400001"]')
            ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
        `);
        warehouseId = whRes.rows[0].id;
        console.log(`Warehouse ID: ${warehouseId}`);

        // 2. Read products.json
        const productsPath = path.join(__dirname, '../public/data/products.json');
        if (!fs.existsSync(productsPath)) {
            console.error('products.json not found! Run generate_data.js first.');
            process.exit(1);
        }
        const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

        console.log(`Seeding ${products.length} products...`);

        // 3. Insert products and batches
        for (const p of products) {
            // Insert Product
            const prodRes = await client.query(`
                INSERT INTO products (
                    sku, title, description, price, category, 
                    images, attributes, created_at, updated_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
                ) ON CONFLICT (sku) DO UPDATE SET price = EXCLUDED.price
                RETURNING id
            `, [
                p.id, // Use 'prod_1' as SKU
                p.title,
                p.fullDesc,
                p.price,
                p.category,
                JSON.stringify(p.images),
                JSON.stringify(p.attributes)
            ]);

            const productId = prodRes.rows[0].id;

            // Insert Batch (Stock)
            await client.query(`
                INSERT INTO batches (
                    sku_id, batch_no, expiry_date, warehouse_id, qty_available
                ) VALUES (
                    $1, $2, $3, $4, $5
                ) ON CONFLICT (sku_id, batch_no, warehouse_id) DO NOTHING
            `, [
                productId,
                `BATCH-${p.id}`,
                '2026-12-31', // Future expiry
                warehouseId,
                getRandomInt(10, 100) // Random stock
            ]);
        }

        console.log('Seeding completed successfully!');
        client.release();
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await pool.end();
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

seed();
