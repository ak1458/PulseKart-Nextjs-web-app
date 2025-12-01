import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service';

export class InventoryController {

    static async getInventory(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = parseInt(req.query.offset as string) || 0;
            const search = req.query.search as string || '';
            const warehouse = req.query.warehouse as string || '';

            const inventory = await InventoryService.getInventory(limit, offset, search, warehouse);
            res.json(inventory);
        } catch (error: any) {
            console.error('Get Inventory Error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async adjustStock(req: Request, res: Response) {
        try {
            const result = await InventoryService.adjustStock(req.body);
            res.json(result);
        } catch (error: any) {
            console.error('Adjust Stock Error:', error);
            res.status(400).json({ message: error.message });
        }
    }
}
