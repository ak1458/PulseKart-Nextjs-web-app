import { Router } from 'express';
import { BiController } from '../controllers/bi.controller';

const router = Router();

router.get('/dashboard', BiController.getDashboard);

export default router;
