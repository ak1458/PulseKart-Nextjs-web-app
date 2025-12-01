import { query } from '../config/database';

export interface Product {
    id?: number;
    sku: string;
    title: string;
    description?: string;
    category: string;
    price: number;
    mrp?: number;
    tax_rate?: number;
    prescription_required?: boolean;
    attributes?: any;
    images?: string[];
    seo?: any;
    is_active?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export class ProductModel {
    static async create(product: Product): Promise<Product> {
        const {
            sku, title, description, category, price, mrp, tax_rate,
            prescription_required, attributes, images, seo
        } = product;

        const text = `
            INSERT INTO products (
                sku, title, description, category, price, mrp, tax_rate,
                prescription_required, attributes, images, seo
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;
        const values = [
            sku, title, description, category, price, mrp, tax_rate || 0,
            prescription_required || false, JSON.stringify(attributes || {}),
            JSON.stringify(images || []), JSON.stringify(seo || {})
        ];

        const result = await query(text, values);
        return result.rows[0];
    }

    static async addStock(skuId: number, warehouseId: number, qty: number, batchNo: string, expiry: string) {
        const text = `
            INSERT INTO batches (sku_id, warehouse_id, qty_available, batch_no, expiry_date)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const result = await query(text, [skuId, warehouseId, qty, batchNo, expiry]);
        return result.rows[0];
    }

    static async findAll(limit = 50, offset = 0): Promise<Product[]> {
        const text = `
            SELECT p.*, 
            (SELECT SUM(qty_available) FROM batches b WHERE b.sku_id = p.id) as stock
            FROM products p
            WHERE p.is_active = TRUE
            ORDER BY p.created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await query(text, [limit, offset]);
        return result.rows;
    }

    static async findById(id: number): Promise<Product | null> {
        const text = `
            SELECT p.*, 
            (SELECT SUM(qty_available) FROM batches b WHERE b.sku_id = p.id) as stock
            FROM products p
            WHERE p.id = $1
        `;
        const result = await query(text, [id]);
        return result.rows[0] || null;
    }

    static async getWarehouseIdByCode(code: string): Promise<number | null> {
        const result = await query('SELECT id FROM warehouses WHERE code = $1', [code]);
        return result.rows[0]?.id || null;
    }
}
