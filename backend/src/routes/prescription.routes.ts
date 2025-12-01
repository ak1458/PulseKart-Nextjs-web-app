import { Router } from 'express';
import { PrescriptionController } from '../controllers/prescription.controller';

const router = Router();

router.post('/analyze', PrescriptionController.analyzeRx);
router.get('/', PrescriptionController.getQueue);
router.post('/:id/review', PrescriptionController.reviewRx);
router.delete('/:id', PrescriptionController.deleteRx);

export default router;
