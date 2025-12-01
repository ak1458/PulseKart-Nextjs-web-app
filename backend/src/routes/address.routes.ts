import { Router } from 'express';
import { AddressController } from '../controllers/address.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticateToken, AddressController.create);
router.get('/', authenticateToken, AddressController.list);
router.delete('/:id', authenticateToken, AddressController.delete);

export default router;
