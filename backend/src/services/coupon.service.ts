import { query } from '../config/database';

export class CouponService {

    static async createCoupon(data: any) {
        const {
            code, type, value, min_order_amount, start_at, end_at, usage_limit_total, created_by
        } = data;

        const sql = `
            INSERT INTO coupons (
                code, type, value, min_order_amount, start_at, end_at, usage_limit_total, created_by, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
            RETURNING *
        `;
        const res = await query(sql, [
            code.toUpperCase(), type, value, min_order_amount || 0, start_at, end_at, usage_limit_total, created_by
        ]);
        return res.rows[0];
    }

    static async getCoupons() {
        const res = await query('SELECT * FROM coupons ORDER BY created_at DESC');
        return res.rows;
    }

    static async validateCoupon(code: string, cartTotal: number) {
        const res = await query('SELECT * FROM coupons WHERE code = $1 AND status = \'active\'', [code.toUpperCase()]);

        if (res.rows.length === 0) {
            throw new Error('Invalid coupon code');
        }

        const coupon = res.rows[0];
        const now = new Date();

        if (coupon.start_at && new Date(coupon.start_at) > now) throw new Error('Coupon not yet active');
        if (coupon.end_at && new Date(coupon.end_at) < now) throw new Error('Coupon expired');
        if (cartTotal < parseFloat(coupon.min_order_amount)) {
            throw new Error(`Minimum order amount of ₹${coupon.min_order_amount} required`);
        }

        // Calculate Discount
        let discount = 0;
        if (coupon.type === 'percent') {
            discount = (cartTotal * parseFloat(coupon.value)) / 100;
            if (coupon.cap_amount) {
                discount = Math.min(discount, parseFloat(coupon.cap_amount));
            }
        } else if (coupon.type === 'flat') {
            discount = parseFloat(coupon.value);
        }

        // Ensure discount doesn't exceed total
        discount = Math.min(discount, cartTotal);

        return {
            valid: true,
            coupon_id: coupon.id,
            code: coupon.code,
            discount_amount: discount,
            final_total: cartTotal - discount
        };
    }
    static async deleteCoupon(id: number) {
        await query('DELETE FROM coupons WHERE id = $1', [id]);
        return { success: true };
    }
}
