import { Router } from 'express';
import { WarehouseController } from '../controllers/warehouse.controller';

const router = Router();

router.post('/path', WarehouseController.getOptimalPath);
router.get('/heatmap', WarehouseController.getHeatmap);

export default router;
