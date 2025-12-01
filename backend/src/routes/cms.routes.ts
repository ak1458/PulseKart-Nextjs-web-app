import { Router } from 'express';
import { CmsController } from '../controllers/cms.controller';

const router = Router();

// Public
router.get('/pages/:slug', CmsController.getPage);

// Admin
router.get('/pages', CmsController.listPages);
router.post('/pages', CmsController.savePage);
router.patch('/pages/:id/publish', CmsController.togglePublish);

export default router;
