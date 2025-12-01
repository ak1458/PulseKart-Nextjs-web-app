import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';

const router = Router();

router.get('/', InventoryController.getInventory);
router.post('/adjust', InventoryController.adjustStock);

export default router;
