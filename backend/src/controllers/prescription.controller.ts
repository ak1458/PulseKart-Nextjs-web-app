
import { Request, Response } from 'express';
import { AnalysisService } from '../services/analysis.service';
import { PrescriptionService } from '../services/prescription.service';

export class PrescriptionController {

    static async getQueue(req: Request, res: Response) {
        try {
            const queue = await PrescriptionService.getQueue();
            res.json(queue);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async reviewRx(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;
            const result = await PrescriptionService.reviewRx(id, status, notes);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteRx(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await PrescriptionService.deleteRx(id);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async analyzeRx(req: Request, res: Response) {
        try {
            const analysis = await AnalysisService.analyzePrescription(req.body);
            res.json(analysis);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
