import { Request, Response } from 'express';
import { BiService } from '../services/bi.service';

export class BiController {

    static async getDashboard(req: Request, res: Response) {
        const fs = require('fs');
        const logPath = 'd:/gravity/pulse-kart/backend/debug.log';
        try {
            fs.appendFileSync(logPath, `${new Date().toISOString()} - BI Request Received\n`);

            const [metrics, trend, distribution] = await Promise.all([
                BiService.getDashboardMetrics(),
                BiService.getSalesTrend(),
                BiService.getCategoryDistribution()
            ]);

            fs.appendFileSync(logPath, `${new Date().toISOString()} - BI Data Fetched Successfully\n`);

            res.json({
                metrics,
                trend,
                distribution
            });
        } catch (error: any) {
            fs.appendFileSync(logPath, `${new Date().toISOString()} - BI Error: ${error.message}\n${error.stack}\n\n`);
            res.status(500).json({ error: error.message });
        }
    }
}
