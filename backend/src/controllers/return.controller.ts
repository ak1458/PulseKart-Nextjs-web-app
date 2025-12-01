import { Request, Response } from 'express';
import { ReturnService } from '../services/return.service';
import { RefundService } from '../services/refund.service';

export class ReturnController {

    // Create Return Request
    static async createReturn(req: Request, res: Response) {
        try {
            // TODO: Validate user ownership from auth token
            const result = await ReturnService.createReturnRequest(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Update Status (Ops)
    static async updateStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const result = await ReturnService.updateStatus(id, status);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Submit Inspection
    static async submitInspection(req: Request, res: Response) {
        try {
            // TODO: Get inspector ID from auth token
            const result = await ReturnService.processInspection({
                ...req.body,
                inspector_id: 1 // Mocked for now
            });
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get Return Details
    static async getReturn(req: Request, res: Response) {
        try {
            const result = await ReturnService.getReturnDetails(req.params.id);
            if (!result) return res.status(404).json({ error: 'Return not found' });
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Initiate Refund (Manual Trigger)
    static async initiateRefund(req: Request, res: Response) {
        try {
            const result = await RefundService.initiateRefund({
                ...req.body,
                initiated_by: 1 // Mocked
            });
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
