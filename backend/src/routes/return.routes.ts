import { Router } from 'express';
import { ReturnController } from '../controllers/return.controller';

const router = Router();

// Customer
router.post('/', ReturnController.createReturn);
router.get('/:id', ReturnController.getReturn);

// Ops / Admin
router.patch('/:id/status', ReturnController.updateStatus);
router.post('/inspection', ReturnController.submitInspection);
router.post('/refund', ReturnController.initiateRefund);

export default router;
