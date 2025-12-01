import { Request, Response } from 'express';
import { DeliveryService } from '../services/delivery.service';

export class DeliveryController {

    static async getZones(req: Request, res: Response) {
        try {
            const zones = await DeliveryService.getZones();
            res.json(zones);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async createZone(req: Request, res: Response) {
        try {
            const zone = await DeliveryService.createZone(req.body);
            res.json(zone);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateZone(req: Request, res: Response) {
        try {
            const zone = await DeliveryService.updateZone(req.params.id, req.body);
            res.json(zone);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteZone(req: Request, res: Response) {
        try {
            await DeliveryService.deleteZone(req.params.id);
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
