import { Router } from 'express';
import { CouponController } from '../controllers/coupon.controller';

const router = Router();

router.post('/', CouponController.createCoupon);
router.get('/', CouponController.getCoupons);
router.post('/apply', CouponController.applyCoupon);
router.delete('/:id', CouponController.deleteCoupon);

export default router;
