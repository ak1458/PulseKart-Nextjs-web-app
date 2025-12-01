import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

// Public Routes
router.get('/', ProductController.list);
router.get('/:id', ProductController.getOne);

// Admin Routes
router.post('/', authenticateToken, authorizeRole(['admin', 'pharmacist']), ProductController.create);

export default router;
