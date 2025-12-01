import { Request, Response } from 'express';
import { FinanceService } from '../services/finance.service';

export class FinanceController {

    static async getDashboard(req: Request, res: Response) {
        try {
            const stats = await FinanceService.getStats();
            const transactions = await FinanceService.getTransactions();
            res.json({ stats, transactions });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
