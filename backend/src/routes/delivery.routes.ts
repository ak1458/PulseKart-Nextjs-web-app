import { Router } from 'express';
import { DeliveryController } from '../controllers/delivery.controller';

const router = Router();

router.get('/zones', DeliveryController.getZones);
router.post('/zones', DeliveryController.createZone);
router.put('/zones/:id', DeliveryController.updateZone);
router.delete('/zones/:id', DeliveryController.deleteZone);

export default router;
