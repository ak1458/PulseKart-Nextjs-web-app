import { Request, Response } from 'express';
import { CouponService } from '../services/coupon.service';

export class CouponController {

    static async createCoupon(req: Request, res: Response) {
        try {
            const coupon = await CouponService.createCoupon(req.body);
            res.json(coupon);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getCoupons(req: Request, res: Response) {
        try {
            const coupons = await CouponService.getCoupons();
            res.json(coupons);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async applyCoupon(req: Request, res: Response) {
        try {
            const { code, cartTotal } = req.body;
            const result = await CouponService.validateCoupon(code, cartTotal);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async deleteCoupon(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            await CouponService.deleteCoupon(id);
            res.json({ message: 'Coupon deleted successfully' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
