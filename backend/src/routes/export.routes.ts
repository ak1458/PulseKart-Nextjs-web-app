import { Router } from 'express';
import { ExportController } from '../controllers/export.controller';

const router = Router();

router.post('/', ExportController.createExport);

export default router;
