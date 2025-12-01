import { Router } from 'express';
import { FinanceController } from '../controllers/finance.controller';

const router = Router();

router.get('/dashboard', FinanceController.getDashboard);

export default router;
