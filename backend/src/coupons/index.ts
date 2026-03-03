// Export all public types and classes from the coupons module
export { CouponsModule } from './coupons.module';
export { CouponsService } from './coupons.service';
export { CouponsController } from './coupons.controller';

// Entities
export { Coupon } from './entities/coupon.entity';
export { CouponUsage } from './entities/coupon-usage.entity';
export type {
  CouponType,
  ApplicableProductsType,
} from './entities/coupon.entity';

// DTOs
export { CreateCouponDto, createCouponSchema } from './dto/create-coupon.dto';
export { UpdateCouponDto, updateCouponSchema } from './dto/update-coupon.dto';
export {
  ValidateCouponDto,
  validateCouponSchema,
} from './dto/validate-coupon.dto';
export { ApplyCouponDto, applyCouponSchema } from './dto/apply-coupon.dto';
export { couponValidationResponseSchema } from './dto/coupon-response.dto';
export type {
  CouponValidationResponse,
  CouponListResponse,
  CouponFilters,
  PaginationOptions,
} from './dto/coupon-response.dto';
