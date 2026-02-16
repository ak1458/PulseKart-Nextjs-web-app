import { createZodDto } from 'nestjs-zod';
import { createCouponBaseSchema } from './create-coupon.dto';

export const updateCouponSchema = createCouponBaseSchema.partial().refine((data) => {
    // If end_date is provided, it should be after start_date
    if (data.start_date && data.end_date) {
        return new Date(data.end_date) > new Date(data.start_date);
    }
    return true;
}, {
    message: 'End date must be after start date',
    path: ['end_date'],
});

export class UpdateCouponDto extends createZodDto(updateCouponSchema) { }
