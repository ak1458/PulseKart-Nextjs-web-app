import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';

const router = Router();

router.get('/', OrderController.getOrders);
router.post('/import', OrderController.importOrders);
router.patch('/:id/status', OrderController.updateStatus);
router.delete('/:id', OrderController.deleteOrder);

export default router;
