import { Request, Response } from 'express';
import { WarehouseService } from '../services/warehouse.service';

export class WarehouseController {

    static async getOptimalPath(req: Request, res: Response) {
        try {
            const { binIds } = req.body;
            const path = await WarehouseService.getOptimalPath(binIds);
            res.json(path);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getHeatmap(req: Request, res: Response) {
        try {
            const data = await WarehouseService.getHeatmapData();
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
