
import { query } from '../config/database';

export interface Warehouse {
    id: string;
    name: string;
    address: string;
    pincodes: string[]; // Serviceable pincodes
    capacity: number;
    is_cold_chain: boolean;
    is_active: boolean;
}

export interface Batch {
    id: string;
    sku: string;
    batch_number: string;
    expiry_date: Date;
    quantity: number;
    mrp: number;
    purchase_price: number;
    supplier_id?: string;
}

export interface InventoryRecord {
    sku: string;
    warehouse_id: string;
    quantity_available: number;
    quantity_reserved: number;
    batches: Batch[];
    last_updated: Date;
}

export class InventoryModel {
    // Mock implementation for MVP - in real app this would query DB

    static async getStock(sku: string): Promise<InventoryRecord[]> {
        // Simulate DB query
        return [
            {
                sku,
                warehouse_id: 'WH-001',
                quantity_available: 150,
                quantity_reserved: 5,
                batches: [
                    {
                        id: 'B001',
                        sku,
                        batch_number: 'BATCH-2023-A',
                        expiry_date: new Date('2024-12-31'),
                        quantity: 100,
                        mrp: 500,
                        purchase_price: 300
                    }
                ],
                last_updated: new Date()
            }
        ];
    }

    static async adjustStock(sku: string, warehouseId: string, delta: number, reason: string): Promise<boolean> {
        console.log(`Adjusting stock for ${sku} in ${warehouseId} by ${delta}. Reason: ${reason}`);
        return true;
    }

    static async createWarehouse(warehouse: Warehouse): Promise<Warehouse> {
        console.log('Creating warehouse:', warehouse);
        return warehouse;
    }
}
