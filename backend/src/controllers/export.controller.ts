import { Request, Response } from 'express';
import { ExportService } from '../services/export.service';

export class ExportController {

    static async createExport(req: Request, res: Response) {
        try {
            const { type, dateFrom, dateTo } = req.body;

            // For now, only support order_invoice/csv
            const csvData = await ExportService.generateOrderCsv(dateFrom, dateTo);

            // Return CSV directly
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
            res.send(csvData);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
