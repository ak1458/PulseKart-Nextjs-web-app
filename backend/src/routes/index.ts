import { Router } from 'express';
import authRoutes from './auth.routes';
import addressRoutes from './address.routes';
import productRoutes from './product.routes';
import webhookRoutes from './webhook.routes';
import returnRoutes from './return.routes';
import searchRoutes from './search.routes';
import cmsRoutes from './cms.routes';
import prescriptionRoutes from './prescription.routes';
import ticketRoutes from './ticket.routes';
import chatbotRoutes from './chatbot.routes';
import warehouseRoutes from './warehouse.routes';
import biRoutes from './bi.routes';
import exportRoutes from './export.routes';
import orderRoutes from './order.routes';
import inventoryRoutes from './inventory.routes';
import couponRoutes from './coupon.routes';
import employeeRoutes from './employee.routes';
import deliveryRoutes from './delivery.routes';
import financeRoutes from './finance.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users/addresses', addressRoutes);
router.use('/products', productRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/returns', returnRoutes);
router.use('/search', searchRoutes);
router.use('/cms', cmsRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/tickets', ticketRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/warehouse', warehouseRoutes);
router.use('/bi', biRoutes);
router.use('/exports', exportRoutes);
router.use('/orders', orderRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/coupons', couponRoutes);
router.use('/employees', employeeRoutes);
router.use('/delivery', deliveryRoutes);
router.use('/finance', financeRoutes);

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to PulseKart API v1' });
});

export default router;
