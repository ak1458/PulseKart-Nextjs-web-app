import { query } from '../config/database';
import fs from 'fs';
import path from 'path';

const migrateProducts = async () => {
    try {
        const schemaPath = path.join(__dirname, 'schema_products.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Running Product schema migration...');
        await query(schemaSql);

        // Seed some initial categories if empty
        const checkCategories = await query('SELECT count(*) FROM categories');
        if (parseInt(checkCategories.rows[0].count) === 0) {
            console.log('Seeding default categories...');
            await query(`
                INSERT INTO categories (name, slug, description) VALUES 
                ('Medicines', 'medicines', 'All kinds of pharmaceutical drugs'),
                ('Vitamins', 'vitamins', 'Supplements and vitamins'),
                ('Personal Care', 'personal-care', 'Hygiene and personal care items'),
                ('Baby Care', 'baby-care', 'Products for babies and infants')
            `);
        }

        console.log('Product tables created and seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error migrating products:', error);
        process.exit(1);
    }
};

migrateProducts();
