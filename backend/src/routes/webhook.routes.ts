import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';

const router = Router();

router.post('/courier', WebhookController.handleCourierEvent);

export default router;
